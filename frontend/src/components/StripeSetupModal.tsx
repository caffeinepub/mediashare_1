import { useState } from 'react';
import { useSetStripeConfiguration } from '../hooks/useStripeConfig';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface StripeSetupModalProps {
  open: boolean;
  onClose: () => void;
}

export function StripeSetupModal({ open, onClose }: StripeSetupModalProps) {
  const [secretKey, setSecretKey] = useState('');
  const [allowedCountries, setAllowedCountries] = useState('US, CA, GB, AU, DE, FR, IN');
  const setConfigMutation = useSetStripeConfiguration();

  const handleSave = async () => {
    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    const countries = allowedCountries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (countries.length === 0) {
      toast.error('Please enter at least one valid country code');
      return;
    }

    try {
      await setConfigMutation.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries: countries,
      });
      toast.success('Stripe configured successfully!');
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to configure Stripe.';
      toast.error('Configuration failed', { description: message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <DialogTitle>Configure Stripe Payments</DialogTitle>
          </div>
          <DialogDescription>
            Enter your Stripe secret key to enable premium subscriptions. You can find this in your{' '}
            <a
              href="https://dashboard.stripe.com/apikeys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-primary"
            >
              Stripe Dashboard
            </a>
            .
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="stripe-secret-key">Stripe Secret Key</Label>
            <Input
              id="stripe-secret-key"
              type="password"
              placeholder="sk_live_... or sk_test_..."
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              disabled={setConfigMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Use <code>sk_test_...</code> for testing, <code>sk_live_...</code> for production.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowed-countries">Allowed Countries</Label>
            <Input
              id="allowed-countries"
              placeholder="US, CA, GB, AU, DE, FR, IN"
              value={allowedCountries}
              onChange={(e) => setAllowedCountries(e.target.value)}
              disabled={setConfigMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated 2-letter country codes (ISO 3166-1 alpha-2).
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={setConfigMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={setConfigMutation.isPending || !secretKey.trim()}>
            {setConfigMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
