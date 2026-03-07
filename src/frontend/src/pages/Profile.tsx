import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  DollarSign,
  Edit2,
  Image,
  LogIn,
  Upload,
  User,
  UserPlus,
} from "lucide-react";
import React, { useState } from "react";
import AdRevenueDashboard from "../components/AdRevenueDashboard";
import { DeleteVideoButton } from "../components/DeleteVideoButton";
import { PhotoCard } from "../components/PhotoCard";
import { VideoCard } from "../components/VideoCard";
import { VideoEditModal } from "../components/VideoEditModal";
import { useGetCallerUserProfile } from "../hooks/useGetCallerUserProfile";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePhotos } from "../hooks/usePhotos";
import { useVideo } from "../hooks/useVideo";
import { useVideos } from "../hooks/useVideos";

// Wrapper that fetches the full ExtendedVideo before rendering the edit modal
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

export default function Profile() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: videos, isLoading: videosLoading } = useVideos();
  const { data: photos, isLoading: photosLoading } = usePhotos();
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  const isAuthenticated = !!identity;
  const principalStr = identity?.getPrincipal().toString();

  const myVideos =
    videos?.filter((v) => v.uploader.toString() === principalStr) ?? [];

  const myPhotos =
    photos?.filter((p) => p.uploader.toString() === principalStr) ?? [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-muted">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-center text-muted-foreground text-sm mb-4">
              Sign in to view your profile, manage your content, and track your
              earnings.
            </p>
            <Button className="w-full" onClick={() => navigate({ to: "/" })}>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate({ to: "/" })}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 rounded-full bg-primary/10">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div>
            {profileLoading ? (
              <>
                <Skeleton className="h-6 w-32 mb-1" />
                <Skeleton className="h-4 w-48" />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-foreground">
                  {userProfile?.name ?? "My Profile"}
                </h1>
                {userProfile?.channelName && (
                  <p className="text-muted-foreground">
                    @{userProfile.channelName}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="videos">
          <TabsList className="mb-6">
            <TabsTrigger value="videos">Videos ({myVideos.length})</TabsTrigger>
            <TabsTrigger value="photos">Photos ({myPhotos.length})</TabsTrigger>
            <TabsTrigger value="ad-revenue">
              <DollarSign className="w-4 h-4 mr-1" />
              Ad Revenue
            </TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">My Videos</h2>
              <Button
                size="sm"
                onClick={() => navigate({ to: "/upload-video" })}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </div>
            {videosLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : myVideos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Upload className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No videos uploaded yet.</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => navigate({ to: "/upload-video" })}
                >
                  Upload your first video
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myVideos.map((video) => (
                  <div key={video.id} className="relative group">
                    <VideoCard video={video} />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setEditingVideoId(video.id)}
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <DeleteVideoButton videoId={video.id} variant="outline" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">My Photos</h2>
              <Button
                size="sm"
                onClick={() => navigate({ to: "/upload-photo" })}
              >
                <Image className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
            </div>
            {photosLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-lg" />
                ))}
              </div>
            ) : myPhotos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No photos uploaded yet.</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => navigate({ to: "/upload-photo" })}
                >
                  Upload your first photo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {myPhotos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Ad Revenue Tab */}
          <TabsContent value="ad-revenue">
            <AdRevenueDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* Video Edit Modal — fetches full ExtendedVideo before rendering */}
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
