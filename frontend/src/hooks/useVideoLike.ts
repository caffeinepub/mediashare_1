import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useVideoLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).likeVideo(videoId);
    },
    onSuccess: (_data, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to like video.';
      if (message.toLowerCase().includes('unauthorized')) {
        toast.error('Please sign in to like videos.');
      } else {
        toast.error('Failed to like video.', { description: message });
      }
    },
  });
}
