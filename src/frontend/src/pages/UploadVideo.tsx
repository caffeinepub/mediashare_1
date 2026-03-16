import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Upload,
  Video,
  Wifi,
} from "lucide-react";
import { useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useVideoUpload } from "../hooks/useVideoUpload";

const ACCEPTED_VIDEO_TYPES = [
  ".mp4",
  ".mov",
  ".mkv",
  ".avi",
  ".3gp",
  ".webm",
  ".m4v",
  ".flv",
  ".wmv",
];
const MAX_SIZE_BYTES = 20 * 1024 * 1024 * 1024; // 20 GB

export function UploadVideo() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { actor, isFetching, isError, retry } = useActor();
  const { uploadVideo, isUploading, uploadProgress, error, isSuccess, reset } =
    useVideoUpload();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isConnecting = isFetching && !actor;
  const isActorReady = !!actor;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = `.${selected.name.split(".").pop()?.toLowerCase()}`;
    const isValidType =
      selected.type.startsWith("video/") || ACCEPTED_VIDEO_TYPES.includes(ext);

    if (!isValidType) {
      setFileError(
        "Sirf video files allowed hain (MP4, MKV, MOV, AVI, 3GP, WebM, etc.)",
      );
      return;
    }

    if (selected.size > MAX_SIZE_BYTES) {
      setFileError("File size 20 GB se zyada nahi honi chahiye.");
      return;
    }

    setFile(selected);
  }

  async function handleUpload() {
    if (!file || !title.trim() || isUploading || !actor) return;

    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      await uploadVideo({
        title: title.trim(),
        description: description.trim(),
        tags: tagList,
        file,
        actor,
      });
    } catch {
      // error shown via toast
    }
  }

  function handleReset() {
    reset();
    setTitle("");
    setDescription("");
    setTags("");
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // --- Success screen ---
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Upload Ho Gayi!</h2>
          <p className="text-muted-foreground mb-6">
            Aapki video successfully upload ho gayi hai.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleReset}
              variant="outline"
              data-ocid="upload.secondary_button"
            >
              Aur Upload Karein
            </Button>
            <Button
              onClick={() => navigate({ to: "/" })}
              data-ocid="upload.primary_button"
            >
              Home Jaayein
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- Not logged in ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-sm">
          <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Karein</h2>
          <p className="text-muted-foreground">
            Video upload karne ke liye pehle Internet Identity se login karein.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Video Upload Karein</h1>
          <p className="text-muted-foreground mt-1">
            Apni video MediaShare par share karein
          </p>
        </div>

        {/* Server Status Banner */}
        {isError ? (
          <div
            className="flex items-center justify-between gap-2 text-sm px-4 py-3 rounded-lg mb-6 bg-destructive/10 text-destructive"
            data-ocid="upload.error_state"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Server se connect nahi ho paaya.</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => retry()}
              className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
              data-ocid="upload.secondary_button"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        ) : isConnecting ? (
          <div
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg mb-6 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
            data-ocid="upload.loading_state"
          >
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Server se connect ho raha hai, thoda wait karein...</span>
          </div>
        ) : isActorReady ? (
          <div
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg mb-6 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
            data-ocid="upload.success_state"
          >
            <Wifi className="w-4 h-4 shrink-0" />
            <span>Server connected — upload ke liye taiyaar</span>
          </div>
        ) : null}

        {/* Upload Form */}
        <div className="space-y-6">
          {/* File Picker */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-accent/30 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) =>
              e.key === "Enter" && fileInputRef.current?.click()
            }
            data-ocid="upload.dropzone"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
              data-ocid="upload.upload_button"
            />
            {file ? (
              <div className="space-y-1">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                <p className="font-semibold text-green-600 dark:text-green-400">
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  Badlein
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="font-semibold text-lg">Video choose karein</p>
                <p className="text-sm text-muted-foreground">
                  MP4, MKV, MOV, AVI, 3GP, WebM — max 20 GB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Browse
                </Button>
              </div>
            )}
          </div>

          {fileError && (
            <p
              className="text-sm text-destructive"
              data-ocid="upload.error_state"
            >
              {fileError}
            </p>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Apni video ka title likhein"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              data-ocid="upload.input"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Video ke baare mein likhein (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={3}
              data-ocid="upload.textarea"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma se alag karein)</Label>
            <Input
              id="tags"
              placeholder="jaise: cricket, funny, vlog"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isUploading}
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2" data-ocid="upload.loading_state">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Upload ho rahi hai...
                </span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-3" />
              <p className="text-xs text-muted-foreground text-center">
                Band mat karein — upload chal rahi hai
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg"
              data-ocid="upload.error_state"
            >
              {error}
            </div>
          )}

          {/* Upload Button */}
          <Button
            className="w-full h-12 text-base"
            onClick={handleUpload}
            disabled={!file || !title.trim() || isUploading || !isActorReady}
            data-ocid="upload.submit_button"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Upload ho rahi
                hai ({uploadProgress}%)
              </>
            ) : isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Server connect
                ho raha hai...
              </>
            ) : isError ? (
              <>
                <AlertCircle className="w-5 h-5 mr-2" /> Server not connected —
                Retry karein
              </>
            ) : !file ? (
              <>
                <Upload className="w-5 h-5 mr-2" /> Pehle video choose karein
              </>
            ) : !title.trim() ? (
              <>
                <Upload className="w-5 h-5 mr-2" /> Title likhein
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" /> Upload Karein
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
