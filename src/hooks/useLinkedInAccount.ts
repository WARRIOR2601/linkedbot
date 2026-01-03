import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LinkedInAccount {
  id: string;
  user_id: string;
  linkedin_user_id: string | null;
  profile_name: string | null;
  profile_photo_url: string | null;
  headline: string | null;
  followers_count: number | null;
  is_connected: boolean;
  token_expires_at: string | null;
  connected_at: string | null;
  created_at: string;
  updated_at: string;
  // Ayrshare fields
  ayrshare_profile_key: string | null;
  ayrshare_connected: boolean | null;
  ayrshare_connected_at: string | null;
}

export type ConnectionStatus = "not_connected" | "connected" | "expired";

export const useLinkedInAccount = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState<LinkedInAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async () => {
    if (!user) {
      setAccount(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("linkedin_accounts")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setAccount(data as LinkedInAccount | null);
    } catch (err: any) {
      console.error("Error fetching LinkedIn account:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const getConnectionStatus = (): ConnectionStatus => {
    if (!account) {
      return "not_connected";
    }
    
    // Prioritize Ayrshare connection status
    if (account.ayrshare_connected) {
      return "connected";
    }
    
    // Fallback to legacy OAuth connection
    if (account.is_connected) {
      if (account.token_expires_at) {
        const expiresAt = new Date(account.token_expires_at);
        if (expiresAt < new Date()) {
          return "expired";
        }
      }
      return "connected";
    }
    
    return "not_connected";
  };

  const disconnectAccount = async () => {
    if (!user || !account) return { error: "No account to disconnect" };

    try {
      // Use Ayrshare disconnect if available
      if (account.ayrshare_profile_key) {
        const { error } = await supabase.functions.invoke("ayrshare-disconnect");
        if (error) throw error;
      } else {
        // Legacy disconnect
        const { error } = await supabase
          .from("linkedin_accounts")
          .update({
            is_connected: false,
            access_token_encrypted: null,
            refresh_token_encrypted: null,
            token_expires_at: null,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      }
      
      await fetchAccount();
      return { error: null };
    } catch (err: any) {
      console.error("Error disconnecting LinkedIn account:", err);
      return { error: err.message };
    }
  };

  // This function would be called after successful OAuth flow (legacy)
  const connectAccount = async (linkedInData: {
    linkedin_user_id: string;
    profile_name: string;
    profile_photo_url?: string;
    headline?: string;
    followers_count?: number;
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  }) => {
    if (!user) return { error: "No user logged in" };

    try {
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setSeconds(tokenExpiresAt.getSeconds() + linkedInData.expires_in);

      const accountData = {
        user_id: user.id,
        linkedin_user_id: linkedInData.linkedin_user_id,
        profile_name: linkedInData.profile_name,
        profile_photo_url: linkedInData.profile_photo_url || null,
        headline: linkedInData.headline || null,
        followers_count: linkedInData.followers_count || null,
        access_token_encrypted: linkedInData.access_token,
        refresh_token_encrypted: linkedInData.refresh_token || null,
        token_expires_at: tokenExpiresAt.toISOString(),
        is_connected: true,
        connected_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("linkedin_accounts")
        .upsert(accountData, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;
      setAccount(data as LinkedInAccount);
      return { data, error: null };
    } catch (err: any) {
      console.error("Error connecting LinkedIn account:", err);
      return { data: null, error: err.message };
    }
  };

  // Check if user can post (has active Ayrshare connection)
  const canPost = (): boolean => {
    return !!account?.ayrshare_connected;
  };

  return {
    account,
    isLoading,
    error,
    connectionStatus: getConnectionStatus(),
    connectAccount,
    disconnectAccount,
    refetch: fetchAccount,
    canPost: canPost(),
  };
};
