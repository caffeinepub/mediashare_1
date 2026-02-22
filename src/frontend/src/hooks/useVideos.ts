import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Video } from '../backend';

export function useVideos() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<{ id: string; data: Video }>>({
    queryKey: ['videos'],
    queryFn: async () => {
      if (!actor) return [];
      
      // Get list of video metadata
      const videoMetadata = await actor.listVideos();
      
      // Fetch full video data for each video
      const videos = await Promise.all(
        videoMetadata.map(async (meta) => {
          const videoData = await actor.getVideo(meta.id);
          return { id: meta.id, data: videoData };
        })
      );
      
      return videos;
    },
    enabled: !!actor && !isFetching,
  });
}
