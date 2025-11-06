import { AddressAPI } from "@/api/address.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatVND } from "@/lib/helper";
import type { Address, VoucherIF, ShippingData, CartProduct } from "@/page/type";
import { Home, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStores";
import { useCartStore } from "@/stores/useCartStore";
import { VoucherAPI } from "@/api/voucher.api";
import { OrderAPI } from "@/api/order.api";
import { PaymentAPI } from "@/api/payment.api";
import { ShippingAPI } from "@/api/shipping.api";

export default function Payment() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Lấy cart items
    const { cartItems, fetchCart, clearCart, cartCount, removeItem } = useCartStore();

    // Address
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

    // Payment & voucher
    const [payment, setPayment] = useState<"CASH" | "BANK_TRANSFER" | "MOMO">("CASH");

    // Voucher
    const [voucher, setVoucher] = useState<VoucherIF[]>([]);
    const [totalVoucher, setTotalVoucher] = useState<number>(0);
    const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);

    // shipping
    const [shippingData, setShippingData] = useState<ShippingData | null>(null);
    const [shippingFee, setShippingFee] = useState<number>(0); // Phí vận chuyển

    const [note, setNote] = useState("");

    const [orderItems, setOrderItems] = useState<Array<{ quantity: number; productVariantId: number }>>([]);

    // Khởi tạo dữ liệu addresses, voucher và cart
    const init = async () => {
        try {
            setLoading(true);

            // Load cart nếu chưa có
            if (cartItems.length === 0) {
                await fetchCart();
            }

            // Load addresses và vouchers song song
            const [addressResponse, voucherResponse] = await Promise.all([AddressAPI.getAddress(), VoucherAPI.getVouchers()]);

            setVoucher(voucherResponse.data.data);
            console.log("Voucher available:", voucherResponse.data);

            const loadedAddresses = addressResponse.data.data;
            setAddresses(loadedAddresses);

            // Set default address
            const defaultAddr = loadedAddresses.find((a: Address) => a.defaultAddress);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Không thể tải thông tin");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        init();
    }, [user]);

    // tính giá trị cần thiết cho phí vận chuyển
    useEffect(() => {
        const fetchShippingFee = async () => {
            try {
                const tempItems = cartItems.map((it: CartProduct) => {
                    return {
                        nameProduct: it.productBaseResponse.name,
                        length: it.productVariantResponse.length,
                        width: it.productVariantResponse.width,
                        height: it.productVariantResponse.height,
                        weight: it.productVariantResponse.weight,
                        quantity: it.quantity,
                    };
                });
                setOrderItems(cartItems.map((it: CartProduct) => ({ quantity: it.quantity, productVariantId: it.productVariantResponse.id })));

                console.log("Items for shipping fee calculation:", tempItems);
                const dataShipfee = await ShippingAPI.estimateDimensions(tempItems);

                setShippingData(dataShipfee.data);
                console.log("Calculated shipping fee data:", dataShipfee);
            } catch (error) {
                console.error("Error calculating shipping fee:", error);
            }
        };

        if (cartItems.length > 0) {
            fetchShippingFee();
        }
    }, [cartItems]);

    // Tính phí vận chuyển khi có thay đổi địa chỉ hoặc dữ liệu vận chuyển
    useEffect(() => {
        const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
        const calculateShippingFee = async () => {
            if (!shippingData || !selectedAddress) return;

            try {
                const response = await ShippingAPI.caculateShippingFee({
                    toDistrictId: selectedAddress?.districtId,
                    toWardCode: selectedAddress?.wardId,
                    serviceTypeId: shippingData.serviceTypeId,
                    weight: shippingData.weightTotal,
                    length: shippingData.lengthTotal,
                    width: shippingData.widthTotal,
                    height: shippingData.heightTotal,
                    items: shippingData.itemResponses,
                });

                setShippingFee(response.data.total);
            } catch (error) {
                console.error("Error calculating shipping fee:", error);
            }
        };

        calculateShippingFee();
    }, [shippingData, selectedAddressId, addresses]);

    // tính tông đơn hàng (chưa voucher và phí ship)
    const subTotal = cartItems.reduce((sum, it) => sum + it.productVariantResponse.price * it.quantity, 0);

    // tính giá trị voucher
    useEffect(() => {
        const selectedVoucherData = voucher ? voucher.find((v) => v.id === Number(selectedVoucher)) : null;
        if (selectedVoucherData) {
            if (selectedVoucherData.type === "FIXED_AMOUNT" && selectedVoucherData.minDiscountValue <= subTotal) {
                setTotalVoucher(selectedVoucherData.discountValue);
            } else if (selectedVoucherData.type === "PERCENTAGE") {
                const discount = (subTotal * selectedVoucherData.discountValue) / 100;
                if (selectedVoucherData.maxDiscountValue) {
                    setTotalVoucher(Math.min(discount, selectedVoucherData.maxDiscountValue));
                } else {
                    setTotalVoucher(discount);
                }
            }
        } else {
            setTotalVoucher(0);
        }
    }, [selectedVoucher, voucher, subTotal]);

    // Tổng cộng
    const total = Math.max(0, subTotal + shippingFee - totalVoucher);

    // Địa chỉ giao hàng
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

    // Đặt hàng
    const placeOrder = async () => {
        try {
            // Validate
            if (!selectedAddress) {
                toast.error("Vui lòng chọn địa chỉ giao hàng");
                return;
            }

            if (cartItems.length === 0) {
                toast.error("Giỏ hàng trống");
                return;
            }

            console.log("Placing order:", {
                cartItems,
                address: selectedAddress,
                note,
                payment,
                total,
            });

            // Tạo đơn hàng
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
                payment,
                note,
                selectedVoucher ? Number(selectedVoucher) : null
            );

            // Lấy link thanh toán
            const paymentResponse = await PaymentAPI.getPaymentMethods(orderResponse.data);

            // Xóa giỏ hàng sau khi đặt hàng thành công
            clearCart();
            cartItems.map((item) => removeItem(item.id)); // Xóa từng item để đồng bộ với backend
            console.log("Payment redirect link:", paymentResponse.data);

            // Redirect đến trang thanh toán
            window.location.href = paymentResponse.data;
        } catch (error) {
            console.error("Error placing order:", error);
            toast.error("Đặt hàng thất bại. Vui lòng thử lại.");
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto flex items-center justify-center flex-col min-h-[500px]">
                <div className="mt-6">Vui lòng đăng nhập để xem trang cá nhân.</div>
                <Button className="mt-6">
                    <Link to="/login">
                        <Home className="inline-flex mr-2" /> Đăng nhập ngay
                    </Link>
                </Button>
            </div>
        );
    }

    if (cartCount === 0) {
        navigate("/cart", { replace: true });
        return;
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <BreadcrumbCustom title="Giỏ hàng" link_title="/cart" subtitle="Thanh toán" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
                {/* LEFT: Order summary */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Đơn hàng của bạn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {cartItems.map((it) => {
                                const prod = it.productBaseResponse;
                                const varr = it.productVariantResponse;
                                const size = varr.variantAttributes.find((a) => a.attribute.toLowerCase().includes("kích thước"))?.value;
                                const color = varr.variantAttributes.find((a) => a.attribute.toLowerCase().includes("màu"))?.value;
                                const line = varr.price * it.quantity;

                                return (
                                    <div key={it.id} className="flex gap-3 pb-3 border-b last:border-0">
                                        <img src={prod.urlCoverImage} alt={prod.name} className="h-20 w-20 rounded object-cover" />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm line-clamp-2">{prod.name}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                Size: {size ?? "-"} | Màu: {color ?? "-"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Số lượng: {it.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatVND(line)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatVND(varr.price)} x {it.quantity}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT: Payment info */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle>Thông tin giao hàng</CardTitle>
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
                                                                    <p className="font-medium">{user?.fullName}</p>
                                                                    {addr.defaultAddress && (
                                                                        <Badge variant="default" className="text-xs">
                                                                            Mặc định
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mb-2">{user?.phone}</p>
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
                        </CardHeader>
                        <CardContent>
                            {selectedAddress ? (
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium">{user?.fullName}</p>
                                                {selectedAddress.defaultAddress && (
                                                    <Badge variant="default" className="text-xs">
                                                        Mặc định
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{user?.phone}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="space-y-1">
                                        <p className="text-sm">{selectedAddress.streetAddress}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.province}
                                        </p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Ghi chú đơn hàng</label>
                                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú giao hàng (tùy chọn)..." rows={3} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <MapPin className="h-12 w-12 text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground mb-3">Chưa có địa chỉ giao hàng</p>
                                    <Link to="/profile?tab=address">
                                        <Button variant="outline" size="sm">
                                            Thêm địa chỉ
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* PAYMENT METHOD */}
                            <RadioGroup value={payment} onValueChange={(v) => setPayment(v as "CASH" | "BANK_TRANSFER" | "MOMO")} className="grid gap-2">
                                <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer">
                                    <RadioGroupItem value="CASH" id="pay-cash" />
                                    <span>Thanh toán khi nhận hàng (COD)</span>
                                </Label>
                                <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer">
                                    <RadioGroupItem value="BANK_TRANSFER" id="pay-bank-transfer" />
                                    <span>VNPay (QR/Thẻ)</span>
                                </Label>
                                <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer">
                                    <RadioGroupItem value="MOMO" id="pay-momo" />
                                    <span>MoMo</span>
                                </Label>
                            </RadioGroup>

                            <Separator />

                            {/* VOUCHER – radio only */}
                            <div className="space-y-2">
                                <div className="text-base font-semibold">Ưu Đãi Dành Cho Bạn</div>
                                <div className="relative">
                                    <RadioGroup value={selectedVoucher} onValueChange={setSelectedVoucher} className="flex gap-4 overflow-x-auto pb-2">
                                        {voucher.map((v: VoucherIF) => (
                                            <label key={v.id} className="min-w-[360px]">
                                                <Card className={`relative border-2 transition-colors cursor-pointer ${selectedVoucher === v.id.toString() ? "border-foreground" : "border-muted"}`}>
                                                    <div className="p-4 flex gap-3 items-start">
                                                        <RadioGroupItem value={v.id.toString()} className="mt-1" />
                                                        <div className="flex-1">
                                                            <div className="text-sm">{v.discription}</div>

                                                            <div className="text-xs text-muted-foreground mt-1">HSD: {new Date(v.endDate).toLocaleDateString("vi-VN")}</div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </label>
                                        ))}
                                        {voucher.length === 0 && <div className="text-sm text-muted-foreground py-2">Không có voucher khả dụng</div>}
                                    </RadioGroup>
                                </div>
                                <Separator />
                            </div>

                            <div className="space-y-1 pt-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Tạm tính</span>
                                    <span>{formatVND(subTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Giảm giá voucher : </span>
                                    <span>-{formatVND(totalVoucher)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Phí vận chuyển</span>
                                    <span>{formatVND(shippingFee)}</span>
                                    {/* <span>{t}</span> */}
                                </div>

                                <Separator />
                                <div className="flex justify-between text-base font-semibold">
                                    <span>Tổng thanh toán</span>
                                    <span>{formatVND(total)}</span>
                                </div>
                            </div>

                            <Button className="w-full mt-2" disabled={loading || cartItems.length === 0} onClick={placeOrder}>
                                {payment === "CASH" ? "Đặt hàng" : "Thanh toán"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
