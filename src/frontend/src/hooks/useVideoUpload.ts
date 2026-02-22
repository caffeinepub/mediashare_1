import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';

export function useVideoUpload() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({ title, description, file }: { title: string; description: string; file: File }) => {
      if (!actor) throw new Error('Not authenticated');

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const externalBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      const videoId = await actor.uploadVideo(title, description, externalBlob);
      return videoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      setUploadProgress(0);
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  return {
    uploadVideo: mutation.mutateAsync,
    isUploading: mutation.isPending,
    uploadProgress,
    error: mutation.error?.message,
    isSuccess: mutation.isSuccess,
  };
}
