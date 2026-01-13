import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export type ScheduledPostStatus = "pending" | "published" | "failed" | "paused" | "skipped";

export interface ScheduledPost {
  id: string;
  user_id: string;
  agent_id: string | null;
  content: string;
  scheduled_for: string;
  status: ScheduledPostStatus;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useScheduledPosts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: scheduledPosts = [], isLoading } = useQuery({
    queryKey: ["scheduled-posts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("scheduled_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      return data as ScheduledPost[];
    },
    enabled: !!user,
  });

  const updatePostStatus = useMutation({
    mutationFn: async ({ postId, status }: { postId: string; status: ScheduledPostStatus }) => {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const postNow = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ 
          scheduled_for: new Date().toISOString(),
          status: "pending",
          updated_at: new Date().toISOString() 
        })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      toast({
        title: "Post queued",
        description: "The post will be published when the extension is active.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const skipPost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ status: "skipped", updated_at: new Date().toISOString() })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      toast({
        title: "Post skipped",
        description: "This post will not be published.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const togglePause = useMutation({
    mutationFn: async ({ postId, currentStatus }: { postId: string; currentStatus: ScheduledPostStatus }) => {
      const newStatus = currentStatus === "paused" ? "pending" : "paused";
      const { error } = await supabase
        .from("scheduled_posts")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", postId);

      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      toast({
        title: newStatus === "paused" ? "Post paused" : "Post resumed",
        description: newStatus === "paused" 
          ? "This post will not be published until resumed." 
          : "This post will be published at the scheduled time.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("scheduled_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      toast({
        title: "Post deleted",
        description: "The scheduled post has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter to get pending posts only (what extension sees)
  const pendingPosts = scheduledPosts.filter(p => p.status === "pending");
  const pausedPosts = scheduledPosts.filter(p => p.status === "paused");
  const upcomingPosts = scheduledPosts.filter(p => 
    (p.status === "pending" || p.status === "paused") && 
    new Date(p.scheduled_for) > new Date()
  );

  return {
    scheduledPosts,
    pendingPosts,
    pausedPosts,
    upcomingPosts,
    isLoading,
    postNow: postNow.mutate,
    skipPost: skipPost.mutate,
    togglePause: togglePause.mutate,
    deletePost: deletePost.mutate,
    updatePostStatus: updatePostStatus.mutate,
    isUpdating: updatePostStatus.isPending || postNow.isPending || skipPost.isPending || togglePause.isPending,
  };
};
