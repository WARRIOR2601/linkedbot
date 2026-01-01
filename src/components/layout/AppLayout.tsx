import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import EmailVerificationBanner from "@/components/auth/EmailVerificationBanner";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();
  const isEmailVerified = user?.email_confirmed_at != null;

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-6 lg:p-8">
          {!isEmailVerified && <EmailVerificationBanner email={user?.email} />}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
