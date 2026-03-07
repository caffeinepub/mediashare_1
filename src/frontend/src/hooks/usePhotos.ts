import { useQuery } from "@tanstack/react-query";
import type { PhotoMetadata } from "../lib/types";
import { useActor } from "./useActor";

export function usePhotos() {
  const { actor, isFetching } = useActor();

  return useQuery<PhotoMetadata[]>({
    queryKey: ["photos"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).listPhotos();
    },
    enabled: !!actor && !isFetching,
  });
}
