import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useVideoLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.likeVideo(videoId);
    },
    onSuccess: (_, videoId) => {
      // Invalidate both the videos list and individual video queries
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      toast.success('Video liked!');
    },
    onError: (error: any) => {
      if (error.message?.includes('Unauthorized')) {
        toast.error('Please sign in to like videos');
      } else if (error.message?.includes('already liked')) {
        toast.info('You have already liked this video');
      } else {
        toast.error('Failed to like video');
      }
    },
  });
}
