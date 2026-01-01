import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface EmailVerificationBannerProps {
  email?: string;
}

const EmailVerificationBanner = ({ email }: EmailVerificationBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <Alert className="border-warning bg-warning/10 mb-4">
      <AlertCircle className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between flex-1 ml-2">
        <span className="text-sm">
          Please verify your email{email ? ` (${email})` : ""} to secure your account.
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-2"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default EmailVerificationBanner;
