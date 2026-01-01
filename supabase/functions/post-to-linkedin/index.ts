import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LinkedInPostRequest {
  userId: string;
  content: string;
  linkedinUserId: string;
  accessToken: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, content, linkedinUserId, accessToken } = await req.json() as LinkedInPostRequest;

    if (!userId || !content || !linkedinUserId || !accessToken) {
      console.error("Missing required fields for LinkedIn posting");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Attempting to post to LinkedIn for user ${userId}`);

    // LinkedIn API endpoint for creating a post
    // Using UGC Post API (User Generated Content)
    const linkedInApiUrl = "https://api.linkedin.com/v2/ugcPosts";

    const postBody = {
      author: `urn:li:person:${linkedinUserId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    console.log("Sending request to LinkedIn API...");

    const response = await fetch(linkedInApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(postBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("LinkedIn API error:", response.status, errorData);
      
      // Handle specific LinkedIn errors
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "LinkedIn token expired", code: "TOKEN_EXPIRED" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "LinkedIn rate limit exceeded", code: "RATE_LIMITED" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `LinkedIn API error: ${errorData}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const responseData = await response.json();
    const linkedinPostId = responseData.id;

    console.log(`Successfully posted to LinkedIn. Post ID: ${linkedinPostId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        linkedinPostId,
        message: "Post published successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in post-to-linkedin function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
