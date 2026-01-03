import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface OnboardingProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  industry: string | null;
  description: string | null;
  target_audience: string | null;
  goals: string[] | null;
  tone_of_voice: string | null;
  posting_frequency: string | null;
  is_complete: boolean;
  account_status: string;
  created_at: string;
  updated_at: string;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Track last fetched user ID to prevent redundant fetches on tab focus
  const lastFetchedUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchProfile = useCallback(async (force = false) => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      lastFetchedUserIdRef.current = null;
      return;
    }

    // Skip if we already fetched for this user (prevents tab-focus refetch)
    if (!force && lastFetchedUserIdRef.current === user.id && profile !== null) {
      return;
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      return;
    }

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      const { data, error } = await supabase
        .from("client_ai_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
      lastFetchedUserIdRef.current = user.id;
    } catch (err: any) {
      console.error("Error fetching onboarding profile:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [user, profile]);

  useEffect(() => {
    // Only fetch if user ID actually changed (not just reference)
    if (user?.id !== lastFetchedUserIdRef.current) {
      fetchProfile();
    }
  }, [user?.id, fetchProfile]);

  const saveProfile = async (profileData: Partial<OnboardingProfile>) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { data, error } = await supabase
        .from("client_ai_profiles")
        .upsert({
          user_id: user.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (err: any) {
      console.error("Error saving onboarding profile:", err);
      return { data: null, error: err.message };
    }
  };

  const completeOnboarding = async (profileData: Partial<OnboardingProfile>) => {
    return saveProfile({
      ...profileData,
      is_complete: true,
    });
  };

  return {
    profile,
    isLoading,
    error,
    isComplete: profile?.is_complete ?? false,
    saveProfile,
    completeOnboarding,
    refetch: () => fetchProfile(true),
  };
};
