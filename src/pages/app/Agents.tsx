import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useAgents, AGENT_TYPES, Agent, AgentStatus, getStatusColor, getStatusLabel } from "@/hooks/useAgents";
import { useSubscription } from "@/hooks/useSubscription";
import {
  Bot,
  Plus,
  Play,
  Pause,
  Settings,
  Trash2,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Crown,
  Zap,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Agents = () => {
  const { agents, isLoading, toggleAgentStatus, deleteAgent, activateAgent } = useAgents();
  const { subscription, canCreateAgent, isLoading: subLoading } = useSubscription();

  const getAgentTypeName = (type: string) => {
    return AGENT_TYPES.find((t) => t.id === type)?.name || type;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-36" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bot className="w-8 h-8" />
              AI Agents
            </h1>
            <p className="text-muted-foreground">
              AI assistants that draft and schedule posts based on your preferences
            </p>
          </div>
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
                Upgrade to Create More
              </Link>
            </Button>
          )}
        </div>

        {/* What Agents Do / Don't Do */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <p className="font-medium text-sm">What are AI Agents?</p>
                  <p className="text-sm text-muted-foreground">
                    Agents are AI assistants trained by you to behave like a content intern. Each agent follows your defined rules, tone, posting frequency, and boundaries. They cannot act independently and cannot perform any action without your prior authorization.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs font-medium text-success mb-1">✓ What agents can do:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      <li>• Draft LinkedIn post content</li>
                      <li>• Schedule posts based on your rules</li>
                      <li>• Post only after your LinkedIn connection & consent</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-destructive mb-1">✗ What agents cannot do:</p>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      <li>• Like, comment, or send messages</li>
                      <li>• Send connection requests</li>
                      <li>• Perform engagement automation or data scraping</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Slots Progress */}
        <Card className="border-muted">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Agent Slots</p>
                    <p className="text-sm text-muted-foreground">
                      {agents.length} / {subscription?.max_agents || 1} used
                    </p>
                  </div>
                  <Progress 
                    value={(agents.length / (subscription?.max_agents || 1)) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
              {agents.length >= (subscription?.max_agents || 1) && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/billing">
                    <Zap className="w-3 h-3 mr-1" />
                    Upgrade
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agents Grid */}
        {agents.length === 0 ? (
          <Card className="py-16">
            <CardContent className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Agents Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Create your first AI agent to help draft and schedule LinkedIn posts.
                Agents are AI assistants that create content based on rules you define.
              </p>
              <Button variant="hero" asChild>
                <Link to="/app/agents/new">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Your First Agent
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onToggleStatus={toggleAgentStatus.mutate}
                onActivate={activateAgent.mutate}
                onDelete={deleteAgent.mutate}
                getAgentTypeName={getAgentTypeName}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

interface AgentCardProps {
  agent: Agent;
  onToggleStatus: (data: { id: string; status: "active" | "paused" }) => void;
  onActivate: (id: string) => void;
  onDelete: (id: string) => void;
  getAgentTypeName: (type: string) => string;
}

const AgentCard = ({
  agent,
  onToggleStatus,
  onActivate,
  onDelete,
  getAgentTypeName,
}: AgentCardProps) => {
  const status = agent.status as AgentStatus;
  
  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="text-xs">
                {getAgentTypeName(agent.agent_type)}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(status)}>
            {status === "active" && (
              <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
            )}
            {status === "error" && <AlertTriangle className="w-3 h-3 mr-1" />}
            {getStatusLabel(status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-border">
          <div className="text-center">
            <p className="text-2xl font-bold">{agent.posts_created}</p>
            <p className="text-xs text-muted-foreground">Posts Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold capitalize">{agent.posting_frequency}</p>
            <p className="text-xs text-muted-foreground">Frequency</p>
          </div>
        </div>

        {/* Last Post */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {agent.last_post_at ? (
            <span>Last post: {formatDistanceToNow(parseISO(agent.last_post_at), { addSuffix: true })}</span>
          ) : (
            <span>No posts yet</span>
          )}
        </div>

        {/* Topics */}
        {agent.topics && agent.topics.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {agent.topics.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
            {agent.topics.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{agent.topics.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Draft Warning */}
        {status === "draft" && (
          <div className="p-2 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p className="font-medium">Setup not complete</p>
            <p className="text-xs">Complete setup to enable content creation</p>
          </div>
        )}

        {/* Error Warning */}
        {status === "error" && (
          <div className="p-2 rounded-lg bg-destructive/10 text-sm text-destructive">
            <p className="font-medium">Agent needs attention</p>
            <p className="text-xs">Check settings and try reactivating</p>
          </div>
        )}

        {/* Active Agent - LinkedIn Dependency */}
        {status === "active" && (
          <div className="p-2 rounded-lg bg-success/5 border border-success/20 text-xs text-muted-foreground">
            Requires LinkedIn connection to post
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {status === "draft" ? (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onActivate(agent.id)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Activate Agent
            </Button>
          ) : status === "error" ? (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onActivate(agent.id)}
            >
              <Play className="w-4 h-4 mr-1" />
              Retry
            </Button>
          ) : (
            <Button
              variant={status === "active" ? "outline" : "default"}
              size="sm"
              className="flex-1"
              onClick={() =>
                onToggleStatus({
                  id: agent.id,
                  status: status === "active" ? "paused" : "active",
                })
              }
            >
              {status === "active" ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Start
                </>
              )}
            </Button>
          )}
          <Button variant="outline" size="icon" asChild>
            <Link to={`/app/agents/${agent.id}`}>
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{agent.name}" and all its training data.
                  Posts created by this agent will remain.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(agent.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default Agents;
