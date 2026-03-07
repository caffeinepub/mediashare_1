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
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Image, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import UpgradePrompt from "../components/UpgradePrompt";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePhotoUpload } from "../hooks/usePhotoUpload";

export function UploadPhoto() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { uploadPhoto, isUploading, uploadProgress, error, isSuccess } =
    usePhotoUpload();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    try {
      await uploadPhoto({ title, description, file });
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Alert>
          <AlertDescription>Please sign in to upload photos.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: "/" })} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container py-16 max-w-lg mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Photo Uploaded!</h2>
        <p className="text-muted-foreground mb-6">
          Your photo has been shared successfully.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate({ to: "/photos" })}>
            View Photos
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Upload Another
          </Button>
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
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-chart-2 to-chart-3 flex items-center justify-center">
                  <Image className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Upload Photo</CardTitle>
                  <CardDescription>
                    Share your photo with the world
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="photo-file">Photo File *</Label>
                  <Input
                    id="photo-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    required
                  />
                </div>

                {preview && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-64 object-contain bg-muted"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter photo title"
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
                    placeholder="Enter photo description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isUploading}
                    rows={3}
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
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={!file || !title.trim() || isUploading}
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
                        Upload Photo
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: "/photos" })}
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
