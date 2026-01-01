import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AITrainingUpdate {
  id: string;
  user_id: string;
  content: string;
  update_type: "general" | "tone" | "focus" | "business";
  created_at: string;
}

export const useAITraining = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<AITrainingUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastTrainedAt, setLastTrainedAt] = useState<string | null>(null);

  const fetchUpdates = async () => {
    if (!user) {
      setUpdates([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("ai_training_updates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUpdates(data as AITrainingUpdate[]);
      if (data && data.length > 0) {
        setLastTrainedAt(data[0].created_at);
      }
    } catch (err: any) {
      console.error("Error fetching training updates:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [user]);

  const addUpdate = async (content: string, updateType: AITrainingUpdate["update_type"]) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { data, error } = await supabase
        .from("ai_training_updates")
        .insert({
          user_id: user.id,
          content,
          update_type: updateType,
        })
        .select()
        .single();

      if (error) throw error;
      setUpdates((prev) => [data as AITrainingUpdate, ...prev]);
      setLastTrainedAt(data.created_at);
      return { data, error: null };
    } catch (err: any) {
      console.error("Error adding training update:", err);
      return { data: null, error: err.message };
    }
  };

  const deleteUpdate = async (id: string) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { error } = await supabase
        .from("ai_training_updates")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setUpdates((prev) => prev.filter((u) => u.id !== id));
      return { error: null };
    } catch (err: any) {
      console.error("Error deleting training update:", err);
      return { error: err.message };
    }
  };

  return {
    updates,
    isLoading,
    lastTrainedAt,
    addUpdate,
    deleteUpdate,
    refetch: fetchUpdates,
  };
};
