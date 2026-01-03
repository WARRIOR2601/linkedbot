import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Linkedin,
  CheckCircle2,
  Shield,
  ExternalLink,
  Zap,
  Bot,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LinkedInConnect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  // Check if LinkedIn is configured (single-owner mode)
  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        // In single-owner mode, we just need to verify the user exists
        // The Ayrshare API key is already connected to the owner's LinkedIn
        if (user) {
          // Mark the user's account as connected in the database
          const { data: account } = await supabase
            .from("linkedin_accounts")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!account) {
            // Create account record for the owner
            await supabase.from("linkedin_accounts").insert({
              user_id: user.id,
              is_connected: true,
              ayrshare_connected: true,
              ayrshare_connected_at: new Date().toISOString(),
            });
          } else if (!account.ayrshare_connected) {
            // Update existing record
            await supabase
              .from("linkedin_accounts")
              .update({
                is_connected: true,
                ayrshare_connected: true,
                ayrshare_connected_at: new Date().toISOString(),
              })
              .eq("user_id", user.id);
          }

          setIsConfigured(true);
        }
      } catch (err) {
        console.error("Configuration check error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkConfiguration();
  }, [user]);

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
            Your LinkedIn account is configured for automated posting
          </p>
        </div>

        {/* Single Owner Mode Notice */}
        <Alert className="border-primary/50 bg-primary/5">
          <Settings className="h-4 w-4 text-primary" />
          <AlertTitle>Single-Owner Mode</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            LinkedBot is configured to post to your LinkedIn account using your Ayrshare API key. 
            All posts created in this app will be published to your connected LinkedIn profile.
          </AlertDescription>
        </Alert>

        {/* Agent Info Notice */}
        <Alert className="border-muted bg-muted/30">
          <Bot className="h-4 w-4" />
          <AlertTitle>How AI Agents Work</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            AI agents are content assistants that draft and schedule posts based on your preferences. 
            They can only publish content you've reviewed and approved.
            Agents do not perform likes, comments, messages, or any engagement automation.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Connection Status Card */}
          <Card className="border-success/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#0A66C2] flex items-center justify-center">
                  <Linkedin className="w-7 h-7 text-white" />
                </div>
                <Badge variant="default" className="bg-success">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Configured
                </Badge>
              </div>
              <CardTitle className="mt-4">LinkedIn Account</CardTitle>
              <CardDescription>
                Your LinkedIn account is ready for posting via Ayrshare integration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Connection Info */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div>
                      <p className="font-medium">Ready to Post</p>
                      <p className="text-sm text-muted-foreground">
                        Your Ayrshare API key is connected to your LinkedIn
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
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Mode</span>
                    <span>Single Owner</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/app/create")}
                >
                  Create Your First Post
                </Button>
              </div>
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
                    "Create and edit posts with AI assistance",
                    "Schedule posts for optimal times",
                    "Publish posts to LinkedIn",
                    "View scheduled and published posts",
                    "Use AI agents to generate content",
                    "Track post performance",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-success" />
                      <span>{feature}</span>
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
                    <span>Posts are published via official Ayrshare API</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>API keys are stored securely in Supabase secrets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>No content is posted without your review and approval</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <span>Only posting permissions are used</span>
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
