import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Extension ID only used for Chrome Web Store link (not for redirects)
const EXTENSION_ID = "fkledgmccgjmeilmnnmopakcaneafgd";

const LinkedInConnect = () => {
  const navigate = useNavigate();
  const { extensionStatus, analytics, isLoading, revokeSession } = useExtension();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [localConnected, setLocalConnected] = useState(() => {
    return localStorage.getItem("linkedbot_extension_connected") === "true";
  });
  const [autoDetectionAttempted, setAutoDetectionAttempted] = useState(false);

  // Auto-detect extension on mount and listen for connection events
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    console.log("[LinkedBot] Setting up extension message listener");

    const handleMessage = (event: MessageEvent) => {
      // Log all incoming messages for debugging
      if (event.data?.type?.startsWith("LINKEDBOT")) {
        console.log("[LinkedBot] Received message:", event.data);
      }

      // Handle extension connected event
      if (event.data?.type === "LINKEDBOT_EXTENSION_CONNECTED") {
        console.log("[LinkedBot] Extension CONNECTED event received");
        setIsConnecting(false);
        setShowHelper(false);
        setLocalConnected(true);
        localStorage.setItem("linkedbot_extension_connected", "true");
        if (!localConnected) {
          toast.success("Chrome Extension connected successfully!");
        }
        if (timeoutId) clearTimeout(timeoutId);
      }
      
      // Handle extension not connected event
      if (event.data?.type === "LINKEDBOT_EXTENSION_NOT_CONNECTED") {
        console.log("[LinkedBot] Extension NOT_CONNECTED event received");
        setIsConnecting(false);
        setShowHelper(true);
        setLocalConnected(false);
        localStorage.removeItem("linkedbot_extension_connected");
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    window.addEventListener("message", handleMessage);

    // Auto-send connection request on mount (no button required)
    if (!autoDetectionAttempted && !localConnected && !extensionStatus.isConnected) {
      setAutoDetectionAttempted(true);
      setIsConnecting(true);
      
      console.log("[LinkedBot] Sending auto-detection request");
      
      // Send initial detection request
      window.postMessage({ type: "LINKEDBOT_CONNECT_REQUEST" }, "*");
      
      // Show helper if no response after 5 seconds
      timeoutId = setTimeout(() => {
        console.log("[LinkedBot] No response after 5 seconds - showing helper");
        setShowHelper(true);
        setIsConnecting(false);
      }, 5000);
    }

    return () => {
      window.removeEventListener("message", handleMessage);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [autoDetectionAttempted, localConnected, extensionStatus.isConnected]);

  // Derive final connected state
  const isConnected = extensionStatus.isConnected || localConnected;

  const handleRetryConnection = useCallback(() => {
    setIsConnecting(true);
    setShowHelper(false);

    // Send message to extension via postMessage
    window.postMessage(
      { type: "LINKEDBOT_CONNECT_REQUEST" },
      "*"
    );

    // Show helper message if no response after 5 seconds
    setTimeout(() => {
      setShowHelper(true);
      setIsConnecting(false);
    }, 5000);
  }, []);

  const handleDisconnect = async () => {
    try {
      await revokeSession.mutateAsync();
      setLocalConnected(false);
      localStorage.removeItem("linkedbot_extension_connected");
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

        {/* Helper message when extension not responding */}
        {showHelper && !isConnected && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertTitle>Waiting for Extension</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              Please open <strong>LinkedIn</strong> in another browser tab, then try connecting again. 
              The extension needs LinkedIn to be open to complete the connection.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Connection Status Card */}
          <Card className={isConnected ? "border-success/50" : "border-muted"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Chrome className="w-7 h-7 text-white" />
                </div>
                <Badge variant={isConnected ? "default" : "secondary"} className={isConnected ? "bg-success" : ""}>
                  {isConnected ? (
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
                {isConnected 
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
                    {isConnected ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : isConnecting ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : (
                      <XCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">
                        {isConnected 
                          ? "Ready to Post" 
                          : isConnecting 
                            ? "Connecting..."
                            : "Extension Not Connected"
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isConnected 
                          ? "Posts will be published via the Chrome Extension"
                          : isConnecting
                            ? "Waiting for extension response..."
                            : "Click below to connect your extension"
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Last Sync Time */}
                {isConnected && extensionStatus.lastSeen && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      Last synced {formatDistanceToNow(new Date(extensionStatus.lastSeen), { addSuffix: true })}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2">
                {!isConnected ? (
                    <Button 
                      className="w-full" 
                      onClick={handleRetryConnection}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Detecting Extension...
                        </>
                      ) : (
                        <>
                          <Chrome className="w-4 h-4 mr-2" />
                          Retry Connection
                        </>
                      )}
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
                    "Open LinkedIn in another browser tab",
                    "Click 'Connect Chrome Extension' above",
                    "The extension will auto-authenticate using your login",
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
