import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ExternalBlob } from "../backend";
import { useActor } from "./useActor";

export function useMarkThumbnailGenerated() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      videoId,
      thumbnailBlob,
    }: { videoId: string; thumbnailBlob: ExternalBlob }) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).markThumbnailGenerated(videoId, thumbnailBlob);
    },
    onSuccess: (_data, { videoId }) => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Thumbnail saved!");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to save thumbnail.";
      toast.error("Thumbnail save failed", { description: message });
    },
  });
}
