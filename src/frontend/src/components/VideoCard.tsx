import { Card } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { ChannelNameDisplay } from './ChannelNameDisplay';
import { formatViewCount } from '../utils/formatters';
import type { VideoMetadata } from '../backend';

interface VideoCardProps {
  video: VideoMetadata;
  variant?: 'default' | 'compact';
}

function formatTimeAgo(timestamp: bigint): string {
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

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

export function VideoCard({ video, variant = 'default' }: VideoCardProps) {
  const navigate = useNavigate();

  if (variant === 'compact') {
    return (
      <div
        className="cursor-pointer group flex gap-2 hover:bg-muted/50 rounded-lg p-2 transition-colors"
        onClick={() => navigate({ to: '/video/$id', params: { id: video.id } })}
      >
        {/* Compact thumbnail */}
        <div className="w-40 aspect-video bg-muted relative overflow-hidden rounded-lg shrink-0">
          {video.thumbnail ? (
            <img
              src={video.thumbnail.getDirectURL()}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <img
              src="/assets/generated/video-placeholder.dim_320x180.png"
              alt={video.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Compact video info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="text-xs text-muted-foreground">
            <ChannelNameDisplay principal={video.uploader} />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <span>{formatViewCount(video.viewCount)}</span>
            <span>•</span>
            <span>{formatTimeAgo(video.uploadTime)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer group"
      onClick={() => navigate({ to: '/video/$id', params: { id: video.id } })}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-muted relative overflow-hidden rounded-xl mb-3">
        {video.thumbnail ? (
          <img
            src={video.thumbnail.getDirectURL()}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <img
            src="/assets/generated/video-placeholder.dim_320x180.png"
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        )}
      </div>

      {/* Video info */}
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <div className="text-xs text-muted-foreground">
            <ChannelNameDisplay principal={video.uploader} />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <span>{formatViewCount(video.viewCount)}</span>
            <span>•</span>
            <span>{formatTimeAgo(video.uploadTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
