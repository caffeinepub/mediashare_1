import { useParams, useNavigate } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { useVideos } from '../hooks/useVideos';
import { usePhotos } from '../hooks/usePhotos';
import { useChannelName } from '../hooks/useChannelName';
import { useUserStats } from '../hooks/useUserStats';
import { VideoCard } from '../components/VideoCard';
import { PhotoCard } from '../components/PhotoCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, User, Video, Image, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMemo } from 'react';

export function ChannelProfile() {
  const { principal: principalParam } = useParams({ from: '/channel/$principal' });
  const navigate = useNavigate();

  // Parse principal first, but always call hooks
  const principal = useMemo(() => {
    try {
      return Principal.fromText(principalParam);
    } catch (error) {
      return null;
    }
  }, [principalParam]);

  // Always call hooks unconditionally
  const { data: channelName, isLoading: channelLoading } = useChannelName(principal || Principal.anonymous());
  const { data: userStats, isLoading: statsLoading } = useUserStats(principal || Principal.anonymous());
  const { data: allVideos, isLoading: videosLoading } = useVideos();
  const { data: allPhotos, isLoading: photosLoading } = usePhotos();

  const isLoading = channelLoading || statsLoading || videosLoading || photosLoading;

  // Handle invalid principal after hooks
  if (!principal) {
    return (
      <div className="container py-16">
        <Alert variant="destructive">
          <AlertDescription>Invalid principal ID</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading channel...</p>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="container py-16">
        <Alert variant="destructive">
          <AlertDescription>User not found</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    );
  }

  const userVideos = allVideos?.filter(video => video.uploader.toString() === principal.toString()) || [];
  const userPhotos = allPhotos?.filter(photo => photo.uploader.toString() === principal.toString()) || [];

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-chart-1 to-chart-2 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{channelName || 'Unknown Channel'}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {principal.toString().slice(0, 20)}...
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-1/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Videos</p>
                <p className="text-lg font-semibold">{Number(userStats.totalVideosUploaded)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-chart-2/20 flex items-center justify-center">
                <Image className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Photos</p>
                <p className="text-lg font-semibold">{Number(userStats.totalPhotosUploaded)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="text-sm font-medium">
                  {new Date(Number(userStats.accountCreation) / 1000000).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="videos">Videos ({userVideos.length})</TabsTrigger>
          <TabsTrigger value="photos">Photos ({userPhotos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-6">
          {userVideos.length === 0 ? (
            <div className="text-center py-16">
              <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
              <p className="text-muted-foreground">This channel hasn't uploaded any videos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          {userPhotos.length === 0 ? (
            <div className="text-center py-16">
              <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No photos yet</h2>
              <p className="text-muted-foreground">This channel hasn't uploaded any photos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userPhotos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
