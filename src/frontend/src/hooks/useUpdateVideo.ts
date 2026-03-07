import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useActor } from "./useActor";

interface UpdateVideoParams {
  videoId: string;
  title: string;
  description: string;
  tags: string[];
}

export function useUpdateVideo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      videoId,
      title,
      description,
      tags,
    }: UpdateVideoParams) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).updateVideo(videoId, title, description, tags);
    },
    onSuccess: (_data, { videoId }) => {
      queryClient.invalidateQueries({ queryKey: ["video", videoId] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      toast.success("Video updated successfully!");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to update video.";
      if (message.toLowerCase().includes("unauthorized")) {
        toast.error("Unauthorized: You can only edit your own videos.");
      } else {
        toast.error("Update failed", { description: message });
      }
    },
  });
}
