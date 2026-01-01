import { useMemo } from "react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  Users,
  Eye,
  Calendar,
  Sparkles,
  AlertCircle,
  Plus,
  BarChart3,
  FileText,
  Clock,
  CalendarCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Mock analytics data (will be replaced with real data in future steps)
const engagementData = [
  { name: "Mon", views: 1200, likes: 80, comments: 24 },
  { name: "Tue", views: 1800, likes: 120, comments: 45 },
  { name: "Wed", views: 2400, likes: 180, comments: 62 },
  { name: "Thu", views: 1600, likes: 95, comments: 38 },
  { name: "Fri", views: 2200, likes: 150, comments: 55 },
  { name: "Sat", views: 800, likes: 45, comments: 18 },
  { name: "Sun", views: 600, likes: 35, comments: 12 },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { posts, isLoading } = usePosts();

  // Calculate stats from real post data
  const stats = useMemo(() => {
    const scheduledPosts = posts.filter((p) => p.status === "scheduled");
    const draftPosts = posts.filter((p) => p.status === "draft");
    const totalPosts = posts.length;
    
    // Get next scheduled post
    const upcomingScheduled = scheduledPosts
      .filter((p) => p.scheduled_at && parseISO(p.scheduled_at) >= new Date())
      .sort((a, b) => {
        const dateA = a.scheduled_at ? parseISO(a.scheduled_at) : new Date();
        const dateB = b.scheduled_at ? parseISO(b.scheduled_at) : new Date();
        return dateA.getTime() - dateB.getTime();
      });

    const nextPost = upcomingScheduled[0];

    return {
      totalPosts,
      scheduledCount: scheduledPosts.length,
      draftCount: draftPosts.length,
      upcomingCount: upcomingScheduled.length,
      nextPost,
    };
  }, [posts]);

  // Get upcoming scheduled posts
  const upcomingPosts = useMemo(() => {
    return posts
      .filter((p) => p.status === "scheduled" && p.scheduled_at && parseISO(p.scheduled_at) >= new Date())
      .sort((a, b) => {
        const dateA = a.scheduled_at ? parseISO(a.scheduled_at) : new Date();
        const dateB = b.scheduled_at ? parseISO(b.scheduled_at) : new Date();
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3);
  }, [posts]);

  // Get recent posts (both draft and scheduled)
  const recentPosts = useMemo(() => {
    return posts
      .sort((a, b) => parseISO(b.created_at).getTime() - parseISO(a.created_at).getTime())
      .slice(0, 3);
  }, [posts]);

  if (isLoading) {
    return <DashboardLoading />;
  }

  const displayName = user?.email?.split("@")[0] || "there";

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {displayName}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/app/calendar">
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/app/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats.totalPosts}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-success" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats.upcomingCount}</p>
                <p className="text-sm text-muted-foreground">Scheduled Posts</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats.draftCount}</p>
                <p className="text-sm text-muted-foreground">Draft Posts</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-accent-foreground" />
                </div>
              </div>
              <div className="mt-4">
                {stats.nextPost ? (
                  <>
                    <p className="text-lg font-bold">
                      {formatDistanceToNow(parseISO(stats.nextPost.scheduled_at!), { addSuffix: true })}
                    </p>
                    <p className="text-sm text-muted-foreground">Next Scheduled</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold">No posts</p>
                    <p className="text-sm text-muted-foreground">Schedule one now</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Engagement Chart (placeholder for future analytics) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Engagement Overview
                <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                    <Area
                      type="monotone"
                      dataKey="likes"
                      stroke="hsl(var(--accent))"
                      fillOpacity={1}
                      fill="url(#colorLikes)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Scheduled Posts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Upcoming Posts</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/calendar">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingPosts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No scheduled posts</p>
                </div>
              ) : (
                upcomingPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{post.content.slice(0, 40)}...</p>
                      <p className="text-sm text-muted-foreground">
                        {post.scheduled_at && format(parseISO(post.scheduled_at), "MMM d 'at' h:mm a")}
                      </p>
                    </div>
                    <Badge variant="default" className="shrink-0">scheduled</Badge>
                  </div>
                ))
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/app/create">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate New Post
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Posts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/app/calendar">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No posts yet</p>
                <Button variant="link" asChild>
                  <Link to="/app/create">Create your first post</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium mb-2 line-clamp-2">{post.content.slice(0, 100)}...</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>Created {format(parseISO(post.created_at), "MMM d, yyyy")}</span>
                          {post.tags && post.tags.length > 0 && (
                            <>
                              <span>•</span>
                              {post.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant={post.status === "scheduled" ? "default" : "secondary"}>
                        {post.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

// Loading State Component
export const DashboardLoading = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

// Empty State Component
export const DashboardEmpty = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Linkedbot!</p>
        </div>

        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Your LinkedIn</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              To start tracking your performance and generating AI-powered content, connect your LinkedIn account first.
            </p>
            <Button variant="hero" asChild>
              <Link to="/app/linkedin">Connect LinkedIn</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
