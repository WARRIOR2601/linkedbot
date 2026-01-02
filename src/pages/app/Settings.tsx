import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLinkedInAccount } from "@/hooks/useLinkedInAccount";
import { User, Bell, Palette, Shield, Linkedin, Info, ExternalLink } from "lucide-react";

const Settings = () => {
  const { account, connectionStatus } = useLinkedInAccount();

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

        {/* LinkedIn Connection & Consent */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-[#0A66C2]" />
              LinkedIn Connection
            </CardTitle>
            <CardDescription>Manage your LinkedIn account connection and posting preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Connection Status</p>
                <p className="text-sm text-muted-foreground">
                  {connectionStatus === "connected" 
                    ? `Connected as ${account?.profile_name || "LinkedIn User"}`
                    : connectionStatus === "expired"
                    ? "Connection expired - please reconnect"
                    : "Not connected"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {connectionStatus === "connected" && (
                  <Badge variant="outline" className="text-warning border-warning">
                    Posting pending approval
                  </Badge>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link to="/app/linkedin">
                    {connectionStatus === "connected" ? "Manage" : "Connect"}
                  </Link>
                </Button>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>AI Agents & LinkedIn Consent</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                By connecting LinkedIn, you explicitly allow your AI agents to publish posts on your behalf using official LinkedIn APIs.
                You can pause agents or disconnect LinkedIn at any time. Agents are disabled if LinkedIn is disconnected and cannot bypass your control.
                We never post content without your explicit review and approval.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium">Post Review Requirement</p>
                <p className="text-xs text-muted-foreground">All posts require your approval before publishing</p>
              </div>
              <Badge variant="secondary">Always On</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><User className="w-5 h-5" />Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input defaultValue="John" /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input defaultValue="Doe" /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue="john@example.com" type="email" /></div>
            <div className="space-y-2"><Label>LinkedIn Headline</Label><Input defaultValue="Marketing Director | Growth Expert" /></div>
            <Button variant="hero">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="w-5 h-5" />Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {["Email notifications for scheduled posts", "Weekly performance reports", "New feature announcements"].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <span className="text-sm">{item}</span><Switch defaultChecked={i < 2} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Palette className="w-5 h-5" />Theme</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {[{ name: "Blue", color: "bg-primary" }, { name: "Purple", color: "bg-accent" }, { name: "Green", color: "bg-success" }].map((theme) => (
                <button key={theme.name} className={`w-10 h-10 rounded-full ${theme.color} ring-2 ring-offset-2 ring-offset-background ${theme.name === "Blue" ? "ring-primary" : "ring-transparent"}`} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
