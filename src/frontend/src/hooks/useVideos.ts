import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { VideoMetadata } from "../lib/types";
import { useActor } from "./useActor";

export function useVideos() {
  const { actor, isFetching } = useActor();

  return useQuery<VideoMetadata[]>({
    queryKey: ["videos"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).listVideos();
    },
    enabled: !!actor && !isFetching,
    placeholderData: keepPreviousData,
  });
}
