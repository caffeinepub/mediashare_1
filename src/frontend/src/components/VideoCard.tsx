import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Heart, MessageSquare } from 'lucide-react';
import type { Video } from '../backend';
import { ChannelNameDisplay } from './ChannelNameDisplay';

interface VideoCardProps {
  video: {
    id: string;
    data: Video;
  };
}

export function VideoCard({ video }: VideoCardProps) {
  const navigate = useNavigate();
  const uploadDate = new Date(Number(video.data.uploadTime) / 1000000);
  const thumbnailUrl = video.data.file.getDirectURL();

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-chart-1"
      onClick={() => navigate({ to: '/video/$id', params: { id: video.id } })}
    >
      <div className="aspect-video bg-muted relative overflow-hidden">
        <video
          src={thumbnailUrl}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          preload="metadata"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-2 group-hover:text-chart-1 transition-colors">
          {video.data.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate font-medium">
            <ChannelNameDisplay principal={video.data.uploader} />
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{uploadDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              <span>{Number(video.data.likeCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{Number(video.data.commentCount)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
