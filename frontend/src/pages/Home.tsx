import { VideoCard } from '../components/VideoCard';
import { useVideos } from '../hooks/useVideos';
import { DataRestorationBanner } from '../components/DataRestorationBanner';

export function Home() {
  const { data: videos, isLoading } = useVideos();

  // Sort videos by uploadTime in descending order (newest first)
  const sortedVideos = videos ? [...videos].sort((a, b) => {
    return Number(b.uploadTime - a.uploadTime);
  }) : [];

  return (
    <div className="w-full">
      <DataRestorationBanner />
      <section className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading videos...</p>
            </div>
          </div>
        ) : sortedVideos && sortedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {sortedVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground text-lg mb-2">No videos yet</p>
              <p className="text-sm text-muted-foreground">Be the first to upload a video!</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
