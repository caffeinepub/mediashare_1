import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useIncrementVideoView() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.incrementViewCount(videoId);
    },
    onSuccess: (_, videoId) => {
      // Invalidate video queries to refresh view count
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: () => {
      // Silent error handling - view count increment failures shouldn't disrupt user experience
    },
  });
}
