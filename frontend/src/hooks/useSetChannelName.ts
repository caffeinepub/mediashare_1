import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useSetChannelName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelName: string) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Validate channel name length
      const trimmed = channelName.trim();
      if (trimmed.length < 3 || trimmed.length > 30) {
        throw new Error('Channel name must be between 3 and 30 characters');
      }
      
      await actor.setChannelName(channelName);
    },
    onSuccess: () => {
      // Invalidate all channel name queries and user profile
      queryClient.invalidateQueries({ queryKey: ['channelName'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Channel name updated!');
    },
    onError: (error: any) => {
      if (error.message?.includes('Unauthorized')) {
        toast.error('Please sign in to set a channel name');
      } else if (error.message?.includes('Invalid channel name')) {
        toast.error('Channel name must be 3-30 characters with only letters and numbers');
      } else {
        toast.error(error.message || 'Failed to update channel name');
      }
    },
  });
}
