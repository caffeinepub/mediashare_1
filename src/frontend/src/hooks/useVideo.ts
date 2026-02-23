import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Video } from '../backend';

export function useVideo(videoId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Video>({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!actor || !videoId) throw new Error('Actor or videoId not available');
      return actor.getVideo(videoId);
    },
    enabled: !!actor && !actorFetching && !!videoId,
    retry: false,
  });
}
