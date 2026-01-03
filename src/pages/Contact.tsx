import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, Shield } from "lucide-react";

const Contact = () => {
  return (
    <PublicLayout>
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg mb-12">
            Have questions about Linkedbot? We're here to help.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>General Inquiries</CardTitle>
                <CardDescription>For questions about our service</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:hello@linkedbot.online" 
                  className="text-primary hover:underline font-medium"
                >
                  hello@linkedbot.online
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Privacy & Data</CardTitle>
                <CardDescription>For privacy-related questions or data requests</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:privacy@linkedbot.online" 
                  className="text-primary hover:underline font-medium"
                >
                  privacy@linkedbot.online
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Technical Support</CardTitle>
                <CardDescription>For help with your account or AI agents</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:support@linkedbot.online" 
                  className="text-primary hover:underline font-medium"
                >
                  support@linkedbot.online
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Legal</CardTitle>
                <CardDescription>For legal inquiries and terms questions</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:legal@linkedbot.online" 
                  className="text-primary hover:underline font-medium"
                >
                  legal@linkedbot.online
                </a>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-12">
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We aim to respond to all inquiries within 24-48 business hours. For urgent matters 
                regarding your LinkedIn connection or AI agents, please include "URGENT" in your 
                email subject line.
              </p>
            </CardContent>
          </Card>

          <div className="mt-12 p-6 rounded-lg border border-border/50 bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              Linkedbot is an independent service and is not affiliated with, endorsed by, or 
              sponsored by LinkedIn Corporation. LinkedIn is a registered trademark of LinkedIn Corporation.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Contact;
