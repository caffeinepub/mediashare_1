import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useRemoveThumbnail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.removeThumbnail(videoId);
    },
    onSuccess: (_, videoId) => {
      toast.success('Thumbnail removed successfully');
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: (error: any) => {
      console.error('Failed to remove thumbnail:', error);
      if (error.message?.includes('Unauthorized')) {
        toast.error('You do not have permission to remove this thumbnail');
      } else {
        toast.error(error.message || 'Failed to remove thumbnail');
      }
    },
  });
}
