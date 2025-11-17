import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Star, X, Upload, Loader2 } from "lucide-react";
import type { Review } from "./types";
import { ReviewAPI } from "@/api/review.api";
import { UploadImgAPI } from "@/api/uploadImg.api";
import { toast } from "sonner";

interface EditReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    review: Review | null;
    onSuccess: () => void;
}

export default function EditReviewDialog({ isOpen, onClose, review, onSuccess }: EditReviewDialogProps) {
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState<string>("");
    const [existingImages, setExistingImages] = useState<{ id: number; url: string }[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Load dữ liệu review khi mở dialog
    useEffect(() => {
        if (review && isOpen) {
            setRating(review.rating || 5);
            setComment(review.comment || "");
            setExistingImages(review.images || []);
            setNewImages([]);
            setNewImagePreviews([]);
            setImagesToDelete([]);
        }
    }, [review, isOpen]);

    // Render sao đánh giá
    const renderEditableStars = () => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="transition-all hover:scale-110">
                        <Star className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                    </button>
                ))}
            </div>
        );
    };

    // Xử lý chọn ảnh mới
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Giới hạn tổng số ảnh (existing + new) <= 5
        const totalImages = existingImages.length - imagesToDelete.length + newImages.length + files.length;
        if (totalImages > 5) {
            toast.error("Tối đa 5 ảnh cho mỗi đánh giá");
            return;
        }

        // Tạo preview cho ảnh mới
        const newPreviews: string[] = [];
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === files.length) {
                    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setNewImages([...newImages, ...files]);
    };

    // Xóa ảnh cũ (đánh dấu để xóa)
    const handleDeleteExistingImage = (imageId: number) => {
        setImagesToDelete([...imagesToDelete, imageId]);
    };

    // Hoàn tác xóa ảnh cũ
    const handleUndoDeleteExistingImage = (imageId: number) => {
        setImagesToDelete(imagesToDelete.filter((id) => id !== imageId));
    };

    // Xóa ảnh mới (chưa upload)
    const handleDeleteNewImage = (index: number) => {
        setNewImages(newImages.filter((_, i) => i !== index));
        setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
    };

    // Submit form
    const handleSubmit = async () => {
        if (!review) return;

        if (!comment.trim()) {
            toast.error("Vui lòng nhập nội dung đánh giá");
            return;
        }

        setIsSubmitting(true);

        try {
            const reviewId = typeof review.id === "string" ? parseInt(review.id) : review.id;

            // 1. Cập nhật rating và comment
            await ReviewAPI.updateReview(reviewId, rating, comment.trim());

            // 2. Xóa ảnh cũ nếu có
            if (imagesToDelete.length > 0) {
                await ReviewAPI.deleteImgReview(imagesToDelete);
            }

            // 3. Upload và thêm ảnh mới nếu có
            if (newImages.length > 0) {
                setIsUploading(true);
                const uploadPromises = newImages.map((file) => UploadImgAPI.uploadImg(file));
                const uploadResults = await Promise.all(uploadPromises);
                const newImageUrls = uploadResults.map((result: { data: string }) => result.data);

                await ReviewAPI.addImgReview(reviewId, newImageUrls);
                setIsUploading(false);
            }

            toast.success("Cập nhật đánh giá thành công");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating review:", error);
            toast.error("Cập nhật đánh giá thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    // Reset form khi đóng
    const handleClose = () => {
        setRating(5);
        setComment("");
        setExistingImages([]);
        setNewImages([]);
        setNewImagePreviews([]);
        setImagesToDelete([]);
        onClose();
    };

    if (!review) return null;

    const totalCurrentImages = existingImages.length - imagesToDelete.length + newImages.length;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Chỉnh sửa đánh giá</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Đánh giá sao */}
                    <div className="space-y-2">
                        <Label>Đánh giá của bạn</Label>
                        {renderEditableStars()}
                    </div>

                    {/* Nội dung đánh giá */}
                    <div className="space-y-2">
                        <Label htmlFor="comment">Nội dung đánh giá</Label>
                        <Textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..." rows={5} className="resize-none" />
                    </div>

                    {/* Hình ảnh */}
                    <div className="space-y-2">
                        <Label>Hình ảnh ({totalCurrentImages}/5)</Label>

                        {/* Ảnh hiện có */}
                        {existingImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {existingImages.map((img) => {
                                    const isMarkedForDelete = imagesToDelete.includes(img.id);
                                    return (
                                        <div key={img.id} className={`relative group ${isMarkedForDelete ? "opacity-50" : ""}`}>
                                            <img src={img.url} alt="Review" className="w-24 h-24 object-cover rounded-md border" />
                                            {isMarkedForDelete ? (
                                                <button type="button" onClick={() => handleUndoDeleteExistingImage(img.id)} className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md text-white text-xs">
                                                    Hoàn tác
                                                </button>
                                            ) : (
                                                <button type="button" onClick={() => handleDeleteExistingImage(img.id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Ảnh mới chưa upload */}
                        {newImagePreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {newImagePreviews.map((preview, index) => (
                                    <div key={`new-${index}`} className="relative group">
                                        <img src={preview} alt="New" className="w-24 h-24 object-cover rounded-md border border-blue-500" />
                                        <button type="button" onClick={() => handleDeleteNewImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1 rounded">Mới</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Button thêm ảnh */}
                        {totalCurrentImages < 5 && (
                            <div>
                                <input type="file" id="image-upload" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                                <label htmlFor="image-upload">
                                    <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => document.getElementById("image-upload")?.click()}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Thêm ảnh
                                    </Button>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || isUploading}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {isUploading ? "Đang tải ảnh..." : "Đang cập nhật..."}
                            </>
                        ) : (
                            "Cập nhật"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
