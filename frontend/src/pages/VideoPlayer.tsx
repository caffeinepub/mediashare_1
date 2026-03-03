import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ThumbsUp, Eye, Clock, Tag, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useVideo } from '../hooks/useVideo';
import { useVideoLike } from '../hooks/useVideoLike';
import { useIncrementVideoView } from '../hooks/useIncrementVideoView';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useVideos } from '../hooks/useVideos';
import { useRecordAdImpression } from '../hooks/useRecordAdImpression';
import { CommentSection } from '../components/CommentSection';
import { VideoCard } from '../components/VideoCard';
import { ChannelNameDisplay } from '../components/ChannelNameDisplay';
import { VideoRating } from '../components/VideoRating';
import { VideoRatingDisplay } from '../components/VideoRatingDisplay';
import { ShareButton } from '../components/ShareButton';
import { VideoEditModal } from '../components/VideoEditModal';
import { DeleteVideoButton } from '../components/DeleteVideoButton';
import { AdSenseUnit } from '../components/AdSenseUnit';
import { formatViewCount, formatTimeAgo } from '../utils/formatters';

const AD_IMPRESSION_THRESHOLD_SECONDS = 10;

export default function VideoPlayer() {
  const { id } = useParams({ from: '/video/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: video, isLoading, error } = useVideo(id);
  const { data: allVideos } = useVideos();
  const likeVideoMutation = useVideoLike();
  const incrementViewMutation = useIncrementVideoView();
  const recordAdImpressionMutation = useRecordAdImpression();

  const videoRef = useRef<HTMLVideoElement>(null);
  const viewCountedRef = useRef(false);
  const adImpressionRecordedRef = useRef(false);
  const watchedSecondsRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  // Keep stable refs to mutations so effects don't re-run on every render
  const incrementViewRef = useRef(incrementViewMutation);
  const recordAdImpressionRef = useRef(recordAdImpressionMutation);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    incrementViewRef.current = incrementViewMutation;
  }, [incrementViewMutation]);

  useEffect(() => {
    recordAdImpressionRef.current = recordAdImpressionMutation;
  }, [recordAdImpressionMutation]);

  // Reset tracking state when video ID changes
  useEffect(() => {
    viewCountedRef.current = false;
    adImpressionRecordedRef.current = false;
    watchedSecondsRef.current = 0;
    lastTimeRef.current = null;
  }, [id]);

  // Track playback time for view count and ad impression
  const handleTimeUpdate = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const currentTime = videoEl.currentTime;

    if (lastTimeRef.current !== null) {
      const delta = currentTime - lastTimeRef.current;
      // Only count forward progress (not seeking or large jumps)
      if (delta > 0 && delta < 2) {
        watchedSecondsRef.current += delta;
      }
    }
    lastTimeRef.current = currentTime;

    // Record view after 5 seconds of actual playback
    if (!viewCountedRef.current && watchedSecondsRef.current >= 5) {
      viewCountedRef.current = true;
      incrementViewRef.current.mutate(id);
    }

    // Record ad impression after 10 seconds of actual playback
    if (!adImpressionRecordedRef.current && watchedSecondsRef.current >= AD_IMPRESSION_THRESHOLD_SECONDS) {
      adImpressionRecordedRef.current = true;
      recordAdImpressionRef.current.mutate(id);
    }
  }, [id]);

  const isOwner =
    identity && video
      ? video.uploader.toString() === identity.getPrincipal().toString()
      : false;

  const relatedVideos = allVideos?.filter((v) => v.id !== id).slice(0, 6) ?? [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-destructive text-lg">Video not found or failed to load.</p>
        <Button variant="link" onClick={() => navigate({ to: '/' })}>
          Back to Home
        </Button>
      </div>
    );
  }

  const videoUrl = video.file.getDirectURL();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player */}
          <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onSeeked={() => {
                lastTimeRef.current = videoRef.current?.currentTime ?? null;
              }}
            />
          </div>

          {/* Ad Unit below video player */}
          <AdSenseUnit
            adSlot="video-player-below-ad"
            adFormat="horizontal"
            className="w-full min-h-[90px] rounded-lg overflow-hidden"
          />

          {/* Video Info */}
          <div className="space-y-3">
            <h1 className="text-xl font-bold text-foreground leading-tight">{video.title}</h1>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatViewCount(video.viewCount)} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTimeAgo(video.uploadTime)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => likeVideoMutation.mutate(id)}
                  disabled={likeVideoMutation.isPending || !identity}
                  className="flex items-center gap-1"
                >
                  {likeVideoMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ThumbsUp className="w-4 h-4" />
                  )}
                  {formatViewCount(video.likeCount)}
                </Button>
                <ShareButton />
                {isOwner && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditModalOpen(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <DeleteVideoButton videoId={id} variant="outline" />
                  </>
                )}
              </div>
            </div>

            {/* Channel Info */}
            <div className="flex items-center gap-3 py-3 border-t border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {video.uploader.toString().slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <ChannelNameDisplay principal={video.uploader} />
                <p className="text-xs text-muted-foreground">Creator</p>
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">{video.description}</p>
              </div>
            )}

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                {video.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Rating */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-t border-border">
              <VideoRatingDisplay videoId={id} />
              {identity && <VideoRating videoId={id} />}
            </div>
          </div>

          {/* Comments */}
          <CommentSection videoId={id} />
        </div>

        {/* Related Videos Sidebar */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Related Videos</h3>
          {relatedVideos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No other videos yet.</p>
          ) : (
            relatedVideos.map((v) => (
              <VideoCard key={v.id} video={v} variant="compact" />
            ))
          )}
        </div>
      </div>

      {/* Edit Modal — video is ExtendedVideo, passed directly with separate videoId prop */}
      {isOwner && (
        <VideoEditModal
          video={video}
          videoId={id}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />
      )}
    </div>
  );
}
