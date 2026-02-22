import { useParams, useNavigate } from '@tanstack/react-router';
import { useVideo } from '../hooks/useVideo';
import { useVideoLike } from '../hooks/useVideoLike';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, User, Calendar, Heart, Download, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChannelNameDisplay } from '../components/ChannelNameDisplay';
import { CommentSection } from '../components/CommentSection';
import { VideoQualitySelector } from '../components/VideoQualitySelector';
import { toast } from 'sonner';

export function VideoPlayer() {
  const { id } = useParams({ from: '/video/$id' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: video, isLoading, error } = useVideo(id);
  const likeMutation = useVideoLike();

  const isAuthenticated = !!identity;

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container py-16">
        <Alert variant="destructive">
          <AlertDescription>Failed to load video. It may have been removed or doesn't exist.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/videos' })} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery
        </Button>
      </div>
    );
  }

  const videoUrl = video.data.file.getDirectURL();
  const uploadDate = new Date(Number(video.data.uploadTime) / 1000000);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like videos');
      return;
    }
    await likeMutation.mutateAsync(id);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `${video.data.title}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started!');
  };

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => navigate({ to: '/videos' })} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Videos
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <video
              src={videoUrl}
              controls
              className="w-full aspect-video bg-black"
            >
              Your browser does not support the video tag.
            </video>
          </Card>

          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold flex-1">{video.data.title}</h1>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeMutation.isPending}
                  className="gap-2"
                >
                  {likeMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                  <span>{Number(video.data.likeCount)}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>

            {video.data.description && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground whitespace-pre-wrap">{video.data.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <CommentSection videoId={id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Uploaded by</p>
                  <p className="text-sm font-medium">
                    <ChannelNameDisplay principal={video.data.uploader} />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upload date</p>
                  <p className="text-sm">{uploadDate.toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">{uploadDate.toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Comments</p>
                  <p className="text-sm">{Number(video.data.commentCount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <VideoQualitySelector />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
