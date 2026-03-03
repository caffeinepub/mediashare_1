import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { XCircle, Home, RefreshCw } from 'lucide-react';

export function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="container py-16 max-w-lg mx-auto">
      <Card className="border-destructive">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription className="text-base">
            Your payment was cancelled or could not be processed. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Don't worry — you can try again whenever you're ready. Your free account is still active.
          </p>
          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="w-full bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90"
              onClick={() => navigate({ to: '/upgrade' })}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
