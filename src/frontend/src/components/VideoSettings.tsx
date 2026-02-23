import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThumbnailSelector } from './ThumbnailSelector';
import { useRemoveThumbnail } from '../hooks/useRemoveThumbnail';
import { Loader2, Trash2, Image as ImageIcon } from 'lucide-react';
import type { ExtendedVideo } from '../backend';

interface VideoSettingsProps {
  video: ExtendedVideo;
  videoId: string;
  onClose: () => void;
}

export function VideoSettings({ video, videoId, onClose }: VideoSettingsProps) {
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);
  const { mutate: removeThumbnail, isPending: isRemoving } = useRemoveThumbnail();

  const videoUrl = video.file.getDirectURL();

  const handleRemoveThumbnail = () => {
    removeThumbnail(videoId, {
      onSuccess: () => {
        setShowThumbnailSelector(false);
      },
    });
  };

  const handleThumbnailComplete = () => {
    setShowThumbnailSelector(false);
    onClose();
  };

  if (showThumbnailSelector) {
    return (
      <div className="space-y-4">
        <ThumbnailSelector
          videoId={videoId}
          videoUrl={videoUrl}
          onComplete={handleThumbnailComplete}
        />
        <Button variant="outline" onClick={() => setShowThumbnailSelector(false)} className="w-full">
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>Thumbnail Settings</CardTitle>
            <CardDescription>Manage your video's thumbnail</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {video.thumbnail && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Current Thumbnail</p>
            <div className="aspect-video rounded-lg overflow-hidden border">
              <img
                src={video.thumbnail.getDirectURL()}
                alt="Current thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {!video.thumbnail && (
          <Alert>
            <AlertDescription>No thumbnail set for this video.</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button onClick={() => setShowThumbnailSelector(true)} className="w-full">
            {video.thumbnail ? 'Change Thumbnail' : 'Add Thumbnail'}
          </Button>

          {video.thumbnail && (
            <Button
              variant="destructive"
              onClick={handleRemoveThumbnail}
              disabled={isRemoving}
              className="w-full"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Thumbnail
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
