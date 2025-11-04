import { AddressAPI } from "@/api/address.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/helper";
import type { Address, CartProduct } from "@/page/type";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import { toast } from "sonner";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStores";
import Voucher from "@/components/Voucher";
import { VoucherAPI } from "@/api/voucher.api";

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Get cart items from navigation state
    const cartItems = (location.state?.cartItems as CartProduct[]) || [];

    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    // Payment & voucher
    const [payment, setPayment] = useState<"cod" | "vnpay" | "momo">("cod");
    const [voucher, setVoucher] = useState("");
    const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
    const [note, setNote] = useState("");

    // Load addresses
    const init = async () => {
        try {
            setLoading(true);
            const addressResponse = await AddressAPI.getAddress();
            const loadedAddresses = addressResponse.data.data;
            setAddresses(loadedAddresses);

            // Set default address
            const defaultAddr = loadedAddresses.find((a: Address) => a.defaultAddress);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            toast.error("Không thể tải địa chỉ giao hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Redirect to cart if no items
        if (!cartItems || cartItems.length === 0) {
            toast.error("Giỏ hàng trống");
            navigate("/cart");
            return;
        }
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Get selected address
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

    // Calculate totals
    const subTotal = cartItems.reduce((sum, it) => sum + it.productVariantResponse.price * it.quantity, 0);
    const shippingFee = 0; // You can calculate based on address
    const discount = couponApplied?.discount || 0;
    const total = Math.max(0, subTotal + shippingFee - discount);

    const applyVoucher = async () => {
        // // TODO: Call API to validate voucher
        // if (voucher.trim()) {
        //     // Mock validation
        //     setCouponApplied({ code: voucher, discount: 50000 });
        //     toast.success("Áp dụng mã giảm giá thành công!");
        // }

        const data = await VoucherAPI.getVouchers();
        console.log("Vouchers:", data);
    };

    const placeOrder = async () => {
        if (!selectedAddress) {
            toast.error("Vui lòng chọn địa chỉ giao hàng");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Giỏ hàng trống");
            return;
        }

        // TODO: Call API to place order
        console.log("Placing order:", {
            cartItems,
            address: selectedAddress,
            note,
            payment,
            total,
        });
        toast.success("Đặt hàng thành công!");
        // navigate("/order-success");
    };

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
                                <Link to="/profile?tab=address">
                                    <Button variant="link" size="sm" className="h-auto p-0">
                                        Thay đổi
                                    </Button>
                                </Link>
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
                            <RadioGroup value={payment} onValueChange={(v) => setPayment(v as "cod" | "vnpay" | "momo")} className="grid gap-2">
                                <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer">
                                    <RadioGroupItem value="cod" id="pay-cod" />
                                    <span>Thanh toán khi nhận hàng (COD)</span>
                                </Label>
                                <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer">
                                    <RadioGroupItem value="vnpay" id="pay-vnpay" />
                                    <span>VNPay (QR/Thẻ)</span>
                                </Label>
                                <Label className="flex items-center gap-2 rounded-md border p-3 cursor-pointer">
                                    <RadioGroupItem value="momo" id="pay-momo" />
                                    <span>MoMo</span>
                                </Label>
                            </RadioGroup>

                            <Separator />

                            <div className="flex gap-2">
                                <Input placeholder="Nhập mã giảm giá" value={voucher} onChange={(e) => setVoucher(e.target.value)} />
                                <Button variant="outline" onClick={applyVoucher}>
                                    Áp dụng
                                </Button>
                            </div>
                            {couponApplied && (
                                <div className="text-xs text-green-700">
                                    Đã áp dụng: <span className="font-medium">{couponApplied.code}</span> (−{formatVND(couponApplied.discount)})
                                </div>
                            )}

                            <div className="space-y-1 pt-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Tạm tính</span>
                                    <span>{formatVND(subTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phí vận chuyển</span>
                                    <span>{shippingFee === 0 ? "—" : formatVND(shippingFee)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Giảm giá</span>
                                    <span className="text-green-700">−{formatVND(discount)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-base font-semibold">
                                    <span>Tổng thanh toán</span>
                                    <span>{formatVND(total)}</span>
                                </div>
                            </div>

                            <Button className="w-full mt-2" disabled={loading || cartItems.length === 0} onClick={placeOrder}>
                                {payment === "cod" ? "Đặt hàng" : "Thanh toán"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
