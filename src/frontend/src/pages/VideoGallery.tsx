import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { DataRestorationBanner } from "../components/DataRestorationBanner";
import { VideoCard } from "../components/VideoCard";
import { useSearchVideos } from "../hooks/useSearchVideos";
import { useVideos } from "../hooks/useVideos";

export function VideoGallery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const {
    data: allVideos,
    isLoading: allVideosLoading,
    error: allVideosError,
    isFetching: allVideosFetching,
  } = useVideos();
  const { data: searchResults, isLoading: searchLoading } =
    useSearchVideos(debouncedSearchTerm);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isSearching = debouncedSearchTerm.trim().length > 0;
  const videos = isSearching ? searchResults : allVideos;
  // Only show full-page loading spinner on initial load (no data yet), not on background refetch
  const isLoading = isSearching
    ? searchLoading
    : allVideosLoading && !allVideos;
  const error = allVideosError;

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
          <AlertDescription>
            Failed to load videos. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <DataRestorationBanner />

      <div className="mb-8 mt-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <Video className="w-8 h-8 text-chart-1" />
          Video Gallery
          {allVideosFetching && !allVideosLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground ml-2" />
          )}
        </h1>
        <p className="text-muted-foreground mb-6">
          Discover and watch videos from our community
        </p>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search videos by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {!videos || videos.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {isSearching ? "No videos found" : "No videos yet"}
          </h3>
          <p className="text-muted-foreground">
            {isSearching
              ? "Try a different search term"
              : "Be the first to upload a video!"}
          </p>
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
