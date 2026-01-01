import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MessageSquare,
  Heart,
  Share2,
  Calendar,
  Sparkles,
  AlertCircle,
  Plus,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
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

// Mock data
const engagementData = [
  { name: "Mon", views: 1200, likes: 80, comments: 24 },
  { name: "Tue", views: 1800, likes: 120, comments: 45 },
  { name: "Wed", views: 2400, likes: 180, comments: 62 },
  { name: "Thu", views: 1600, likes: 95, comments: 38 },
  { name: "Fri", views: 2200, likes: 150, comments: 55 },
  { name: "Sat", views: 800, likes: 45, comments: 18 },
  { name: "Sun", views: 600, likes: 35, comments: 12 },
];

const weeklyPerformance = [
  { name: "Week 1", posts: 5, engagement: 2400 },
  { name: "Week 2", posts: 7, engagement: 3200 },
  { name: "Week 3", posts: 4, engagement: 1800 },
  { name: "Week 4", posts: 8, engagement: 4100 },
];

const stats = [
  {
    title: "Profile Views",
    value: "2,547",
    change: "+12.5%",
    trend: "up",
    icon: Eye,
  },
  {
    title: "Post Impressions",
    value: "45.2K",
    change: "+28.3%",
    trend: "up",
    icon: BarChart3,
  },
  {
    title: "Followers",
    value: "1,234",
    change: "+8.1%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Engagement Rate",
    value: "4.2%",
    change: "-2.4%",
    trend: "down",
    icon: Heart,
  },
];

const scheduledPosts = [
  { title: "5 AI Tools Every Marketer Needs", time: "Today, 9:00 AM", status: "scheduled" },
  { title: "Why Personal Branding Matters", time: "Tomorrow, 2:00 PM", status: "scheduled" },
  { title: "Leadership Lessons from...", time: "Wed, 10:00 AM", status: "draft" },
];

const recentPosts = [
  {
    title: "The Future of Remote Work",
    impressions: "12.4K",
    likes: 245,
    comments: 38,
    shares: 12,
  },
  {
    title: "How I Built My Network",
    impressions: "8.7K",
    likes: 189,
    comments: 52,
    shares: 8,
  },
];

const Dashboard = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, John! Here's your LinkedIn performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/app/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
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
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      stat.trend === "up" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Engagement Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Engagement Overview</CardTitle>
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
              <CardTitle className="text-lg">Scheduled Posts</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/calendar">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledPosts.map((post, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{post.title}</p>
                    <p className="text-sm text-muted-foreground">{post.time}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      post.status === "scheduled"
                        ? "bg-success/20 text-success"
                        : "bg-warning/20 text-warning"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/app/create">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate New Post
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyPerformance}>
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
                    <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Posts</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/analytics">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPosts.map((post, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50">
                  <p className="font-medium mb-3">{post.title}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.impressions}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {post.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      {post.shares}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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
