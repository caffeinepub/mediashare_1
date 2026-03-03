import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useIncrementVideoView() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).incrementVideoView(videoId);
    },
    onSuccess: (_data, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['videoMetadata', videoId] });
    },
    onError: (err: unknown) => {
      console.error('Failed to increment view count:', err);
    },
  });
}
