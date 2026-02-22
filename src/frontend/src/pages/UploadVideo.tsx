import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useVideoUpload } from '../hooks/useVideoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, Upload, Loader2, CheckCircle2 } from 'lucide-react';

export function UploadVideo() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { uploadVideo, isUploading, uploadProgress, error, isSuccess } = useVideoUpload();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    await uploadVideo({ title, description, file });
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Alert>
          <AlertDescription>Please sign in to upload videos.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container py-16 max-w-2xl mx-auto">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold">Video Uploaded Successfully!</h2>
            <p className="text-muted-foreground">Your video has been uploaded and is now available in the gallery.</p>
            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={() => navigate({ to: '/videos' })}>View Gallery</Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Upload Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <Video className="w-8 h-8 text-chart-1" />
          Upload Video
        </h1>
        <p className="text-muted-foreground">Share your video with the community</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
          <CardDescription>Fill in the information about your video</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="video-file">Video File *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  required
                />
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                disabled={isUploading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter video description (optional)"
                rows={4}
                disabled={isUploading}
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isUploading || !file || !title.trim()} className="w-full gap-2">
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Video
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
