import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, Power, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AgentGlobalToggleProps {
  className?: string;
}

export const AgentGlobalToggle = ({ className }: AgentGlobalToggleProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch current agent_active state
  useEffect(() => {
    const fetchAgentStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("client_ai_profiles")
          .select("agent_active")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) throw error;
        setIsActive(data?.agent_active ?? false);
      } catch (err) {
        console.error("Error fetching agent status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentStatus();
  }, [user]);

  const handleToggle = async (checked: boolean) => {
    if (!user || isUpdating) return;
    
    setIsUpdating(true);
    const previousState = isActive;
    setIsActive(checked); // Optimistic update

    try {
      const { error } = await supabase
        .from("client_ai_profiles")
        .update({ 
          agent_active: checked,
          updated_at: new Date().toISOString() 
        })
        .eq("user_id", user.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["onboarding-profile"] });
      
      toast({
        title: checked ? "Agent Activated" : "Agent Deactivated",
        description: checked 
          ? "Your agent will now process and schedule posts." 
          : "Your agent is paused and won't process new posts.",
      });
    } catch (err: any) {
      console.error("Error updating agent status:", err);
      setIsActive(previousState); // Rollback
      toast({
        title: "Error",
        description: "Failed to update agent status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
            </div>
            <div className="w-11 h-6 bg-muted rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${isActive ? "border-success/30 bg-success/5" : "border-muted"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isActive ? "bg-success/10" : "bg-muted"
            }`}>
              <Power className={`w-5 h-5 ${isActive ? "text-success" : "text-muted-foreground"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Label htmlFor="agent-toggle" className="font-medium cursor-pointer">
                  Activate Agent
                </Label>
                {isActive ? (
                  <Badge className="bg-success text-success-foreground text-xs">Active</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isActive 
                  ? "Agent is processing and scheduling posts" 
                  : "Agent is paused - no posts will be processed"
                }
              </p>
            </div>
          </div>
          <Switch
            id="agent-toggle"
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
            className="data-[state=checked]:bg-success"
          />
        </div>

        {!isActive && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span>Turn on to allow your agent to create and schedule posts</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
