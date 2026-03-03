import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@dfinity/principal';
import type { UserStats } from '../lib/types';

export function useUserStats(principal: Principal | string | undefined) {
  const { actor, isFetching } = useActor();

  const principalStr = principal?.toString();

  return useQuery<UserStats | null>({
    queryKey: ['userStats', principalStr],
    queryFn: async () => {
      if (!actor || !principal) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getUserStats(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
    staleTime: 5 * 60 * 1000,
  });
}
