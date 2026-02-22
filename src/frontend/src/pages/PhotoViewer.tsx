import { useParams, useNavigate } from '@tanstack/react-router';
import { usePhoto } from '../hooks/usePhoto';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, User, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChannelNameDisplay } from '../components/ChannelNameDisplay';

export function PhotoViewer() {
  const { id } = useParams({ from: '/photo/$id' });
  const navigate = useNavigate();
  const { data: photo, isLoading, error } = usePhoto(id);

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading photo...</p>
        </div>
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="container py-16">
        <Alert variant="destructive">
          <AlertDescription>Failed to load photo. It may have been removed or doesn't exist.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/photos' })} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gallery
        </Button>
      </div>
    );
  }

  const photoUrl = photo.data.file.getDirectURL();
  const uploadDate = new Date(Number(photo.data.uploadTime) / 1000000);

  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <Button variant="ghost" onClick={() => navigate({ to: '/photos' })} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Photos
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <img src={photoUrl} alt={photo.data.title} className="w-full h-auto" />
          </Card>

          <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold">{photo.data.title}</h1>
            {photo.data.description && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground whitespace-pre-wrap">{photo.data.description}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chart-2 to-chart-3 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">Uploaded by</p>
                  <p className="text-sm font-medium">
                    <ChannelNameDisplay principal={photo.data.uploader} />
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
