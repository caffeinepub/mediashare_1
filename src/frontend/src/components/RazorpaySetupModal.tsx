import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IndianRupee, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSetRazorpayConfiguration } from "../hooks/useRazorpayConfig";

interface RazorpaySetupModalProps {
  open: boolean;
  onClose: () => void;
}

export function RazorpaySetupModal({ open, onClose }: RazorpaySetupModalProps) {
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const setConfigMutation = useSetRazorpayConfiguration();

  const handleSave = async () => {
    if (!keyId.trim()) {
      toast.error("Please enter your Razorpay Key ID");
      return;
    }
    if (!keySecret.trim()) {
      toast.error("Please enter your Razorpay Key Secret");
      return;
    }

    try {
      await setConfigMutation.mutateAsync({
        keyId: keyId.trim(),
        keySecret: keySecret.trim(),
      });
      onClose();
    } catch {
      // Error handled in mutation onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" />
            <DialogTitle>Configure Razorpay Payments</DialogTitle>
          </div>
          <DialogDescription>
            Enter your Razorpay API credentials to enable INR payments. You can
            find these in your{" "}
            <a
              href="https://dashboard.razorpay.com/app/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Razorpay Dashboard
            </a>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="razorpay-key-id">Key ID</Label>
            <Input
              id="razorpay-key-id"
              type="text"
              placeholder="rzp_live_XXXXXXXXXX"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Starts with <code>rzp_live_</code> for production or{" "}
              <code>rzp_test_</code> for testing.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="razorpay-key-secret">Key Secret</Label>
            <Input
              id="razorpay-key-secret"
              type="password"
              placeholder="Your Razorpay Key Secret"
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Keep this secret. Never share it publicly.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={setConfigMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={setConfigMutation.isPending}>
            {setConfigMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Configuration"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
