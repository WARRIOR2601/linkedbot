import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Linkedin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Unlink,
  ExternalLink,
  Info,
  Zap,
  Loader2,
  Bot,
} from "lucide-react";

const LinkedInConnect = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"not_connected" | "connected" | "expired">("not_connected");
  const [connectedAt, setConnectedAt] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Check Ayrshare connection status on mount and after return from Ayrshare
  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user]);

  // Handle return from Ayrshare linking
  useEffect(() => {
    const status = searchParams.get("status");
    if (status === "success") {
      toast.success("LinkedIn connected successfully!");
      checkConnectionStatus();
      setSearchParams({});
    } else if (status === "error") {
      toast.error("Failed to connect LinkedIn", {
        description: "Please try again.",
      });
      setSearchParams({});
    }
  }, [searchParams]);

  const checkConnectionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("ayrshare-check-status");
      
      if (error) {
        console.error("Status check error:", error);
        setConnectionStatus("not_connected");
        return;
      }

      if (data.connected) {
        setConnectionStatus("connected");
        // Fetch connected_at from database
        const { data: account } = await supabase
          .from("linkedin_accounts")
          .select("ayrshare_connected_at")
          .eq("user_id", user?.id)
          .single();
        
        if (account?.ayrshare_connected_at) {
          setConnectedAt(account.ayrshare_connected_at);
        }
      } else {
        setConnectionStatus("not_connected");
      }
    } catch (err) {
      console.error("Status check error:", err);
      setConnectionStatus("not_connected");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke("ayrshare-create-profile");

      if (error) throw error;

      if (data.linkUrl) {
        // Redirect to Ayrshare for LinkedIn connection
        window.location.href = data.linkUrl;
      } else {
        throw new Error(data.error || "Failed to generate connection link");
      }
    } catch (err: any) {
      console.error("Connect error:", err);
      toast.error("Failed to start LinkedIn connection", {
        description: err.message,
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const { error } = await supabase.functions.invoke("ayrshare-disconnect");
      
      if (error) throw error;

      toast.success("LinkedIn account disconnected");
      setConnectionStatus("not_connected");
      setConnectedAt(null);
    } catch (err: any) {
      console.error("Disconnect error:", err);
      toast.error("Failed to disconnect LinkedIn account");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    checkConnectionStatus();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-8">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-8">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">LinkedIn Connection</h1>
          <p className="text-muted-foreground mt-1">
            Connect your LinkedIn account to manage your posting workflow
          </p>
        </div>

        {/* User Consent & Agent Control Notice */}
        <Alert className="border-primary/50 bg-primary/5">
          <Shield className="h-4 w-4 text-primary" />
          <AlertTitle>You're Always in Control</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            By connecting LinkedIn, you explicitly allow your AI agents to publish posts on your behalf using official APIs. 
            You can pause agents or disconnect LinkedIn at any time. Agents are disabled if LinkedIn is disconnected and cannot bypass your control.
            We will never post without your explicit review and approval.
          </AlertDescription>
        </Alert>

        {/* Agent Dependency Notice */}
        <Alert className="border-muted bg-muted/30">
          <Bot className="h-4 w-4" />
          <AlertTitle>How AI Agents Work with LinkedIn</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            AI agents are content assistants that draft and schedule posts based on your preferences. They can only publish content when your LinkedIn account is connected and you have granted consent. 
            Agents do not perform likes, comments, messages, connection requests, or any engagement automation.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Connection Status Card */}
          <Card className={connectionStatus === "connected" ? "border-success/50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#0A66C2] flex items-center justify-center">
                  <Linkedin className="w-7 h-7 text-white" />
                </div>
                {connectionStatus === "connected" && (
                  <Badge variant="default" className="bg-success">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
                {connectionStatus === "expired" && (
                  <Badge variant="destructive">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Expired
                  </Badge>
                )}
                {connectionStatus === "not_connected" && (
                  <Badge variant="secondary">Not Connected</Badge>
                )}
              </div>
              <CardTitle className="mt-4">LinkedIn Account</CardTitle>
              <CardDescription>
                {connectionStatus === "connected"
                  ? "Your account is connected and ready for posting."
                  : connectionStatus === "expired"
                  ? "Your connection has expired. Please reconnect."
                  : "Connect your LinkedIn to manage your content workflow"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectionStatus === "connected" && (
                <div className="space-y-4">
                  {/* Connection Info */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <div>
                        <p className="font-medium">LinkedIn Connected</p>
                        <p className="text-sm text-muted-foreground">
                          Your account is ready for automated posting
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connection Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Status</span>
                      <span className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="w-4 h-4" />
                        Active
                      </span>
                    </div>
                    {connectedAt && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground">Connected Since</span>
                        <span>{format(parseISO(connectedAt), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleRefresh}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                    >
                      <Unlink className="w-4 h-4 mr-2" />
                      {isDisconnecting ? "..." : "Disconnect"}
                    </Button>
                  </div>
                </div>
              )}

              {connectionStatus === "expired" && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Connection Expired</AlertTitle>
                    <AlertDescription>
                      Your LinkedIn access has expired. Please reconnect.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleConnect} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reconnect LinkedIn
                  </Button>
                </div>
              )}

              {connectionStatus === "not_connected" && (
                <div className="space-y-4">
                  {isConnecting ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Connecting to LinkedIn...</p>
                    </div>
                  ) : (
                    <>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Connect Your LinkedIn</AlertTitle>
                        <AlertDescription>
                          Connect your LinkedIn account to draft and schedule posts. You'll review and approve all content before it's published.
                        </AlertDescription>
                      </Alert>
                      <Button onClick={handleConnect} className="w-full bg-[#0A66C2] hover:bg-[#004182]">
                        <Linkedin className="w-4 h-4 mr-2" />
                        Connect LinkedIn Account
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        By connecting, you agree to let Linkedbot access your LinkedIn profile for posting purposes. 
                        You can revoke access at any time.
                      </p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features & Security */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  What You Can Do
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { text: "Connect your LinkedIn account", available: true },
                    { text: "Draft and review posts before publishing", available: true },
                    { text: "Schedule posts for optimal times", available: true },
                    { text: "Pause or cancel scheduled posts anytime", available: true },
                    { text: "Disconnect your account at any time", available: true },
                    { text: "Publish posts to LinkedIn", available: true },
                    { text: "View scheduled and published posts", available: true },
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-3">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${feature.available ? "text-success" : "text-muted-foreground"}`} />
                        <span className={feature.available ? "" : "text-muted-foreground"}>{feature.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-success" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>We use official LinkedIn OAuth 2.0 for secure authentication</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Tokens are encrypted and stored securely</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>You can disconnect and revoke access at any time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>We only request permissions needed for posting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>No content is posted without your review and approval</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Help Link */}
        <div className="text-center">
          <Button variant="link" asChild>
            <a
              href="https://www.linkedin.com/help/linkedin/answer/a1342443"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn about LinkedIn's third-party app policies
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default LinkedInConnect;
