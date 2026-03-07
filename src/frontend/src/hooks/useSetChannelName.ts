import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useActor } from "./useActor";

export function useSetChannelName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channelName: string) => {
      if (!actor) throw new Error("Actor not available");
      if (channelName.trim().length < 2) {
        throw new Error("Channel name must be at least 2 characters.");
      }
      if (channelName.trim().length > 50) {
        throw new Error("Channel name must be 50 characters or fewer.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).setChannelName(channelName.trim());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channelName"] });
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      toast.success("Channel name updated!");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Failed to update channel name.";
      toast.error("Update failed", { description: message });
    },
  });
}
