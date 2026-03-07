import type { Principal } from "@dfinity/principal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SubscriptionStatus } from "../lib/types";
import { useActor } from "./useActor";

export function useSetSubscriptionStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user,
      status,
    }: { user: Principal; status: SubscriptionStatus }) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (actor as any).setSubscriptionStatus(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubscriptionStatus"] });
    },
  });
}
