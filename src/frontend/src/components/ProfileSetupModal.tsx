import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetCallerUserProfile } from "../hooks/useGetCallerUserProfile";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSaveCallerUserProfile } from "../hooks/useSaveCallerUserProfile";

export function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();

  const [name, setName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [open, setOpen] = useState(false);

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    setOpen(showProfileSetup);
  }, [showProfileSetup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await saveProfileMutation.mutateAsync({
      name: name.trim(),
      channelName: channelName.trim() || undefined,
      accountCreation: BigInt(Date.now() * 1000000), // Convert to nanoseconds
    });
    setOpen(false);
  };

  const remainingChars = 30 - channelName.length;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome! Set up your profile</DialogTitle>
          <DialogDescription>
            Please provide your name and an optional channel name to get
            started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={saveProfileMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channelName">
              Channel Name (optional)
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
              disabled={saveProfileMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              This will be displayed instead of your principal ID
            </p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!name.trim() || saveProfileMutation.isPending}
          >
            {saveProfileMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
