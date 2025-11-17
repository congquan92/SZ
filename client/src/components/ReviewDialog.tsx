import { ReviewAPI } from "@/api/review.api";
import { UploadImgAPI } from "@/api/uploadImg.api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Star, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function ReviewDialog({ orderItemId, productName, productImage }: { orderItemId: number; productName: string; productImage: string }) {
    const [open, setOpen] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [localFiles, setLocalFiles] = useState<File[]>([]); // Lưu file tạm
    const [localPreviews, setLocalPreviews] = useState<string[]>([]); // Preview URL từ local
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Validate số lượng ảnh/video (max 5 files)
        if (localFiles.length + files.length > 5) {
            toast.error("Chỉ được tải lên tối đa 5 ảnh/video");
            return;
        }

        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        Array.from(files).forEach((file) => {
            // Validate file type (image or video)
            const isImage = file.type.startsWith("image/");
            const isVideo = file.type.startsWith("video/");

            if (!isImage && !isVideo) {
                toast.error(`${file.name} không phải là file ảnh hoặc video hợp lệ`);
                return;
            }

            // Validate file size (max 10MB for images, 50MB for videos)
            const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error(`${file.name} vượt quá ${isVideo ? "50MB" : "10MB"}`);
                return;
            }

            // Tạo preview URL từ file local
            const previewUrl = URL.createObjectURL(file);
            validFiles.push(file);
            newPreviews.push(previewUrl);
        });

        if (validFiles.length > 0) {
            setLocalFiles((prev) => [...prev, ...validFiles]);
            setLocalPreviews((prev) => [...prev, ...newPreviews]);
            toast.success(`Đã chọn ${validFiles.length} file`);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (index: number) => {
        // Revoke preview URL để tránh memory leak
        URL.revokeObjectURL(localPreviews[index]);
        setLocalFiles((prev) => prev.filter((_, i) => i !== index));
        setLocalPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!comment.trim()) {
            toast.error("Vui lòng nhập nội dung đánh giá");
            return;
        }

        try {
            setIsSubmitting(true);

            // Upload các file lên server
            let uploadedUrls: string[] = [];
            if (localFiles.length > 0) {
                const uploadPromises = localFiles.map(async (file) => {
                    try {
                        const response = await UploadImgAPI.uploadImg(file);
                        if (response.data && response.data.length > 0) {
                            return response.data[0];
                        }
                        return null;
                    } catch (error) {
                        console.error(`Failed to upload ${file.name}:`, error);
                        return null;
                    }
                });

                const results = await Promise.all(uploadPromises);
                uploadedUrls = results.filter((url): url is string => url !== null);
            }

            // Gửi đánh giá với URL đã upload
            await ReviewAPI.addReview(orderItemId, rating, comment, uploadedUrls);
            toast.success("Đã gửi đánh giá thành công!");

            // Clean up preview URLs
            localPreviews.forEach((url) => URL.revokeObjectURL(url));

            setOpen(false);
            // Reset form
            setRating(5);
            setComment("");
            setLocalFiles([]);
            setLocalPreviews([]);
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
                        <label className="text-sm font-medium">Hình ảnh/Video ({localFiles.length}/5)</label>

                        {/* Preview local images/videos */}
                        {localPreviews.length > 0 && (
                            <div className="grid grid-cols-5 gap-2">
                                {localPreviews.map((url, index) => {
                                    const file = localFiles[index];
                                    const isVideo = file.type.startsWith("video/");
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
                        <Button variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting || localFiles.length >= 5} type="button">
                            <Camera className="mr-2 h-4 w-4" />
                            Thêm ảnh/video
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
