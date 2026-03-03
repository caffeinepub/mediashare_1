import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useGetAdRevenueForCaller() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<number>({
    queryKey: ['adRevenueForCaller'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getAdRevenueForCaller();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
