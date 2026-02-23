import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useVideoUpload() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      onProgress,
    }: {
      file: File;
      title: string;
      description: string;
      onProgress?: (progress: number) => void;
    }) => {
      if (!actor) throw new Error('Actor not initialized');

      // Convert File to Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Update progress
      setUploadProgress(50);
      if (onProgress) onProgress(50);

      const videoId = await actor.uploadVideo(title, description, uint8Array);

      setUploadProgress(100);
      if (onProgress) onProgress(100);

      return videoId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video uploaded successfully!');
      setUploadProgress(0);
    },
    onError: (error: Error) => {
      console.error('Video upload error:', error);
      toast.error(`Failed to upload video: ${error.message}`);
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
