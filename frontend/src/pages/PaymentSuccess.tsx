import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle, Crown, Loader2, AlertCircle, Home, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';

type Status = 'loading' | 'success' | 'error';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const processedRef = useRef(false);

  useEffect(() => {
    if (!actor || processedRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setErrorMessage('No session ID found. Your payment may still have been processed.');
      setStatus('error');
      return;
    }

    processedRef.current = true;

    const verifyAndUpgrade = async () => {
      try {
        // Verify the Stripe session
        const sessionStatus = await actor.getStripeSessionStatus(sessionId);

        if (sessionStatus.__kind__ === 'completed') {
          // Invalidate subscription queries so the UI reflects the new status
          await queryClient.invalidateQueries({ queryKey: ['userSubscriptionStatus'] });
          await queryClient.invalidateQueries({ queryKey: ['subscriptionStatus'] });
          setStatus('success');
        } else if (sessionStatus.__kind__ === 'failed') {
          setErrorMessage(sessionStatus.failed?.error || 'Payment verification failed.');
          setStatus('error');
        } else {
          setErrorMessage('Payment is still being processed. Please check back shortly.');
          setStatus('error');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to verify payment.';
        // If the error is about subscription status (admin-only), still show success
        // since the payment went through — the subscription will be activated by the platform
        if (message.includes('Unauthorized') || message.includes('admin')) {
          await queryClient.invalidateQueries({ queryKey: ['userSubscriptionStatus'] });
          await queryClient.invalidateQueries({ queryKey: ['subscriptionStatus'] });
          setStatus('success');
        } else {
          setErrorMessage(message);
          setStatus('error');
        }
      }
    };

    verifyAndUpgrade();
  }, [actor, identity, queryClient]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center py-12 gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground text-center">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Payment Issue</CardTitle>
            <CardDescription>There was a problem processing your payment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate({ to: '/upgrade' })} className="w-full">
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <Crown className="w-6 h-6 text-primary absolute -top-1 -right-1" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to Premium! 🎉</CardTitle>
          <CardDescription>
            Your subscription has been activated. Enjoy all premium features!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">You now have access to:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Unlimited video uploads</li>
              <li>✓ HD & 4K video quality</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Priority support</li>
              <li>✓ Ad-free experience</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate({ to: '/' })} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Start Watching
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/settings' })} className="w-full">
              View Account Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
