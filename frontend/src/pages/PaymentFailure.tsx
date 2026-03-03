import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { XCircle, RefreshCw, Home, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Payment Cancelled</CardTitle>
          <CardDescription>
            Your payment was cancelled or could not be processed. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
            <p>If you experienced an issue, please try again. Your account has not been charged.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate({ to: '/upgrade' })} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Need help?{' '}
            <span className="text-primary cursor-pointer hover:underline">
              Contact support
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
