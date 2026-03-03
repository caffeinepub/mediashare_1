import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

interface UploadPhotoParams {
  title: string;
  description: string;
  file: File;
}

export function usePhotoUpload() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({ title, description, file }: UploadPhotoParams) => {
      if (!actor) throw new Error('Actor not available');

      setUploadProgress(10);

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      setUploadProgress(50);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const photoId = await (actor as any).uploadPhoto(title, description, uint8Array);

      setUploadProgress(100);
      return photoId as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      toast.success('Photo uploaded successfully!');
      setUploadProgress(0);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      toast.error('Upload failed', { description: message });
      setUploadProgress(0);
    },
  });

  return {
    uploadPhoto: mutation.mutateAsync,
    isUploading: mutation.isPending,
    uploadProgress,
    error: mutation.error instanceof Error ? mutation.error.message : null,
    isSuccess: mutation.isSuccess,
  };
}
