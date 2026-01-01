import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UpcomingEvent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_type: string;
  created_at: string;
  updated_at: string;
}

export const useUpcomingEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("upcoming_events")
        .select("*")
        .eq("user_id", user.id)
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data as UpcomingEvent[]);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const createEvent = async (eventData: Omit<UpcomingEvent, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { data, error } = await supabase
        .from("upcoming_events")
        .insert({
          user_id: user.id,
          ...eventData,
        })
        .select()
        .single();

      if (error) throw error;
      setEvents((prev) => [...prev, data as UpcomingEvent].sort((a, b) => 
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      ));
      return { data, error: null };
    } catch (err: any) {
      console.error("Error creating event:", err);
      return { data: null, error: err.message };
    }
  };

  const updateEvent = async (id: string, updates: Partial<UpcomingEvent>) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { data, error } = await supabase
        .from("upcoming_events")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setEvents((prev) => 
        prev.map((e) => (e.id === id ? (data as UpcomingEvent) : e))
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      );
      return { data, error: null };
    } catch (err: any) {
      console.error("Error updating event:", err);
      return { data: null, error: err.message };
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { error } = await supabase
        .from("upcoming_events")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setEvents((prev) => prev.filter((e) => e.id !== id));
      return { error: null };
    } catch (err: any) {
      console.error("Error deleting event:", err);
      return { error: err.message };
    }
  };

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
};
