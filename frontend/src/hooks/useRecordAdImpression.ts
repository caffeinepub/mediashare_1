import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useRecordAdImpression() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.recordAdImpression(videoId);
    },
    onSuccess: (_data, videoId) => {
      queryClient.invalidateQueries({ queryKey: ['adRevenueForVideo', videoId] });
      queryClient.invalidateQueries({ queryKey: ['adRevenueForCaller'] });
    },
    onError: () => {
      // Silently fail — don't disrupt video playback
    },
  });
}
