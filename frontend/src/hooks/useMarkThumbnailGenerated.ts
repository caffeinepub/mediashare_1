import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { ExternalBlob } from '../backend';

export function useMarkThumbnailGenerated() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      videoId,
      thumbnailBlob,
    }: {
      videoId: string;
      thumbnailBlob: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.markThumbnailGenerated(videoId, thumbnailBlob);
    },
    onSuccess: (_, variables) => {
      toast.success('Thumbnail saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['video', variables.videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: (error: any) => {
      console.error('Failed to mark thumbnail as generated:', error);
      toast.error(error.message || 'Failed to save thumbnail');
    },
  });
}
