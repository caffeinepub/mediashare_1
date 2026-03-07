/**
 * Formats a view count into a human-readable string
 * @param count - The view count as a BigInt
 * @returns Formatted string (e.g., '1.2K', '3.5M', '10')
 */
export function formatViewCount(count: bigint): string {
  const num = Number(count);

  if (num === 0) return "0 views";
  if (num === 1) return "1 view";

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B views`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M views`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K views`;
  }

  return `${num} views`;
}

/**
 * Formats a timestamp into a relative time string
 * @param timestamp - The timestamp as a BigInt (nanoseconds)
 * @returns Formatted string (e.g., '2 hours ago', '3 days ago')
 */
export function formatTimeAgo(timestamp: bigint): string {
  const now = Date.now();
  const uploadTime = Number(timestamp) / 1000000; // Convert nanoseconds to milliseconds
  const diffMs = now - uploadTime;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  if (diffWeeks < 4)
    return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
}
