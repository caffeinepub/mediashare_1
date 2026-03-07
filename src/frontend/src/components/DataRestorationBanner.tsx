import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";

const BANNER_DISMISSED_KEY = "data_restoration_banner_dismissed_v36";

export function DataRestorationBanner() {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BANNER_DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    } catch {
      // ignore storage errors
    }
    setDismissed(true);
  };

  return (
    <div className="px-4 pt-4 sm:px-6">
      <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-200 relative pr-10">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-300 font-semibold">
          All Videos Are Safe
        </AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          Your videos are fully intact and available. All previously uploaded
          content is safe and accessible. Uploading new videos will not affect
          your existing content.
        </AlertDescription>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="absolute top-2 right-2 h-7 w-7 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-900 dark:hover:text-green-200"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  );
}
