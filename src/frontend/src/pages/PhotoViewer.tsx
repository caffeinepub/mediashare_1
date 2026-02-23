import { useParams, useNavigate } from '@tanstack/react-router';
import { usePhoto } from '../hooks/usePhoto';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChannelNameDisplay } from '../components/ChannelNameDisplay';
import { useEffect, useMemo } from 'react';

export default function PhotoViewer() {
  const { id } = useParams({ from: '/photo/$id' });
  const navigate = useNavigate();
  const { data: photo, isLoading, error } = usePhoto(id);

  // Convert Uint8Array to blob URL for image display
  const imageUrl = useMemo(() => {
    if (!photo?.file) return null;
    const blob = new Blob([new Uint8Array(photo.file)], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }, [photo?.file]);

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading photo...</p>
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load photo</p>
          <Button onClick={() => navigate({ to: '/photos' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Photos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/photos' })}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Photos
      </Button>

      <div className="bg-card rounded-lg overflow-hidden shadow-lg">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={photo.title}
            className="w-full h-auto"
          />
        ) : (
          <div className="w-full aspect-video bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">Photo unavailable</p>
          </div>
        )}

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{photo.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <ChannelNameDisplay principal={photo.uploader} />
            <span>•</span>
            <span>{new Date(Number(photo.uploadTime) / 1000000).toLocaleDateString()}</span>
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {photo.description}
          </p>
        </div>
      </div>
    </div>
  );
}
