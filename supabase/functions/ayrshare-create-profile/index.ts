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
    const ayrsharePrivateKey = Deno.env.get("AYRSHARE_PRIVATE_KEY");
    const ayrshareDomain = Deno.env.get("AYRSHARE_DOMAIN");

    if (!ayrshareApiKey) {
      console.error("AYRSHARE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Ayrshare API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ayrsharePrivateKey) {
      console.error("AYRSHARE_PRIVATE_KEY not configured");
      return new Response(JSON.stringify({ error: "Ayrshare private key not configured" }), {
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

    // Get the request origin for redirect URL
    const origin = req.headers.get("origin") || "https://linkedbot.lovable.app";
    const redirectUrl = `${origin}/app/linkedin?status=success`;

    // Check if user already has an Ayrshare profile
    const { data: existingAccount } = await supabase
      .from("linkedin_accounts")
      .select("ayrshare_profile_key")
      .eq("user_id", user.id)
      .single();

    let profileKey = existingAccount?.ayrshare_profile_key;

    if (!profileKey) {
      // Create new Ayrshare profile for this user
      console.log("Creating new Ayrshare profile for user:", user.id);
      
      const profileResponse = await fetch("https://api.ayrshare.com/api/profiles/profile", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ayrshareApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: `linkedbot-user-${user.id.substring(0, 8)}`,
        }),
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error("Ayrshare profile creation error:", errorText);
        return new Response(JSON.stringify({ error: "Failed to create Ayrshare profile", details: errorText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const profileData = await profileResponse.json();
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

    // Generate JWT link for LinkedIn connection
    console.log("Generating JWT for profile:", profileKey);
    
    const linkResponse = await fetch("https://api.ayrshare.com/api/profiles/generateJWT", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ayrshareApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: ayrshareDomain,
        privateKey: ayrsharePrivateKey,
        profileKey: profileKey,
        redirect: redirectUrl,
        allowedSocial: ["linkedin"],
      }),
    });

    const linkResponseText = await linkResponse.text();
    console.log("Ayrshare JWT response status:", linkResponse.status);
    console.log("Ayrshare JWT response:", linkResponseText);

    if (!linkResponse.ok) {
      console.error("Ayrshare JWT generation error:", linkResponseText);
      return new Response(JSON.stringify({ 
        error: "Failed to generate connection link", 
        details: linkResponseText 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let linkData;
    try {
      linkData = JSON.parse(linkResponseText);
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
      linkUrl: linkData.url 
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
