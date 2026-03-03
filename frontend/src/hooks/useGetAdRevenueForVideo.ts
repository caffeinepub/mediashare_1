import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

interface AdRevenueData {
  impressions: bigint;
  totalRevenue: number;
}

export function useGetAdRevenueForVideo(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<AdRevenueData>({
    queryKey: ['adRevenueForVideo', videoId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getAdRevenueForVideo(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}
