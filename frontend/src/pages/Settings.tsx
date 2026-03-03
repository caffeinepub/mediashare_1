import React, { useState, useEffect } from 'react';
import {
  Crown,
  User,
  Settings as SettingsIcon,
  Check,
  Loader2,
  Shield,
  CreditCard,
  IndianRupee,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useSaveCallerUserProfile } from '../hooks/useSaveCallerUserProfile';
import { useGetUserSubscriptionStatus } from '../hooks/useGetUserSubscriptionStatus';
import { useIsStripeConfigured } from '../hooks/useStripeConfig';
import { useIsRazorpayConfigured } from '../hooks/useRazorpayConfig';
import { useGetAdSensePublisherId, useSetAdSensePublisherId } from '../hooks/useAdSenseConfig';
import { StripeSetupModal } from '../components/StripeSetupModal';
import { RazorpaySetupModal } from '../components/RazorpaySetupModal';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: subscriptionData, isLoading: subscriptionLoading } = useGetUserSubscriptionStatus();
  const saveProfile = useSaveCallerUserProfile();

  const { data: isStripeConfigured } = useIsStripeConfigured();
  const { data: isRazorpayConfigured } = useIsRazorpayConfigured();
  const { data: adSensePublisherId } = useGetAdSensePublisherId();
  const setAdSensePublisherId = useSetAdSensePublisherId();

  const [name, setName] = useState('');
  const [channelName, setChannelName] = useState('');
  const [showStripeSetup, setShowStripeSetup] = useState(false);
  const [showRazorpaySetup, setShowRazorpaySetup] = useState(false);
  const [publisherIdInput, setPublisherIdInput] = useState('');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name ?? '');
      setChannelName(userProfile.channelName ?? '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (adSensePublisherId) {
      setPublisherIdInput(adSensePublisherId);
    }
  }, [adSensePublisherId]);

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    await saveProfile.mutateAsync({
      name,
      channelName: channelName || undefined,
      accountCreation: userProfile.accountCreation,
    });
  };

  const handleSaveAdSense = async () => {
    const trimmed = publisherIdInput.trim();
    if (!trimmed) {
      toast.error('Please enter a publisher ID');
      return;
    }
    if (!trimmed.startsWith('ca-pub-')) {
      toast.error('Publisher ID must start with ca-pub-');
      return;
    }
    await setAdSensePublisherId.mutateAsync(trimmed);
  };

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Please sign in to access settings.</p>
            <Button className="mt-4" onClick={() => navigate({ to: '/' })}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPremium = subscriptionData?.tier === 'premium';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="w-4 h-4 text-primary" />
              Subscription
            </CardTitle>
            <CardDescription>Your current plan and features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Current Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {isPremium ? 'All premium features unlocked' : 'Limited features'}
                    </p>
                  </div>
                  <Badge
                    className={
                      isPremium
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }
                  >
                    {isPremium ? (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </>
                    ) : (
                      'Free'
                    )}
                  </Badge>
                </div>

                {isPremium ? (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1">
                    {[
                      'Unlimited video uploads',
                      'HD & 4K video quality',
                      'Advanced analytics',
                      'Priority support',
                      'Ad-free experience',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-3 h-3 text-primary" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => navigate({ to: '/upgrade' })}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium — $9.99/mo or ₹499/mo
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Stripe Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="w-4 h-4 text-primary" />
              Stripe Payments (USD)
            </CardTitle>
            <CardDescription>Configure Stripe for USD payment processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground font-medium">
                  Status:{' '}
                  <span className={isStripeConfigured ? 'text-green-600' : 'text-muted-foreground'}>
                    {isStripeConfigured ? 'Configured ✓' : 'Not configured'}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Accept credit/debit card payments in USD
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowStripeSetup(true)}>
                {isStripeConfigured ? 'Reconfigure' : 'Setup Stripe'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Razorpay Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IndianRupee className="w-4 h-4 text-primary" />
              Razorpay Payments (INR)
            </CardTitle>
            <CardDescription>Configure Razorpay for INR payment processing in India</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground font-medium">
                  Status:{' '}
                  <span className={isRazorpayConfigured ? 'text-green-600' : 'text-muted-foreground'}>
                    {isRazorpayConfigured ? 'Configured ✓' : 'Not configured'}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Accept UPI, cards, and NetBanking payments in INR
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowRazorpaySetup(true)}>
                {isRazorpayConfigured ? 'Reconfigure' : 'Setup Razorpay'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AdSense Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Megaphone className="w-4 h-4 text-primary" />
              Google AdSense
            </CardTitle>
            <CardDescription>
              Configure your Google AdSense publisher ID to display ads and earn revenue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="publisher-id">Publisher ID</Label>
              <Input
                id="publisher-id"
                type="text"
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                value={publisherIdInput}
                onChange={(e) => setPublisherIdInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Find your Publisher ID in your{' '}
                <a
                  href="https://adsense.google.com/adsense/answer/105516"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  AdSense account
                </a>
                . Format: <code>ca-pub-XXXXXXXXXXXXXXXX</code>
              </p>
            </div>
            {adSensePublisherId && (
              <p className="text-xs text-green-600 font-medium">
                ✓ Currently configured: {adSensePublisherId}
              </p>
            )}
            <Button
              onClick={handleSaveAdSense}
              disabled={setAdSensePublisherId.isPending || !publisherIdInput.trim()}
              size="sm"
            >
              {setAdSensePublisherId.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Publisher ID'
              )}
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Profile
            </CardTitle>
            <CardDescription>Update your display name and channel name</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileLoading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channelName">Channel Name</Label>
                  <Input
                    id="channelName"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="Your channel name (optional)"
                  />
                </div>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saveProfile.isPending || !name.trim()}
                  className="w-full"
                >
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Principal ID</span>
              <span className="font-mono text-xs text-foreground truncate max-w-[200px]">
                {identity.getPrincipal().toString()}
              </span>
            </div>
            {userProfile?.accountCreation && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Member Since</span>
                <span className="text-foreground">
                  {new Date(Number(userProfile.accountCreation) / 1_000_000).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
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
