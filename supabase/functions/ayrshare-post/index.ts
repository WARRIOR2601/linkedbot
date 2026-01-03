import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PostRequest {
  postId: string;
  content: string;
  imageUrl?: string;
  scheduleDate?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== Ayrshare Post Function (Single-Owner Mode) ===");
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const ayrshareApiKey = Deno.env.get("AYRSHARE_API_KEY");

    if (!ayrshareApiKey) {
      return new Response(JSON.stringify({ error: "AYRSHARE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client with user's auth
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("User authenticated:", user.id);

    // Parse request body
    const { postId, content, imageUrl, scheduleDate }: PostRequest = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Posting content:", content.substring(0, 100) + "...");
    console.log("Image URL:", imageUrl || "none");
    console.log("Schedule date:", scheduleDate || "immediate");

    // Build Ayrshare post body (single-owner mode - no profileKey needed)
    const postBody: Record<string, unknown> = {
      post: content,
      platforms: ["linkedin"],
    };

    // Add image if provided
    if (imageUrl) {
      postBody.mediaUrls = [imageUrl];
    }

    // Add schedule date if provided
    if (scheduleDate) {
      postBody.scheduleDate = scheduleDate;
    }

    console.log("Ayrshare request body:", JSON.stringify(postBody, null, 2));

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
    console.log("Ayrshare response:", JSON.stringify(postResult, null, 2));

    if (!postResponse.ok || postResult.status === "error") {
      console.error("Ayrshare post error:", postResult);
      
      // Update post status to failed
      if (postId) {
        await supabase
          .from("posts")
          .update({
            status: "failed",
            error_message: postResult.message || "Failed to post to LinkedIn",
            updated_at: new Date().toISOString(),
          })
          .eq("id", postId)
          .eq("user_id", user.id);
      }

      return new Response(JSON.stringify({ 
        error: postResult.message || "Failed to post to LinkedIn",
        details: postResult 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update post status based on whether it's scheduled or posted
    if (postId) {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (scheduleDate) {
        updateData.status = "scheduled";
        updateData.scheduled_at = scheduleDate;
      } else {
        updateData.status = "posted";
        updateData.posted_at = new Date().toISOString();
        updateData.linkedin_post_id = postResult.id || postResult.postIds?.linkedin;
      }

      await supabase
        .from("posts")
        .update(updateData)
        .eq("id", postId)
        .eq("user_id", user.id);

      console.log("Post updated in database:", postId);
    }

    return new Response(JSON.stringify({ 
      success: true,
      ayrshareId: postResult.id,
      scheduled: !!scheduleDate 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ayrshare-post:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
