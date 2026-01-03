import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription, PLAN_DETAILS, SubscriptionPlan } from "@/hooks/useSubscription";
import { useAgents } from "@/hooks/useAgents";
import { toast } from "sonner";
import {
  CheckCircle2,
  Zap,
  Bot,
  Crown,
  Building2,
  Sparkles,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const planIcons: Record<SubscriptionPlan, React.ReactNode> = {
  free: <Bot className="w-6 h-6" />,
  pro: <Crown className="w-6 h-6" />,
  business: <Building2 className="w-6 h-6" />,
};

const Billing = () => {
  const navigate = useNavigate();
  const { subscription, isLoading: subLoading, planDetails, isTrialActive, trialDaysRemaining } = useSubscription();
  const { agents, isLoading: agentsLoading } = useAgents();

  const isLoading = subLoading || agentsLoading;
  const agentCount = agents.length;
  const maxAgents = subscription?.max_agents || 1;
  const agentUsagePercent = Math.min(100, (agentCount / maxAgents) * 100);

  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (plan === subscription?.plan) return;
    
    toast.info("Upgrade coming soon!", {
      description: "Stripe integration will be available shortly.",
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-8 max-w-5xl mx-auto">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-32 w-full" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription and agent limits
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="border-primary/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  {planIcons[subscription?.plan || "free"]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-xl">{planDetails.displayName} Plan</p>
                    {isTrialActive && (
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="w-3 h-3" />
                        Trial: {trialDaysRemaining} days left
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {planDetails.price === 0
                      ? "Free forever"
                      : `$${planDetails.price}/month`}
                  </p>
                </div>
              </div>

              {subscription?.plan !== "business" && (
                <Button onClick={() => handleUpgrade(subscription?.plan === "free" ? "pro" : "business")}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agent Usage Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Agent Usage
            </CardTitle>
            <CardDescription>
              You are paying for agents, not posts. All posts are unlimited.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>
                <span className="font-semibold text-lg">{agentCount}</span> of{" "}
                <span className="font-semibold text-lg">{maxAgents}</span> agents used
              </span>
              <span className="text-muted-foreground">
                {maxAgents - agentCount} slot{maxAgents - agentCount !== 1 ? "s" : ""} remaining
              </span>
            </div>
            <Progress value={agentUsagePercent} className="h-3" />
            
            {agentCount >= maxAgents && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30">
                <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Agent limit reached</p>
                  <p className="text-xs text-muted-foreground">
                    Upgrade your plan to create more agents
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleUpgrade("pro")}>
                  Upgrade
                </Button>
              </div>
            )}

            {agentCount < maxAgents && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/app/agents/create")}
              >
                <Bot className="w-4 h-4 mr-2" />
                Create New Agent
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Pricing Philosophy */}
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Simple Agent-Based Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  With Linkedbot, you pay for the number of AI agents you create — not for posts. 
                  Each agent can create unlimited posts, so you only pay for the automation capacity you need.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.keys(PLAN_DETAILS) as SubscriptionPlan[]).map((planKey) => {
            const plan = PLAN_DETAILS[planKey];
            const isCurrent = subscription?.plan === planKey;
            const isUpgrade = 
              (subscription?.plan === "free" && (planKey === "pro" || planKey === "business")) ||
              (subscription?.plan === "pro" && planKey === "business");

            return (
              <Card
                key={planKey}
                className={`relative ${
                  isCurrent ? "border-primary ring-2 ring-primary/20" : ""
                } ${planKey === "pro" ? "md:scale-105 shadow-lg" : ""}`}
              >
                {planKey === "pro" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">Most Popular</Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge variant="secondary">Current</Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      {planIcons[planKey]}
                    </div>
                    <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Up to {plan.maxAgents} agent{plan.maxAgents > 1 ? "s" : ""}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isCurrent ? "secondary" : isUpgrade ? "default" : "outline"}
                    className="w-full"
                    disabled={isCurrent}
                    onClick={() => handleUpgrade(planKey)}
                  >
                    {isCurrent
                      ? "Current Plan"
                      : isUpgrade
                      ? "Upgrade"
                      : "Downgrade"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">How does post frequency work?</h4>
              <p className="text-sm text-muted-foreground">
                Agents generate posts based on your schedule and posting rules. 
                Posting frequency is fully user-controlled and designed to comply with LinkedIn guidelines.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">What happens if I downgrade?</h4>
              <p className="text-sm text-muted-foreground">
                Your existing agents remain available and can be paused or managed at any time. 
                Creating new agents may be limited depending on your plan.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Can I change plans anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes. You can upgrade or downgrade your plan at any time. 
                Changes apply immediately to agent creation and management features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Billing;
