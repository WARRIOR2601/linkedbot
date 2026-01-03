import PublicLayout from "@/components/layout/PublicLayout";

const Terms = () => {
  return (
    <PublicLayout>
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-muted-foreground text-lg">
              Last updated: January 3, 2025
            </p>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Linkedbot, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Linkedbot provides AI-powered content creation, scheduling, and analytics tools for LinkedIn. Our service includes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>AI-generated post content and suggestions</li>
                <li>Post scheduling and automation</li>
                <li>Analytics and performance tracking</li>
                <li>Content calendar management</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">3. User Obligations</h2>
              <p className="text-muted-foreground">
                When using our service, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service in compliance with LinkedIn's terms of service</li>
                <li>Not use the service for any illegal or unauthorized purpose</li>
                <li>Not misrepresent yourself or your content</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The service and its original content, features, and functionality are owned by Linkedbot and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                Linkedbot shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify or replace these terms at any time. We will provide notice of any significant changes by posting the new terms on this page.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">7. AI Agents & LinkedIn Integration Terms</h2>
              <p className="text-muted-foreground">
                Linkedbot uses AI agents to help you create and schedule LinkedIn content. By using our service and connecting your LinkedIn account, you agree to the following terms.
              </p>

              <h3 className="text-xl font-medium mt-4">What Are AI Agents?</h3>
              <p className="text-muted-foreground">
                AI agents are content assistants trained by you to behave like a content intern. Each agent follows your defined rules, tone, posting frequency, and boundaries. Agents do not act independently and cannot perform any action without your prior authorization.
              </p>

              <h3 className="text-xl font-medium mt-4">What Agents Can Do</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Draft LinkedIn post content based on your preferences and training</li>
                <li>Schedule posts according to rules you define</li>
                <li>Publish posts only after LinkedIn account connection and your explicit consent</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">What Agents Cannot Do</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Like, comment on, or share other users' posts</li>
                <li>Send direct messages or InMail</li>
                <li>Send or accept connection requests</li>
                <li>Perform any engagement automation</li>
                <li>Scrape or extract LinkedIn data</li>
                <li>Act without your explicit authorization</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">User Consent and Control</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>You must explicitly authorize the connection between Linkedbot and your LinkedIn account</li>
                <li>By connecting LinkedIn, you allow your AI agents to publish posts on your behalf using official LinkedIn APIs</li>
                <li>You retain full control over what content is posted to your LinkedIn profile</li>
                <li>All posts require your review and approval before publication</li>
                <li>You may pause agents or disconnect your LinkedIn account at any time</li>
                <li>Agents are disabled if LinkedIn is disconnected and cannot bypass your control</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">Permitted Use of LinkedIn Data</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>We access only the data necessary to provide our posting service</li>
                <li>We use your profile information solely to identify your account within our application</li>
                <li>We use posting permissions only to publish content you have approved through your AI agents</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">Prohibited Activities</h3>
              <p className="text-muted-foreground">
                You agree not to use Linkedbot for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Posting spam, misleading content, or content that violates LinkedIn's terms</li>
                <li>Any form of automated engagement or interaction beyond posting</li>
                <li>Scraping or extracting LinkedIn data</li>
                <li>Circumventing LinkedIn's API rate limits or usage policies</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">Token Security</h3>
              <p className="text-muted-foreground">
                Your LinkedIn access credentials are encrypted and stored securely. You are responsible for maintaining the security of your Linkedbot account, which provides access to your connected LinkedIn account and AI agents.
              </p>

              <h3 className="text-xl font-medium mt-4">Disconnection and Data Removal</h3>
              <p className="text-muted-foreground">
                Upon disconnecting your LinkedIn account, we will delete your LinkedIn tokens and associated profile data from our systems. All AI agents will be disabled immediately. Scheduled posts that have not yet been published will be cancelled.
              </p>

              <h3 className="text-xl font-medium mt-4">Compliance with LinkedIn Policies</h3>
              <p className="text-muted-foreground">
                Your use of Linkedbot and AI agents must comply with LinkedIn's User Agreement and Professional Community Policies. We reserve the right to suspend or terminate your access if you violate LinkedIn's terms through our service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">8. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the appropriate courts.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">9. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the service will immediately cease. All AI agents will be disabled and scheduled posts will be cancelled.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">10. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Legal Inquiries:</strong> <a href="mailto:legal@linkedbot.online" className="text-primary hover:underline">legal@linkedbot.online</a></li>
                <li><strong>General Support:</strong> <a href="mailto:support@linkedbot.online" className="text-primary hover:underline">support@linkedbot.online</a></li>
              </ul>
            </div>

            <div className="mt-8 p-6 rounded-lg border border-border/50 bg-muted/30">
              <p className="text-sm text-muted-foreground text-center">
                Linkedbot is an independent service and is not affiliated with, endorsed by, or 
                sponsored by LinkedIn Corporation. LinkedIn® is a registered trademark of LinkedIn Corporation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Terms;
