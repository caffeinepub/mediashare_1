import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { ExternalBlob } from '../backend';

export function useSetCustomThumbnail() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      videoId,
      thumbnailBlob,
    }: {
      videoId: string;
      thumbnailBlob: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');

      // Add progress tracking
      const blobWithProgress = thumbnailBlob.withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await actor.setCustomThumbnail(videoId, blobWithProgress);
      setUploadProgress(100);
    },
    onSuccess: (_, variables) => {
      toast.success('Custom thumbnail uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['video', variables.videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setUploadProgress(0);
    },
    onError: (error: any) => {
      console.error('Failed to upload custom thumbnail:', error);
      toast.error(error.message || 'Failed to upload thumbnail');
      setUploadProgress(0);
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
}
