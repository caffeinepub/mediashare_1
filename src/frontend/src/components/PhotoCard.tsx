import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import type { Photo } from '../backend';
import { ChannelNameDisplay } from './ChannelNameDisplay';

interface PhotoCardProps {
  photo: {
    id: string;
    data: Photo;
  };
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const navigate = useNavigate();
  const uploadDate = new Date(Number(photo.data.uploadTime) / 1000000);
  const photoUrl = photo.data.file.getDirectURL();

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden hover:border-chart-2"
      onClick={() => navigate({ to: '/photo/$id', params: { id: photo.id } })}
    >
      <div className="aspect-square bg-muted relative overflow-hidden">
        <img
          src={photoUrl}
          alt={photo.data.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold line-clamp-2 group-hover:text-chart-2 transition-colors">
          {photo.data.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate font-medium">
            <ChannelNameDisplay principal={photo.data.uploader} />
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>{uploadDate.toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
