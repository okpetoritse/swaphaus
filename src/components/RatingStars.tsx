export default function RatingStars({
  rating,
  showCount = false,
  count = 0,
}: {
  rating: number;
  showCount?: boolean;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-sm ${
              star <= Math.round(rating) ? "text-brass" : "text-white/20"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-paper-dim ml-1">
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}