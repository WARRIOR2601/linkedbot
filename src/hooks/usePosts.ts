import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PostStatus = "draft" | "scheduled" | "posted" | "failed";

export interface Post {
  id: string;
  user_id: string;
  agent_id: string | null;
  content: string;
  ai_model: string;
  tags: string[];
  hashtags: string[];
  post_length: string;
  guidance: string | null;
  image_url: string | null;
  status: PostStatus;
  scheduled_at: string | null;
  posted_at: string | null;
  linkedin_post_id: string | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export const usePosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    if (!user) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data as Post[]);
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const createPost = async (postData: Omit<Post, "id" | "user_id" | "created_at" | "updated_at" | "posted_at" | "linkedin_post_id" | "error_message" | "retry_count">) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { data, error } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          ...postData,
        })
        .select()
        .single();

      if (error) throw error;
      setPosts((prev) => [data as Post, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      console.error("Error creating post:", err);
      return { data: null, error: err.message };
    }
  };

  const updatePost = async (id: string, updates: Partial<Post>) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { data, error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setPosts((prev) => prev.map((p) => (p.id === id ? (data as Post) : p)));
      return { data, error: null };
    } catch (err: any) {
      console.error("Error updating post:", err);
      return { data: null, error: err.message };
    }
  };

  const deletePost = async (id: string) => {
    if (!user) return { error: "No user logged in" };

    try {
      const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      setPosts((prev) => prev.filter((p) => p.id !== id));
      return { error: null };
    } catch (err: any) {
      console.error("Error deleting post:", err);
      return { error: err.message };
    }
  };

  const retryPost = async (id: string) => {
    if (!user) return { error: "No user logged in" };

    try {
      // Reset the post to scheduled status for retry
      const { data, error } = await supabase
        .from("posts")
        .update({
          status: "scheduled",
          error_message: null,
          retry_count: 0,
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setPosts((prev) => prev.map((p) => (p.id === id ? (data as Post) : p)));
      return { data, error: null };
    } catch (err: any) {
      console.error("Error retrying post:", err);
      return { data: null, error: err.message };
    }
  };

  return {
    posts,
    isLoading,
    error,
    createPost,
    updatePost,
    deletePost,
    retryPost,
    refetch: fetchPosts,
  };
};
