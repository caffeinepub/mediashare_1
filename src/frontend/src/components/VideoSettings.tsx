import React from "react";
import type { ExtendedVideo } from "../lib/types";
import { ThumbnailSelector } from "./ThumbnailSelector";

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
