import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, startOfDay, startOfWeek, startOfMonth, startOfYear, subDays, subWeeks, subMonths, subYears, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

export type TimeRange = "day" | "week" | "month" | "year";

interface PostWithAnalytics {
  id: string;
  content: string;
  ai_model: string;
  tags: string[] | null;
  status: string;
  created_at: string;
  posted_at: string | null;
  scheduled_at: string | null;
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  engagement_rate?: number;
}

interface TagAnalytics {
  tag: string;
  postCount: number;
  totalImpressions: number;
  avgEngagementRate: number;
  trend: "up" | "down" | "neutral";
}

interface OverviewStats {
  totalPosts: number;
  postsChange: number;
  postedPosts: number;
  scheduledPosts: number;
  draftPosts: number;
  failedPosts: number;
  totalImpressions: number;
  impressionsChange: number;
  totalEngagement: number;
  engagementChange: number;
  avgEngagementRate: number;
}

interface EngagementTrend {
  date: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  posts: number;
}

interface BestPostingTime {
  day: string;
  hour: number;
  postCount: number;
  avgEngagement: number;
}

interface TopPost {
  id: string;
  content: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  postedAt: string;
}

interface AIModelPerformance {
  model: string;
  postCount: number;
  avgEngagementRate: number;
  totalImpressions: number;
}

export const useAnalytics = (timeRange: TimeRange = "month") => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostWithAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate date range based on timeRange
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    
    switch (timeRange) {
      case "day":
        start = subDays(now, 1);
        break;
      case "week":
        start = subWeeks(now, 1);
        break;
      case "month":
        start = subMonths(now, 1);
        break;
      case "year":
        start = subYears(now, 1);
        break;
      default:
        start = subMonths(now, 1);
    }
    
    return { start, end: now };
  }, [timeRange]);

  // Fetch posts and their analytics
  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setPosts([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;

        // Fetch analytics for all posts
        const { data: analyticsData, error: analyticsError } = await supabase
          .from("post_analytics")
          .select("*")
          .eq("user_id", user.id);

        if (analyticsError) throw analyticsError;

        // Merge posts with their analytics
        const postsWithAnalytics = (postsData || []).map((post) => {
          const analytics = (analyticsData || []).find((a) => a.post_id === post.id);
          return {
            ...post,
            impressions: analytics?.impressions || 0,
            likes: analytics?.likes || 0,
            comments: analytics?.comments || 0,
            shares: analytics?.shares || 0,
            engagement_rate: analytics?.engagement_rate || 0,
          };
        });

        setPosts(postsWithAnalytics);
      } catch (err: any) {
        console.error("Error fetching analytics:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, timeRange]);

  // Filter posts by date range
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const postDate = post.posted_at ? parseISO(post.posted_at) : parseISO(post.created_at);
      return postDate >= dateRange.start && postDate <= dateRange.end;
    });
  }, [posts, dateRange]);

  // Calculate overview stats
  const overviewStats = useMemo((): OverviewStats => {
    const posted = posts.filter((p) => p.status === "posted");
    const scheduled = posts.filter((p) => p.status === "scheduled");
    const drafts = posts.filter((p) => p.status === "draft");
    const failed = posts.filter((p) => p.status === "failed");

    const totalImpressions = posted.reduce((sum, p) => sum + (p.impressions || 0), 0);
    const totalLikes = posted.reduce((sum, p) => sum + (p.likes || 0), 0);
    const totalComments = posted.reduce((sum, p) => sum + (p.comments || 0), 0);
    const totalShares = posted.reduce((sum, p) => sum + (p.shares || 0), 0);
    const totalEngagement = totalLikes + totalComments + totalShares;

    const avgEngagementRate = posted.length > 0
      ? posted.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / posted.length
      : 0;

    return {
      totalPosts: posts.length,
      postsChange: 0, // Would need previous period data for comparison
      postedPosts: posted.length,
      scheduledPosts: scheduled.length,
      draftPosts: drafts.length,
      failedPosts: failed.length,
      totalImpressions,
      impressionsChange: 0,
      totalEngagement,
      engagementChange: 0,
      avgEngagementRate,
    };
  }, [posts]);

  // Calculate engagement trends
  const engagementTrends = useMemo((): EngagementTrend[] => {
    const postedPosts = filteredPosts.filter((p) => p.status === "posted" && p.posted_at);
    
    if (postedPosts.length === 0) return [];

    // Group posts by date
    const groupedByDate: Record<string, PostWithAnalytics[]> = {};
    
    postedPosts.forEach((post) => {
      const dateKey = format(parseISO(post.posted_at!), "yyyy-MM-dd");
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(post);
    });

    // Generate trend data
    return Object.entries(groupedByDate)
      .map(([date, datePosts]) => ({
        date: format(parseISO(date), timeRange === "year" ? "MMM" : "MMM d"),
        impressions: datePosts.reduce((sum, p) => sum + (p.impressions || 0), 0),
        likes: datePosts.reduce((sum, p) => sum + (p.likes || 0), 0),
        comments: datePosts.reduce((sum, p) => sum + (p.comments || 0), 0),
        shares: datePosts.reduce((sum, p) => sum + (p.shares || 0), 0),
        posts: datePosts.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredPosts, timeRange]);

  // Calculate tag analytics
  const tagAnalytics = useMemo((): TagAnalytics[] => {
    const tagStats: Record<string, { posts: PostWithAnalytics[]; impressions: number; engagementSum: number }> = {};

    posts.forEach((post) => {
      if (!post.tags || post.tags.length === 0) return;
      
      post.tags.forEach((tag) => {
        if (!tagStats[tag]) {
          tagStats[tag] = { posts: [], impressions: 0, engagementSum: 0 };
        }
        tagStats[tag].posts.push(post);
        tagStats[tag].impressions += post.impressions || 0;
        tagStats[tag].engagementSum += post.engagement_rate || 0;
      });
    });

    return Object.entries(tagStats)
      .map(([tag, stats]) => ({
        tag,
        postCount: stats.posts.length,
        totalImpressions: stats.impressions,
        avgEngagementRate: stats.posts.length > 0 ? stats.engagementSum / stats.posts.length : 0,
        trend: "neutral" as const, // Would need historical data for trend
      }))
      .sort((a, b) => b.postCount - a.postCount);
  }, [posts]);

  // Calculate AI model performance
  const aiModelPerformance = useMemo((): AIModelPerformance[] => {
    const modelStats: Record<string, { posts: PostWithAnalytics[]; impressions: number; engagementSum: number }> = {};

    posts.forEach((post) => {
      const model = post.ai_model;
      if (!modelStats[model]) {
        modelStats[model] = { posts: [], impressions: 0, engagementSum: 0 };
      }
      modelStats[model].posts.push(post);
      modelStats[model].impressions += post.impressions || 0;
      modelStats[model].engagementSum += post.engagement_rate || 0;
    });

    return Object.entries(modelStats)
      .map(([model, stats]) => ({
        model,
        postCount: stats.posts.length,
        avgEngagementRate: stats.posts.length > 0 ? stats.engagementSum / stats.posts.length : 0,
        totalImpressions: stats.impressions,
      }))
      .sort((a, b) => b.avgEngagementRate - a.avgEngagementRate);
  }, [posts]);

  // Get top performing posts
  const topPosts = useMemo((): TopPost[] => {
    return posts
      .filter((p) => p.status === "posted" && p.posted_at)
      .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
      .slice(0, 5)
      .map((post) => ({
        id: post.id,
        content: post.content.slice(0, 100) + (post.content.length > 100 ? "..." : ""),
        impressions: post.impressions || 0,
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        engagementRate: post.engagement_rate || 0,
        postedAt: post.posted_at!,
      }));
  }, [posts]);

  // Calculate best posting times
  const bestPostingTimes = useMemo((): BestPostingTime[] => {
    const timeStats: Record<string, { day: string; hour: number; posts: PostWithAnalytics[] }> = {};

    posts
      .filter((p) => p.status === "posted" && p.posted_at)
      .forEach((post) => {
        const date = parseISO(post.posted_at!);
        const day = format(date, "EEE");
        const hour = date.getHours();
        const key = `${day}-${hour}`;
        
        if (!timeStats[key]) {
          timeStats[key] = { day, hour, posts: [] };
        }
        timeStats[key].posts.push(post);
      });

    return Object.values(timeStats)
      .map((stat) => ({
        day: stat.day,
        hour: stat.hour,
        postCount: stat.posts.length,
        avgEngagement: stat.posts.length > 0
          ? stat.posts.reduce((sum, p) => sum + (p.engagement_rate || 0), 0) / stat.posts.length
          : 0,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 5);
  }, [posts]);

  // Content mix by AI model
  const contentMix = useMemo(() => {
    const total = posts.length;
    if (total === 0) return [];

    const modelCounts: Record<string, number> = {};
    posts.forEach((post) => {
      modelCounts[post.ai_model] = (modelCounts[post.ai_model] || 0) + 1;
    });

    const colors = [
      "hsl(var(--primary))",
      "hsl(var(--accent))",
      "hsl(var(--success))",
      "hsl(var(--warning))",
      "hsl(var(--muted))",
      "hsl(var(--destructive))",
    ];

    return Object.entries(modelCounts).map(([model, count], index) => ({
      name: model.charAt(0).toUpperCase() + model.slice(1),
      value: Math.round((count / total) * 100),
      color: colors[index % colors.length],
    }));
  }, [posts]);

  return {
    isLoading,
    error,
    overviewStats,
    engagementTrends,
    tagAnalytics,
    aiModelPerformance,
    topPosts,
    bestPostingTimes,
    contentMix,
    hasData: posts.length > 0,
    hasPosts: posts.filter((p) => p.status === "posted").length > 0,
  };
};
