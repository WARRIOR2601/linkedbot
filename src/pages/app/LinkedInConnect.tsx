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
import { useLinkedInAccount } from "@/hooks/useLinkedInAccount";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Linkedin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Link as LinkIcon,
  Unlink,
  ExternalLink,
  Info,
  Zap,
  Loader2,
  Bot,
} from "lucide-react";

const LinkedInConnect = () => {
  const { user } = useAuth();
  const { account, isLoading, connectionStatus, disconnectAccount, refetch } = useLinkedInAccount();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      toast.error("LinkedIn connection failed", {
        description: searchParams.get("error_description") || "Please try again.",
      });
      setSearchParams({});
      return;
    }

    if (code && user) {
      handleOAuthCallback(code);
    }
  }, [searchParams, user]);

  const handleOAuthCallback = async (code: string) => {
    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/app/linkedin`;
      
      const { data, error } = await supabase.functions.invoke("linkedin-oauth-callback", {
        body: {
          code,
          redirectUri,
          userId: user?.id,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("LinkedIn connected successfully!", {
          description: `Connected as ${data.account.profile_name}`,
        });
        refetch();
      } else {
        throw new Error(data.error || "Connection failed");
      }
    } catch (err: any) {
      console.error("OAuth callback error:", err);
      toast.error("Failed to complete LinkedIn connection", {
        description: err.message,
      });
    } finally {
      setIsConnecting(false);
      setSearchParams({});
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/app/linkedin`;
      
      const { data, error } = await supabase.functions.invoke("linkedin-oauth-init", {
        body: { redirectUri },
      });

      if (error) throw error;

      if (data.authUrl) {
        // Store state for CSRF protection
        sessionStorage.setItem("linkedin_oauth_state", data.state);
        // Redirect to LinkedIn
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.error || "Failed to generate OAuth URL");
      }
    } catch (err: any) {
      console.error("OAuth init error:", err);
      toast.error("Failed to start LinkedIn connection", {
        description: err.message,
      });
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    const { error } = await disconnectAccount();
    setIsDisconnecting(false);
    
    if (error) {
      toast.error("Failed to disconnect LinkedIn account");
    } else {
      toast.success("LinkedIn account disconnected");
    }
  };

  const handleReconnect = async () => {
    handleConnect();
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
            By connecting LinkedIn, you explicitly allow your AI agents to publish posts on your behalf using official LinkedIn APIs. 
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

        {/* API Status Banner */}
        <Alert className="border-warning/50 bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Posting Pending LinkedIn Approval</AlertTitle>
          <AlertDescription className="text-warning/80">
            LinkedIn posting is currently awaiting API approval. You can connect your account and create posts, 
            but publishing to LinkedIn will be enabled once LinkedIn approves our application.
          </AlertDescription>
        </Alert>

        {/* Why Approval Is Needed */}
        <Alert className="border-muted bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertTitle>Why is LinkedIn API approval needed?</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            LinkedIn requires all third-party applications to complete an API approval process before enabling 
            posting capabilities. This ensures user data is handled securely and that applications comply with 
            LinkedIn's policies. During this approval period, you can still connect your account, draft posts, 
            and schedule content—publishing will be enabled automatically once approval is granted.
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
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant="default" className="bg-success">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                    <Badge variant="outline" className="text-warning border-warning text-xs">
                      Posting pending approval
                    </Badge>
                  </div>
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
                  ? "Your account is connected. Posting will be enabled after LinkedIn API approval."
                  : connectionStatus === "expired"
                  ? "Your connection has expired. Please reconnect."
                  : "Connect your LinkedIn to manage your content workflow"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectionStatus === "connected" && account && (
                <div className="space-y-4">
                  {/* Profile Info */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={account.profile_photo_url || undefined} />
                      <AvatarFallback className="text-lg">
                        {account.profile_name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{account.profile_name || "LinkedIn User"}</p>
                      {account.headline && (
                        <p className="text-sm text-muted-foreground">{account.headline}</p>
                      )}
                      {account.followers_count !== null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {account.followers_count.toLocaleString()} followers
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Connection Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Connection</span>
                      <span className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="w-4 h-4" />
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Posting Status</span>
                      <Badge variant="outline" className="text-warning border-warning">
                        Pending Approval
                      </Badge>
                    </div>
                    {account.connected_at && (
                      <div className="flex items-center justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Connected Since</span>
                        <span>{format(parseISO(account.connected_at), "MMM d, yyyy")}</span>
                      </div>
                    )}
                    {account.token_expires_at && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-muted-foreground">Token Expires</span>
                        <span>{format(parseISO(account.token_expires_at), "MMM d, yyyy")}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={handleReconnect}>
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

              {connectionStatus === "expired" && account && (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Connection Expired</AlertTitle>
                    <AlertDescription>
                      Your LinkedIn access token has expired. Please reconnect.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleReconnect} className="w-full">
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
            <Card className="border-warning/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    What You Can Do
                  </CardTitle>
                  <Badge variant="outline" className="text-warning border-warning">
                    Test Mode
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { text: "Connect your LinkedIn account", available: true },
                    { text: "Draft and review posts before publishing", available: true },
                    { text: "Schedule posts for optimal times", available: true },
                    { text: "Pause or cancel scheduled posts anytime", available: true },
                    { text: "Disconnect your account at any time", available: true },
                    { text: "Publish posts to LinkedIn", available: false, note: "Pending approval" },
                    { text: "Analytics sync", available: false, note: "After approval" },
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-3">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${feature.available ? "text-success" : "text-muted-foreground"}`} />
                        <span className={feature.available ? "" : "text-muted-foreground"}>{feature.text}</span>
                      </span>
                      {feature.note && (
                        <Badge variant="secondary" className="text-xs">{feature.note}</Badge>
                      )}
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
