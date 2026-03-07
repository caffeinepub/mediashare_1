import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

interface SubscriptionResult {
  tier: "free" | "premium";
  canUploadHD: boolean;
  canUploadUnlimited: boolean;
}

export function useGetUserSubscriptionStatus() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<SubscriptionResult>({
    queryKey: ["userSubscriptionStatus"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = await (actor as any).getSubscriptionStatus();
      const isPremium =
        status === "premium" ||
        status?.__kind__ === "premium" ||
        (typeof status === "object" && "premium" in status);
      return {
        tier: isPremium ? "premium" : "free",
        canUploadHD: isPremium,
        canUploadUnlimited: isPremium,
      };
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}
