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
              <h2 className="text-2xl font-semibold">6. Contact Us</h2>
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
