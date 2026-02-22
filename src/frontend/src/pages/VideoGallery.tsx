import { useVideos } from '../hooks/useVideos';
import { VideoCard } from '../components/VideoCard';
import { Loader2, Video } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function VideoGallery() {
  const { data: videos, isLoading, error } = useVideos();

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16">
        <Alert variant="destructive">
          <AlertDescription>Failed to load videos. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <Video className="w-8 h-8 text-chart-1" />
          Video Gallery
        </h1>
        <p className="text-muted-foreground">Discover and watch videos from our community</p>
      </div>

      {!videos || videos.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
          <p className="text-muted-foreground">Be the first to upload a video!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
