import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { SubscriptionStatus } from '../backend';

export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionStatusResult {
  tier: SubscriptionTier;
  features: {
    unlimitedUploads: boolean;
    higherQualityLimits: boolean;
    prioritySupport: boolean;
    noAds: boolean;
  };
}

export function useGetUserSubscriptionStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<SubscriptionStatusResult>({
    queryKey: ['userSubscriptionStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');

      const status = await actor.getSubscriptionStatus();
      const isPremium = status === SubscriptionStatus.premium;

      return {
        tier: isPremium ? 'premium' : 'free',
        features: {
          unlimitedUploads: isPremium,
          higherQualityLimits: isPremium,
          prioritySupport: isPremium,
          noAds: isPremium,
        },
      };
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
