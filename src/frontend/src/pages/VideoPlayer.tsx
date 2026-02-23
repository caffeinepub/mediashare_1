import { useParams, useNavigate } from '@tanstack/react-router';
import { useVideo } from '../hooks/useVideo';
import { useVideos } from '../hooks/useVideos';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useVideoLike } from '../hooks/useVideoLike';
import { useIncrementVideoView } from '../hooks/useIncrementVideoView';
import { useSubscribe } from '../hooks/useSubscribe';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Heart, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { CommentSection } from '../components/CommentSection';
import { ChannelNameDisplay } from '../components/ChannelNameDisplay';
import { VideoEditModal } from '../components/VideoEditModal';
import { VideoCard } from '../components/VideoCard';
import { VideoRating } from '../components/VideoRating';
import { ShareButton } from '../components/ShareButton';
import { formatViewCount } from '../utils/formatters';
import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function VideoPlayer() {
  const { id } = useParams({ from: '/video/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: video, isLoading, error } = useVideo(id);
  const { data: allVideos } = useVideos();
  const [editOpen, setEditOpen] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const { mutate: likeVideo, isPending: isLiking } = useVideoLike();
  const { mutate: incrementView } = useIncrementVideoView();
  const { mutate: subscribe, isPending: isSubscribing } = useSubscribe();
  const { data: isSubscribed } = useSubscriptionStatus(video?.uploader);

  // Increment view count when video loads
  useEffect(() => {
    if (video && id) {
      incrementView(id);
    }
  }, [video, id, incrementView]);

  // Use ExternalBlob.getDirectURL() for streaming video content
  const videoUrl = useMemo(() => {
    if (!video?.file) return null;
    return video.file.getDirectURL();
  }, [video?.file]);

  // Check if current user is the video owner
  const isOwner = useMemo(() => {
    if (!video || !identity) return false;
    return video.uploader.toString() === identity.getPrincipal().toString();
  }, [video, identity]);

  // Get related videos (same uploader or recent videos)
  const relatedVideos = useMemo(() => {
    if (!allVideos || !video) return [];
    
    // Filter out current video and prioritize same uploader
    const sameUploader = allVideos.filter(
      v => v.id !== id && v.uploader.toString() === video.uploader.toString()
    );
    
    const otherVideos = allVideos.filter(
      v => v.id !== id && v.uploader.toString() !== video.uploader.toString()
    );
    
    // Combine and limit to 10 videos
    return [...sameUploader, ...otherVideos].slice(0, 10);
  }, [allVideos, video, id]);

  const handleLike = () => {
    if (!identity) {
      toast.error('Please sign in to like videos');
      return;
    }
    likeVideo(id);
  };

  const handleSubscribe = () => {
    if (!identity) {
      toast.error('Please sign in to subscribe');
      return;
    }
    if (!video) return;
    subscribe({ channelPrincipal: video.uploader });
  };

  // Truncate description for collapsed state
  const shouldTruncate = video?.description && video.description.length > 150;
  const displayDescription = descriptionExpanded || !shouldTruncate
    ? video?.description
    : video?.description.slice(0, 150) + '...';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load video</p>
          <Button onClick={() => navigate({ to: '/videos' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Two-column layout: main content + sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Video player */}
          <div className="bg-card rounded-lg overflow-hidden shadow-lg mb-4">
            {videoUrl ? (
              <video
                controls
                className="w-full aspect-video bg-black"
                src={videoUrl}
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground">Video unavailable</p>
              </div>
            )}
          </div>

          {/* Video title */}
          <h1 className="text-2xl font-bold mb-3">{video.title}</h1>

          {/* Channel info and action buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-medium">
                    {video.uploader.toString().slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-semibold">
                    <ChannelNameDisplay principal={video.uploader} />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatViewCount(video.viewCount)} • {new Date(Number(video.uploadTime) / 1000000).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {!isOwner && (
                <Button
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  variant={isSubscribed ? "outline" : "default"}
                  className="gap-2"
                >
                  <Bell className={`h-4 w-4 ${isSubscribing ? 'animate-pulse' : ''}`} />
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Button>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="default"
                onClick={handleLike}
                disabled={isLiking}
                className="gap-2"
              >
                <Heart className={`h-5 w-5 ${isLiking ? 'animate-pulse' : ''}`} />
                <span className="font-semibold">{Number(video.likeCount)}</span>
              </Button>

              <ShareButton />

              {isOwner && (
                <Button variant="outline" size="default" onClick={() => setEditOpen(true)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}
            </div>
          </div>

          {/* Rating section */}
          <div className="bg-muted/30 rounded-lg p-4 mb-4 border border-border">
            <VideoRating videoId={id} />
          </div>

          {/* Expandable description */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <p className="text-sm whitespace-pre-wrap mb-2">
              {displayDescription}
            </p>
            {shouldTruncate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                className="gap-1 text-xs"
              >
                {descriptionExpanded ? (
                  <>
                    Show less <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Show more <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </Button>
            )}

            {video.tags && video.tags.length > 0 && (
              <div className="mt-3">
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comments section */}
          <CommentSection videoId={id} />
        </div>

        {/* Related videos sidebar */}
        <div className="lg:w-96 shrink-0">
          <div className="sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Related Videos</h2>
            <div className="space-y-2">
              {relatedVideos.length > 0 ? (
                relatedVideos.map((relatedVideo) => (
                  <VideoCard
                    key={relatedVideo.id}
                    video={relatedVideo}
                    variant="compact"
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No related videos available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {isOwner && (
        <VideoEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          video={video}
          videoId={id}
        />
      )}
    </div>
  );
}
