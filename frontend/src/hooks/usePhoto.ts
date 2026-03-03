import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Photo } from '../lib/types';

export function usePhoto(photoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Photo | null>({
    queryKey: ['photo', photoId],
    queryFn: async () => {
      if (!actor) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getPhoto(photoId);
    },
    enabled: !!actor && !isFetching && !!photoId,
  });
}
