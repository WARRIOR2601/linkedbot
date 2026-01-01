import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: ReactNode;
}

// Diagnostics state for debugging
interface DiagnosticsState {
  authStatus: "loading" | "authenticated" | "unauthenticated";
  userId: string | null;
  loginMethod: "email" | "google" | null;
  onboardingComplete: boolean | null;
  currentRoute: string;
  lastRedirectReason: string | null;
}

export const useDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
    authStatus: "loading",
    userId: null,
    loginMethod: null,
    onboardingComplete: null,
    currentRoute: "/",
    lastRedirectReason: null,
  });

  const updateDiagnostics = (updates: Partial<DiagnosticsState>) => {
    setDiagnostics((prev) => ({ ...prev, ...updates }));
  };

  return { diagnostics, updateDiagnostics };
};

// Global diagnostics state
let globalDiagnostics: DiagnosticsState = {
  authStatus: "loading",
  userId: null,
  loginMethod: null,
  onboardingComplete: null,
  currentRoute: "/",
  lastRedirectReason: null,
};

export const getGlobalDiagnostics = () => globalDiagnostics;
export const setGlobalDiagnostics = (updates: Partial<DiagnosticsState>) => {
  globalDiagnostics = { ...globalDiagnostics, ...updates };
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading: authLoading, loginMethod } = useAuth();
  const { isComplete, isLoading: onboardingLoading } = useOnboarding();
  const location = useLocation();

  // Update global diagnostics
  useEffect(() => {
    setGlobalDiagnostics({
      authStatus: authLoading ? "loading" : user ? "authenticated" : "unauthenticated",
      userId: user?.id ?? null,
      loginMethod,
      onboardingComplete: onboardingLoading ? null : isComplete,
      currentRoute: location.pathname,
    });
  }, [authLoading, user, loginMethod, onboardingLoading, isComplete, location.pathname]);

  // Show loading state while auth or onboarding status is being determined
  if (authLoading || (user && onboardingLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-md space-y-4 p-8">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <div className="space-y-2 mt-8">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Rule 1: Not authenticated → redirect to /login
  if (!user) {
    setGlobalDiagnostics({ lastRedirectReason: "Not authenticated" });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rule 2: Authenticated but onboarding not complete → redirect to /onboarding
  // Exception: Allow access to /onboarding itself
  if (!isComplete && location.pathname !== "/onboarding") {
    setGlobalDiagnostics({ lastRedirectReason: "Onboarding not complete" });
    return <Navigate to="/onboarding" replace />;
  }

  // Rule 3: Authenticated and onboarding complete, but on /onboarding → redirect to dashboard
  if (isComplete && location.pathname === "/onboarding") {
    setGlobalDiagnostics({ lastRedirectReason: "Onboarding already complete" });
    return <Navigate to="/app/dashboard" replace />;
  }

  setGlobalDiagnostics({ lastRedirectReason: null });
  return <>{children}</>;
};

export default ProtectedRoute;
