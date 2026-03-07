import { useQuery } from "@tanstack/react-query";
import type { ExtendedVideo } from "../lib/types";
import { useActor } from "./useActor";

export function useVideo(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<ExtendedVideo | null>({
    queryKey: ["video", videoId],
    queryFn: async () => {
      if (!actor) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getVideo(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}
