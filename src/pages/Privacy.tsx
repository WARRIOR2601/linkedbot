import PublicLayout from "@/components/layout/PublicLayout";

const Privacy = () => {
  return (
    <PublicLayout>
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-muted-foreground text-lg">
              Last updated: January 1, 2024
            </p>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to Linkedbot. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and use our services.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">2. Data We Collect</h2>
              <p className="text-muted-foreground">
                We may collect, use, store and transfer different kinds of personal data about you including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Identity Data: first name, last name, username</li>
                <li>Contact Data: email address</li>
                <li>Technical Data: IP address, browser type, device information</li>
                <li>Usage Data: information about how you use our website and services</li>
                <li>LinkedIn Data: profile information and post analytics when you connect your account</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">3. How We Use Your Data</h2>
              <p className="text-muted-foreground">
                We use your data to provide and improve our services, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Providing AI-generated content suggestions</li>
                <li>Scheduling and publishing posts to LinkedIn</li>
                <li>Analyzing post performance and engagement</li>
                <li>Sending service-related notifications</li>
                <li>Improving our AI models and features</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Data Security</h2>
              <p className="text-muted-foreground">
                We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way. We limit access to your personal data to employees and partners who have a business need to know.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Your Rights</h2>
              <p className="text-muted-foreground">
                Under certain circumstances, you have rights under data protection laws including the right to access, correct, erase, restrict, transfer, or object to processing of your personal data.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">6. AI Agents & LinkedIn Data Usage</h2>
              <p className="text-muted-foreground">
                Linkedbot uses AI agents to help you create and schedule LinkedIn content. This section explains how AI agents work and our LinkedIn data practices.
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
              
              <h3 className="text-xl font-medium mt-4">LinkedIn Data We Access</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Your LinkedIn profile information (name, headline, profile photo)</li>
                <li>Your LinkedIn member ID for account identification</li>
                <li>Permission to share posts on your behalf (w_member_social scope)</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">Why We Access This Data</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>To identify your LinkedIn account and display your profile information within our app</li>
                <li>To allow your AI agents to publish posts that you have explicitly reviewed and approved</li>
                <li>To schedule posts for future publication at times you specify</li>
              </ul>

              <h3 className="text-xl font-medium mt-4">Token Storage and Security</h3>
              <p className="text-muted-foreground">
                Your LinkedIn access tokens are encrypted and stored securely in our database. We use industry-standard encryption methods to protect your credentials. Tokens are only used to perform actions you have explicitly authorized through your AI agents.
              </p>

              <h3 className="text-xl font-medium mt-4">Revoking Access</h3>
              <p className="text-muted-foreground">
                You can disconnect your LinkedIn account at any time from the Settings page within Linkedbot. When disconnected, all AI agents are immediately disabled and cannot post. You can also revoke access directly from your LinkedIn account settings under "Permitted Services."
              </p>

              <h3 className="text-xl font-medium mt-4">Data Deletion</h3>
              <p className="text-muted-foreground">
                When you disconnect your LinkedIn account, we immediately delete your LinkedIn access tokens and refresh tokens from our systems. Your LinkedIn profile information stored in our database is also removed. AI agents remain configured but are disabled until you reconnect.
              </p>

              <h3 className="text-xl font-medium mt-4">What We Do Not Do</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>We do not scrape LinkedIn data or access data beyond the permissions you grant</li>
                <li>We do not perform automated engagement actions (likes, comments, connection requests)</li>
                <li>We do not post content without your explicit review and approval</li>
                <li>We do not share your LinkedIn data with third parties</li>
                <li>We do not access your LinkedIn connections, messages, or other private data</li>
                <li>We do not allow AI agents to bypass your control or consent</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@linkedbot.com.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Privacy;
