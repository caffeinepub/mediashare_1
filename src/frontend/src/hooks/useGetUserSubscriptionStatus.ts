import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionStatus {
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

  return useQuery<SubscriptionStatus>({
    queryKey: ['userSubscriptionStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // TODO: Replace with actual backend call once implemented
      // For now, return free tier as default
      return {
        tier: 'free',
        features: {
          unlimitedUploads: false,
          higherQualityLimits: false,
          prioritySupport: false,
          noAds: false,
        },
      };
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
