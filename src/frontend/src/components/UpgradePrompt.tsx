import { useGetUserSubscriptionStatus } from '../hooks/useGetUserSubscriptionStatus';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Zap, ArrowRight } from 'lucide-react';

export function UpgradePrompt() {
  const navigate = useNavigate();
  const { data: subscriptionStatus, isLoading } = useGetUserSubscriptionStatus();

  // Only show to free tier users
  if (isLoading || subscriptionStatus?.tier === 'premium') {
    return null;
  }

  return (
    <Card className="border-chart-1 bg-gradient-to-br from-chart-1/5 to-chart-2/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-chart-1" />
          <CardTitle className="text-lg">Upgrade to Premium</CardTitle>
        </div>
        <CardDescription>
          Unlock unlimited uploads, higher quality limits, and more!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-chart-1" />
            <span>Unlimited video and photo uploads</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-chart-1" />
            <span>4K quality support</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-chart-1" />
            <span>Priority support and no ads</span>
          </div>
          <Button
            className="w-full mt-4 bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90"
            onClick={() => navigate({ to: '/upgrade' })}
          >
            Learn More
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
