import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserSubscriptionStatus } from '../hooks/useGetUserSubscriptionStatus';
import { useCreateCheckoutSession } from '../hooks/useCreateCheckoutSession';
import { useIsStripeConfigured } from '../hooks/useStripeConfig';
import { StripeSetupModal } from '../components/StripeSetupModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Check, Zap, Loader2, Crown, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function Upgrade() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: subscriptionStatus, isLoading } = useGetUserSubscriptionStatus();
  const { data: stripeConfigured, isLoading: stripeConfigLoading } = useIsStripeConfigured();
  const checkoutMutation = useCreateCheckoutSession();
  const [showStripeSetup, setShowStripeSetup] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isPremium = subscriptionStatus?.tier === 'premium';

  const handleUpgrade = async () => {
    if (!stripeConfigured) {
      setShowStripeSetup(true);
      return;
    }

    try {
      const session = await checkoutMutation.mutateAsync([
        {
          productName: 'Media Share Premium',
          productDescription: 'Unlimited uploads, 4K quality, priority support, and no ads',
          currency: 'usd',
          priceInCents: BigInt(999),
          quantity: BigInt(1),
        },
      ]);

      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Please try again later.';
      toast.error('Checkout failed', { description: message });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Alert>
          <AlertDescription>Please sign in to view upgrade options.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold">Upgrade to Premium</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock unlimited uploads, higher quality limits, and priority support
          </p>
        </div>

        {isPremium && (
          <Alert className="max-w-2xl mx-auto border-chart-1 bg-chart-1/10">
            <Sparkles className="w-4 h-4 text-chart-1" />
            <AlertDescription className="text-chart-1">
              You're already on the Premium plan! Enjoy all the benefits.
            </AlertDescription>
          </Alert>
        )}

        {!stripeConfigLoading && !stripeConfigured && !isPremium && (
          <Alert className="max-w-2xl mx-auto">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Payment system is not yet configured. Admin needs to set up Stripe to enable purchases.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Card className={subscriptionStatus?.tier === 'free' ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Free</CardTitle>
                {subscriptionStatus?.tier === 'free' && (
                  <Badge variant="outline">Current Plan</Badge>
                )}
              </div>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Basic video and photo uploads</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Standard quality (720p)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Community support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm">Public galleries</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className={`relative ${subscriptionStatus?.tier === 'premium' ? 'border-chart-1' : 'border-primary shadow-lg'}`}>
            {subscriptionStatus?.tier !== 'premium' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-chart-1 to-chart-2 text-white border-0">
                  <Zap className="w-3 h-3 mr-1" />
                  Recommended
                </Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  Premium
                  <Crown className="w-5 h-5 text-chart-1" />
                </CardTitle>
                {subscriptionStatus?.tier === 'premium' && (
                  <Badge className="bg-chart-1 text-white">Current Plan</Badge>
                )}
              </div>
              <CardDescription>For creators who want more</CardDescription>
              <div className="pt-4">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-chart-1 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">Unlimited uploads</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-chart-1 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">Higher quality limits (4K)</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-chart-1 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">Priority support</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-chart-1 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">No ads</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-chart-1 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">Advanced analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-chart-1 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium">Custom channel branding</span>
                </div>
              </div>
              {!isPremium && (
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90"
                  size="lg"
                  onClick={handleUpgrade}
                  disabled={checkoutMutation.isPending || stripeConfigLoading}
                >
                  {checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Redirecting to checkout...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Go Premium — $9.99/mo
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your Premium subscription at any time. You'll continue to have access until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit and debit cards through our secure Stripe payment system.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-sm text-muted-foreground">
                  All new users start with a free account. You can upgrade to Premium at any time to unlock additional features.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How does billing work?</h3>
                <p className="text-sm text-muted-foreground">
                  You'll be charged $9.99/month. Your subscription renews automatically each month until you cancel.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <StripeSetupModal open={showStripeSetup} onClose={() => setShowStripeSetup(false)} />
    </div>
  );
}
