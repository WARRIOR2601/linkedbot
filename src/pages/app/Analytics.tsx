import { useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useAgentAnalytics, AGENT_TYPES, getStatusColor, getStatusLabel, AgentStatus } from "@/hooks/useAgents";
import { useAnalytics, TimeRange } from "@/hooks/useAnalytics";
import TagAnalyticsChart from "@/components/analytics/TagAnalyticsChart";
import {
  TrendingUp,
  TrendingDown,
  Bot,
  Eye,
  Heart,
  MessageSquare,
  FileText,
  BarChart3,
  Clock,
  ArrowUpRight,
  Sparkles,
  Info,
  Image as ImageIcon,
  Type,
  Lightbulb,
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
  BarChart,
  Bar,
} from "recharts";
import { formatDistanceToNow, parseISO } from "date-fns";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const { data: agentData, isLoading: agentLoading } = useAgentAnalytics();
  const {
    isLoading: analyticsLoading,
    overviewStats,
    engagementTrends,
    tagAnalytics,
    topPosts,
    bestPostingTimes,
    hasData,
    hasPosts,
  } = useAnalytics(timeRange);

  const isLoading = agentLoading || analyticsLoading;

  if (isLoading) {
    return <AnalyticsLoading />;
  }

  if (!agentData || agentData.agents.length === 0) {
    return <AnalyticsEmpty />;
  }

  // Generate insights based on data
  const insights = generateInsights(agentData);

  // Prepare agent performance data for chart
  const agentChartData = agentData.agents.map((agent) => ({
    name: agent.name.slice(0, 10),
    posts: agent.postsCreated,
    engagement: agent.avgEngagement,
  }));

  // Image vs text chart data
  const imageVsTextData = [
    { name: "Image Posts", value: agentData.imageVsText.imagePosts, color: "hsl(var(--primary))" },
    { name: "Text Only", value: agentData.imageVsText.textPosts, color: "hsl(var(--muted))" },
  ].filter((d) => d.value > 0);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Agent performance & insights</p>
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

        {/* Analytics Status Banner */}
        <Alert className="border-primary/30 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>Engagement Data Coming Soon</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            LinkedIn analytics integration is in development. Currently showing agent activity data. 
            Real engagement metrics (impressions, likes, comments) will be available once LinkedIn API access is approved.
          </AlertDescription>
        </Alert>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <Badge className="bg-success/10 text-success border-success/20">
                  {agentData.agents.filter((a) => a.status === "active").length} active
                </Badge>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{agentData.agents.length}</p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-success" />
                </div>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{agentData.totalPosts}</p>
                <p className="text-sm text-muted-foreground">Posts Created</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{agentData.totalPublished}</p>
                <p className="text-sm text-muted-foreground">Published</p>
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
                <p className="text-2xl font-bold">{agentData.totalScheduled}</p>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        {insights.length > 0 && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-background border flex items-start gap-3"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      insight.type === "positive" ? "bg-success/10 text-success" :
                      insight.type === "negative" ? "bg-destructive/10 text-destructive" :
                      "bg-primary/10 text-primary"
                    }`}>
                      {insight.type === "positive" ? <TrendingUp className="w-4 h-4" /> :
                       insight.type === "negative" ? <TrendingDown className="w-4 h-4" /> :
                       <Info className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Performance */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Agent Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agentData.agents.length > 0 ? (
                <div className="space-y-4">
                  {agentData.agents
                    .sort((a, b) => b.avgEngagement - a.avgEngagement)
                    .map((agent, index) => {
                      const agentType = AGENT_TYPES.find((t) => t.id === agent.type);
                      return (
                        <div
                          key={agent.id}
                          className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{agent.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {agentType?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="font-bold">{agent.postsCreated}</p>
                              <p className="text-xs text-muted-foreground">Posts</p>
                            </div>
                            <div className="text-center">
                              <p className="font-bold">{agent.avgEngagement.toFixed(1)}%</p>
                              <p className="text-xs text-muted-foreground">Engagement</p>
                            </div>
                            <Badge className={getStatusColor(agent.status)}>
                              {getStatusLabel(agent.status)}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No agents yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Image vs Text Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Content Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imageVsTextData.length > 0 ? (
                <>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={imageVsTextData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {imageVsTextData.map((entry, index) => (
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
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm">Image Posts</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{agentData.imageVsText.imagePosts}</p>
                        <p className="text-xs text-muted-foreground">
                          {agentData.imageVsText.imageEngagement.toFixed(1)}% avg
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        <span className="text-sm">Text Only</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{agentData.imageVsText.textPosts}</p>
                        <p className="text-xs text-muted-foreground">
                          {agentData.imageVsText.textEngagement.toFixed(1)}% avg
                        </p>
                      </div>
                    </div>
                    {agentData.imageVsText.imageEngagement > agentData.imageVsText.textEngagement && (
                      <p className="text-xs text-center text-muted-foreground">
                        Image posts perform {((agentData.imageVsText.imageEngagement / (agentData.imageVsText.textEngagement || 1)) * 100 - 100).toFixed(0)}% better
                      </p>
                    )}
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

        {/* Tag Analytics */}
        <TagAnalyticsChart data={tagAnalytics} />

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Best Posting Times */}
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Best Posting Times
                </CardTitle>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
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
          <Card className="opacity-60">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-success" />
                  Top Performing Posts
                </CardTitle>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
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
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No posted content yet</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/app/agents">Manage agents</Link>
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

// Generate insights based on data
interface Insight {
  title: string;
  description: string;
  type: "positive" | "negative" | "info";
}

function generateInsights(data: NonNullable<ReturnType<typeof useAgentAnalytics>["data"]>): Insight[] {
  const insights: Insight[] = [];

  // Best performing agent
  const sortedAgents = [...data.agents].sort((a, b) => b.avgEngagement - a.avgEngagement);
  if (sortedAgents.length > 0 && sortedAgents[0].avgEngagement > 0) {
    insights.push({
      title: `${sortedAgents[0].name} is your top performer`,
      description: `Averaging ${sortedAgents[0].avgEngagement.toFixed(1)}% engagement rate`,
      type: "positive",
    });
  }

  // Image vs text comparison
  if (data.imageVsText.imagePosts > 0 && data.imageVsText.textPosts > 0) {
    const diff = data.imageVsText.imageEngagement - data.imageVsText.textEngagement;
    if (diff > 0) {
      insights.push({
        title: "Image posts outperform text",
        description: `Image posts get ${diff.toFixed(1)}% more engagement on average`,
        type: "positive",
      });
    } else if (diff < -1) {
      insights.push({
        title: "Text posts performing well",
        description: "Your text-only content is resonating with your audience",
        type: "info",
      });
    }
  }

  // Active agents
  const activeCount = data.agents.filter((a) => a.status === "active").length;
  const pausedCount = data.agents.filter((a) => a.status === "paused").length;
  if (pausedCount > activeCount && pausedCount > 0) {
    insights.push({
      title: "Agents are paused",
      description: `${pausedCount} of ${data.agents.length} agents are currently paused`,
      type: "negative",
    });
  }

  // Best tags
  if (data.tagAnalytics.length > 0) {
    const topTag = data.tagAnalytics[0];
    if (topTag.avgEngagement > 0) {
      insights.push({
        title: `#${topTag.tag} is trending`,
        description: `Your top performing tag with ${topTag.avgEngagement.toFixed(1)}% avg engagement`,
        type: "positive",
      });
    }
  }

  // Posting consistency
  if (data.totalScheduled > 0) {
    insights.push({
      title: `${data.totalScheduled} posts scheduled`,
      description: "Your agents are planning ahead for consistent posting",
      type: "info",
    });
  }

  return insights.slice(0, 6);
}

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
          <p className="text-muted-foreground">Agent performance & insights</p>
        </div>

        <Card className="text-center py-16">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create an agent to start generating content. Analytics will appear once your agents create posts.
            </p>
            <Button variant="hero" asChild>
              <Link to="/app/agents/new">
                <Sparkles className="w-4 h-4 mr-2" />
                Create Your First Agent
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Analytics;
