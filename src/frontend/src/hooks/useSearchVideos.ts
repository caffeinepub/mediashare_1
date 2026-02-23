import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ExtendedVideo } from '../backend';

export function useSearchVideos(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<{ id: string; data: ExtendedVideo }>>({
    queryKey: ['videos', 'search', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      
      const metadata = await actor.searchVideos(searchTerm);
      
      const videosWithData = await Promise.all(
        metadata.map(async (meta) => {
          const videoData = await actor.getVideo(meta.id);
          return {
            id: meta.id,
            data: videoData,
          };
        })
      );

      return videosWithData;
    },
    enabled: !!actor && !actorFetching && searchTerm.trim().length > 0,
  });
}
