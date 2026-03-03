import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useDeleteVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.deleteVideo(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video'] });
      toast.success('Video deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || '';
      if (message.includes('Unauthorized')) {
        toast.error('You are not authorized to delete this video');
      } else {
        toast.error('Failed to delete video');
      }
    },
  });
}
