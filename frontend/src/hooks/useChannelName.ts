import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@icp-sdk/core/principal';

export function useChannelName(principal: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['channelName', principal.toString()],
    queryFn: async () => {
      if (!actor) return principal.toString();
      return actor.getChannelName(principal);
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
