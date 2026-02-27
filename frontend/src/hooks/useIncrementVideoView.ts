import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useIncrementVideoView() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      // Only increment view count for authenticated (non-anonymous) users
      if (!identity) return;
      if (!actor) throw new Error('Actor not available');
      await actor.incrementVideoView(videoId);
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
