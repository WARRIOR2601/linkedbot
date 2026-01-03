import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const ayrshareApiKey = Deno.env.get("AYRSHARE_API_KEY");

    if (!ayrshareApiKey) {
      return new Response(JSON.stringify({ error: "Ayrshare API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's Ayrshare profile key
    const { data: account, error: accountError } = await supabase
      .from("linkedin_accounts")
      .select("ayrshare_profile_key")
      .eq("user_id", user.id)
      .single();

    if (accountError || !account?.ayrshare_profile_key) {
      return new Response(JSON.stringify({ error: "No Ayrshare profile found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Unlink LinkedIn from Ayrshare profile
    const unlinkResponse = await fetch("https://api.ayrshare.com/api/profiles/social/unlink", {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${ayrshareApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profileKey: account.ayrshare_profile_key,
        platform: "linkedin",
      }),
    });

    if (!unlinkResponse.ok) {
      const errorText = await unlinkResponse.text();
      console.error("Ayrshare unlink error:", errorText);
      // Continue anyway to update local state
    }

    // Update local database
    const { error: updateError } = await supabase
      .from("linkedin_accounts")
      .update({
        ayrshare_connected: false,
        ayrshare_connected_at: null,
        is_connected: false,
        connected_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Database update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update connection status" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("LinkedIn disconnected via Ayrshare for user:", user.id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ayrshare-disconnect:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
