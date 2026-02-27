import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { VideoMetadata } from '../backend';

export function useVideos() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VideoMetadata[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listVideos();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}
