import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useRateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, stars }: { videoId: string; stars: number }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rateVideo(videoId, BigInt(stars));
    },
    onSuccess: (_, { videoId }) => {
      // Invalidate all rating-related queries
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['averageRating', videoId] });
      queryClient.invalidateQueries({ queryKey: ['totalRatings', videoId] });
      queryClient.invalidateQueries({ queryKey: ['userRating', videoId] });
      toast.success('Rating submitted successfully!');
    },
    onError: (error: any) => {
      if (error.message?.includes('Unauthorized')) {
        toast.error('Please sign in to rate videos');
      } else {
        toast.error('Failed to submit rating');
      }
    },
  });
}
