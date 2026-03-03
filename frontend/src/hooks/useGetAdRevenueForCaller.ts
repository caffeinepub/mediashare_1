import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useGetAdRevenueForCaller(enabled = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ['adRevenueForCaller'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdRevenueForCaller();
    },
    enabled: !!actor && !actorFetching && enabled,
    staleTime: 30_000,
  });
}
