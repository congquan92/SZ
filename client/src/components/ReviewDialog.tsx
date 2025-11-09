import { ReviewAPI } from "@/api/review.api";
import { UploadImgAPI } from "@/api/uploadImg.api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Star, X, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function ReviewDialog({ orderItemId, productName, productImage }: { orderItemId: number; productName: string; productImage: string }) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Validate số lượng ảnh/video (max 5 files)
        if (images.length + files.length > 5) {
            toast.error("Chỉ được tải lên tối đa 5 ảnh/video");
            return;
        }

        setIsUploading(true);
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                // Validate file type (image or video)
                const isImage = file.type.startsWith("image/");
                const isVideo = file.type.startsWith("video/");

                if (!isImage && !isVideo) {
                    toast.error(`${file.name} không phải là file ảnh hoặc video hợp lệ`);
                    return null;
                }

                // Validate file size (max 10MB for images, 50MB for videos)
                const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
                if (file.size > maxSize) {
                    toast.error(`${file.name} vượt quá ${isVideo ? "50MB" : "10MB"}`);
                    return null;
                }

                // Upload
                const response = await UploadImgAPI.uploadImg(file);
                if (response.data && response.data.length > 0) {
                    return response.data[0];
                }
                return null;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            const validUrls = uploadedUrls.filter((url): url is string => url !== null);

            if (validUrls.length > 0) {
                setImages((prev) => [...prev, ...validUrls]);
                toast.success(`Đã tải lên ${validUrls.length} file`);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            toast.error("Upload thất bại. Vui lòng thử lại.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!comment.trim()) {
            toast.error("Vui lòng nhập nội dung đánh giá");
            return;
        }

        try {
            setIsSubmitting(true);
            await ReviewAPI.addReview(orderItemId, rating, comment, images);
            toast.success("Đã gửi đánh giá thành công!");
            setOpen(false);
            // Reset form
            setRating(5);
            setComment("");
            setImages([]);
        } catch (error) {
            console.error("Failed to add review:", error);
            toast.error("Gửi đánh giá thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                    Đánh giá
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Đánh giá sản phẩm</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Product info */}
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <img src={productImage} alt={productName} className="size-16 object-cover rounded-md border" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium line-clamp-2">{productName}</div>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Đánh giá của bạn</label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button" onClick={() => setRating(star)} className="hover:scale-110 transition-transform">
                                    <Star className={`w-7 h-7 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-muted-foreground">({rating} sao)</span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nhận xét của bạn</label>
                        <Textarea placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..." className="min-h-[120px]" value={comment} onChange={(e) => setComment(e.target.value)} />
                    </div>

                    {/* Images/Videos upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Hình ảnh/Video ({images.length}/5)</label>

                        {/* Preview uploaded images/videos */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-5 gap-2">
                                {images.map((url, index) => {
                                    const isVideo = url.includes(".mp4") || url.includes(".mov") || url.includes(".avi") || url.includes(".webm");
                                    return (
                                        <div key={index} className="relative group">
                                            {isVideo ? (
                                                <video src={url} className="w-full aspect-square object-cover rounded-md border" controls />
                                            ) : (
                                                <img src={url} alt={`Review ${index + 1}`} className="w-full aspect-square object-cover rounded-md border" />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={isSubmitting}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Upload button */}
                        <Button variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting || isUploading || images.length >= 5} type="button">
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tải lên...
                                </>
                            ) : (
                                <>
                                    <Camera className="mr-2 h-4 w-4" />
                                    Thêm ảnh/video
                                </>
                            )}
                        </Button>

                        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleImageChange} />
                        <p className="text-xs text-muted-foreground">Hỗ trợ ảnh (max 10MB) và video (max 50MB)</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
