import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useGetCallerUserProfile';
import { useUserStats } from '../hooks/useUserStats';
import { useVideos } from '../hooks/useVideos';
import { usePhotos } from '../hooks/usePhotos';
import { VideoCard } from '../components/VideoCard';
import { PhotoCard } from '../components/PhotoCard';
import { DeleteVideoButton } from '../components/DeleteVideoButton';
import { VideoEditModal } from '../components/VideoEditModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Settings,
  Video,
  Image,
  Eye,
  Heart,
  Calendar,
  LogIn,
  Share2,
  Loader2,
  UserPlus,
  Edit,
} from 'lucide-react';
import { useMemo } from 'react';
import { Principal } from '@dfinity/principal';
import { formatViewCount } from '../utils/formatters';
import type { VideoMetadata } from '../backend';
import { useVideo } from '../hooks/useVideo';

// Small wrapper to load full ExtendedVideo for the edit modal
function VideoCardWithActions({
  video,
  onEdit,
}: {
  video: VideoMetadata;
  onEdit: (videoId: string) => void;
}) {
  return (
    <div className="relative group">
      <VideoCard video={video} />
      {/* Action buttons — always visible, not just on hover */}
      <div className="absolute top-2 right-2 flex gap-1">
        <Button
          size="icon"
          variant="secondary"
          className="h-8 w-8 shadow-md"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(video.id);
          }}
          title="Edit video"
        >
          <Edit className="h-3.5 w-3.5" />
        </Button>
        <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
          <DeleteVideoButton
            videoId={video.id}
            variant="secondary"
            size="icon"
            showLabel={false}
          />
        </div>
      </div>
    </div>
  );
}

// Edit modal wrapper that fetches the full ExtendedVideo
function VideoEditModalWrapper({
  videoId,
  open,
  onOpenChange,
}: {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: video, isLoading } = useVideo(videoId);

  if (!open) return null;
  if (isLoading || !video) return null;

  return (
    <VideoEditModal
      open={open}
      onOpenChange={onOpenChange}
      video={video}
      videoId={videoId}
    />
  );
}

export function Profile() {
  const navigate = useNavigate();
  const { identity, login, isInitializing, isLoggingIn } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = isAuthenticated ? identity?.getPrincipal() : undefined;

  // Always call hooks unconditionally
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { data: userStats, isLoading: statsLoading } = useUserStats(
    principal ?? Principal.anonymous()
  );
  const { data: allVideos, isLoading: videosLoading } = useVideos();
  const { data: allPhotos, isLoading: photosLoading } = usePhotos();

  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  const isLoading = profileLoading || statsLoading || videosLoading || photosLoading;

  // Filter videos and photos by current user
  const myVideos = useMemo(() => {
    if (!allVideos || !principal) return [];
    return allVideos.filter(
      (v) => v.uploader.toString() === principal.toString()
    );
  }, [allVideos, principal]);

  const myPhotos = useMemo(() => {
    if (!allPhotos || !principal) return [];
    return allPhotos.filter(
      (p) => p.uploader.toString() === principal.toString()
    );
  }, [allPhotos, principal]);

  // Calculate total views and likes from user's videos
  const totalViews = useMemo(
    () => myVideos.reduce((sum, v) => sum + Number(v.viewCount), 0),
    [myVideos]
  );
  const totalLikes = useMemo(
    () => myVideos.reduce((sum, v) => sum + Number(v.likeCount), 0),
    [myVideos]
  );

  // While auth is initializing (checking stored identity), show a spinner
  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Loading profile…</p>
      </div>
    );
  }

  // Unauthenticated state — show prominent sign-in + create account CTA
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        {/* App icon */}
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg">
          <Share2 className="w-10 h-10 text-primary-foreground" />
        </div>

        <h1 className="text-3xl font-bold mb-2">Media Share</h1>
        <h2 className="text-xl font-semibold mb-3 text-foreground">Join Media Share</h2>
        <p className="text-muted-foreground mb-8 max-w-sm">
          Create an account or sign in to upload videos, manage your channel, and connect with others.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          {/* Create Account - primary CTA */}
          <Button
            size="lg"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="gap-2 flex-1 font-semibold"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </Button>

          {/* Sign In - secondary CTA */}
          <Button
            size="lg"
            variant="outline"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="gap-2 flex-1 font-semibold"
          >
            {isLoggingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6 max-w-xs">
          Secure authentication powered by Internet Identity. No passwords required.
        </p>
      </div>
    );
  }

  // Loading skeleton (authenticated but data still loading)
  if (isLoading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const displayName = userProfile?.name || 'User';
  const channelName = userProfile?.channelName || displayName;
  const joinDate = userStats?.accountCreation
    ? new Date(Number(userStats.accountCreation) / 1000000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <div className="container py-8 space-y-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center shrink-0">
          <User className="w-10 h-10 text-white" />
        </div>

        {/* Name & Channel */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight">{displayName}</h1>
          {userProfile?.channelName && (
            <p className="text-muted-foreground text-sm mt-0.5">
              @{channelName}
            </p>
          )}
          {joinDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {joinDate}</span>
            </div>
          )}
        </div>

        {/* Settings button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/settings' })}
          className="gap-2 shrink-0"
        >
          <Settings className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      <Separator />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{myVideos.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Videos</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-chart-2/10 flex items-center justify-center">
                <Image className="w-5 h-5 text-chart-2" />
              </div>
            </div>
            <p className="text-2xl font-bold">{myPhotos.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Photos</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-chart-3/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-chart-3" />
              </div>
            </div>
            <p className="text-2xl font-bold">{formatViewCount(BigInt(totalViews))}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Views</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <p className="text-2xl font-bold">{totalLikes}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Likes</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="videos" className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="videos">Videos ({myVideos.length})</TabsTrigger>
          <TabsTrigger value="photos">Photos ({myPhotos.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="mt-6">
          {myVideos.length === 0 ? (
            <div className="text-center py-16">
              <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't uploaded any videos yet.
              </p>
              <Button onClick={() => navigate({ to: '/upload-video' })} className="gap-2">
                <Video className="w-4 h-4" />
                Upload a Video
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myVideos.map((video) => (
                <VideoCardWithActions
                  key={video.id}
                  video={video}
                  onEdit={(videoId) => setEditingVideoId(videoId)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="photos" className="mt-6">
          {myPhotos.length === 0 ? (
            <div className="text-center py-16">
              <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">No photos yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't uploaded any photos yet.
              </p>
              <Button onClick={() => navigate({ to: '/upload-photo' })} className="gap-2">
                <Image className="w-4 h-4" />
                Upload a Photo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myPhotos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Video Edit Modal */}
      {editingVideoId && (
        <VideoEditModalWrapper
          videoId={editingVideoId}
          open={!!editingVideoId}
          onOpenChange={(open) => {
            if (!open) setEditingVideoId(null);
          }}
        />
      )}
    </div>
  );
}
