import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Users,
  BarChart3,
  Clock,
  ArrowUpRight,
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data
const overviewStats = [
  { title: "Total Impressions", value: "128.5K", change: "+23.5%", trend: "up", icon: Eye },
  { title: "Total Engagement", value: "8,456", change: "+18.2%", trend: "up", icon: Heart },
  { title: "New Followers", value: "+342", change: "+12.8%", trend: "up", icon: Users },
  { title: "Posts Published", value: "24", change: "-5.0%", trend: "down", icon: BarChart3 },
];

const engagementData = [
  { name: "Jan 1", impressions: 4200, engagement: 320, followers: 15 },
  { name: "Jan 5", impressions: 5100, engagement: 410, followers: 22 },
  { name: "Jan 10", impressions: 4800, engagement: 380, followers: 18 },
  { name: "Jan 15", impressions: 6200, engagement: 520, followers: 35 },
  { name: "Jan 20", impressions: 7100, engagement: 610, followers: 42 },
  { name: "Jan 25", impressions: 5800, engagement: 480, followers: 28 },
  { name: "Jan 30", impressions: 8400, engagement: 720, followers: 55 },
];

const postTypeData = [
  { name: "Thought Leadership", value: 35, color: "hsl(var(--primary))" },
  { name: "How-To", value: 25, color: "hsl(var(--accent))" },
  { name: "Personal Stories", value: 20, color: "hsl(var(--success))" },
  { name: "Industry News", value: 15, color: "hsl(var(--warning))" },
  { name: "Other", value: 5, color: "hsl(var(--muted))" },
];

const bestPostingTimes = [
  { day: "Mon", time: "9:00 AM", engagement: 85 },
  { day: "Tue", time: "2:00 PM", engagement: 92 },
  { day: "Wed", time: "10:00 AM", engagement: 78 },
  { day: "Thu", time: "11:00 AM", engagement: 88 },
  { day: "Fri", time: "9:00 AM", engagement: 75 },
];

const topPosts = [
  {
    title: "5 AI Tools Every Marketer Needs",
    impressions: "25.4K",
    likes: 542,
    comments: 89,
    shares: 45,
  },
  {
    title: "The Future of Remote Work",
    impressions: "18.7K",
    likes: 398,
    comments: 67,
    shares: 32,
  },
  {
    title: "Leadership Lessons from My Mentor",
    impressions: "15.2K",
    likes: 312,
    comments: 54,
    shares: 28,
  },
];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("month");

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your LinkedIn performance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border overflow-hidden">
              {["day", "week", "month", "year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    timeRange === range
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewStats.map((stat, index) => (
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

        {/* Main Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Engagement Over Time */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Engagement Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
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
                      dataKey="impressions"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorImpressions)"
                    />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="hsl(var(--accent))"
                      fillOpacity={1}
                      fill="url(#colorEngagement)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Post Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Mix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={postTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {postTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {postTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Best Posting Times */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Best Posting Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bestPostingTimes.map((slot, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-medium">{slot.day}</div>
                    <div className="w-20 text-sm text-muted-foreground">{slot.time}</div>
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                          style={{ width: `${slot.engagement}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-medium">{slot.engagement}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-success" />
                Top Performing Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post, index) => (
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

// Loading State
export const AnalyticsLoading = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-48" />
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
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

// Empty State
export const AnalyticsEmpty = () => {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your LinkedIn performance</p>
        </div>

        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Start posting content to see your analytics. Connect your LinkedIn account and create your first post to begin tracking performance.
            </p>
            <Button variant="hero">Create Your First Post</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Analytics;
