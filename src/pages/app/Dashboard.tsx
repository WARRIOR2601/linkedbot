import { useMemo } from "react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePosts } from "@/hooks/usePosts";
import { useAgents, AGENT_TYPES, getStatusColor, getStatusLabel, AgentStatus } from "@/hooks/useAgents";
import { useSubscription } from "@/hooks/useSubscription";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  Bot,
  Calendar,
  Sparkles,
  Plus,
  BarChart3,
  FileText,
  Clock,
  CalendarCheck,
  Play,
  Pause,
  AlertTriangle,
  Crown,
  Zap,
  Building2,
  Users,
  Target,
  Settings,
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
} from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const { posts, isLoading: postsLoading } = usePosts();
  const { agents, isLoading: agentsLoading, toggleAgentStatus } = useAgents();
  const { subscription, isLoading: subLoading, planDetails, isTrialActive, trialDaysRemaining, canCreateAgent } = useSubscription();
  const { profile, isLoading: profileLoading } = useOnboarding();

  const isLoading = postsLoading || agentsLoading || subLoading || profileLoading;

  // Calculate stats from real post data
  const stats = useMemo(() => {
    const scheduledPosts = posts.filter((p) => p.status === "scheduled");
    const postedPosts = posts.filter((p) => p.status === "posted");
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

    // Agent stats
    const activeAgents = agents.filter((a) => a.status === "active").length;
    const pausedAgents = agents.filter((a) => a.status === "paused").length;
    const draftAgents = agents.filter((a) => a.status === "draft").length;
    const errorAgents = agents.filter((a) => a.status === "error").length;

    return {
      totalPosts,
      postedCount: postedPosts.length,
      scheduledCount: scheduledPosts.length,
      upcomingCount: upcomingScheduled.length,
      nextPost,
      totalAgents: agents.length,
      activeAgents,
      pausedAgents,
      draftAgents,
      errorAgents,
    };
  }, [posts, agents]);

  // Get upcoming scheduled posts
  const upcomingPosts = useMemo(() => {
    return posts
      .filter((p) => p.status === "scheduled" && p.scheduled_at && parseISO(p.scheduled_at) >= new Date())
      .sort((a, b) => {
        const dateA = a.scheduled_at ? parseISO(a.scheduled_at) : new Date();
        const dateB = b.scheduled_at ? parseISO(b.scheduled_at) : new Date();
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  }, [posts]);

  // Get agent for post
  const getAgentForPost = (agentId: string | null) => {
    if (!agentId) return null;
    return agents.find((a) => a.id === agentId);
  };

  // Mock engagement data for visualization
  const engagementData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      name: day,
      posts: Math.floor(Math.random() * 3),
      engagement: Math.floor(Math.random() * 100),
    }));
  }, []);

  if (isLoading) {
    return <DashboardLoading />;
  }

  const displayName = user?.email?.split("@")[0] || "there";

  return (
    <AppLayout>
      <TooltipProvider>
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
            {canCreateAgent(agents.length) ? (
              <Button variant="hero" asChild>
                <Link to="/app/agents/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Agent
                </Link>
              </Button>
            ) : (
              <Button variant="hero" asChild>
                <Link to="/app/billing">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* LinkedIn Approval Status Banner */}
        <Alert className="border-warning/50 bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning/80 flex items-center justify-between">
            <span>
              <span className="font-medium">LinkedIn posting pending approval.</span> You can create and schedule posts. Publishing will be enabled after approval.
            </span>
            <ShadcnTooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 cursor-help shrink-0 ml-2" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>LinkedIn requires API approval for third-party posting. Your scheduled posts are saved and ready.</p>
              </TooltipContent>
            </ShadcnTooltip>
          </AlertDescription>
        </Alert>
      <div className="space-y-8">
        {isTrialActive && (
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Pro Trial Active</p>
                    <p className="text-sm text-muted-foreground">
                      {trialDaysRemaining} days remaining • All features unlocked
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/billing">View Plans</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Context Card */}
        {profile && (profile.business_name || profile.industry) && (
          <Card className="border-muted bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {profile.business_name || "Your Business"}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {profile.industry && (
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {profile.industry}
                        </span>
                      )}
                      {profile.target_audience && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {profile.target_audience.slice(0, 30)}{profile.target_audience.length > 30 ? "..." : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/app/settings">
                    <Settings className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Slots Card */}
        <Card className="border-muted">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Agent Slots</p>
                    <p className="text-sm text-muted-foreground">
                      {agents.length} / {subscription?.max_agents || 1}
                    </p>
                  </div>
                  <Progress 
                    value={(agents.length / (subscription?.max_agents || 1)) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
              {agents.length >= (subscription?.max_agents || 1) && (
                <Button variant="outline" size="sm" className="ml-4" asChild>
                  <Link to="/app/billing">
                    <Zap className="w-3 h-3 mr-1" />
                    Upgrade
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                {stats.activeAgents > 0 && (
                  <Badge className="bg-success/10 text-success border-success/20">
                    {stats.activeAgents} active
                  </Badge>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats.totalAgents}</p>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-success" />
                </div>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats.scheduledCount}</p>
                <p className="text-sm text-muted-foreground">Scheduled Posts</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stats.postedCount}</p>
                <p className="text-sm text-muted-foreground">Posts Published</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-foreground" />
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
                    <p className="text-sm text-muted-foreground">Activate an agent</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Active Agents */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Your Agents
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/agents">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No agents yet</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/app/agents/new">Create your first agent</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.slice(0, 4).map((agent) => {
                    const status = agent.status as AgentStatus;
                    const agentType = AGENT_TYPES.find((t) => t.id === agent.agent_type);
                    return (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Bot className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {agentType?.name} • {agent.posts_created} posts
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(status)}>
                            {status === "active" && (
                              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1 animate-pulse" />
                            )}
                            {status === "error" && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {getStatusLabel(status)}
                          </Badge>
                          {(status === "active" || status === "paused") && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                toggleAgentStatus.mutate({
                                  id: agent.id,
                                  status: status === "active" ? "paused" : "active",
                                })
                              }
                            >
                              {status === "active" ? (
                                <Pause className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Posts */}
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
                  <p className="text-xs">Activate an agent to start posting</p>
                </div>
              ) : (
                upcomingPosts.map((post) => {
                  const agent = getAgentForPost(post.agent_id);
                  return (
                    <div
                      key={post.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {agent?.name || "Agent"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {post.content.slice(0, 50)}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {post.scheduled_at && format(parseISO(post.scheduled_at), "MMM d 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/app/agents/new">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create New Agent
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Performance Overview
              <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                    dataKey="engagement"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorPosts)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Engagement data will appear after your posts are published on LinkedIn
            </p>
          </CardContent>
        </Card>
      </div>
      </TooltipProvider>
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
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
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

export default Dashboard;
