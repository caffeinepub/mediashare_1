import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Photo } from '../backend';

export function usePhotos() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<{ id: string; data: Photo }>>({
    queryKey: ['photos'],
    queryFn: async () => {
      if (!actor) return [];
      
      // Get list of photo metadata
      const photoMetadata = await actor.listPhotos();
      
      // Fetch full photo data for each photo
      const photos = await Promise.all(
        photoMetadata.map(async (meta) => {
          const photoData = await actor.getPhoto(meta.id);
          return { id: meta.id, data: photoData };
        })
      );
      
      return photos;
    },
    enabled: !!actor && !isFetching,
  });
}
