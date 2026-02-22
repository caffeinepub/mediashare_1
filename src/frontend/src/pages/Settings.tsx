import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useSaveCallerUserProfile } from '../hooks/useSaveCallerUserProfile';
import { useSetChannelName } from '../hooks/useSetChannelName';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function Settings() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();
  const setChannelNameMutation = useSetChannelName();

  const [name, setName] = useState('');
  const [channelName, setChannelName] = useState('');

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setChannelName(userProfile.channelName || '');
    }
  }, [userProfile]);

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Alert>
          <AlertDescription>Please sign in to access settings.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await saveProfileMutation.mutateAsync({
      name: name.trim(),
      channelName: channelName.trim() || undefined,
    });
  };

  const handleSaveChannelName = async () => {
    if (!channelName.trim()) return;
    await setChannelNameMutation.mutateAsync(channelName.trim());
  };

  const remainingChars = 30 - channelName.length;
  const isPending = saveProfileMutation.isPending || setChannelNameMutation.isPending;

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your profile and preferences</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your name and channel information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channelName">
                  Channel Name
                  <span className="text-xs text-muted-foreground ml-2">
                    {remainingChars} characters remaining
                  </span>
                </Label>
                <Input
                  id="channelName"
                  placeholder="Your channel name (3-30 characters)"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value.slice(0, 30))}
                  maxLength={30}
                  disabled={isPending}
                />
                <p className="text-xs text-muted-foreground">
                  This will be displayed instead of your principal ID. Must be 3-30 characters with only letters and numbers.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={!name.trim() || isPending}
                >
                  {saveProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
                {channelName.trim() && channelName !== userProfile?.channelName && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveChannelName}
                    disabled={isPending || channelName.length < 3}
                  >
                    {setChannelNameMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Channel Name'
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {identity && (
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your Internet Identity principal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Principal ID</Label>
                <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                  {identity.getPrincipal().toString()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
