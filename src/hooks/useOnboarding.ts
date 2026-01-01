import { useState, useEffect } from "react";
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
  created_at: string;
  updated_at: string;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("client_ai_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      console.error("Error fetching onboarding profile:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

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
    refetch: fetchProfile,
  };
};
