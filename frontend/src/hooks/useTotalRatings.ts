import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useTotalRatings(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['totalRatings', videoId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const total = await (actor as any).getTotalRatings(videoId);
      return Number(total);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}
