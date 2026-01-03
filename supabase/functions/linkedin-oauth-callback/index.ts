import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple encryption using Web Crypto API
async function encryptToken(token: string, secretKey: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey.slice(0, 32).padEnd(32, '0')),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    keyMaterial,
    new TextEncoder().encode(token)
  );
  
  // Convert to hex strings for storage
  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const encryptedHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${ivHex}:${encryptedHex}`;
}

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
    const tokenEncryptionKey = Deno.env.get("TOKEN_ENCRYPTION_KEY") || supabaseServiceKey;
    
    if (!linkedinClientId || !linkedinClientSecret) {
      console.error("LinkedIn OAuth credentials not configured");
      return new Response(
        JSON.stringify({ error: "LinkedIn OAuth not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { code, redirectUri, userId, state } = await req.json();

    if (!code || !redirectUri || !userId) {
      return new Response(
        JSON.stringify({ error: "code, redirectUri, and userId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log state for debugging (state validation happens on client side)
    console.log("OAuth callback received with state:", state ? "present" : "missing");
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

    // Encrypt tokens before storing
    const encryptedAccessToken = await encryptToken(accessToken, tokenEncryptionKey);
    const encryptedRefreshToken = refreshToken 
      ? await encryptToken(refreshToken, tokenEncryptionKey) 
      : null;

    console.log("Tokens encrypted successfully");

    // Upsert LinkedIn account in database
    const { data: accountData, error: upsertError } = await supabase
      .from("linkedin_accounts")
      .upsert({
        user_id: userId,
        linkedin_user_id: linkedinUserId,
        profile_name: profileName,
        profile_photo_url: profilePhotoUrl,
        headline: email, // Store email in headline for now
        access_token_encrypted: encryptedAccessToken,
        refresh_token_encrypted: encryptedRefreshToken,
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

    console.log("LinkedIn account saved successfully with encrypted tokens");

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