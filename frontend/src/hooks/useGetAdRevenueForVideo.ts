import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export type VideoAdRevenue = {
  impressions: bigint;
  totalRevenue: number;
};

export function useGetAdRevenueForVideo(videoId: string, enabled = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VideoAdRevenue>({
    queryKey: ['adRevenueForVideo', videoId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdRevenueForVideo(videoId);
    },
    enabled: !!actor && !actorFetching && enabled && !!videoId,
    staleTime: 30_000,
  });
}
