import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_RETRIES = 2;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting scheduled posts processing...");

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
        hashtags
      `)
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .lt("retry_count", MAX_RETRIES)
      .order("scheduled_at", { ascending: true })
      .limit(10); // Process in batches to respect rate limits

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

        // Get the user's LinkedIn account
        const { data: linkedInAccount, error: accountError } = await supabase
          .from("linkedin_accounts")
          .select("*")
          .eq("user_id", post.user_id)
          .eq("is_connected", true)
          .maybeSingle();

        if (accountError || !linkedInAccount) {
          console.error(`No connected LinkedIn account for user ${post.user_id}`);
          await markPostFailed(supabase, post.id, "No connected LinkedIn account", post.retry_count);
          failureCount++;
          results.push({ postId: post.id, status: "failed", reason: "No LinkedIn account" });
          continue;
        }

        // Check if token is expired
        if (linkedInAccount.token_expires_at) {
          const expiresAt = new Date(linkedInAccount.token_expires_at);
          if (expiresAt < new Date()) {
            console.error(`LinkedIn token expired for user ${post.user_id}`);
            await markPostFailed(supabase, post.id, "LinkedIn token expired", post.retry_count);
            failureCount++;
            results.push({ postId: post.id, status: "failed", reason: "Token expired" });
            continue;
          }
        }

        // Prepare content with hashtags
        let fullContent = post.content;
        if (post.hashtags && post.hashtags.length > 0) {
          fullContent += "\n\n" + post.hashtags.map((h: string) => `#${h}`).join(" ");
        }

        // Call the post-to-linkedin function
        const postResponse = await supabase.functions.invoke("post-to-linkedin", {
          body: {
            userId: post.user_id,
            content: fullContent,
            linkedinUserId: linkedInAccount.linkedin_user_id,
            accessToken: linkedInAccount.access_token_encrypted, // In production, decrypt this
          },
        });

        if (postResponse.error) {
          console.error(`Error posting to LinkedIn for post ${post.id}:`, postResponse.error);
          await markPostFailed(supabase, post.id, postResponse.error.message, post.retry_count);
          failureCount++;
          results.push({ postId: post.id, status: "failed", reason: postResponse.error.message });
          continue;
        }

        const responseData = postResponse.data;

        if (responseData.error) {
          console.error(`LinkedIn API error for post ${post.id}:`, responseData.error);
          
          // Handle rate limiting by not incrementing retry count
          if (responseData.code === "RATE_LIMITED") {
            console.log(`Rate limited, will retry post ${post.id} later`);
            results.push({ postId: post.id, status: "rate_limited" });
            continue;
          }
          
          await markPostFailed(supabase, post.id, responseData.error, post.retry_count);
          failureCount++;
          results.push({ postId: post.id, status: "failed", reason: responseData.error });
          continue;
        }

        // Success! Update the post status
        const { error: updateError } = await supabase
          .from("posts")
          .update({
            status: "posted",
            posted_at: new Date().toISOString(),
            linkedin_post_id: responseData.linkedinPostId,
            error_message: null,
          })
          .eq("id", post.id);

        if (updateError) {
          console.error(`Error updating post ${post.id} status:`, updateError);
        } else {
          console.log(`Successfully posted ${post.id} to LinkedIn`);
          successCount++;
          results.push({ postId: post.id, status: "posted", linkedinPostId: responseData.linkedinPostId });
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
