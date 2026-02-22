import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, content }: { videoId: string; content: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addComment(videoId, content);
    },
    onSuccess: (_, { videoId }) => {
      // Invalidate comments and video queries to refresh counts
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Comment added!');
    },
    onError: (error: any) => {
      if (error.message?.includes('Unauthorized')) {
        toast.error('Please sign in to comment');
      } else {
        toast.error('Failed to add comment');
      }
    },
  });
}
