import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Crown, Check, Zap, Shield, Star, AlertCircle, Loader2, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useCreateCheckoutSession } from '../hooks/useCreateCheckoutSession';
import { useGetUserSubscriptionStatus } from '../hooks/useGetUserSubscriptionStatus';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { StripeSetupModal } from '../components/StripeSetupModal';
import { RazorpaySetupModal } from '../components/RazorpaySetupModal';
import { useIsStripeConfigured } from '../hooks/useStripeConfig';
import { useIsRazorpayConfigured } from '../hooks/useRazorpayConfig';
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout';
import type { ShoppingItem } from '../backend';

const premiumFeatures = [
  'Upload unlimited videos',
  'HD & 4K video quality',
  'Advanced analytics dashboard',
  'Priority support',
  'Custom channel branding',
  'Ad-free experience',
  'Early access to new features',
];

const freeFeatures = [
  'Upload up to 5 videos',
  'Standard video quality',
  'Basic analytics',
  'Community support',
];

export default function Upgrade() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: subscriptionData } = useGetUserSubscriptionStatus();
  const { data: isStripeConfigured } = useIsStripeConfigured();
  const { data: isRazorpayConfigured } = useIsRazorpayConfigured();
  const createCheckoutSession = useCreateCheckoutSession();
  const razorpayCheckout = useRazorpayCheckout();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showStripeSetup, setShowStripeSetup] = useState(false);
  const [showRazorpaySetup, setShowRazorpaySetup] = useState(false);

  const isPremium = subscriptionData?.tier === 'premium';

  const handleStripeUpgrade = async () => {
    setCheckoutError(null);

    if (!identity) {
      navigate({ to: '/' });
      return;
    }

    if (!isStripeConfigured) {
      setShowStripeSetup(true);
      return;
    }

    const items: ShoppingItem[] = [
      {
        productName: 'Media Share Premium',
        productDescription: 'Monthly premium subscription with unlimited uploads and HD quality',
        currency: 'usd',
        priceInCents: BigInt(999),
        quantity: BigInt(1),
      },
    ];

    try {
      const session = await createCheckoutSession.mutateAsync(items);
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }
      window.location.href = session.url;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start checkout. Please try again.';
      setCheckoutError(message);
    }
  };

  const handleRazorpayUpgrade = async () => {
    setCheckoutError(null);

    if (!identity) {
      navigate({ to: '/' });
      return;
    }

    if (!isRazorpayConfigured) {
      setShowRazorpaySetup(true);
      return;
    }

    try {
      // ₹499 = 49900 paise
      await razorpayCheckout.mutateAsync({ keyId: '', amountInPaise: 49900 });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      if (message !== 'Payment dismissed') {
        setCheckoutError(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Crown className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Upgrade to Premium</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Unlock the full potential of Media Share with our premium plan.
          </p>
        </div>

        {isPremium && (
          <Alert className="mb-8 border-primary/30 bg-primary/5">
            <Crown className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary font-medium">
              You already have an active Premium subscription! Enjoy all premium features.
            </AlertDescription>
          </Alert>
        )}

        {checkoutError && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{checkoutError}</AlertDescription>
          </Alert>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Free Plan */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Free</CardTitle>
                <Badge variant="secondary">Current</Badge>
              </div>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freeFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Premium Plan — Stripe (USD) */}
          <Card className="border-primary/50 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-primary" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  Premium
                </CardTitle>
                <Badge className="bg-primary text-primary-foreground">USD</Badge>
              </div>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              {!isPremium && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleStripeUpgrade}
                  disabled={createCheckoutSession.isPending}
                >
                  {createCheckoutSession.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Pay with Card — $9.99
                    </>
                  )}
                </Button>
              )}
              {isPremium && (
                <Button className="w-full" size="lg" variant="outline" disabled>
                  <Crown className="w-4 h-4 mr-2" />
                  Already Premium
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan — Razorpay (INR) */}
          {(isRazorpayConfigured || !isRazorpayConfigured) && (
            <Card className="border-orange-500/50 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 left-0 h-1 bg-orange-500" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <IndianRupee className="w-5 h-5 text-orange-500" />
                    Premium
                  </CardTitle>
                  <Badge className="bg-orange-500 text-white">INR</Badge>
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">₹499</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {premiumFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {!isPremium && (
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    size="lg"
                    onClick={handleRazorpayUpgrade}
                    disabled={razorpayCheckout.isPending}
                  >
                    {razorpayCheckout.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <IndianRupee className="w-4 h-4 mr-2" />
                        Pay with Razorpay — ₹499
                      </>
                    )}
                  </Button>
                )}
                {isPremium && (
                  <Button className="w-full" size="lg" variant="outline" disabled>
                    <Crown className="w-4 h-4 mr-2" />
                    Already Premium
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center mt-3">
                  UPI · Cards · NetBanking · Wallets
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="mb-8" />

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Secure payment via Stripe &amp; Razorpay
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Cancel anytime
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4" />
            Instant activation
          </div>
        </div>
      </div>

      {showStripeSetup && (
        <StripeSetupModal open={showStripeSetup} onClose={() => setShowStripeSetup(false)} />
      )}
      {showRazorpaySetup && (
        <RazorpaySetupModal open={showRazorpaySetup} onClose={() => setShowRazorpaySetup(false)} />
      )}
    </div>
  );
}
