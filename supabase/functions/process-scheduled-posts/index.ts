import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_RETRIES = 3;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cronSecret = Deno.env.get("CRON_SECRET_KEY");
    const ayrshareApiKey = Deno.env.get("AYRSHARE_API_KEY");
    
    // Verify authentication - either cron secret or valid admin JWT
    const authHeader = req.headers.get("authorization");
    
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      console.log("Authenticated via cron secret");
    } else if (authHeader) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error("Invalid authentication token");
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const { data: isAdmin } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (!isAdmin) {
        console.error("User is not admin");
        return new Response(
          JSON.stringify({ error: "Admin privileges required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("Authenticated via admin JWT");
    } else {
      console.error("No authentication provided");
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!ayrshareApiKey) {
      console.error("Ayrshare API key not configured");
      return new Response(
        JSON.stringify({ error: "Ayrshare API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting scheduled posts processing via Ayrshare...");

    // Find all posts that are scheduled and due for posting
    const now = new Date().toISOString();
    
    const { data: duePosts, error: fetchError } = await supabase
      .from("posts")
      .select(`
        id,
        user_id,
        content,
        status,
        scheduled_at,
        retry_count,
        hashtags,
        image_url
      `)
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .lt("retry_count", MAX_RETRIES)
      .order("scheduled_at", { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error("Error fetching due posts:", fetchError);
      throw fetchError;
    }

    if (!duePosts || duePosts.length === 0) {
      console.log("No posts due for publishing");
      return new Response(
        JSON.stringify({ message: "No posts to process", processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${duePosts.length} posts to process`);

    let successCount = 0;
    let failureCount = 0;
    const results: any[] = [];

    for (const post of duePosts) {
      try {
        console.log(`Processing post ${post.id} for user ${post.user_id}`);

        // Get the user's LinkedIn account with Ayrshare profile
        const { data: linkedInAccount, error: accountError } = await supabase
          .from("linkedin_accounts")
          .select("*")
          .eq("user_id", post.user_id)
          .maybeSingle();

        if (accountError || !linkedInAccount) {
          console.error(`No LinkedIn account for user ${post.user_id}`);
          await markPostFailed(supabase, post.id, "No LinkedIn account found", post.retry_count);
          failureCount++;
          results.push({ postId: post.id, status: "failed", reason: "No LinkedIn account" });
          continue;
        }

        // Check if Ayrshare is connected
        if (!linkedInAccount.ayrshare_connected || !linkedInAccount.ayrshare_profile_key) {
          console.error(`LinkedIn not connected via Ayrshare for user ${post.user_id}`);
          await markPostFailed(supabase, post.id, "LinkedIn not connected. Please connect via dashboard.", post.retry_count);
          failureCount++;
          results.push({ postId: post.id, status: "failed", reason: "LinkedIn not connected" });
          continue;
        }

        // Prepare content with hashtags
        let fullContent = post.content;
        if (post.hashtags && post.hashtags.length > 0) {
          fullContent += "\n\n" + post.hashtags.map((h: string) => `#${h}`).join(" ");
        }

        // Build Ayrshare post request
        const postBody: Record<string, unknown> = {
          post: fullContent,
          platforms: ["linkedin"],
          profileKey: linkedInAccount.ayrshare_profile_key,
        };

        if (post.image_url) {
          postBody.mediaUrls = [post.image_url];
        }

        // Post to Ayrshare
        const postResponse = await fetch("https://api.ayrshare.com/api/post", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${ayrshareApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(postBody),
        });

        const postResult = await postResponse.json();

        if (!postResponse.ok || postResult.status === "error") {
          console.error(`Ayrshare error for post ${post.id}:`, postResult);
          
          // Handle rate limiting
          if (postResponse.status === 429) {
            console.log(`Rate limited, will retry post ${post.id} later`);
            results.push({ postId: post.id, status: "rate_limited" });
            continue;
          }
          
          await markPostFailed(supabase, post.id, postResult.message || "Failed to post to LinkedIn", post.retry_count);
          failureCount++;
          results.push({ postId: post.id, status: "failed", reason: postResult.message });
          continue;
        }

        // Success! Update the post status
        const linkedinPostId = postResult.postIds?.linkedin || postResult.id;
        
        const { error: updateError } = await supabase
          .from("posts")
          .update({
            status: "posted",
            posted_at: new Date().toISOString(),
            linkedin_post_id: linkedinPostId,
            error_message: null,
          })
          .eq("id", post.id);

        if (updateError) {
          console.error(`Error updating post ${post.id} status:`, updateError);
        } else {
          console.log(`Successfully posted ${post.id} to LinkedIn via Ayrshare`);
          successCount++;
          results.push({ postId: post.id, status: "posted", linkedinPostId });
        }

        // Add a small delay between posts to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (postError: unknown) {
        console.error(`Unexpected error processing post ${post.id}:`, postError);
        const errorMsg = postError instanceof Error ? postError.message : "Unknown error";
        await markPostFailed(supabase, post.id, errorMsg, post.retry_count);
        failureCount++;
        results.push({ postId: post.id, status: "failed", reason: errorMsg });
      }
    }

    console.log(`Processing complete. Success: ${successCount}, Failed: ${failureCount}`);

    return new Response(
      JSON.stringify({
        message: "Processing complete",
        processed: duePosts.length,
        success: successCount,
        failed: failureCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in process-scheduled-posts function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function markPostFailed(supabase: any, postId: string, errorMessage: string, currentRetryCount: number) {
  const newRetryCount = currentRetryCount + 1;
  const status = newRetryCount >= MAX_RETRIES ? "failed" : "scheduled";
  
  await supabase
    .from("posts")
    .update({
      status,
      error_message: errorMessage,
      retry_count: newRetryCount,
    })
    .eq("id", postId);
  
  console.log(`Marked post ${postId} as ${status} (retry ${newRetryCount}/${MAX_RETRIES})`);
}
