import { Star } from "lucide-react";
export const Stars = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} size={14} fill={i <= Math.round(rating) ? "#f59e0b" : "none"} stroke="#f59e0b" />
        ))}
    </div>
);