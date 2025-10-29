import { Star } from "lucide-react";
export function renderStars(avgRating: string | number) {
    const rating = parseFloat(avgRating as string);
    const fullStars = Math.floor(rating); // số sao đầy
    const hasHalfStar = rating % 1 >= 0.5; // có nửa sao không
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400 w-4 h-4" />
            ))}
            {hasHalfStar && <Star className="fill-yellow-400 text-yellow-400 w-4 h-4 opacity-50" />}
            {[...Array(emptyStars)].map((_, i) => (
                <Star key={`empty-${i}`} className="text-gray-300 w-4 h-4" />
            ))}
        </div>
    );
}
