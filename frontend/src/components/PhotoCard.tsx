import React from 'react';
import { Link } from '@tanstack/react-router';
import { ChannelNameDisplay } from './ChannelNameDisplay';
import { formatTimeAgo } from '../utils/formatters';
import type { PhotoMetadata } from '../lib/types';

interface PhotoCardProps {
  photo: PhotoMetadata;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <Link to="/photo/$id" params={{ id: photo.id }} className="block group">
      <div className="rounded-xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-md">
        {/* Thumbnail */}
        <div className="aspect-square bg-muted relative overflow-hidden">
          <img
            src="/assets/generated/photo-placeholder.dim_320x320.png"
            alt={photo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
          <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
            {photo.title}
          </h3>
          <ChannelNameDisplay principal={photo.uploader} className="text-xs text-muted-foreground" />
          <p className="text-xs text-muted-foreground">{formatTimeAgo(photo.uploadTime)}</p>
        </div>
      </div>
    </Link>
  );
}
