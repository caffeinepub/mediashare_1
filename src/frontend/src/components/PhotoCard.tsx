import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { ChannelNameDisplay } from './ChannelNameDisplay';
import type { PhotoMetadata } from '../backend';

interface PhotoCardProps {
  photo: PhotoMetadata;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate({ to: '/photo/$id', params: { id: photo.id } })}
    >
      <CardContent className="p-0">
        <div className="aspect-square bg-muted relative overflow-hidden">
          <img
            src="/assets/generated/photo-placeholder.dim_320x320.png"
            alt={photo.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{photo.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <ChannelNameDisplay principal={photo.uploader} />
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(Number(photo.uploadTime) / 1000000).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
