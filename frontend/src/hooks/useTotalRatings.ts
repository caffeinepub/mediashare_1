import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useTotalRatings(videoId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['totalRatings', videoId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const total = await actor.getTotalRatings(videoId);
      return Number(total);
    },
    enabled: !!actor && !actorFetching,
  });
}
