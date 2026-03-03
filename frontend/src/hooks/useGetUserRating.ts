import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useGetUserRating(videoId: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<number | null>({
    queryKey: ['userRating', videoId, identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userRatings = await (actor as any).getUserRatings();
      if (!userRatings) return null;
      const entry = userRatings.find(
        (r: { videoId: string; rating: number }) => r.videoId === videoId
      );
      return entry ? entry.rating : null;
    },
    enabled: !!actor && !isFetching && !!identity && !!videoId,
  });
}
