import { Star } from "lucide-react";
import { useAverageRating } from "../hooks/useAverageRating";
import { useTotalRatings } from "../hooks/useTotalRatings";

interface VideoRatingDisplayProps {
  videoId: string;
}

export function VideoRatingDisplay({ videoId }: VideoRatingDisplayProps) {
  const { data: averageRating, isLoading: loadingAverage } =
    useAverageRating(videoId);
  const { data: totalRatings, isLoading: loadingTotal } =
    useTotalRatings(videoId);

  if (loadingAverage || loadingTotal) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="h-4 w-4 fill-muted stroke-muted" />
          ))}
        </div>
        <span>Loading...</span>
      </div>
    );
  }

  const rating = averageRating || 0;
  const count = totalRatings || 0;

  // Calculate full, half, and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }, (_, i) => i).map((i) => (
          <Star
            key={`full-star-${i}`}
            className="h-4 w-4 fill-yellow-500 stroke-yellow-500"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className="h-4 w-4 fill-muted stroke-yellow-500" />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: "50%" }}
            >
              <Star className="h-4 w-4 fill-yellow-500 stroke-yellow-500" />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => i).map((i) => (
          <Star
            key={`empty-star-${i}`}
            className="h-4 w-4 fill-muted stroke-yellow-500"
          />
        ))}
      </div>

      <span className="text-sm text-muted-foreground">
        {count === 0 ? (
          "No ratings yet"
        ) : (
          <>
            {rating.toFixed(1)} stars ({count}{" "}
            {count === 1 ? "rating" : "ratings"})
          </>
        )}
      </span>
    </div>
  );
}
