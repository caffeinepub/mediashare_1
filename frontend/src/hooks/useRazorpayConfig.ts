import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';

export function useIsRazorpayConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['razorpayConfigured'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isRazorpayConfiguredLegacy();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetRazorpayConfiguration() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ keyId, keySecret }: { keyId: string; keySecret: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setRazorpayConfiguration(keyId, keySecret);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['razorpayConfigured'] });
      toast.success('Razorpay configured successfully!');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to configure Razorpay.';
      toast.error('Configuration failed', { description: message });
    },
  });
}
