import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Photo } from '../backend';

export function usePhoto(photoId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Photo>({
    queryKey: ['photo', photoId],
    queryFn: async () => {
      if (!actor || !photoId) throw new Error('Actor or photoId not available');
      return actor.getPhoto(photoId);
    },
    enabled: !!actor && !actorFetching && !!photoId,
    retry: false,
  });
}
