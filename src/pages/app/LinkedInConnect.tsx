import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useExtension } from "@/hooks/useExtension";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Chrome,
  CheckCircle2,
  Shield,
  ExternalLink,
  Zap,
  Bot,
  XCircle,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Replace with your actual extension ID when published
const EXTENSION_ID = "fklefcdgmcgjmeilmnnmopakcaenafgd";

const LinkedInConnect = () => {
  const navigate = useNavigate();
  const { extensionStatus, analytics, isLoading, revokeSession } = useExtension();

  const handleConnectExtension = () => {
    // Redirect to extension's connect page - extension will auto-authenticate via cookies
    window.location.href = `chrome-extension://${EXTENSION_ID}/connect.html`;
  };

  const handleDisconnect = async () => {
    try {
      await revokeSession.mutateAsync();
      toast.success("Extension disconnected");
    } catch (error) {
      console.error("Failed to disconnect:", error);
      toast.error("Failed to disconnect extension");
    }
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
          <h1 className="text-3xl font-bold">Chrome Extension</h1>
          <p className="text-muted-foreground mt-1">
            Connect the LinkedBot Chrome Extension to post to LinkedIn
          </p>
        </div>

        {/* Chrome Extension Mode Notice */}
        <Alert className="border-primary/50 bg-primary/5">
          <Chrome className="h-4 w-4 text-primary" />
          <AlertTitle>Chrome Extension Mode</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            LinkedBot uses a Chrome Extension to publish posts directly to LinkedIn. 
            The extension runs in your browser and posts content on your behalf while you're logged into LinkedIn.
          </AlertDescription>
        </Alert>

        {/* Agent Info Notice */}
        <Alert className="border-muted bg-muted/30">
          <Bot className="h-4 w-4" />
          <AlertTitle>How AI Agents Work</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            AI agents are content assistants that draft and schedule posts based on your preferences. 
            The Chrome Extension then publishes scheduled posts when they're due.
            Agents do not perform likes, comments, messages, or any engagement automation.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Connection Status Card */}
          <Card className={extensionStatus.isConnected ? "border-success/50" : "border-muted"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Chrome className="w-7 h-7 text-white" />
                </div>
                <Badge variant={extensionStatus.isConnected ? "default" : "secondary"} className={extensionStatus.isConnected ? "bg-success" : ""}>
                  {extensionStatus.isConnected ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Connected
                    </>
                  )}
                </Badge>
              </div>
              <CardTitle className="mt-4">Chrome Extension</CardTitle>
              <CardDescription>
                {extensionStatus.isConnected 
                  ? "Your extension is connected and ready to post"
                  : "Connect the LinkedBot Chrome Extension to enable posting"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Connection Status */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    {extensionStatus.isConnected ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">
                        {extensionStatus.isConnected ? "Ready to Post" : "Extension Not Connected"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {extensionStatus.isConnected 
                          ? "Posts will be published via the Chrome Extension"
                          : "Click below to connect your extension"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Last Sync Time */}
                {extensionStatus.isConnected && extensionStatus.lastSeen && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      Last synced {formatDistanceToNow(new Date(extensionStatus.lastSeen), { addSuffix: true })}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  {!extensionStatus.isConnected ? (
                    <Button 
                      className="w-full" 
                      onClick={handleConnectExtension}
                    >
                      <Chrome className="w-4 h-4 mr-2" />
                      Connect Chrome Extension
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="w-full text-destructive hover:text-destructive"
                      onClick={handleDisconnect}
                    >
                      Disconnect Extension
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features & Security */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 list-decimal list-inside">
                  {[
                    "Install the LinkedBot Chrome Extension",
                    "Click 'Connect Chrome Extension' above",
                    "The extension will auto-authenticate using your login",
                    "Keep the extension running while logged into LinkedIn",
                    "Scheduled posts are published automatically",
                  ].map((step, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <a
                    href={`https://chrome.google.com/webstore/detail/${EXTENSION_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Chrome className="w-4 h-4 mr-2" />
                    Get Chrome Extension
                    <ExternalLink className="w-3 h-3 ml-2" />
                  </a>
                </Button>
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
                    <span>Extension tokens are short-lived and auto-refresh</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Tokens are invisible - no copy/paste needed</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Session is revoked on logout</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>No LinkedIn credentials are stored</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Extension only posts your scheduled content</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button variant="link" onClick={() => navigate("/app/agents")}>
            Create an agent to start generating content
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default LinkedInConnect;
