import PublicLayout from "@/components/layout/PublicLayout";

const Terms = () => {
  return (
    <PublicLayout>
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <div className="prose prose-invert max-w-none space-y-8">
            <p className="text-muted-foreground text-lg">
              Last updated: January 1, 2024
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
              <h2 className="text-2xl font-semibold">7. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at legal@linkedbot.com.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Terms;
