import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const BANNER_DISMISSED_KEY = 'data_restoration_banner_dismissed_v35';

export function DataRestorationBanner() {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(BANNER_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    } catch {
      // ignore storage errors
    }
    setDismissed(true);
  };

  return (
    <div className="px-4 pt-4 sm:px-6">
      <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 relative pr-10">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold">
          Video Restoration In Progress
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-400">
          A technical issue during our latest update may have temporarily affected video visibility.
          Our team is actively working to restore all uploaded videos. We apologize for the inconvenience —
          your content is safe and will be back shortly.
        </AlertDescription>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="absolute top-2 right-2 h-7 w-7 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:text-amber-900 dark:hover:text-amber-200"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </Button>
      </Alert>
    </div>
  );
}
