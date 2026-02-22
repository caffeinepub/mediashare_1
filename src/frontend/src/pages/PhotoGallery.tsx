import { usePhotos } from '../hooks/usePhotos';
import { PhotoCard } from '../components/PhotoCard';
import { Loader2, Image } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function PhotoGallery() {
  const { data: photos, isLoading, error } = usePhotos();

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
          <AlertDescription>Failed to load photos. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <Image className="w-8 h-8 text-chart-2" />
          Photo Gallery
        </h1>
        <p className="text-muted-foreground">Browse beautiful photos from our community</p>
      </div>

      {!photos || photos.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Image className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No photos yet</h3>
          <p className="text-muted-foreground">Be the first to upload a photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}
    </div>
  );
}
