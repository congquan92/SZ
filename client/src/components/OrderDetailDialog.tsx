import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatVND } from "@/lib/helper";
import { OrderAPI } from "@/api/order.api";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import type { OrderDetailData } from "@/page/type";

const STATUS_HEADER: Record<string, string> = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    PACKED: "Đã đóng gói",
    SHIPPED: "Đang vận chuyển",
    DELIVERED: "Đã giao hàng",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã huỷ",
    REFUNDED: "Đã hoàn tiền",
};

const PAYMENT_TYPE: Record<string, string> = {
    BANK_TRANSFER: "Chuyển khoản",
    CASH: "Tiền mặt",
    QR_CODE: "Mã QR",
};

export default function OrderDetailDialog({ orderId }: { orderId: number }) {
    const [open, setOpen] = useState(false);
    const [orderDetail, setOrderDetail] = useState<OrderDetailData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const response = await OrderAPI.getOrderDetail(orderId);
            setOrderDetail(response.data);
        } catch {
            toast.error("Không thể tải thông tin đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen && !orderDetail) {
            fetchOrderDetail();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="link" size="sm">
                    Xem Chi tiết <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Chi tiết đơn hàng #{orderId}</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="py-8 text-center text-muted-foreground">Đang tải...</div>
                ) : orderDetail ? (
                    <div className="space-y-4">
                        {/* Status & Payment Info */}
                        <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Trạng thái:</span>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {STATUS_HEADER[orderDetail.deliveryStatus] || orderDetail.deliveryStatus}
                                </Badge>
                            </div>
                            <Separator orientation="vertical" className="h-6" />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Thanh toán:</span>
                                <Badge variant="outline" className={orderDetail.paymentStatus === "PAID" ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-amber-200 text-amber-700 bg-amber-50"}>
                                    {orderDetail.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                                </Badge>
                            </div>
                            <Separator orientation="vertical" className="h-6" />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Phương thức:</span>
                                <span className="text-sm font-medium">{PAYMENT_TYPE[orderDetail.paymentType] || orderDetail.paymentType}</span>
                            </div>
                        </div>

                        {/* Tracking Code */}
                        {orderDetail.orderTrackingCode && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <span className="text-sm text-muted-foreground">Mã vận đơn: </span>
                                <span className="text-sm font-semibold text-blue-700">{orderDetail.orderTrackingCode}</span>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Sản phẩm</h3>
                            <div className="border rounded-lg divide-y">
                                {orderDetail.orderItemResponses.map((item) => (
                                    <div key={item.orderItemId} className="p-4">
                                        <div className="flex gap-4">
                                            <img src={item.urlImageSnapShot} alt={item.nameProductSnapShot} className="size-20 object-cover rounded-md border bg-white flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium line-clamp-2">{item.nameProductSnapShot}</div>
                                                <div className="text-sm text-muted-foreground mt-1 space-y-1">
                                                    {item.productVariantResponse.sku && <div>SKU: {item.productVariantResponse.sku}</div>}
                                                    <div>{item.productVariantResponse.variantAttributes.map((attr) => `${attr.attribute}: ${attr.value}`).join(", ")}</div>
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        <span>Giá: {formatVND(item.listPriceSnapShot)}</span>
                                                        <span>x {item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="font-semibold">{formatVND(item.finalPrice * item.quantity)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Note */}
                        {orderDetail.note && (
                            <div className="space-y-2">
                                <h3 className="font-semibold">Ghi chú</h3>
                                <div className="p-3 bg-muted/30 rounded-lg text-sm">{orderDetail.note}</div>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Tổng thanh toán</h3>
                            <div className="border rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tổng tiền hàng:</span>
                                    <span className="font-medium">{formatVND(orderDetail.originalOrderAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Phí vận chuyển:</span>
                                    <span className="font-medium">{formatVND(orderDetail.totalFeeShip)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Giảm giá:</span>
                                    <span className="font-medium text-rose-600">- {formatVND(orderDetail.discountValue)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-base">
                                    <span className="font-semibold">Thành tiền:</span>
                                    <span className="font-bold text-lg text-primary">{formatVND(orderDetail.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-muted-foreground">Không có dữ liệu</div>
                )}
            </DialogContent>
        </Dialog>
    );
}
