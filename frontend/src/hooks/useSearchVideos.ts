import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ExtendedVideo, VideoMetadata } from '../lib/types';

export function useSearchVideos(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ExtendedVideo[]>({
    queryKey: ['searchVideos', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actorAny = actor as any;
      const metadata: VideoMetadata[] = await actorAny.searchVideos(searchTerm);
      const videos = await Promise.all(
        metadata.map(async (meta) => {
          const videoData = await actorAny.getVideo(meta.id);
          return { ...videoData, id: meta.id } as ExtendedVideo;
        })
      );
      return videos.filter(Boolean);
    },
    enabled: !!actor && !isFetching && !!searchTerm.trim(),
  });
}
