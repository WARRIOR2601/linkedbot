import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Linkedin,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Shield,
  Zap,
} from "lucide-react";

const LinkedInConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = () => {
    setIsLoading(true);
    // Simulate connection
    setTimeout(() => {
      setIsConnected(true);
      setIsLoading(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">LinkedIn Connection</h1>
          <p className="text-muted-foreground">Connect your LinkedIn account to start posting</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Connection Card */}
          <Card className={isConnected ? "border-success/50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#0A66C2] flex items-center justify-center">
                  <Linkedin className="w-7 h-7 text-white" />
                </div>
                {isConnected && (
                  <span className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle2 className="w-4 h-4" />
                    Connected
                  </span>
                )}
              </div>
              <CardTitle className="mt-4">LinkedIn Account</CardTitle>
              <CardDescription>
                {isConnected
                  ? "Your account is connected and ready to post"
                  : "Connect your LinkedIn account to enable posting and analytics"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : isConnected ? (
                <div className="space-y-4">
                  {/* Profile Preview */}
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
                      JD
                    </div>
                    <div>
                      <p className="font-semibold">John Doe</p>
                      <p className="text-sm text-muted-foreground">Marketing Director | Growth Expert</p>
                      <p className="text-xs text-muted-foreground mt-1">1,234 followers</p>
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
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Connected Since</span>
                      <span>January 1, 2024</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span>Just now</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={handleDisconnect}>
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Not Connected</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          You need to connect your LinkedIn account to post content and track analytics.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button variant="hero" className="w-full" onClick={handleConnect}>
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
                    "Track post performance & engagement",
                    "View profile analytics",
                    "Manage your content calendar",
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
                    <span>Your credentials are never stored on our servers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>You can revoke access at any time from LinkedIn settings</span>
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
      </div>
    </AppLayout>
  );
};

export default LinkedInConnect;
