import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useAverageRating(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<number>({
    queryKey: ['averageRating', videoId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await (actor as any).getAverageRating(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}
