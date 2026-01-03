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
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const ayrshareApiKey = Deno.env.get("AYRSHARE_API_KEY");
    const ayrshareDomain = Deno.env.get("AYRSHARE_DOMAIN");

    if (!ayrshareApiKey) {
      console.error("AYRSHARE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Ayrshare API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ayrshareDomain) {
      console.error("AYRSHARE_DOMAIN not configured");
      return new Response(JSON.stringify({ error: "Ayrshare domain not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User auth error:", userError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Processing Ayrshare connection for user:", user.id);

    // Check if user already has an Ayrshare profile
    const { data: existingAccount } = await supabase
      .from("linkedin_accounts")
      .select("ayrshare_profile_key")
      .eq("user_id", user.id)
      .maybeSingle();

    let profileKey = existingAccount?.ayrshare_profile_key;

    if (!profileKey) {
      // Create new Ayrshare profile for this user
      console.log("Creating new Ayrshare profile for user:", user.id);
      
      const profileResponse = await fetch("https://app.ayrshare.com/api/profiles/create-profile", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ayrshareApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `linkedbot-user-${user.id.substring(0, 8)}`,
        }),
      });

      const profileResponseText = await profileResponse.text();
      console.log("Ayrshare create-profile response status:", profileResponse.status);
      console.log("Ayrshare create-profile response:", profileResponseText);

      if (!profileResponse.ok) {
        console.error("Ayrshare profile creation error:", profileResponseText);
        return new Response(JSON.stringify({ 
          error: "Failed to create Ayrshare profile", 
          details: profileResponseText 
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let profileData;
      try {
        profileData = JSON.parse(profileResponseText);
      } catch (e) {
        console.error("Failed to parse profile response:", e);
        return new Response(JSON.stringify({ error: "Invalid response from Ayrshare" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      profileKey = profileData.profileKey;
      console.log("Ayrshare profile created with key:", profileKey);

      // Store profile key in database
      const { error: upsertError } = await supabase
        .from("linkedin_accounts")
        .upsert({
          user_id: user.id,
          ayrshare_profile_key: profileKey,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (upsertError) {
        console.error("Database upsert error:", upsertError);
        return new Response(JSON.stringify({ error: "Failed to store profile key" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate JWT link for LinkedIn connection using Ayrshare's generateJWT endpoint
    const redirectUrl = `${ayrshareDomain}/app/linkedin`;
    console.log("Generating JWT for profile:", profileKey, "with redirect:", redirectUrl);
    
    const jwtResponse = await fetch("https://app.ayrshare.com/api/generateJWT", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ayrshareApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profileKey: profileKey,
        redirect: redirectUrl,
      }),
    });

    const jwtResponseText = await jwtResponse.text();
    console.log("Ayrshare generateJWT response status:", jwtResponse.status);
    console.log("Ayrshare generateJWT response:", jwtResponseText);

    if (!jwtResponse.ok) {
      console.error("Ayrshare generateJWT error:", jwtResponseText);
      return new Response(JSON.stringify({ 
        error: "Failed to generate connection link", 
        details: jwtResponseText 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let jwtData;
    try {
      jwtData = JSON.parse(jwtResponseText);
    } catch (e) {
      console.error("Failed to parse JWT response:", e);
      return new Response(JSON.stringify({ error: "Invalid response from Ayrshare" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Ayrshare link generated successfully for user:", user.id);

    return new Response(JSON.stringify({ 
      profileKey,
      linkUrl: jwtData.url 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in ayrshare-create-profile:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
