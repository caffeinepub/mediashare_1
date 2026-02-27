import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useGetUserRating(videoId: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['userRating', videoId],
    queryFn: async () => {
      if (!actor || !identity) return null;
      
      const userRatings = await actor.getUserRatings();
      const rating = userRatings.find(([id]) => id === videoId);
      
      return rating ? Number(rating[1].value) : null;
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}
