import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserStats } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useUserStats(principal: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<UserStats>({
    queryKey: ['userStats', principal.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUserStats(principal);
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
