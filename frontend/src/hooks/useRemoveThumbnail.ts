import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useRemoveThumbnail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).removeThumbnail(videoId);
    },
    onSuccess: (_data, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Thumbnail removed.');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to remove thumbnail.';
      if (message.toLowerCase().includes('unauthorized')) {
        toast.error('Unauthorized: You can only modify your own videos.');
      } else {
        toast.error('Failed to remove thumbnail.', { description: message });
      }
    },
  });
}
