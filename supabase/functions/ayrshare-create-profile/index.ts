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

    // Check if user already has an Ayrshare profile
    const { data: existingAccount } = await supabase
      .from("linkedin_accounts")
      .select("ayrshare_profile_key")
      .eq("user_id", user.id)
      .single();

    if (existingAccount?.ayrshare_profile_key) {
      // Profile already exists, generate link URL
      const linkResponse = await fetch("https://api.ayrshare.com/api/profiles/generateJWT", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ayrshareApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain: Deno.env.get("SITE_URL") || supabaseUrl.replace("supabase.co", "lovable.app"),
          privateKey: true,
          profileKey: existingAccount.ayrshare_profile_key,
        }),
      });

      if (!linkResponse.ok) {
        const errorText = await linkResponse.text();
        console.error("Ayrshare JWT generation error:", errorText);
        return new Response(JSON.stringify({ error: "Failed to generate link" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const linkData = await linkResponse.json();
      return new Response(JSON.stringify({ 
        profileKey: existingAccount.ayrshare_profile_key,
        linkUrl: linkData.url 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create new Ayrshare profile for this user
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
      return new Response(JSON.stringify({ error: "Failed to create Ayrshare profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const profileData = await profileResponse.json();
    const profileKey = profileData.profileKey;

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

    // Generate JWT link for LinkedIn connection
    const linkResponse = await fetch("https://api.ayrshare.com/api/profiles/generateJWT", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ayrshareApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        domain: Deno.env.get("SITE_URL") || supabaseUrl.replace("supabase.co", "lovable.app"),
        privateKey: true,
        profileKey: profileKey,
      }),
    });

    if (!linkResponse.ok) {
      const errorText = await linkResponse.text();
      console.error("Ayrshare JWT generation error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to generate connection link" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const linkData = await linkResponse.json();

    console.log("Ayrshare profile created successfully for user:", user.id);

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
