import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useActor } from "./useActor";

export function useGetAdSensePublisherId() {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ["adSensePublisherId"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAdSensePublisherId();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAdSensePublisherId() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publisherId: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setAdSensePublisherId(publisherId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adSensePublisherId"] });
      toast.success("AdSense publisher ID saved successfully!");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save AdSense publisher ID.";
      toast.error("Save failed", { description: message });
    },
  });
}
