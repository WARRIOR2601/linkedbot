import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AgentStatus = "draft" | "active" | "paused" | "error";

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
  status: AgentStatus;
  last_post_at: string | null;
  posts_created: number;
  created_at: string;
  updated_at: string;
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
  { id: "weekly", name: "Weekly", description: "Once per week" },
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

export const getStatusColor = (status: AgentStatus) => {
  switch (status) {
    case "active":
      return "bg-success/10 text-success border-success/20";
    case "paused":
      return "bg-warning/10 text-warning border-warning/20";
    case "error":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "draft":
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const getStatusLabel = (status: AgentStatus) => {
  switch (status) {
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "error":
      return "Error";
    case "draft":
    default:
      return "Draft";
  }
};

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
          status: "draft", // Always start as draft
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

  const activateAgent = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("agents")
        .update({ status: "active" })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      toast.success("Agent activated - autonomous posting enabled!");
    },
    onError: (error) => {
      toast.error("Failed to activate agent: " + error.message);
    },
  });

  const toggleAgentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "paused" }) => {
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
      toast.success(`Agent ${data.status === "active" ? "activated" : "paused"}!`);
    },
    onError: (error) => {
      toast.error("Failed to update agent status: " + error.message);
    },
  });

  const deleteAgent = useMutation({
    mutationFn: async (id: string) => {
      // First delete training data
      await supabase.from("agent_training_data").delete().eq("agent_id", id);
      // Then delete agent
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
    activateAgent,
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

// Analytics for agents
export interface AgentStats {
  id: string;
  name: string;
  type: string;
  status: AgentStatus;
  postsCreated: number;
  postsPublished: number;
  postsScheduled: number;
  totalImpressions: number;
  totalLikes: number;
  totalComments: number;
  avgEngagement: number;
  lastActive: string | null;
  bestPost: {
    id: string;
    content: string;
    engagement: number;
  } | null;
}

export interface TagAnalytics {
  tag: string;
  postCount: number;
  totalImpressions: number;
  avgEngagement: number;
}

export interface AgentAnalyticsData {
  agents: AgentStats[];
  tagAnalytics: TagAnalytics[];
  imageVsText: {
    imagePosts: number;
    textPosts: number;
    imageEngagement: number;
    textEngagement: number;
  };
  totalPosts: number;
  totalPublished: number;
  totalScheduled: number;
}

export function useAgentAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["agent-analytics"],
    queryFn: async (): Promise<AgentAnalyticsData | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Fetch agents
      const { data: agents, error: agentsError } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id);

      if (agentsError) throw agentsError;

      // Fetch all posts with analytics
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          post_analytics (*)
        `)
        .eq("user_id", user.id);

      if (postsError) throw postsError;

      // Calculate agent-level stats
      const agentStats: AgentStats[] = (agents || []).map((agent) => {
        const agentPosts = (posts || []).filter((p: any) => p.agent_id === agent.id);
        const postedPosts = agentPosts.filter((p: any) => p.status === "posted");
        const scheduledPosts = agentPosts.filter((p: any) => p.status === "scheduled");
        
        const analytics = postedPosts.flatMap((p: any) => p.post_analytics || []);
        const totalImpressions = analytics.reduce((sum: number, a: any) => sum + (a.impressions || 0), 0);
        const totalLikes = analytics.reduce((sum: number, a: any) => sum + (a.likes || 0), 0);
        const totalComments = analytics.reduce((sum: number, a: any) => sum + (a.comments || 0), 0);
        const avgEngagement = postedPosts.length > 0
          ? analytics.reduce((sum: number, a: any) => sum + (a.engagement_rate || 0), 0) / postedPosts.length
          : 0;

        // Find best post
        const bestPost = postedPosts.sort((a: any, b: any) => {
          const aRate = a.post_analytics?.[0]?.engagement_rate || 0;
          const bRate = b.post_analytics?.[0]?.engagement_rate || 0;
          return bRate - aRate;
        })[0];

        return {
          id: agent.id,
          name: agent.name,
          type: agent.agent_type,
          status: agent.status as AgentStatus,
          postsCreated: agent.posts_created || 0,
          postsPublished: postedPosts.length,
          postsScheduled: scheduledPosts.length,
          totalImpressions,
          totalLikes,
          totalComments,
          avgEngagement,
          lastActive: agent.last_post_at,
          bestPost: bestPost ? {
            id: bestPost.id,
            content: bestPost.content.slice(0, 100),
            engagement: bestPost.post_analytics?.[0]?.engagement_rate || 0,
          } : null,
        };
      });

      // Calculate tag analytics from agent posts
      const tagStats: Record<string, { posts: number; impressions: number; engagement: number }> = {};
      (posts || []).forEach((post: any) => {
        const postAnalytics = post.post_analytics?.[0];
        (post.tags || []).forEach((tag: string) => {
          if (!tagStats[tag]) {
            tagStats[tag] = { posts: 0, impressions: 0, engagement: 0 };
          }
          tagStats[tag].posts++;
          tagStats[tag].impressions += postAnalytics?.impressions || 0;
          tagStats[tag].engagement += postAnalytics?.engagement_rate || 0;
        });
      });

      const tagAnalytics: TagAnalytics[] = Object.entries(tagStats)
        .map(([tag, stats]) => ({
          tag,
          postCount: stats.posts,
          totalImpressions: stats.impressions,
          avgEngagement: stats.posts > 0 ? stats.engagement / stats.posts : 0,
        }))
        .sort((a, b) => b.avgEngagement - a.avgEngagement);

      // Image vs text performance
      const imagePosts = (posts || []).filter((p: any) => p.image_url && p.status === "posted");
      const textOnlyPosts = (posts || []).filter((p: any) => !p.image_url && p.status === "posted");

      const imageEngagement = imagePosts.length > 0
        ? imagePosts.reduce((sum: number, p: any) => sum + (p.post_analytics?.[0]?.engagement_rate || 0), 0) / imagePosts.length
        : 0;
      const textEngagement = textOnlyPosts.length > 0
        ? textOnlyPosts.reduce((sum: number, p: any) => sum + (p.post_analytics?.[0]?.engagement_rate || 0), 0) / textOnlyPosts.length
        : 0;

      return {
        agents: agentStats,
        tagAnalytics,
        imageVsText: {
          imagePosts: imagePosts.length,
          textPosts: textOnlyPosts.length,
          imageEngagement,
          textEngagement,
        },
        totalPosts: (posts || []).length,
        totalPublished: (posts || []).filter((p: any) => p.status === "posted").length,
        totalScheduled: (posts || []).filter((p: any) => p.status === "scheduled").length,
      };
    },
  });

  return { data, isLoading };
}
