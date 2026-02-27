import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';

type ErrorType = 'conversion_error' | 'network_error' | 'backend_error' | 'authentication_error';

interface UploadError {
  type: ErrorType;
  message: string;
}

export function useVideoUpload() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      file,
      title,
      description,
      tags = [],
      onProgress,
    }: {
      file: File;
      title: string;
      description: string;
      tags?: string[];
      onProgress?: (progress: number) => void;
    }) => {
      if (!actor) {
        const error: UploadError = {
          type: 'authentication_error',
          message: 'Please sign in to upload videos',
        };
        throw error;
      }

      try {
        // Convert File to Uint8Array
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Create ExternalBlob with progress tracking
        const externalBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
          if (onProgress) onProgress(percentage);
        });

        // Upload video to backend with tags
        const videoId = await actor.uploadVideo(title, description, tags, externalBlob);

        setUploadProgress(100);
        if (onProgress) onProgress(100);

        return { videoId, videoBlob: externalBlob };
      } catch (error: any) {
        console.error('Video upload error:', error);
        
        // Determine error type and provide user-friendly message
        if (error.message?.includes('Unauthorized')) {
          const uploadError: UploadError = {
            type: 'authentication_error',
            message: 'You must be signed in to upload videos',
          };
          throw uploadError;
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          const uploadError: UploadError = {
            type: 'network_error',
            message: 'Network error. Please check your connection and try again.',
          };
          throw uploadError;
        } else if (error instanceof TypeError || error.message?.includes('conversion')) {
          const uploadError: UploadError = {
            type: 'conversion_error',
            message: 'Failed to process video file. Please try a different file.',
          };
          throw uploadError;
        } else {
          const uploadError: UploadError = {
            type: 'backend_error',
            message: error.message || 'Failed to upload video. Please try again.',
          };
          throw uploadError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      toast.success('Video uploaded successfully!');
    },
    onError: (error: UploadError) => {
      console.error('Upload mutation error:', error);
      if (error.type !== 'network_error') {
        toast.error(error.message);
      }
    },
  });

  return {
    uploadVideo: mutation.mutateAsync,
    isUploading: mutation.isPending,
    uploadProgress,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    reset: () => {
      mutation.reset();
      setUploadProgress(0);
    },
  };
}
