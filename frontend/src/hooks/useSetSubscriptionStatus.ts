import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { SubscriptionStatus } from '../backend';
import { Principal } from '@dfinity/principal';

export function useSetSubscriptionStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: SubscriptionStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setSubscriptionStatus(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSubscriptionStatus'] });
    },
  });
}
