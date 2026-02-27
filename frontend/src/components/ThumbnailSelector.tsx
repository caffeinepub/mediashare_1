import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, Loader2, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ExternalBlob } from '../backend';
import { useSetCustomThumbnail } from '../hooks/useSetCustomThumbnail';
import { useMarkThumbnailGenerated } from '../hooks/useMarkThumbnailGenerated';

interface ThumbnailSelectorProps {
  videoId: string;
  videoUrl: string;
  onComplete: () => void;
}

const MAX_THUMBNAIL_SIZE_MB = 5;
const ACCEPTED_IMAGE_FORMATS = ['image/jpeg', 'image/png'];

export function ThumbnailSelector({ videoId, videoUrl, onComplete }: ThumbnailSelectorProps) {
  const [autoThumbnails, setAutoThumbnails] = useState<string[]>([]);
  const [selectedAutoIndex, setSelectedAutoIndex] = useState<number | null>(null);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customPreview, setCustomPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { mutate: setCustomThumbnail, isPending: isUploadingCustom, uploadProgress } = useSetCustomThumbnail();
  const { mutate: markGenerated, isPending: isMarkingGenerated } = useMarkThumbnailGenerated();

  const isPending = isUploadingCustom || isMarkingGenerated;

  // Generate thumbnails from video
  useEffect(() => {
    const generateThumbnails = async () => {
      if (!videoRef.current) return;

      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const thumbnails: string[] = [];

      // Wait for video metadata to load
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve();
        } else {
          video.addEventListener('loadedmetadata', () => resolve(), { once: true });
        }
      });

      const duration = video.duration;
      const positions = [0.1, 0.3, 0.5, 0.7]; // 10%, 30%, 50%, 70% through the video

      for (const position of positions) {
        video.currentTime = duration * position;
        
        await new Promise<void>((resolve) => {
          video.addEventListener('seeked', () => resolve(), { once: true });
        });

        // Set canvas size to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        thumbnails.push(dataUrl);
      }

      setAutoThumbnails(thumbnails);
      setIsGenerating(false);
    };

    generateThumbnails().catch((err) => {
      console.error('Failed to generate thumbnails:', err);
      setIsGenerating(false);
    });
  }, [videoUrl]);

  const validateCustomFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_FORMATS.includes(file.type)) {
      return 'Invalid file format. Please upload a JPEG or PNG image.';
    }

    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > MAX_THUMBNAIL_SIZE_MB) {
      return `File size exceeds ${MAX_THUMBNAIL_SIZE_MB}MB limit. Your file is ${fileSizeMB.toFixed(2)}MB.`;
    }

    return null;
  };

  const handleCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    setSelectedAutoIndex(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const error = validateCustomFile(file);
      
      if (error) {
        setValidationError(error);
        setCustomFile(null);
        setCustomPreview(null);
        e.target.value = '';
      } else {
        setCustomFile(file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
          setCustomPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSelectAutoThumbnail = async (index: number) => {
    setSelectedAutoIndex(index);
    setCustomFile(null);
    setCustomPreview(null);
    setValidationError(null);
  };

  const handleSubmit = async () => {
    if (customFile) {
      // Upload custom thumbnail
      const arrayBuffer = await customFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const blob = ExternalBlob.fromBytes(uint8Array);

      setCustomThumbnail(
        { videoId, thumbnailBlob: blob },
        {
          onSuccess: () => {
            onComplete();
          },
        }
      );
    } else if (selectedAutoIndex !== null) {
      // Convert selected auto-generated thumbnail to blob
      const dataUrl = autoThumbnails[selectedAutoIndex];
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const externalBlob = ExternalBlob.fromBytes(uint8Array);

      markGenerated(
        { videoId, thumbnailBlob: externalBlob },
        {
          onSuccess: () => {
            onComplete();
          },
        }
      );
    }
  };

  const canSubmit = (selectedAutoIndex !== null || customFile !== null) && !isPending && !validationError;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle>Select Thumbnail</CardTitle>
            <CardDescription>Choose a thumbnail for your video</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hidden video element for thumbnail generation */}
        <video ref={videoRef} src={videoUrl} className="hidden" preload="metadata" />

        {/* Auto-generated thumbnails */}
        <div className="space-y-3">
          <Label>Auto-Generated Thumbnails</Label>
          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Generating thumbnails...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {autoThumbnails.map((thumbnail, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectAutoThumbnail(index)}
                  disabled={isPending}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    selectedAutoIndex === index
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <img src={thumbnail} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  {selectedAutoIndex === index && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom thumbnail upload */}
        <div className="space-y-3">
          <Label htmlFor="custom-thumbnail">Or Upload Custom Thumbnail</Label>
          <Input
            id="custom-thumbnail"
            type="file"
            accept={ACCEPTED_IMAGE_FORMATS.join(',')}
            onChange={handleCustomFileChange}
            disabled={isPending}
          />
          {customPreview && (
            <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary ring-2 ring-primary/20 max-w-sm">
              <img src={customPreview} alt="Custom thumbnail preview" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          )}
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          <p className="text-xs text-muted-foreground">
            Accepted formats: JPEG, PNG • Max size: {MAX_THUMBNAIL_SIZE_MB}MB
          </p>
        </div>

        {/* Upload progress */}
        {isUploadingCustom && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Uploading thumbnail...</span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {/* Submit button */}
        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Continue
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
