import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';

export function useSubscriptionStatus(channelPrincipal: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['subscriptionStatus', channelPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !channelPrincipal) throw new Error('Actor or channel principal not available');
      // Backend doesn't have subscription functionality yet
      // Return false as default until backend is implemented
      return false;
    },
    enabled: !!actor && !actorFetching && !!channelPrincipal,
    retry: false,
  });
}
