import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetUserRating } from "../hooks/useGetUserRating";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRateVideo } from "../hooks/useRateVideo";

interface VideoRatingProps {
  videoId: string;
}

export function VideoRating({ videoId }: VideoRatingProps) {
  const { identity } = useInternetIdentity();
  const { data: userRating, isLoading: loadingUserRating } =
    useGetUserRating(videoId);
  const { mutate: rateVideo, isPending } = useRateVideo(videoId);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleStarClick = (stars: number) => {
    if (!identity) {
      toast.error("Please sign in to rate videos");
      return;
    }
    rateVideo(stars);
  };

  const displayRating = hoveredStar !== null ? hoveredStar : (userRating ?? 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-foreground">
        {userRating ? "Your rating:" : "Rate this video:"}
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isDisabled = isPending || loadingUserRating;

          return (
            <button
              type="button"
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              disabled={isDisabled}
              className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              <Star
                className={`h-7 w-7 transition-colors ${
                  isFilled
                    ? "fill-yellow-500 stroke-yellow-500"
                    : "fill-muted stroke-yellow-400 hover:fill-yellow-200"
                }`}
              />
            </button>
          );
        })}
      </div>
      {userRating != null && (
        <p className="text-xs text-muted-foreground">
          You rated this {userRating} star{userRating !== 1 ? "s" : ""}. Click
          to change.
        </p>
      )}
    </div>
  );
}
