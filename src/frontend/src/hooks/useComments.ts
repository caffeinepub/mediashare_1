import { useQuery } from "@tanstack/react-query";
import type { Comment } from "../lib/types";
import { useActor } from "./useActor";

export function useComments(videoId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ["comments", videoId],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getComments(videoId);
    },
    enabled: !!actor && !isFetching && !!videoId,
  });
}
