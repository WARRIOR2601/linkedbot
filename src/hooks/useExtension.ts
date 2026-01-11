import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ExtensionStatus {
  isConnected: boolean;
  lastSeen: string | null;
}

export interface LinkedInAnalytics {
  followers: number;
  connections: number;
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  captured_at: string | null;
}

export function useExtension() {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();

  // Check if extension has an active session
  const { data: extensionStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["extension-status", user?.id],
    queryFn: async (): Promise<ExtensionStatus> => {
      if (!user) return { isConnected: false, lastSeen: null };

      const { data, error } = await supabase
        .from("extension_sessions")
        .select("expires_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return { isConnected: false, lastSeen: null };
      }

      const isExpired = new Date(data.expires_at) < new Date();
      return {
        isConnected: !isExpired,
        lastSeen: data.created_at,
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Fetch latest analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["linkedin-analytics", user?.id],
    queryFn: async (): Promise<LinkedInAnalytics> => {
      if (!session?.access_token) {
        return {
          followers: 0,
          connections: 0,
          posts: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          captured_at: null,
        };
      }

      const { data, error } = await supabase.functions.invoke("analytics-latest", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error("Failed to fetch analytics:", error);
        return {
          followers: 0,
          connections: 0,
          posts: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          captured_at: null,
        };
      }

      return data;
    },
    enabled: !!user && !!session,
    refetchInterval: 60000, // Refresh every minute
  });

  // Generate extension auth token
  const generateToken = useMutation({
    mutationFn: async () => {
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("extension-auth", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      return data.token;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extension-status"] });
    },
  });

  // Revoke all extension sessions (for logout)
  const revokeSession = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const { error } = await supabase
        .from("extension_sessions")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extension-status"] });
    },
  });

  return {
    extensionStatus: extensionStatus || { isConnected: false, lastSeen: null },
    analytics: analytics || {
      followers: 0,
      connections: 0,
      posts: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      captured_at: null,
    },
    isLoading: statusLoading || analyticsLoading,
    generateToken,
    revokeSession,
  };
}
