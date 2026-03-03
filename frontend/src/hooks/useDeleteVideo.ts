import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).deleteVideo(videoId);
    },
    onSuccess: (_data, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      toast.success('Video deleted successfully.');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete video.';
      if (message.toLowerCase().includes('unauthorized')) {
        toast.error('Unauthorized: You can only delete your own videos.');
      } else {
        toast.error('Failed to delete video.', { description: message });
      }
    },
  });
}
