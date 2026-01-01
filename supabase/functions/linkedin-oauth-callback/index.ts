import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const linkedinClientId = Deno.env.get("LINKEDIN_CLIENT_ID");
    const linkedinClientSecret = Deno.env.get("LINKEDIN_CLIENT_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    if (!linkedinClientId || !linkedinClientSecret) {
      console.error("LinkedIn OAuth credentials not configured");
      return new Response(
        JSON.stringify({ error: "LinkedIn OAuth not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { code, redirectUri, userId } = await req.json();

    if (!code || !redirectUri || !userId) {
      return new Response(
        JSON.stringify({ error: "code, redirectUri, and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Exchanging LinkedIn authorization code for tokens...");

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
        client_id: linkedinClientId,
        client_secret: linkedinClientSecret,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("LinkedIn token exchange failed:", tokenResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to exchange authorization code", details: errorText }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || 5184000; // Default 60 days
    const refreshToken = tokenData.refresh_token || null;

    console.log("Successfully obtained LinkedIn access token");

    // Get LinkedIn user profile using the /v2/userinfo endpoint (OIDC)
    const profileResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error("Failed to fetch LinkedIn profile:", profileResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch LinkedIn profile", details: errorText }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profileData = await profileResponse.json();
    
    const linkedinUserId = profileData.sub;
    const profileName = profileData.name || `${profileData.given_name || ''} ${profileData.family_name || ''}`.trim();
    const profilePhotoUrl = profileData.picture || null;
    const email = profileData.email || null;

    console.log(`LinkedIn profile fetched: ${profileName} (${linkedinUserId})`);

    // Calculate token expiration
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + expiresIn);

    // Upsert LinkedIn account in database
    const { data: accountData, error: upsertError } = await supabase
      .from("linkedin_accounts")
      .upsert({
        user_id: userId,
        linkedin_user_id: linkedinUserId,
        profile_name: profileName,
        profile_photo_url: profilePhotoUrl,
        headline: email, // Store email in headline for now
        access_token_encrypted: accessToken, // In production, encrypt this!
        refresh_token_encrypted: refreshToken,
        token_expires_at: tokenExpiresAt.toISOString(),
        is_connected: true,
        connected_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (upsertError) {
      console.error("Failed to save LinkedIn account:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to save LinkedIn account", details: upsertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("LinkedIn account saved successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        account: {
          linkedin_user_id: linkedinUserId,
          profile_name: profileName,
          profile_photo_url: profilePhotoUrl,
          connected_at: accountData.connected_at,
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in linkedin-oauth-callback:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
