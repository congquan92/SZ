import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/helper";
import { PaymentAPI } from "@/api/payment.api";
import { toast } from "sonner";
import { CreditCard } from "lucide-react";
import type { OrderItem } from "@/page/type";

export default function RepaymentDialog({ order }: { order: OrderItem }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRepayment = async () => {
        setLoading(true);
        try {
            // Gọi API lấy link thanh toán
            const paymentResponse = await PaymentAPI.getPaymentMethods(order.id);
            toast.success("Đang chuyển đến trang thanh toán...");
            setOpen(false);
            window.location.href = paymentResponse.data;
        } catch (error) {
            console.error("Repayment failed:", error);
            toast.error("Không thể thực hiện thanh toán. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Thanh toán lại
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-fit max-w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Xác nhận thanh toán đơn hàng
                    </DialogTitle>
                    <DialogDescription>Vui lòng kiểm tra lại thông tin đơn hàng trước khi thanh toán.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Thông tin giao hàng */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Thông tin giao hàng</h3>
                        <div className="p-3 bg-muted/30 rounded-lg space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{order.customerName}</span>
                                <span>•</span>
                                <span>{order.customerPhone}</span>
                            </div>
                            <div className="text-muted-foreground">{order.deliveryAddress}</div>
                        </div>
                    </div>

                    {/* Sản phẩm */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Sản phẩm ({order.orderItemResponses.length})</h3>
                        <div className="border rounded-lg divide-y">
                            {order.orderItemResponses.map((item) => (
                                <div key={item.orderItemId} className="p-3">
                                    <div className="flex gap-3">
                                        <img src={item.urlImageSnapShot} alt={item.nameProductSnapShot} className="size-16 object-cover rounded-md border bg-white shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium line-clamp-2">{item.nameProductSnapShot}</div>
                                            <div className="text-xs text-muted-foreground mt-1">{item.productVariantResponse.variantAttributes.map((attr) => `${attr.attribute}: ${attr.value}`).join(", ")}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Số lượng: x{item.quantity}</div>
                                        </div>
                                        <div className="text-sm font-semibold shrink-0">{formatVND(item.finalPrice * item.quantity)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Ghi chú */}
                    {order.note && (
                        <div className="space-y-2">
                            <h3 className="font-semibold text-sm">Ghi chú</h3>
                            <div className="p-3 bg-muted/30 rounded-lg text-sm">{order.note}</div>
                        </div>
                    )}

                    {/* Phương thức thanh toán */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Phương thức thanh toán</h3>
                        <div className="p-3 bg-muted/30 rounded-lg text-sm">
                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                                {order.paymentType === "CASH" ? "Thanh toán khi nhận hàng (COD)" : order.paymentType === "BANK_TRANSFER" ? "VNPay (QR/Thẻ)" : "MoMo"}
                            </Badge>
                        </div>
                    </div>

                    {/* Tổng tiền */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Tổng thanh toán</h3>
                        <div className="border rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tổng tiền hàng:</span>
                                <span className="font-medium">{formatVND(order.originalOrderAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Phí vận chuyển:</span>
                                <span className="font-medium">{formatVND(order.totalFeeShip)}</span>
                            </div>
                            {order.discountValue > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Giảm giá voucher:</span>
                                    <span className="font-medium text-rose-600">- {formatVND(order.discountValue)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between text-base">
                                <span className="font-semibold">Thành tiền:</span>
                                <span className="font-bold text-lg text-primary">{formatVND(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800">
                            <strong>Lưu ý:</strong> Bạn sẽ được chuyển đến cổng thanh toán để hoàn tất giao dịch.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button onClick={handleRepayment} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Thanh toán ngay"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
