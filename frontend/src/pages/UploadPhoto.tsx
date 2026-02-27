import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image, Upload, Loader2, CheckCircle2 } from 'lucide-react';

export function UploadPhoto() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { uploadPhoto, isUploading, uploadProgress, error, isSuccess } = usePhotoUpload();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
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

    await uploadPhoto({ title, description, file });
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Alert>
          <AlertDescription>Please sign in to upload photos.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="container py-16 max-w-2xl mx-auto">
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Upload Successful!</CardTitle>
                <CardDescription>Your photo has been uploaded successfully.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button onClick={() => navigate({ to: '/photos' })} className="flex-1">
                View All Photos
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setTitle('');
                  setDescription('');
                  setFile(null);
                  setPreview(null);
                  window.location.reload();
                }}
                className="flex-1"
              >
                Upload Another
              </Button>
            </div>
          </CardContent>
        </Card>
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
                  <Image className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Upload Photo</CardTitle>
                  <CardDescription>Share your photo with the world</CardDescription>
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
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                {preview && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    </div>
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
                    rows={4}
                  />
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploading...</span>
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
                  <Button type="submit" disabled={!file || !title.trim() || isUploading} className="flex-1">
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
                    onClick={() => navigate({ to: '/photos' })}
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
