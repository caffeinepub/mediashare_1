import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { PhotoMetadata } from '../backend';

export function usePhotos() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PhotoMetadata[]>({
    queryKey: ['photos'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listPhotos();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
