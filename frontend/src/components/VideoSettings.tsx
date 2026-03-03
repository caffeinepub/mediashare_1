import React from 'react';
import { ThumbnailSelector } from './ThumbnailSelector';
import type { ExtendedVideo } from '../lib/types';

interface VideoSettingsProps {
  videoId: string;
  video: ExtendedVideo;
}

export function VideoSettings({ videoId, video }: VideoSettingsProps) {
  return (
    <div className="space-y-4">
      <ThumbnailSelector videoId={videoId} video={video} />
    </div>
  );
}
