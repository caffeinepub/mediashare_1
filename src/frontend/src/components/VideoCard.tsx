import { Link } from "@tanstack/react-router";
import { Clock, Eye } from "lucide-react";
import React from "react";
import type { VideoMetadata } from "../lib/types";
import { formatTimeAgo, formatViewCount } from "../utils/formatters";
import { ChannelNameDisplay } from "./ChannelNameDisplay";

interface VideoCardProps {
  video: VideoMetadata;
  variant?: "default" | "compact";
}

export function VideoCard({ video, variant = "default" }: VideoCardProps) {
  const thumbnailUrl = video.thumbnail
    ? typeof video.thumbnail === "string"
      ? video.thumbnail
      : null
    : null;

  if (variant === "compact") {
    return (
      <Link
        to="/video/$id"
        params={{ id: video.id }}
        className="flex gap-3 group"
      >
        <div className="w-40 flex-shrink-0 aspect-video rounded-lg overflow-hidden bg-muted relative">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <img
              src="/assets/generated/video-placeholder.dim_320x180.png"
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
            {video.title}
          </h3>
          <ChannelNameDisplay
            principal={video.uploader}
            className="text-xs text-muted-foreground"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViewCount(video.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(video.uploadTime)}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to="/video/$id" params={{ id: video.id }} className="block group">
      <div className="rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-md">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <img
              src="/assets/generated/video-placeholder.dim_320x180.png"
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
            {video.title}
          </h3>
          <ChannelNameDisplay
            principal={video.uploader}
            className="text-xs text-muted-foreground"
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatViewCount(video.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(video.uploadTime)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
