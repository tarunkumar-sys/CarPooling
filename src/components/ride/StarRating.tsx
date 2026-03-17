export const StarRating = ({ rating, onRate, size = "sm" }: { rating: number, onRate?: (n: number) => void, size?: "sm" | "md" | "lg" }) => {
    const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRate?.(star)}
                    className={`${onRate ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${star <= Math.round(rating) ? 'text-orange-400' : 'text-slate-200'
                        } ${sizes[size]}`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};
