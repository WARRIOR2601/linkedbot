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
    const { followers, connections, posts, likes, comments, shares } = body;

    // Validate required fields
    if (
      typeof followers !== "number" ||
      typeof connections !== "number" ||
      typeof posts !== "number" ||
      typeof likes !== "number" ||
      typeof comments !== "number" ||
      typeof shares !== "number"
    ) {
      return new Response(
        JSON.stringify({ error: "All analytics fields must be numbers" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert analytics record
    const { error: insertError } = await adminClient
      .from("linkedin_analytics")
      .insert({
        user_id: userId,
        followers,
        connections,
        posts,
        likes,
        comments,
        shares,
        captured_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Failed to save analytics:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save analytics" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Extension analytics error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
