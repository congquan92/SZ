import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/helper";
import { OrderAPI } from "@/api/order.api";
import { VoucherAPI } from "@/api/voucher.api";
import { AddressAPI } from "@/api/address.api";
import { PaymentAPI } from "@/api/payment.api";
import { toast } from "sonner";
import { ShoppingCart, MapPin } from "lucide-react";
import type { OrderItem, VoucherIF, Address } from "@/page/type";
import { useNavigate, Link } from "react-router-dom";

export default function ReorderDialog({ order }: { order: OrderItem }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState<VoucherIF[]>([]);
    const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
    const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "MOMO">("CASH");
    const navigate = useNavigate();

    // Load vouchers và addresses khi mở dialog
    useEffect(() => {
        const fetchData = async () => {
            if (open) {
                try {
                    const [voucherResponse, addressResponse] = await Promise.all([VoucherAPI.getVouchers(), AddressAPI.getAddress()]);
                    setVouchers(voucherResponse.data.data);

                    const loadedAddresses = addressResponse.data.data;
                    setAddresses(loadedAddresses);

                    // Set địa chỉ từ order ban đầu hoặc địa chỉ mặc định
                    const defaultAddr = loadedAddresses.find((a: Address) => a.defaultAddress);
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr.id);
                    }
                } catch (error) {
                    console.error("Failed to fetch data:", error);
                }
            }
        };
        fetchData();
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
        // Validate địa chỉ
        const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
        if (!selectedAddress) {
            toast.error("Vui lòng chọn địa chỉ giao hàng");
            return;
        }

        setLoading(true);
        try {
            // Chuẩn bị dữ liệu orderItems từ đơn hàng cũ
            const orderItems = order.orderItemResponses.map((item) => ({
                quantity: item.quantity,
                productVariantId: item.productVariantResponse.id,
            }));

            // Gọi API tạo đơn hàng mới với địa chỉ đã chọn
            const orderResponse = await OrderAPI.orderAdd(
                selectedAddress.customerName,
                selectedAddress.phoneNumber,
                selectedAddress.ward,
                selectedAddress.wardId,
                selectedAddress.districtId,
                selectedAddress.provinceId,
                selectedAddress.district,
                selectedAddress.province,
                `${selectedAddress.streetAddress}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.province}`,
                orderItems,
                paymentMethod,
                order.note || "",
                selectedVoucher ? Number(selectedVoucher) : null
            );

            // Xử lý theo phương thức thanh toán
            if (paymentMethod === "CASH") {
                // COD - chuyển về trang xác nhận đơn hàng
                toast.success("Đặt lại đơn hàng thành công!");
                setOpen(false);
                navigate("/payment/cash-return", {
                    replace: true,
                    state: { orderId: orderResponse.data },
                });
            } else {
                // Thanh toán online - lấy link thanh toán và redirect
                const paymentResponse = await PaymentAPI.getPaymentMethods(orderResponse.data);
                toast.success("Đang chuyển đến trang thanh toán...");
                setOpen(false);
                window.location.href = paymentResponse.data;
            }
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
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Thông tin giao hàng</h3>
                            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="link" size="sm" className="h-auto p-0">
                                        Thay đổi
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3 py-4">
                                        {addresses.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                                                <p className="text-sm text-muted-foreground mb-3">Chưa có địa chỉ nào</p>
                                                <Link to="/profile?tab=address">
                                                    <Button variant="outline" size="sm">
                                                        Thêm địa chỉ mới
                                                    </Button>
                                                </Link>
                                            </div>
                                        ) : (
                                            <RadioGroup value={selectedAddressId?.toString()} onValueChange={(v) => setSelectedAddressId(Number(v))}>
                                                {addresses.map((addr) => (
                                                    <Label key={addr.id} className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent transition-colors" htmlFor={`addr-${addr.id}`}>
                                                        <RadioGroupItem value={addr.id.toString()} id={`addr-${addr.id}`} className="mt-1" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-medium">{addr.customerName}</p>
                                                                {addr.defaultAddress && (
                                                                    <Badge variant="default" className="text-xs">
                                                                        Mặc định
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-2">{addr.phoneNumber}</p>
                                                            <p className="text-sm">{addr.streetAddress}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {addr.ward}, {addr.district}, {addr.province}
                                                            </p>
                                                        </div>
                                                    </Label>
                                                ))}
                                            </RadioGroup>
                                        )}
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <Link to="/profile?tab=address">
                                            <Button variant="outline" size="sm">
                                                Quản lý địa chỉ
                                            </Button>
                                        </Link>
                                        <Button onClick={() => setIsAddressDialogOpen(false)}>Xác nhận</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        {selectedAddressId ? (
                            (() => {
                                const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
                                return selectedAddress ? (
                                    <div className="p-3 bg-muted/30 rounded-lg space-y-1 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{selectedAddress.customerName}</span>
                                            <span>•</span>
                                            <span>{selectedAddress.phoneNumber}</span>
                                            {selectedAddress.defaultAddress && (
                                                <Badge variant="default" className="text-xs">
                                                    Mặc định
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="text-muted-foreground">
                                            {selectedAddress.streetAddress}, {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                                        </div>
                                    </div>
                                ) : null;
                            })()
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center border rounded-lg">
                                <MapPin className="h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground mb-3">Chưa chọn địa chỉ giao hàng</p>
                                <Button variant="outline" size="sm" onClick={() => setIsAddressDialogOpen(true)}>
                                    Chọn địa chỉ
                                </Button>
                            </div>
                        )}
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

                    {/* Phương thức thanh toán */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Phương thức thanh toán</h3>
                        <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "CASH" | "BANK_TRANSFER" | "MOMO")} className="grid gap-2">
                            <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors">
                                <RadioGroupItem value="CASH" id="reorder-pay-cash" />
                                <span className="text-sm">Thanh toán khi nhận hàng (COD)</span>
                            </Label>
                            <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors">
                                <RadioGroupItem value="BANK_TRANSFER" id="reorder-pay-bank" />
                                <span className="text-sm">VNPay (QR/Thẻ)</span>
                            </Label>
                            <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors">
                                <RadioGroupItem value="MOMO" id="reorder-pay-momo" />
                                <span className="text-sm">MoMo</span>
                            </Label>
                        </RadioGroup>
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
                        {loading ? "Đang xử lý..." : paymentMethod === "CASH" ? "Đặt hàng" : "Thanh toán"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
