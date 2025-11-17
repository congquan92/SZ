import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import type { Review } from "./types";
import { renderStars } from "@/lib/helper.tsx";
import { Star } from "lucide-react";

interface ProductReviewsProps {
    avgRating: number;
    allReviews: Review[];
    totalReviews: number;
    ratingStats: { rating: number; totalReview: number }[];
    selectedRatingFilter: number | null;
    onRatingFilterChange: (rating: number | null) => void;
    myReviews: Review[];
    user: { id: number } | null;
    currentPage: number;
    totalPages: number;
    isLoadingMore: boolean;
    onLoadMore: () => void;
    onEditReview: (review: Review) => void;
    onMediaClick: (url: string, isVideo: boolean) => void;
}

export default function ProductReviews({
    avgRating,
    allReviews,
    totalReviews,
    ratingStats,
    selectedRatingFilter,
    onRatingFilterChange,
    myReviews,
    user,
    currentPage,
    totalPages,
    isLoadingMore,
    onLoadMore,
    onEditReview,
    onMediaClick,
}: ProductReviewsProps) {
    return (
        <div className="space-y-6">
            {/* Tổng quan đánh giá */}
            <div className="bg-muted/30 rounded-lg p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="text-center">
                        <div className="text-5xl font-bold">{avgRating.toFixed(1)}</div>
                        <div className="flex justify-center mt-2">{renderStars(avgRating)}</div>
                        <div className="text-sm text-muted-foreground mt-1">{totalReviews} đánh giá</div>
                    </div>
                    <Separator orientation="vertical" className="h-24 hidden md:block" />
                    <div className="flex-1 w-full space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            // Lấy số lượng từ API ratingStats
                            const statItem = ratingStats.find((stat) => stat.rating === star);
                            const count = statItem?.totalReview || 0;
                            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-sm w-12">{star} sao</span>
                                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-500 transition-all" style={{ width: `${percentage}%` }} />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bộ lọc theo sao - giống Shopee */}
            <div className="border-t border-b py-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium mr-2">Lọc theo:</span>
                    <Button variant={selectedRatingFilter === null ? "default" : "outline"} size="sm" onClick={() => onRatingFilterChange(null)} className="h-8">
                        Tất cả
                    </Button>
                    {[5, 4, 3, 2, 1].map((star) => {
                        const statItem = ratingStats.find((stat) => stat.rating === star);
                        const count = statItem?.totalReview || 0;
                        const isSelected = selectedRatingFilter === star;

                        return (
                            <Button key={star} variant={isSelected ? "default" : "outline"} size="sm" onClick={() => onRatingFilterChange(star)} disabled={count === 0} className="h-8">
                                {star} <Star className="w-3 h-3 ml-1 fill-current" /> ({count})
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Danh sách đánh giá & bình luận */}
            <div>
                <h4 className="font-medium mb-4">Đánh giá từ khách hàng ({allReviews?.length || 0})</h4>
                {allReviews && allReviews.length > 0 ? (
                    <div className="space-y-4">
                        {allReviews.map((review) => {
                            try {
                                const reviewDate = review.createdDate
                                    ? new Date(review.createdDate).toLocaleDateString("vi-VN", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      })
                                    : "Không rõ ngày";

                                const userName = review.userResponse?.fullName || review.fullName || "Người dùng";
                                const userAvatar = review.userResponse?.avatar || review.avatarUser || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userResponse?.id || review.id}`;

                                // Kiểm tra xem review này có phải của user đang đăng nhập không
                                const isMyReview = user && myReviews.some((mr) => mr.id === review.id);
                                return (
                                    <div key={review.id} className={`border rounded-lg p-4 ${isMyReview ? "bg-blue-50/50 border-blue-200" : ""}`}>
                                        <div className="flex items-start gap-3">
                                            <Avatar>
                                                <AvatarImage src={userAvatar} />
                                                <AvatarFallback>{userName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-medium">{userName}</div>
                                                            {isMyReview && (
                                                                <Badge variant="default" className="text-xs bg-blue-600">
                                                                    Đánh giá của bạn
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {renderStars(review.rating || 0)}
                                                            <span className="text-xs text-muted-foreground">{reviewDate}</span>
                                                        </div>
                                                    </div>
                                                    {review.status && (
                                                        <Badge variant={review.status === "APPROVED" ? "default" : "secondary"} className="text-xs">
                                                            {review.status}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-2">{review.comment || "Không có bình luận"}</p>
                                                {/* Hình ảnh/Video review */}
                                                {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                                                    <div className="flex gap-2 mt-3 flex-wrap">
                                                        {review.images.map((img) => {
                                                            const isVideo = img.url.includes(".mp4") || img.url.includes(".mov") || img.url.includes(".avi") || img.url.includes(".webm");
                                                            return (
                                                                <div key={img.id} className="relative cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onMediaClick(img.url, isVideo)}>
                                                                    {isVideo ? (
                                                                        <video src={img.url} className="w-32 h-32 object-cover rounded-md border" />
                                                                    ) : (
                                                                        <img src={img.url} alt="Review" className="w-32 h-32 object-cover rounded-md border" loading="lazy" />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {isMyReview && (
                                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700" onClick={() => onEditReview(review)}>
                                                        Chỉnh sửa
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            } catch (err) {
                                console.error("Error rendering review:", err, review);
                                return null;
                            }
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                        <p className="text-sm mt-2">Hãy là người đầu tiên đánh giá sản phẩm!</p>
                    </div>
                )}
            </div>

            {allReviews && allReviews.length > 0 && currentPage < totalPages && (
                <div className="text-center">
                    <Button variant="outline" onClick={onLoadMore} disabled={isLoadingMore}>
                        {isLoadingMore ? "Đang tải..." : "Xem thêm đánh giá"}
                    </Button>
                </div>
            )}
        </div>
    );
}
