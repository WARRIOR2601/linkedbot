import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!linkedinClientId) {
      console.error("LINKEDIN_CLIENT_ID not configured");
      return new Response(
        JSON.stringify({ error: "LinkedIn OAuth not configured. Please add LINKEDIN_CLIENT_ID secret." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { redirectUri, state } = await req.json();

    if (!redirectUri) {
      return new Response(
        JSON.stringify({ error: "redirectUri is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // LinkedIn OAuth 2.0 scopes for posting
    // - openid: Required for OIDC
    // - profile: Access to basic profile info
    // - email: Access to email address
    // - w_member_social: Write access to post on behalf of user
    const scopes = ["openid", "profile", "email", "w_member_social"].join(" ");

    const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", linkedinClientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("state", state || crypto.randomUUID());

    console.log("Generated LinkedIn OAuth URL for redirect:", redirectUri);

    return new Response(
      JSON.stringify({ 
        authUrl: authUrl.toString(),
        state: authUrl.searchParams.get("state")
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error in linkedin-oauth-init:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
