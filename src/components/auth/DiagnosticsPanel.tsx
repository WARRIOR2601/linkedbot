import { useState, useEffect } from "react";
import { Bug, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useUserRole } from "@/hooks/useUserRole";
import { useLocation } from "react-router-dom";
import { getGlobalDiagnostics } from "./ProtectedRoute";

const DiagnosticsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const { user, isLoading: authLoading, loginMethod } = useAuth();
  const { profile, isLoading: onboardingLoading } = useOnboarding();
  const { role, isLoading: roleLoading } = useUserRole();
  const location = useLocation();
  const [lastRedirectReason, setLastRedirectReason] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Poll for global diagnostics updates
  useEffect(() => {
    const interval = setInterval(() => {
      const diagnostics = getGlobalDiagnostics();
      setLastRedirectReason(diagnostics.lastRedirectReason);
      setLastError(diagnostics.lastError ?? null);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Don't show if not logged in
  if (!user) return null;

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 bg-card border-primary/50"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="w-4 h-4" />
      </Button>
    );
  }

  const isEmailVerified = user?.email_confirmed_at != null;
  const authStatus = authLoading ? "loading" : user ? "authenticated" : "unauthenticated";

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 bg-card border-primary/50 shadow-xl">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bug className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Diagnostics</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {!isMinimized && (
        <CardContent className="p-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Auth Status:</span>
            <span className={`font-medium ${
              authStatus === "authenticated" ? "text-green-500" :
              authStatus === "unauthenticated" ? "text-destructive" : "text-warning"
            }`}>
              {authStatus}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono text-[10px] truncate max-w-[140px]">
              {user?.id?.slice(0, 8) || "null"}...
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Login Method:</span>
            <span className="font-medium">{loginMethod || "null"}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Email Verified:</span>
            <span className={`font-medium ${isEmailVerified ? "text-green-500" : "text-yellow-500"}`}>
              {isEmailVerified ? "Yes" : "No"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Onboarding:</span>
            <span className={`font-medium ${
              profile?.is_complete === true ? "text-green-500" :
              profile?.is_complete === false ? "text-yellow-500" : "text-muted-foreground"
            }`}>
              {onboardingLoading ? "loading" : profile?.is_complete ? "Complete" : "Incomplete"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Role:</span>
            <span className="font-medium">
              {roleLoading ? "loading" : role || "user"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Status:</span>
            <span className={`font-medium ${
              profile?.account_status === "active" ? "text-green-500" : "text-destructive"
            }`}>
              {onboardingLoading ? "loading" : profile?.account_status || "active"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Route:</span>
            <span className="font-mono text-[10px]">{location.pathname}</span>
          </div>
          
          {lastRedirectReason && (
            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground">Last Redirect:</span>
              <p className="text-yellow-500 mt-1">{lastRedirectReason}</p>
            </div>
          )}

          {lastError && (
            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground">Last Error:</span>
              <p className="text-destructive mt-1 truncate" title={lastError}>{lastError}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default DiagnosticsPanel;
