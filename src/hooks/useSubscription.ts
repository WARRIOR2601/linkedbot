import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionPlan = "free" | "pro" | "business";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  max_agents: number;
  autonomous_posting_enabled: boolean;
  image_generation_enabled: boolean;
  advanced_analytics_enabled: boolean;
  priority_execution: boolean;
  show_branding: boolean;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanDetails {
  name: string;
  displayName: string;
  price: number;
  maxAgents: number;
  features: string[];
  autonomousPosting: boolean;
  imageGeneration: boolean;
  advancedAnalytics: boolean;
  priorityExecution: boolean;
  showBranding: boolean;
}

export const PLAN_DETAILS: Record<SubscriptionPlan, PlanDetails> = {
  free: {
    name: "free",
    displayName: "Free",
    price: 0,
    maxAgents: 1,
    features: [
      "1 AI Agent",
      "Limited autonomous posting (14 days)",
      "Basic analytics",
      "Limited image generation",
      "Linkedbot branding",
    ],
    autonomousPosting: false,
    imageGeneration: false,
    advancedAnalytics: false,
    priorityExecution: false,
    showBranding: true,
  },
  pro: {
    name: "pro",
    displayName: "Pro",
    price: 29,
    maxAgents: 5,
    features: [
      "Up to 5 AI Agents",
      "Unlimited autonomous posting",
      "Full analytics (agent + tag + image)",
      "Unlimited image generation",
      "Priority agent execution",
      "No branding watermark",
    ],
    autonomousPosting: true,
    imageGeneration: true,
    advancedAnalytics: true,
    priorityExecution: true,
    showBranding: false,
  },
  business: {
    name: "business",
    displayName: "Business",
    price: 99,
    maxAgents: 15,
    features: [
      "Up to 15 AI Agents",
      "Everything in Pro",
      "Advanced analytics & insights",
      "Priority support",
      "Team access (coming soon)",
      "Multiple brands (coming soon)",
    ],
    autonomousPosting: true,
    imageGeneration: true,
    advancedAnalytics: true,
    priorityExecution: true,
    showBranding: false,
  },
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSubscription(data as unknown as Subscription);
      } else {
        // Create default subscription if none exists
        const { data: newSub, error: createError } = await supabase
          .from("user_subscriptions")
          .insert({
            user_id: user.id,
            plan: "free",
            max_agents: 1,
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        setSubscription(newSub as unknown as Subscription);
      }
    } catch (err: any) {
      console.error("Error fetching subscription:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const getPlanDetails = (): PlanDetails => {
    return PLAN_DETAILS[subscription?.plan || "free"];
  };

  const isTrialActive = (): boolean => {
    if (!subscription?.trial_ends_at) return false;
    return new Date(subscription.trial_ends_at) > new Date();
  };

  const getTrialDaysRemaining = (): number => {
    if (!subscription?.trial_ends_at) return 0;
    const diff = new Date(subscription.trial_ends_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const canCreateAgent = (currentAgentCount: number): boolean => {
    const maxAgents = subscription?.max_agents || 1;
    return currentAgentCount < maxAgents;
  };

  const getRemainingAgentSlots = (currentAgentCount: number): number => {
    const maxAgents = subscription?.max_agents || 1;
    return Math.max(0, maxAgents - currentAgentCount);
  };

  const hasFeature = (feature: "autonomousPosting" | "imageGeneration" | "advancedAnalytics" | "priorityExecution"): boolean => {
    if (!subscription) return false;
    
    // During trial, grant all features
    if (isTrialActive()) return true;

    switch (feature) {
      case "autonomousPosting":
        return subscription.autonomous_posting_enabled;
      case "imageGeneration":
        return subscription.image_generation_enabled;
      case "advancedAnalytics":
        return subscription.advanced_analytics_enabled;
      case "priorityExecution":
        return subscription.priority_execution;
      default:
        return false;
    }
  };

  return {
    subscription,
    isLoading,
    error,
    planDetails: getPlanDetails(),
    isTrialActive: isTrialActive(),
    trialDaysRemaining: getTrialDaysRemaining(),
    canCreateAgent,
    getRemainingAgentSlots,
    hasFeature,
    refetch: fetchSubscription,
  };
};
