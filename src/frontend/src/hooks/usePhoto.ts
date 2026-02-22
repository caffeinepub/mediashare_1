import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Photo } from '../backend';

export function usePhoto(photoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<{ id: string; data: Photo }>({
    queryKey: ['photo', photoId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      const photo = await actor.getPhoto(photoId);
      return { id: photoId, data: photo };
    },
    enabled: !!actor && !isFetching && !!photoId,
  });
}
