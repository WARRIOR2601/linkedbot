import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-extension-token",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const extensionToken = req.headers.get("x-extension-token");

    if (!extensionToken) {
      return new Response(
        JSON.stringify({ error: "Missing extension token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate the extension token
    const { data: session, error: sessionError } = await supabase
      .from("extension_sessions")
      .select("user_id, expires_at")
      .eq("token", extensionToken)
      .maybeSingle();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired
    if (new Date(session.expires_at) < new Date()) {
      // Clean up expired token
      await supabase
        .from("extension_sessions")
        .delete()
        .eq("token", extensionToken);

      return new Response(
        JSON.stringify({ error: "Token expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = session.user_id;

    // Get user's AI profile status
    const { data: profile, error: profileError } = await supabase
      .from("client_ai_profiles")
      .select("id, is_complete, business_name, agent_active, account_status")
      .eq("user_id", userId)
      .maybeSingle();

    // Get active agents count
    const { count: activeAgents } = await supabase
      .from("agents")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "active");

    // Get pending posts count
    const { count: pendingPosts } = await supabase
      .from("scheduled_posts")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "pending");

    // Get latest analytics
    const { data: analytics } = await supabase
      .from("linkedin_analytics")
      .select("followers, connections, captured_at")
      .eq("user_id", userId)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        success: true,
        userId,
        profile: profile || null,
        isProfileComplete: profile?.is_complete || false,
        activeAgents: activeAgents || 0,
        pendingPosts: pendingPosts || 0,
        analytics: analytics || null,
        accountStatus: profile?.account_status || "active",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-profile-status:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
