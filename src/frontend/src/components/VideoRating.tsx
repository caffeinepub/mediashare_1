import { useState } from 'react';
import { Star } from 'lucide-react';
import { useRateVideo } from '../hooks/useRateVideo';
import { useGetUserRating } from '../hooks/useGetUserRating';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { VideoRatingDisplay } from './VideoRatingDisplay';
import { toast } from 'sonner';

interface VideoRatingProps {
  videoId: string;
}

export function VideoRating({ videoId }: VideoRatingProps) {
  const { identity } = useInternetIdentity();
  const { data: userRating, isLoading: loadingUserRating } = useGetUserRating(videoId);
  const { mutate: rateVideo, isPending } = useRateVideo();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleStarClick = (stars: number) => {
    if (!identity) {
      toast.error('Please sign in to rate videos');
      return;
    }
    rateVideo({ videoId, stars });
  };

  const displayRating = hoveredStar !== null ? hoveredStar : (userRating || 0);

  return (
    <div className="space-y-3">
      {/* Average rating display */}
      <VideoRatingDisplay videoId={videoId} />

      {/* Interactive rating stars */}
      <div className="flex flex-col gap-2">
        <div className="text-sm font-medium">
          {userRating ? 'Your rating:' : 'Rate this video:'}
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= displayRating;
            const isDisabled = isPending || loadingUserRating;

            return (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                disabled={isDisabled}
                className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    isFilled
                      ? 'fill-yellow-500 stroke-yellow-500'
                      : 'fill-muted stroke-yellow-500 hover:fill-yellow-200'
                  }`}
                />
              </button>
            );
          })}
        </div>
        {userRating && (
          <p className="text-xs text-muted-foreground">
            You rated this video {userRating} star{userRating !== 1 ? 's' : ''}. Click to change your rating.
          </p>
        )}
      </div>
    </div>
  );
}
