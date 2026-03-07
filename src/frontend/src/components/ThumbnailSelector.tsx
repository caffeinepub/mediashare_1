import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Loader2, Upload, X } from "lucide-react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { ExternalBlob } from "../backend";
import { useMarkThumbnailGenerated } from "../hooks/useMarkThumbnailGenerated";
import { useRemoveThumbnail } from "../hooks/useRemoveThumbnail";
import { useSetCustomThumbnail } from "../hooks/useSetCustomThumbnail";
import type { ExtendedVideo } from "../lib/types";

interface ThumbnailSelectorProps {
  videoId: string;
  video: ExtendedVideo;
}

export function ThumbnailSelector({ videoId, video }: ThumbnailSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const {
    setCustomThumbnail,
    isUploading: isUploadingCustom,
    uploadProgress,
  } = useSetCustomThumbnail();
  const markThumbnailGenerated = useMarkThumbnailGenerated();
  const removeThumbnail = useRemoveThumbnail();

  const currentThumbnailUrl =
    video.thumbnail &&
    typeof video.thumbnail === "object" &&
    "getDirectURL" in (video.thumbnail as object)
      ? (video.thumbnail as { getDirectURL(): string }).getDirectURL()
      : null;

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      try {
        await setCustomThumbnail({ videoId, imageFile: file });
      } finally {
        setPreviewUrl(null);
        URL.revokeObjectURL(url);
      }
    },
    [videoId, setCustomThumbnail],
  );

  const handleCaptureThumbnail = useCallback(async () => {
    const videoEl = videoRef.current;
    const canvas = canvasRef.current;
    if (!videoEl || !canvas) return;

    setIsCapturing(true);
    try {
      canvas.width = videoEl.videoWidth || 320;
      canvas.height = videoEl.videoHeight || 180;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.85),
      );
      if (!blob) return;

      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const externalBlob = ExternalBlob.fromBytes(uint8Array);

      await markThumbnailGenerated.mutateAsync({
        videoId,
        thumbnailBlob: externalBlob,
      });
    } finally {
      setIsCapturing(false);
    }
  }, [videoId, markThumbnailGenerated]);

  const videoUrl = video.file.getDirectURL();

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-foreground">Thumbnail</div>

      {/* Current / Preview Thumbnail */}
      {(currentThumbnailUrl || previewUrl) && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          <img
            src={previewUrl ?? currentThumbnailUrl ?? ""}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
          {!previewUrl && currentThumbnailUrl && (
            <Button
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 w-7 h-7"
              onClick={() => removeThumbnail.mutate(videoId)}
              disabled={removeThumbnail.isPending}
            >
              {removeThumbnail.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {isUploadingCustom && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Uploading thumbnail...
          </p>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}

      {/* Video for frame capture */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Seek to a frame in the video below, then capture it as thumbnail:
        </p>
        {/* biome-ignore lint/a11y/useMediaCaption: thumbnail capture tool, captions not required */}
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full aspect-video rounded-lg bg-black"
          preload="metadata"
        />
        <canvas ref={canvasRef} className="hidden" />
        <Button
          variant="outline"
          size="sm"
          onClick={handleCaptureThumbnail}
          disabled={isCapturing || markThumbnailGenerated.isPending}
          className="w-full"
        >
          {isCapturing || markThumbnailGenerated.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Capture Current Frame
            </>
          )}
        </Button>
      </div>

      {/* Upload Custom Image */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingCustom}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Custom Thumbnail
        </Button>
      </div>
    </div>
  );
}
