import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { Check, Crown, Zap } from "lucide-react";
import React from "react";
import { useGetUserSubscriptionStatus } from "../hooks/useGetUserSubscriptionStatus";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const benefits = [
  "Unlimited video uploads",
  "HD & 4K quality",
  "Advanced analytics",
  "Ad-free experience",
];

export default function UpgradePrompt() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: subscriptionData, isLoading } = useGetUserSubscriptionStatus();

  // Don't show for premium users, unauthenticated users, or while loading
  if (!identity || isLoading || subscriptionData?.tier === "premium") {
    return null;
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Crown className="w-4 h-4 text-primary" />
          Upgrade to Premium
        </CardTitle>
        <CardDescription className="text-xs">
          Unlock all features for $9.99/month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-1">
          {benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Check className="w-3 h-3 text-primary flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
        <Button
          size="sm"
          className="w-full"
          onClick={() => navigate({ to: "/upgrade" })}
        >
          <Zap className="w-3 h-3 mr-1" />
          Go Premium
        </Button>
      </CardContent>
    </Card>
  );
}
