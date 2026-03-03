import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { SubscriptionStatus } from '../backend';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Loader2, Home, Crown } from 'lucide-react';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Extract session_id from URL query params
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const sessionId = search?.get('session_id') ?? '';

  useEffect(() => {
    if (!actor || !identity) return;

    const verifyAndActivate = async () => {
      try {
        if (!sessionId) {
          // No session ID — still mark as success (payment may have been processed)
          setStatus('success');
          return;
        }

        const sessionStatus = await actor.getStripeSessionStatus(sessionId);

        if (sessionStatus.__kind__ === 'completed') {
          // Upgrade the user to premium
          const principal = identity.getPrincipal();
          await actor.setSubscriptionStatus(principal, SubscriptionStatus.premium);
          queryClient.invalidateQueries({ queryKey: ['userSubscriptionStatus'] });
          setStatus('success');
        } else if (sessionStatus.__kind__ === 'failed') {
          setErrorMessage(sessionStatus.failed.error || 'Payment verification failed.');
          setStatus('error');
        } else {
          setStatus('success');
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'An error occurred verifying your payment.';
        setErrorMessage(message);
        setStatus('error');
      }
    };

    verifyAndActivate();
  }, [actor, identity, sessionId, queryClient]);

  if (status === 'loading') {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container py-16 max-w-lg mx-auto">
        <Card className="border-destructive">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Verification Failed</CardTitle>
            <CardDescription>{errorMessage || 'We could not verify your payment.'}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => navigate({ to: '/upgrade' })} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/' })} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-16 max-w-lg mx-auto">
      <Card className="border-chart-1 bg-gradient-to-br from-chart-1/5 to-chart-2/5">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-chart-1/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-chart-1" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            Welcome to Premium!
            <Crown className="w-6 h-6 text-chart-1" />
          </CardTitle>
          <CardDescription className="text-base">
            Your subscription is now active. Enjoy all the premium features!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-background/60 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">You now have access to:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Unlimited video and photo uploads</li>
              <li>✓ 4K quality support</li>
              <li>✓ Priority support</li>
              <li>✓ No ads</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Custom channel branding</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90"
              onClick={() => navigate({ to: '/' })}
            >
              <Home className="w-4 h-4 mr-2" />
              Start Creating
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/settings' })} className="w-full">
              View Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
