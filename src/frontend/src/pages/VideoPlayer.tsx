import { useParams, useNavigate } from '@tanstack/react-router';
import { useVideo } from '../hooks/useVideo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import { CommentSection } from '../components/CommentSection';
import { ChannelNameDisplay } from '../components/ChannelNameDisplay';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';

export default function VideoPlayer() {
  const { id } = useParams({ from: '/video/$id' });
  const navigate = useNavigate();
  const { data: video, isLoading, error } = useVideo(id);

  // Convert Uint8Array to blob URL for video display
  const videoUrl = useMemo(() => {
    if (!video?.file) return null;
    const blob = new Blob([new Uint8Array(video.file)], { type: 'video/mp4' });
    return URL.createObjectURL(blob);
  }, [video?.file]);

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Video link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/videos' })}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Videos
      </Button>

      <div className="bg-card rounded-lg overflow-hidden shadow-lg">
        {videoUrl ? (
          <video
            controls
            className="w-full aspect-video bg-black"
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full aspect-video bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Video unavailable</p>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <ChannelNameDisplay principal={video.uploader} />
                <span>•</span>
                <span>{new Date(Number(video.uploadTime) / 1000000).toLocaleDateString()}</span>
                <span>•</span>
                <span>{Number(video.likeCount)} likes</span>
                <span>•</span>
                <span>{Number(video.commentCount)} comments</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          <p className="text-muted-foreground mb-6 whitespace-pre-wrap">
            {video.description}
          </p>

          <CommentSection videoId={id} />
        </div>
      </div>
    </div>
  );
}
