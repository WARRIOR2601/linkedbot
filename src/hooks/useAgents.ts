import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Agent {
  id: string;
  user_id: string;
  name: string;
  agent_type: string;
  posting_goal: string | null;
  tone_of_voice: string | null;
  topics: string[];
  posting_frequency: string;
  preferred_posting_days: number[];
  preferred_time_window_start: string;
  preferred_time_window_end: string;
  status: string;
  last_post_at: string | null;
  posts_created: number;
  created_at: string;
  updated_at: string;
  // New fields
  about_user: string | null;
  about_company: string | null;
  target_audience: string | null;
  sample_posts: string[] | null;
  auto_generate_images: boolean;
  allow_text_only_posts: boolean;
  preferred_image_style: string | null;
}

export interface AgentTrainingData {
  id: string;
  agent_id: string;
  user_id: string;
  training_type: string;
  content: string;
  created_at: string;
}

export interface CreateAgentInput {
  name: string;
  agent_type: string;
  posting_goal?: string;
  tone_of_voice?: string;
  topics?: string[];
  posting_frequency?: string;
  preferred_posting_days?: number[];
  preferred_time_window_start?: string;
  preferred_time_window_end?: string;
  about_user?: string;
  about_company?: string;
  target_audience?: string;
  sample_posts?: string[];
  auto_generate_images?: boolean;
  allow_text_only_posts?: boolean;
  preferred_image_style?: string;
}

export interface AgentTrainingInput {
  agent_id: string;
  training_type: string;
  content: string;
}

export const AGENT_TYPES = [
  { id: "professional", name: "Professional / Thought Leadership", description: "Industry insights and expertise" },
  { id: "hiring", name: "Hiring & Culture", description: "Team building and opportunities" },
  { id: "comedy", name: "Comedy / Relatable", description: "Humorous, relatable content" },
  { id: "storytelling", name: "Personal Brand Storytelling", description: "Authentic personal stories" },
  { id: "product", name: "Product / Business Updates", description: "Announcements and milestones" },
  { id: "engagement", name: "Engagement Booster", description: "Questions and discussions" },
];

export const POSTING_FREQUENCIES = [
  { id: "daily", name: "Daily", description: "Post every day" },
  { id: "weekdays", name: "Weekdays Only", description: "Monday to Friday" },
  { id: "custom", name: "Custom Days", description: "Select specific days" },
];

export const WEEKDAYS = [
  { id: 0, name: "Sunday" },
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
];

export const IMAGE_STYLES = [
  { id: "professional", name: "Professional", description: "Clean, corporate imagery" },
  { id: "creative", name: "Creative", description: "Artistic and eye-catching" },
  { id: "minimal", name: "Minimal", description: "Simple, text-focused visuals" },
  { id: "vibrant", name: "Vibrant", description: "Colorful and energetic" },
  { id: "tech", name: "Tech/Modern", description: "Futuristic, technology-focused" },
];

export function useAgents() {
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Agent[];
    },
  });

  const createAgent = useMutation({
    mutationFn: async (input: CreateAgentInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("agents")
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent created successfully!");
    },
    onError: (error) => {
      toast.error("Failed to create agent: " + error.message);
    },
  });

  const updateAgent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Agent> & { id: string }) => {
      const { data, error } = await supabase
        .from("agents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent updated!");
    },
    onError: (error) => {
      toast.error("Failed to update agent: " + error.message);
    },
  });

  const toggleAgentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "running" | "paused" }) => {
      const { data, error } = await supabase
        .from("agents")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Agent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success(`Agent ${data.status === "running" ? "started" : "paused"}!`);
    },
    onError: (error) => {
      toast.error("Failed to update agent status: " + error.message);
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent deleted!");
    },
    onError: (error) => {
      toast.error("Failed to delete agent: " + error.message);
    },
  });

  return {
    agents,
    isLoading,
    createAgent,
    updateAgent,
    toggleAgentStatus,
    deleteAgent,
  };
}

export function useAgentTraining(agentId: string | null) {
  const queryClient = useQueryClient();

  const { data: trainingData = [], isLoading } = useQuery({
    queryKey: ["agent-training", agentId],
    queryFn: async () => {
      if (!agentId) return [];
      
      const { data, error } = await supabase
        .from("agent_training_data")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AgentTrainingData[];
    },
    enabled: !!agentId,
  });

  const addTrainingData = useMutation({
    mutationFn: async (input: AgentTrainingInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("agent_training_data")
        .insert({
          ...input,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as AgentTrainingData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-training", agentId] });
      toast.success("Training data added!");
    },
    onError: (error) => {
      toast.error("Failed to add training data: " + error.message);
    },
  });

  const deleteTrainingData = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agent_training_data").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-training", agentId] });
      toast.success("Training data removed!");
    },
    onError: (error) => {
      toast.error("Failed to remove training data: " + error.message);
    },
  });

  return {
    trainingData,
    isLoading,
    addTrainingData,
    deleteTrainingData,
  };
}

export function useAgentPosts(agentId: string | null) {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["agent-posts", agentId],
    queryFn: async () => {
      if (!agentId) return [];
      
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("agent_id", agentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!agentId,
  });

  return { posts, isLoading };
}
