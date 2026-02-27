import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useAverageRating(videoId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery({
    queryKey: ['averageRating', videoId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getAverageRating(videoId);
    },
    enabled: !!actor && !actorFetching,
  });
}
