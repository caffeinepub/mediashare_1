import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { SubscriptionStatus } from '../backend';

export type SubscriptionResult = {
  tier: 'free' | 'premium';
  canUploadUnlimited: boolean;
  hasHDQuality: boolean;
  hasAdvancedAnalytics: boolean;
  isAdFree: boolean;
};

export function useGetUserSubscriptionStatus() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SubscriptionResult>({
    queryKey: ['userSubscriptionStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const status = await actor.getSubscriptionStatus();
      const isPremium = status === SubscriptionStatus.premium;
      return {
        tier: isPremium ? 'premium' : 'free',
        canUploadUnlimited: isPremium,
        hasHDQuality: isPremium,
        hasAdvancedAnalytics: isPremium,
        isAdFree: isPremium,
      };
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}
