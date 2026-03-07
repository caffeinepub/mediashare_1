import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Link } from "@tanstack/react-router";
import { useChannelName } from "../hooks/useChannelName";

interface ChannelNameDisplayProps {
  principal: Principal;
  className?: string;
}

export function ChannelNameDisplay({
  principal,
  className = "",
}: ChannelNameDisplayProps) {
  const { data: channelName, isLoading } = useChannelName(principal);

  if (isLoading) {
    return <Skeleton className={`h-4 w-24 ${className}`} />;
  }

  // If channel name is same as principal, show truncated version
  const principalStr = principal.toString();
  const displayName =
    channelName === principalStr
      ? `${principalStr.slice(0, 8)}...${principalStr.slice(-4)}`
      : channelName;

  return (
    <Link
      to="/channel/$principal"
      params={{ principal: principalStr }}
      className={`hover:underline hover:text-chart-1 transition-colors cursor-pointer ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {displayName}
    </Link>
  );
}
