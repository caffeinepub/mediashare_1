import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TagInput } from './TagInput';
import { ThumbnailSelector } from './ThumbnailSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUpdateVideo } from '../hooks/useUpdateVideo';
import { useRemoveThumbnail } from '../hooks/useRemoveThumbnail';
import { Loader2, Save, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { ExtendedVideo } from '../backend';

interface VideoEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: ExtendedVideo;
  videoId: string;
}

export function VideoEditModal({ open, onOpenChange, video, videoId }: VideoEditModalProps) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [tags, setTags] = useState<string[]>(video.tags);
  const [showThumbnailSelector, setShowThumbnailSelector] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const { mutate: updateVideo, isPending: isUpdating } = useUpdateVideo();
  const { mutate: removeThumbnail, isPending: isRemoving } = useRemoveThumbnail();

  const videoUrl = video.file.getDirectURL();

  // Reset form when video changes
  useEffect(() => {
    setTitle(video.title);
    setDescription(video.description);
    setTags(video.tags);
    setShowThumbnailSelector(false);
  }, [video]);

  const handleSave = () => {
    if (!title.trim()) {
      return;
    }

    updateVideo(
      { videoId, title: title.trim(), description: description.trim(), tags },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleRemoveThumbnail = () => {
    removeThumbnail(videoId, {
      onSuccess: () => {
        setShowThumbnailSelector(false);
      },
    });
  };

  const handleThumbnailComplete = () => {
    setShowThumbnailSelector(false);
    setActiveTab('details');
  };

  const hasChanges =
    title !== video.title ||
    description !== video.description ||
    JSON.stringify(tags) !== JSON.stringify(video.tags);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
          <DialogDescription>
            Update your video's information, thumbnail, and tags
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="thumbnail">Thumbnail</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                disabled={isUpdating}
              />
              {!title.trim() && (
                <p className="text-xs text-destructive">Title is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter video description"
                rows={5}
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <TagInput tags={tags} onChange={setTags} disabled={isUpdating} />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={!title.trim() || isUpdating || !hasChanges}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="thumbnail" className="space-y-4 mt-4">
            {showThumbnailSelector ? (
              <div className="space-y-4">
                <ThumbnailSelector
                  videoId={videoId}
                  videoUrl={videoUrl}
                  onComplete={handleThumbnailComplete}
                />
                <Button
                  variant="outline"
                  onClick={() => setShowThumbnailSelector(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {video.thumbnail && (
                  <div className="space-y-3">
                    <Label>Current Thumbnail</Label>
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
                  <Button
                    onClick={() => setShowThumbnailSelector(true)}
                    className="w-full"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
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
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
