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
    const { data: account } = await supabase
      .from("linkedin_accounts")
      .select("ayrshare_profile_key, ayrshare_connected")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!account?.ayrshare_profile_key) {
      return new Response(JSON.stringify({ 
        connected: false,
        hasProfile: false 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check connected platforms from Ayrshare using correct endpoint
    console.log("Checking Ayrshare profile status for key:", account.ayrshare_profile_key);
    const profileResponse = await fetch("https://app.ayrshare.com/api/user", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${ayrshareApiKey}`,
        "Profile-Key": account.ayrshare_profile_key,
      },
    });

    const profileResponseText = await profileResponse.text();
    console.log("Ayrshare user response status:", profileResponse.status);
    console.log("Ayrshare user response:", profileResponseText);

    if (!profileResponse.ok) {
      console.error("Failed to get Ayrshare profile status:", profileResponseText);
      return new Response(JSON.stringify({ 
        connected: account.ayrshare_connected || false,
        hasProfile: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let profileData;
    try {
      profileData = JSON.parse(profileResponseText);
    } catch (e) {
      console.error("Failed to parse profile response");
      return new Response(JSON.stringify({ 
        connected: account.ayrshare_connected || false,
        hasProfile: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const activeSocialAccounts = profileData.activeSocialAccounts || [];
    const linkedinConnected = activeSocialAccounts.includes("linkedin");

    // Update connection status in database if changed
    if (linkedinConnected !== account.ayrshare_connected) {
      await supabase
        .from("linkedin_accounts")
        .update({
          ayrshare_connected: linkedinConnected,
          ayrshare_connected_at: linkedinConnected ? new Date().toISOString() : null,
          is_connected: linkedinConnected,
          connected_at: linkedinConnected ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    }

    console.log("Ayrshare status check for user:", user.id, "LinkedIn connected:", linkedinConnected);

    return new Response(JSON.stringify({ 
      connected: linkedinConnected,
      hasProfile: true,
      activePlatforms: activeSocialAccounts
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ayrshare-check-status:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
