import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { ChannelNameDisplay } from './ChannelNameDisplay';
import type { VideoMetadata } from '../backend';

interface VideoCardProps {
  video: VideoMetadata;
}

export function VideoCard({ video }: VideoCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate({ to: '/video/$id', params: { id: video.id } })}
    >
      <CardContent className="p-0">
        <div className="aspect-video bg-muted relative overflow-hidden">
          <img
            src="/assets/generated/video-placeholder.dim_320x180.png"
            alt={video.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ChannelNameDisplay principal={video.uploader} />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{new Date(Number(video.uploadTime) / 1000000).toLocaleDateString()}</span>
            <span>•</span>
            <span>{Number(video.likeCount)} likes</span>
            <span>•</span>
            <span>{Number(video.commentCount)} comments</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
