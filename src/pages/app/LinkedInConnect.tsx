import { useState } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLinkedInAccount } from "@/hooks/useLinkedInAccount";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Linkedin,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Users,
  Link as LinkIcon,
  Unlink,
  ExternalLink,
  Clock,
  Info,
  Zap,
} from "lucide-react";

const LinkedInConnect = () => {
  const { account, isLoading, connectionStatus, disconnectAccount } = useLinkedInAccount();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = async () => {
    // In production, this would redirect to LinkedIn OAuth
    toast.info("LinkedIn OAuth integration coming soon!", {
      description: "This feature requires LinkedIn OAuth which is being developed.",
    });
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
            Connect your LinkedIn account to publish posts directly
          </p>
        </div>

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
                  ? "Your account is connected and ready to post"
                  : connectionStatus === "expired"
                  ? "Your connection has expired. Please reconnect."
                  : "Connect your LinkedIn to start publishing"}
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
                      <span className="text-muted-foreground">Status</span>
                      <span className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="w-4 h-4" />
                        Active
                      </span>
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
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>OAuth Integration Coming Soon</AlertTitle>
                    <AlertDescription>
                      LinkedIn OAuth integration is currently being developed. Once available, you'll be able to connect your LinkedIn account.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleConnect} className="w-full bg-[#0A66C2] hover:bg-[#004182]">
                    <Linkedin className="w-4 h-4 mr-2" />
                    Connect LinkedIn Account
                  </Button>
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
                    "Post content directly to LinkedIn",
                    "Schedule posts for optimal times",
                    "Automatic publishing at scheduled time",
                    "Track post status (draft, scheduled, posted)",
                    "Retry failed posts manually",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      {feature}
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
                    <span>You can revoke access at any time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>We only request permissions needed for posting</span>
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
