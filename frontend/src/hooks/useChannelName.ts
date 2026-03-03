import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Principal } from '@dfinity/principal';

export function useChannelName(principal: Principal | string | undefined) {
  const { actor, isFetching } = useActor();

  const principalStr = principal?.toString();

  return useQuery<string | null>({
    queryKey: ['channelName', principalStr],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getChannelName(principal);
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}
