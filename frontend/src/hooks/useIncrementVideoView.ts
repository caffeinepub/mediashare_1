import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useIncrementVideoView() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementVideoView(videoId);
    },
    onSuccess: (_, videoId) => {
      // Invalidate all relevant video queries to refresh view count in UI
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['videoMetadata', videoId] });
    },
    onError: (error) => {
      // Log error but don't disrupt user experience
      console.error('Failed to increment view count:', error);
    },
  });
}
