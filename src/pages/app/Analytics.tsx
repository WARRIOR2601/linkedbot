import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAnalytics, TimeRange } from "@/hooks/useAnalytics";
import TagAnalyticsChart from "@/components/analytics/TagAnalyticsChart";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  FileText,
  BarChart3,
  Clock,
  ArrowUpRight,
  Sparkles,
  Info,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const {
    isLoading,
    overviewStats,
    engagementTrends,
    tagAnalytics,
    aiModelPerformance,
    topPosts,
    bestPostingTimes,
    contentMix,
    hasData,
    hasPosts,
  } = useAnalytics(timeRange);

  if (isLoading) {
    return <AnalyticsLoading />;
  }

  if (!hasData) {
    return <AnalyticsEmpty />;
  }

  const statsCards = [
    { 
      title: "Total Posts", 
      value: overviewStats.totalPosts.toString(), 
      icon: FileText,
      color: "text-primary"
    },
    { 
      title: "Posted", 
      value: overviewStats.postedPosts.toString(), 
      icon: ArrowUpRight,
      color: "text-success"
    },
    { 
      title: "Scheduled", 
      value: overviewStats.scheduledPosts.toString(), 
      icon: Clock,
      color: "text-warning"
    },
    { 
      title: "Drafts", 
      value: overviewStats.draftPosts.toString(), 
      icon: BarChart3,
      color: "text-muted-foreground"
    },
  ];

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
              {(["day", "week", "month", "year"] as TimeRange[]).map((range) => (
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

        {/* Info Banner */}
        {!hasPosts && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center gap-3 p-4">
              <Info className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm">
                <span className="font-medium">Engagement data will appear after your posts are published.</span>
                {" "}Currently showing post statistics from your account.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
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
              <CardTitle className="text-lg flex items-center gap-2">
                Engagement Over Time
                {!hasPosts && <Badge variant="secondary">Data pending</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engagementTrends.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={engagementTrends}>
                      <defs>
                        <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
                        dataKey="likes"
                        stroke="hsl(var(--accent))"
                        fillOpacity={1}
                        fill="url(#colorLikes)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>No engagement data yet</p>
                    <p className="text-sm">Data will appear after posts are published</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Mix */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Mix</CardTitle>
            </CardHeader>
            <CardContent>
              {contentMix.length > 0 ? (
                <>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contentMix}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {contentMix.map((entry, index) => (
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
                    {contentMix.map((item, index) => (
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
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <p>No posts yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tag Analytics Section */}
        <TagAnalyticsChart data={tagAnalytics} />

        {/* AI Model Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Model Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiModelPerformance.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aiModelPerformance.map((model, index) => (
                  <div
                    key={model.model}
                    className="p-4 rounded-lg bg-muted/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium capitalize">{model.model}</p>
                        <p className="text-sm text-muted-foreground">{model.postCount} posts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{model.avgEngagementRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Avg. engagement</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No AI model data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

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
              {bestPostingTimes.length > 0 ? (
                <div className="space-y-4">
                  {bestPostingTimes.map((slot, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium">{slot.day}</div>
                      <div className="w-20 text-sm text-muted-foreground">
                        {slot.hour}:00
                      </div>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                            style={{ width: `${Math.min(slot.avgEngagement * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-right text-sm font-medium">
                        {slot.postCount} posts
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Post more to see optimal times</p>
                </div>
              )}
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
              {topPosts.length > 0 ? (
                <div className="space-y-4">
                  {topPosts.map((post, index) => (
                    <div key={post.id} className="p-4 rounded-lg bg-muted/50">
                      <p className="font-medium mb-3 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.impressions.toLocaleString()}
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No posted content yet</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/app/create">Create your first post</Link>
                  </Button>
                </div>
              )}
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
              Start posting content to see your analytics. Create your first post to begin tracking performance.
            </p>
            <Button asChild>
              <Link to="/app/create">Create Your First Post</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Analytics;
