import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Palette, Shield } from "lucide-react";

const Settings = () => {
  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>

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
