import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useRateVideo(videoId: string) {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stars: number) => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).rateVideo(videoId, BigInt(stars));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['averageRating', videoId] });
      queryClient.invalidateQueries({ queryKey: ['totalRatings', videoId] });
      queryClient.invalidateQueries({ queryKey: ['userRating', videoId] });
      toast.success('Rating submitted!');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to submit rating.';
      toast.error('Rating failed', { description: message });
    },
  });
}
