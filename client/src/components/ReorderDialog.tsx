import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatVND } from "@/lib/helper";
import { OrderAPI } from "@/api/order.api";
import { VoucherAPI } from "@/api/voucher.api";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import type { OrderItem, VoucherIF } from "@/page/type";
import { useNavigate } from "react-router-dom";

export default function ReorderDialog({ order }: { order: OrderItem }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState<VoucherIF[]>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
    const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
    const navigate = useNavigate();

    // Load vouchers khi mở dialog
    useEffect(() => {
        const fetchVouchers = async () => {
            if (open) {
                try {
                    const response = await VoucherAPI.getVouchers();
                    setVouchers(response.data.data);
                } catch (error) {
                    console.error("Failed to fetch vouchers:", error);
                }
            }
        };
        fetchVouchers();
    }, [open]);

    // Tính giá trị voucher
    useEffect(() => {
        const selectedVoucherData = vouchers.find((v) => v.id === Number(selectedVoucher));
        if (selectedVoucherData) {
            if (selectedVoucherData.type === "FIXED_AMOUNT" && selectedVoucherData.minDiscountValue <= order.originalOrderAmount) {
                setVoucherDiscount(selectedVoucherData.discountValue);
            } else if (selectedVoucherData.type === "PERCENTAGE") {
                const discount = (order.originalOrderAmount * selectedVoucherData.discountValue) / 100;
                if (selectedVoucherData.maxDiscountValue) {
                    setVoucherDiscount(Math.min(discount, selectedVoucherData.maxDiscountValue));
                } else {
                    setVoucherDiscount(discount);
                }
            } else {
                setVoucherDiscount(0);
            }
        } else {
            setVoucherDiscount(0);
        }
    }, [selectedVoucher, vouchers, order.originalOrderAmount]);

    // Tổng tiền sau khi áp dụng voucher
    const finalTotal = Math.max(0, order.originalOrderAmount + order.totalFeeShip - voucherDiscount);

    const handleReorder = async () => {
        setLoading(true);
        try {
            // Chuẩn bị dữ liệu orderItems từ đơn hàng cũ
            const orderItems = order.orderItemResponses.map((item) => ({
                quantity: item.quantity,
                productVariantId: item.productVariantResponse.id,
            }));

            // Gọi API tạo đơn hàng mới với thông tin từ đơn cũ
            await OrderAPI.orderAdd(
                order.customerName,
                order.customerPhone,
                order.deliveryWardName,
                order.deliveryWardCode,
                order.deliveryDistrictId,
                order.deliveryProvinceId,
                order.deliveryDistrictName,
                order.deliveryProvinceName,
                order.deliveryAddress,
                orderItems,
                order.paymentType,
                order.note || "",
                selectedVoucher ? Number(selectedVoucher) : null
            );

            toast.success("Đặt lại đơn hàng thành công!");
            setOpen(false);

            // Chuyển đến trang đơn hàng để xem đơn mới
            setTimeout(() => {
                navigate("/order");
                window.location.reload(); // Reload để cập nhật danh sách đơn hàng
            }, 500);
        } catch (error) {
            console.error("Reorder failed:", error);
            toast.error("Đặt lại đơn hàng thất bại. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Mua lại
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-fit max-w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Xác nhận mua lại đơn hàng
                    </DialogTitle>
                    <DialogDescription>Bạn có chắc chắn muốn đặt lại đơn hàng này? Đơn hàng mới sẽ sử dụng cùng thông tin giao hàng và sản phẩm.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Thông tin giao hàng */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Thông tin giao hàng</h3>
                        <div className="p-3 bg-muted/30 rounded-lg space-y-1 text-sm">
                            <div>
                                <span className="font-medium">{order.customerName}</span> • {order.customerPhone}
                            </div>
                            <div className="text-muted-foreground">
                                {order.deliveryAddress}, {order.deliveryProvinceName}
                            </div>
                        </div>
                    </div>

                    {/* Sản phẩm */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Sản phẩm ({order.orderItemResponses.length})</h3>
                        <div className="border rounded-lg divide-y">
                            {order.orderItemResponses.map((item) => (
                                <div key={item.orderItemId} className="p-3">
                                    <div className="flex gap-3">
                                        <img src={item.urlImageSnapShot} alt={item.nameProductSnapShot} className="size-16 object-cover rounded-md border bg-white flex-shrink-0" />
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

                    {/* Voucher */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Ưu đãi dành cho bạn</h3>
                        {vouchers.length > 0 ? (
                            <div className="relative">
                                <RadioGroup value={selectedVoucher || ""} onValueChange={setSelectedVoucher} className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
                                    {vouchers.map((v: VoucherIF) => (
                                        <label key={v.id} className="min-w-[280px] max-w-[280px] cursor-pointer snap-start shrink-0">
                                            <Card className={`relative border-2 transition-colors ${selectedVoucher === v.id.toString() ? "border-primary" : "border-muted"}`}>
                                                <div className="p-4 flex gap-3 items-start">
                                                    <RadioGroupItem value={v.id.toString()} className="mt-1" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium">{v.discription}</div>
                                                        <div className="text-xs text-muted-foreground mt-1">HSD: {new Date(v.endDate).toLocaleDateString("vi-VN")}</div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </label>
                                    ))}
                                </RadioGroup>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">Không có voucher khả dụng</div>
                        )}
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
                            {voucherDiscount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Giảm giá voucher:</span>
                                    <span className="font-medium text-rose-600">- {formatVND(voucherDiscount)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between text-base">
                                <span className="font-semibold">Thành tiền:</span>
                                <span className="font-bold text-lg text-primary">{formatVND(finalTotal)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Lưu ý:</strong> Phí vận chuyển và giá sản phẩm có thể thay đổi theo thời điểm đặt hàng.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Hủy
                    </Button>
                    <Button onClick={handleReorder} disabled={loading}>
                        {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
