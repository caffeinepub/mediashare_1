import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Upload,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import { TagInput } from "../components/TagInput";
import { ThumbnailSelector } from "../components/ThumbnailSelector";
import UpgradePrompt from "../components/UpgradePrompt";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useVideoUpload } from "../hooks/useVideoUpload";
import type { ExtendedVideo } from "../lib/types";

const ACCEPTED_VIDEO_FORMATS = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/ogg",
];
const MAX_FILE_SIZE_MB = 20480; // 20 GB

export function UploadVideo() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);

  const { uploadVideo, isUploading, uploadProgress, error, isSuccess, reset } =
    useVideoUpload();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Build a minimal ExtendedVideo-like object for ThumbnailSelector after upload
  const uploadedVideoForThumbnail = useMemo((): ExtendedVideo | null => {
    if (!uploadedVideoId || !uploadedVideoUrl) return null;
    return {
      title,
      description,
      tags,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      uploader: identity?.getPrincipal() as any,
      uploadTime: BigInt(Date.now()) * BigInt(1_000_000),
      likeCount: BigInt(0),
      commentCount: BigInt(0),
      viewCount: BigInt(0),
      thumbnail: null,
      file: {
        getDirectURL: () => uploadedVideoUrl,
      },
    };
  }, [uploadedVideoId, uploadedVideoUrl, title, description, tags, identity]);

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_VIDEO_FORMATS.includes(f.type)) {
      return "Invalid file format. Please upload a video file (MP4, MOV, WebM, or OGG).";
    }
    const fileSizeMB = f.size / 1024 / 1024;
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      return `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Your file is ${fileSizeMB.toFixed(2)}MB.`;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      const err = validateFile(selectedFile);
      if (err) {
        setValidationError(err);
        setFile(null);
        e.target.value = "";
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    const err = validateFile(file);
    if (err) {
      setValidationError(err);
      return;
    }

    try {
      const videoId = await uploadVideo({ title, description, file, tags });
      if (videoId) {
        setUploadedVideoId(videoId);
        // Create a local object URL for the uploaded file so ThumbnailSelector can show the video
        const localUrl = URL.createObjectURL(file);
        setUploadedVideoUrl(localUrl);
        queryClient.invalidateQueries({ queryKey: ["videos"] });
      }
    } catch {
      // Error handled by mutation onError
    }
  };

  const handleRetry = () => {
    if (file && title.trim()) {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  const handleUploadAnother = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setFile(null);
    setValidationError(null);
    setUploadedVideoId(null);
    if (uploadedVideoUrl) {
      URL.revokeObjectURL(uploadedVideoUrl);
    }
    setUploadedVideoUrl(null);
    reset();
  };

  const handleThumbnailComplete = () => {
    if (uploadedVideoId) {
      navigate({ to: "/video/$id", params: { id: uploadedVideoId } });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Alert>
          <AlertDescription>Please sign in to upload videos.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: "/" })} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  // Show thumbnail selector after successful upload
  if (isSuccess && uploadedVideoId && uploadedVideoForThumbnail) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ThumbnailSelector
              videoId={uploadedVideoId}
              video={uploadedVideoForThumbnail}
            />
          </div>
          <div className="md:col-span-1">
            <Card className="border-green-500/50 bg-green-500/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Upload Complete!</CardTitle>
                    <CardDescription>Now select a thumbnail</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={handleThumbnailComplete} className="w-full">
                  Go to Video
                </Button>
                <Button
                  variant="outline"
                  onClick={handleUploadAnother}
                  className="w-full"
                >
                  Upload Another
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Upload Video</CardTitle>
                  <CardDescription>
                    Share your video with the world
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Alert>
                  <AlertDescription className="text-sm">
                    <strong>File Requirements:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Accepted formats: MP4, MOV, WebM, OGG</li>
                      <li>Maximum file size: {MAX_FILE_SIZE_MB}MB</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Reassuring message shown only during active upload */}
                {isUploading && (
                  <Alert className="border-blue-500/50 bg-blue-50 dark:bg-blue-950/30">
                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                      <strong>Your existing videos are safe.</strong> Uploading
                      this video will not affect or remove any of your
                      previously uploaded content. All your videos will remain
                      visible once this upload completes.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="video-file">Video File *</Label>
                  <Input
                    id="video-file"
                    type="file"
                    accept=".mp4,.mov,.webm,.ogv,video/mp4,video/quicktime,video/webm,video/ogg"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    required
                  />
                  {file && !validationError && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {file.name} (
                      {(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  {validationError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter video title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isUploading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter video description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isUploading}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <TagInput
                    tags={tags}
                    onChange={setTags}
                    disabled={isUploading}
                  />
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Uploading...
                      </span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>{error}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                        className="ml-4 flex-shrink-0"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={
                      !file || !title.trim() || isUploading || !!validationError
                    }
                    className="flex-1"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: "/videos" })}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <UpgradePrompt />
        </div>
      </div>
    </div>
  );
}
