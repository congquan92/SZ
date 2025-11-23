import { OrderAPI } from "@/api/order.api";
import { UploadImgAPI } from "@/api/uploadImg.api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, RotateCcw, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { OrderItem } from "@/page/type";

type Props = {
    order: OrderItem;
    onSuccess?: () => void;
};

export default function ReturnDialog({ order, onSuccess }: Props) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [localFiles, setLocalFiles] = useState<File[]>([]);
    const [localPreviews, setLocalPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State để quản lý items cần hoàn trả (orderItemId và quantity)
    const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map());

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (localFiles.length + files.length > 5) {
            toast.error("Chỉ được tải lên tối đa 5 ảnh");
            return;
        }

        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        Array.from(files).forEach((file) => {
            const isImage = file.type.startsWith("image/");

            if (!isImage) {
                toast.error(`${file.name} không phải là file ảnh hợp lệ`);
                return;
            }

            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                toast.error(`${file.name} vượt quá 10MB`);
                return;
            }

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
        URL.revokeObjectURL(localPreviews[index]);
        setLocalFiles((prev) => prev.filter((_, i) => i !== index));
        setLocalPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleToggleItem = (orderItemId: number, maxQuantity: number, checked: boolean) => {
        setSelectedItems((prev) => {
            const newMap = new Map(prev);
            if (checked) {
                newMap.set(orderItemId, maxQuantity); // Mặc định hoàn toàn bộ
            } else {
                newMap.delete(orderItemId);
            }
            return newMap;
        });
    };

    const handleQuantityChange = (orderItemId: number, value: string) => {
        const quantity = parseInt(value) || 0;
        const item = order.orderItemResponses.find((it) => it.orderItemId === orderItemId);
        if (!item) return;

        if (quantity > 0 && quantity <= item.quantity) {
            setSelectedItems((prev) => {
                const newMap = new Map(prev);
                newMap.set(orderItemId, quantity);
                return newMap;
            });
        }
    };

    const handleSubmit = async () => {
        if (!reason.trim()) {
            toast.error("Vui lòng nhập lý do hoàn hàng");
            return;
        }

        if (selectedItems.size === 0) {
            toast.error("Vui lòng chọn ít nhất 1 sản phẩm để hoàn trả");
            return;
        }

        let uploadedUrls: string[] = [];

        try {
            setIsSubmitting(true);

            // Upload các ảnh lên server
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

            // Chuẩn bị items array
            const items = Array.from(selectedItems.entries()).map(([orderItemId, quantity]) => ({
                orderItemId,
                quantity,
            }));

            // Gọi API
            await OrderAPI.returnOrder(order.id, reason, uploadedUrls, items);
            toast.success("Yêu cầu hoàn hàng đã được gửi!");

            // Clean up
            localPreviews.forEach((url) => URL.revokeObjectURL(url));

            if (onSuccess) {
                onSuccess();
            }

            setOpen(false);
            // Reset form
            setReason("");
            setLocalFiles([]);
            setLocalPreviews([]);
            setSelectedItems(new Map());
        } catch (error) {
            console.error("Failed to return order:", error);
            toast.error("Gửi yêu cầu hoàn hàng thất bại. Vui lòng thử lại.");

            // Xóa ảnh đã upload trên cloud nếu gửi yêu cầu thất bại
            if (uploadedUrls.length > 0) {
                try {
                    await UploadImgAPI.deleteImg(uploadedUrls);
                    console.log("Đã xóa ảnh trên cloud sau khi gửi yêu cầu thất bại");
                } catch (deleteError) {
                    console.error("Failed to delete uploaded images:", deleteError);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Hoàn Hàng
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Yêu Cầu Hoàn Hàng - Đơn #{order.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Select items */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Chọn sản phẩm cần hoàn trả</Label>
                        <div className="border rounded-md p-3 space-y-3">
                            {order.orderItemResponses.map((item) => {
                                const isChecked = selectedItems.has(item.orderItemId);
                                const currentQty = selectedItems.get(item.orderItemId) || item.quantity;

                                return (
                                    <div key={item.orderItemId} className="flex items-start gap-3 p-2 border rounded-md">
                                        <input type="checkbox" checked={isChecked} onChange={(e) => handleToggleItem(item.orderItemId, item.quantity, e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300" />
                                        <img src={item.urlImageSnapShot} alt={item.nameProductSnapShot} className="size-16 object-cover rounded-md border shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium line-clamp-2">{item.nameProductSnapShot}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{item.productVariantResponse.variantAttributes.map((attr) => `${attr.attribute}: ${attr.value}`).join(", ")}</div>
                                            <div className="text-xs text-muted-foreground">Số lượng đã mua: {item.quantity}</div>
                                        </div>
                                        {isChecked && (
                                            <div className="shrink-0">
                                                <Label className="text-xs text-muted-foreground">Số lượng hoàn</Label>
                                                <Input type="number" min={1} max={item.quantity} value={currentQty} onChange={(e) => handleQuantityChange(item.orderItemId, e.target.value)} className="w-20 h-8 text-sm" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Lý do hoàn hàng *</Label>
                        <Textarea placeholder="Vui lòng mô tả lý do muốn hoàn hàng (sản phẩm lỗi, không đúng mô tả, không vừa size, v.v.)" className="min-h-[100px]" value={reason} onChange={(e) => setReason(e.target.value)} />
                    </div>

                    {/* Images upload */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Hình ảnh minh chứng ({localFiles.length}/5)</Label>

                        {localPreviews.length > 0 && (
                            <div className="grid grid-cols-5 gap-2">
                                {localPreviews.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img src={url} alt={`Return ${index + 1}`} className="w-full aspect-square object-cover rounded-md border" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            disabled={isSubmitting}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={isSubmitting || localFiles.length >= 5} type="button">
                            <Camera className="mr-2 h-4 w-4" />
                            Thêm ảnh minh chứng
                        </Button>

                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                        <p className="text-xs text-muted-foreground">Hỗ trợ ảnh (max 10MB) để làm bằng chứng cho yêu cầu hoàn hàng</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting ? "Đang gửi..." : "Gửi Yêu Cầu"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
