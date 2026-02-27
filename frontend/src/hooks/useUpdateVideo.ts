import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

interface UpdateVideoParams {
  videoId: string;
  title: string;
  description: string;
  tags: string[];
}

export function useUpdateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, title, description, tags }: UpdateVideoParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVideo(videoId, title, description, tags);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['video', variables.videoId] });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['videoMetadata', variables.videoId] });
      toast.success('Video updated successfully');
    },
    onError: (error: Error) => {
      if (error.message.includes('Unauthorized')) {
        if (error.message.includes('logged in')) {
          toast.error('You must be logged in to edit videos');
        } else {
          toast.error('You can only edit your own videos');
        }
      } else {
        toast.error(error.message || 'Failed to update video');
      }
    },
  });
}
