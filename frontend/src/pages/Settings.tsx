import React, { useState, useEffect } from 'react';
import { Crown, User, Settings as SettingsIcon, Check, Loader2, Shield } from 'lucide-react';
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
import { useNavigate } from '@tanstack/react-router';

export default function Settings() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: subscriptionData, isLoading: subscriptionLoading } = useGetUserSubscriptionStatus();
  const saveProfile = useSaveCallerUserProfile();

  const [name, setName] = useState('');
  const [channelName, setChannelName] = useState('');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name ?? '');
      setChannelName(userProfile.channelName ?? '');
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    await saveProfile.mutateAsync({
      name,
      channelName: channelName || undefined,
      accountCreation: userProfile.accountCreation,
    });
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
                    Upgrade to Premium — $9.99/mo
                  </Button>
                )}
              </>
            )}
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
    </div>
  );
}
