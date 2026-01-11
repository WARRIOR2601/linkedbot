import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-extension-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const extensionToken = req.headers.get("x-extension-token");
    if (!extensionToken) {
      return new Response(
        JSON.stringify({ error: "No extension token provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Validate extension token
    const { data: session, error: sessionError } = await adminClient
      .from("extension_sessions")
      .select("user_id, expires_at")
      .eq("token", extensionToken)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Invalid extension token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired
    if (new Date(session.expires_at) < new Date()) {
      await adminClient
        .from("extension_sessions")
        .delete()
        .eq("token", extensionToken);

      return new Response(
        JSON.stringify({ error: "Extension token expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = session.user_id;

    const body = await req.json();
    const { post_id } = body;

    if (!post_id) {
      return new Response(
        JSON.stringify({ error: "post_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update post status to posted
    const { error: updateError } = await adminClient
      .from("scheduled_posts")
      .update({
        status: "posted",
        posted_at: new Date().toISOString(),
      })
      .eq("id", post_id)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update post:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update post" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also update the agent's posts_created count if there's an agent
    const { data: post } = await adminClient
      .from("scheduled_posts")
      .select("agent_id")
      .eq("id", post_id)
      .single();

    if (post?.agent_id) {
      // Fetch current count and increment
      const { data: agent } = await adminClient
        .from("agents")
        .select("posts_created")
        .eq("id", post.agent_id)
        .single();
      
      if (agent) {
        await adminClient
          .from("agents")
          .update({ posts_created: (agent.posts_created || 0) + 1 })
          .eq("id", post.agent_id);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Post complete error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
