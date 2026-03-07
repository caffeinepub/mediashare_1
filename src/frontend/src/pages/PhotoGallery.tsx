import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Image, Loader2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PhotoCard } from "../components/PhotoCard";
import { usePhotos } from "../hooks/usePhotos";

export function PhotoGallery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { data: photos, isLoading, error } = usePhotos();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredPhotos = useMemo(() => {
    if (!photos) return [];
    if (!debouncedSearchTerm.trim()) return photos;

    const lowercaseQuery = debouncedSearchTerm.toLowerCase();
    return photos.filter(
      (photo) =>
        photo.title.toLowerCase().includes(lowercaseQuery) ||
        photo.description.toLowerCase().includes(lowercaseQuery),
    );
  }, [photos, debouncedSearchTerm]);

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading photos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-16">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load photos. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-2 to-chart-3 flex items-center justify-center">
            <Image className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Photo Gallery</h1>
            <p className="text-muted-foreground">
              {filteredPhotos.length}{" "}
              {filteredPhotos.length === 1 ? "photo" : "photos"}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Search photos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16">
          <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No photos found</h2>
          <p className="text-muted-foreground">
            {debouncedSearchTerm
              ? "Try a different search term"
              : "Be the first to upload a photo!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPhotos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  );
}
