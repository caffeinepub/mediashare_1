import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useRecordAdImpression() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).recordAdImpression(videoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adRevenueForCaller"] });
      queryClient.invalidateQueries({ queryKey: ["adRevenueForVideo"] });
    },
    onError: () => {
      // Silently ignore ad impression errors to avoid disrupting video playback
    },
  });
}
