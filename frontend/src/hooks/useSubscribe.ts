import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import type { Principal } from '@icp-sdk/core/principal';

interface SubscribeParams {
  channelPrincipal: Principal;
}

export function useSubscribe() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelPrincipal }: SubscribeParams) => {
      if (!actor) throw new Error('Actor not available');
      // Backend doesn't have subscription functionality yet
      // This is a placeholder that will be implemented when backend is ready
      throw new Error('Subscription feature coming soon!');
    },
    onSuccess: (_, variables) => {
      toast.success('Subscribed successfully!');
      queryClient.invalidateQueries({ queryKey: ['subscriptionStatus', variables.channelPrincipal.toString()] });
    },
    onError: (error: Error) => {
      if (error.message.includes('Unauthorized')) {
        toast.error('Please sign in to subscribe');
      } else {
        toast.error(error.message || 'Failed to subscribe');
      }
    },
  });
}
