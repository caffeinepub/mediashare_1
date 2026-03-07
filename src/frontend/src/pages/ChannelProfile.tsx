import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@dfinity/principal";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Calendar, Edit2, Users, Video } from "lucide-react";
import React, { useState } from "react";
import { DeleteVideoButton } from "../components/DeleteVideoButton";
import { VideoCard } from "../components/VideoCard";
import { VideoEditModal } from "../components/VideoEditModal";
import { useChannelName } from "../hooks/useChannelName";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUserStats } from "../hooks/useUserStats";
import { useVideo } from "../hooks/useVideo";
import { useVideos } from "../hooks/useVideos";
import type { ExtendedVideo, VideoMetadata } from "../lib/types";
import { formatTimeAgo } from "../utils/formatters";

// Wrapper that fetches full ExtendedVideo before opening edit modal
function VideoEditModalWrapper({
  videoId,
  open,
  onOpenChange,
}: {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: video } = useVideo(videoId);
  if (!video) return null;
  return (
    <VideoEditModal
      video={video}
      videoId={videoId}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

export default function ChannelProfile() {
  const { principal: principalStr } = useParams({
    from: "/channel/$principal",
  });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  let principal: Principal | undefined;
  try {
    principal = Principal.fromText(principalStr);
  } catch {
    principal = undefined;
  }

  const { data: channelName, isLoading: channelLoading } =
    useChannelName(principal);
  const { data: userStats, isLoading: statsLoading } = useUserStats(principal);
  const { data: allVideos, isLoading: videosLoading } = useVideos();

  const isOwner =
    identity && principal
      ? identity.getPrincipal().toString() === principal.toString()
      : false;

  const channelVideos: VideoMetadata[] =
    allVideos?.filter((v) => v.uploader.toString() === principalStr) ?? [];

  const displayName = channelName ?? `${principalStr.slice(0, 12)}...`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Channel Header */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5" />

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8 mb-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-card flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {displayName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {channelLoading ? (
                <Skeleton className="h-7 w-40 mb-2" />
              ) : (
                <h1 className="text-2xl font-bold text-foreground truncate">
                  {displayName}
                </h1>
              )}
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-1">
                {statsLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : (
                  <>
                    <span className="flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" />
                      {channelVideos.length} videos
                    </span>
                    {userStats?.accountCreation && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Joined {formatTimeAgo(userStats.accountCreation)}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/settings" })}
                className="flex-shrink-0"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Channel
              </Button>
            )}
          </div>

          {isOwner && (
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Your Channel
            </Badge>
          )}
        </div>
      </div>

      {/* Videos Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Videos ({channelVideos.length})
        </h2>

        {videosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-video rounded-xl" />
            ))}
          </div>
        ) : channelVideos.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No videos uploaded yet.</p>
            {isOwner && (
              <Button
                className="mt-4"
                onClick={() => navigate({ to: "/upload-video" })}
              >
                Upload Your First Video
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {channelVideos.map((video) => (
              <div key={video.id} className="relative group">
                <VideoCard video={video} />
                {isOwner && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-7 h-7"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingVideoId(video.id);
                      }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <DeleteVideoButton videoId={video.id} variant="secondary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingVideoId && (
        <VideoEditModalWrapper
          videoId={editingVideoId}
          open={!!editingVideoId}
          onOpenChange={(open) => {
            if (!open) setEditingVideoId(null);
          }}
        />
      )}
    </div>
  );
}
