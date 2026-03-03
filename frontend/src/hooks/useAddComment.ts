import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, content }: { videoId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).addComment(videoId, content);
    },
    onSuccess: (_data, { videoId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: () => {
      toast.error('Failed to add comment. Please try again.');
    },
  });
}
