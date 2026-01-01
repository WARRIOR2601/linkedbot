import { useState, useEffect } from "react";
import { getGlobalDiagnostics } from "./ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bug, X, ChevronDown, ChevronUp } from "lucide-react";

const DiagnosticsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [diagnostics, setDiagnostics] = useState(getGlobalDiagnostics());

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(() => {
      setDiagnostics(getGlobalDiagnostics());
    }, 500);
    return () => clearInterval(interval);
  }, []);

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
              diagnostics.authStatus === "authenticated" ? "text-success" :
              diagnostics.authStatus === "unauthenticated" ? "text-destructive" : "text-warning"
            }`}>
              {diagnostics.authStatus}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID:</span>
            <span className="font-mono text-[10px] truncate max-w-[140px]">
              {diagnostics.userId || "null"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Login Method:</span>
            <span className="font-medium">{diagnostics.loginMethod || "null"}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Onboarding Complete:</span>
            <span className={`font-medium ${
              diagnostics.onboardingComplete === true ? "text-success" :
              diagnostics.onboardingComplete === false ? "text-warning" : "text-muted-foreground"
            }`}>
              {diagnostics.onboardingComplete === null ? "loading" : String(diagnostics.onboardingComplete)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Route:</span>
            <span className="font-mono text-[10px]">{diagnostics.currentRoute}</span>
          </div>
          
          {diagnostics.lastRedirectReason && (
            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground">Last Redirect:</span>
              <p className="text-warning mt-1">{diagnostics.lastRedirectReason}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default DiagnosticsPanel;
