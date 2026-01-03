import { ReactNode } from "react";
import PublicNavbar from "./PublicNavbar";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main className="pt-16">{children}</main>
      <footer className="border-t border-border/50 py-12 mt-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/contact" className="hover:text-foreground transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/signup" className="hover:text-foreground transition-colors">Sign Up</a></li>
                <li><a href="/login" className="hover:text-foreground transition-colors">Sign In</a></li>
              </ul>
            </div>
          </div>
          
          {/* LinkedIn Disclaimer */}
          <div className="border-t border-border/50 mt-8 pt-6">
            <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
              Linkedbot is an independent service and is not affiliated with, endorsed by, or sponsored by LinkedIn Corporation. 
              LinkedIn® is a registered trademark of LinkedIn Corporation.
            </p>
          </div>
          
          <div className="border-t border-border/50 mt-6 pt-6 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Linkedbot. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
