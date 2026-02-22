import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Video } from '../backend';

export function useVideo(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<{ id: string; data: Video }>({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      const video = await actor.getVideo(videoId);
      return { id: videoId, data: video };
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}
