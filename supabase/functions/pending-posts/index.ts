import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-extension-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
      // Clean up expired session
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

    // Get user's subscription for plan-based limits
    const { data: subscription } = await adminClient
      .from("user_subscriptions")
      .select("plan")
      .eq("user_id", userId)
      .single();

    // Determine limit based on plan
    let limit = 5;
    if (subscription?.plan === "pro") limit = 20;
    if (subscription?.plan === "business") limit = 50;

    // Get pending posts that are due
    const now = new Date().toISOString();
    const { data: posts, error: postsError } = await adminClient
      .from("scheduled_posts")
      .select("id, content, agent_id")
      .eq("user_id", userId)
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .order("scheduled_for", { ascending: true })
      .limit(limit);

    if (postsError) {
      console.error("Failed to fetch posts:", postsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch posts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = posts.map((post) => ({
      post_id: post.id,
      content: post.content,
      agent_id: post.agent_id,
    }));

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Pending posts error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
