import { ProductAPI } from "@/api/product.api";
import { AddressAPI } from "@/api/address.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatVND } from "@/lib/helper";
import type { CartProduct } from "@/page/type";
import { Minus, Plus, Trash2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/useAuthStores";

interface Address {
    id: number;
    province: string;
    district: string;
    ward: string;
    provinceId: number;
    districtId: number;
    wardId: string;
    streetAddress: string;
    addressType: "HOME" | "WORK";
    status: string;
    defaultAddress: boolean;
}

export default function Cart() {
    const [cartItems, setCartItems] = useState<CartProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const { user } = useAuthStore();

    // Payment & voucher
    const [payment, setPayment] = useState<"cod" | "vnpay" | "momo">("cod");
    const [voucher, setVoucher] = useState("");
    const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
    const [note, setNote] = useState("");

    // Load cart and addresses
    const init = async () => {
        try {
            setLoading(true);

            // Load cart
            const cartResponse = await ProductAPI.getCart(10);
            setCartItems(cartResponse.data.data);

            // Load addresses from API
            const addressResponse = await AddressAPI.getAddress();
            const loadedAddresses = addressResponse.data.data;
            setAddresses(loadedAddresses);

            // Set default address
            const defaultAddr = loadedAddresses.find((a: Address) => a.defaultAddress);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
            }
        } catch (error) {
            console.error("Error fetching cart or addresses:", error);
            toast.error("Không thể tải thông tin giỏ hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        init();
    }, []);

    // Get selected address
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

    // Calculate totals
    const subTotal = cartItems.reduce((sum, it) => sum + it.productVariantResponse.price * it.quantity, 0);
    const shippingFee = 0; // You can calculate based on address
    const discount = couponApplied?.discount || 0;
    const total = Math.max(0, subTotal + shippingFee - discount);

    // Handler functions
    const updateQty = async (itemId: number, newQty: number) => {
        if (newQty < 1) return;
        setCartItems((prev) =>
            prev.map((it) => {
                if (it.id === itemId) {
                    const maxQty = it.productVariantResponse.quantity;
                    return { ...it, quantity: Math.min(newQty, maxQty) };
                }
                return it;
            })
        );
        // TODO: Call API to update quantity on server
    };

    const removeItem = async (itemId: number) => {
        try {
            await ProductAPI.deleteCartItem(itemId);
            setCartItems((prev) => prev.filter((it) => it.id !== itemId));
        } catch (error) {
            console.error("Error deleting cart item:", error);
            toast.error("Xoá sản phẩm thất bại. Vui lòng thử lại.");
        }
    };

    const applyVoucher = () => {
        // TODO: Call API to validate voucher
        if (voucher.trim()) {
            // Mock validation
            setCouponApplied({ code: voucher, discount: 50000 });
        }
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
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <BreadcrumbCustom title="Trang chủ" link_title="/" subtitle="Giỏ hàng" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-2">
                {/* LEFT: Cart items */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Sản phẩm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-sm text-muted-foreground">Đang tải...</div>
                        ) : cartItems.length === 0 ? (
                            <div className="text-sm text-muted-foreground">Giỏ hàng đang trống.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16"></TableHead>
                                        <TableHead>Sản phẩm</TableHead>
                                        <TableHead>Biến thể</TableHead>
                                        <TableHead className="text-right">Giá</TableHead>
                                        <TableHead className="text-center">Số lượng</TableHead>
                                        <TableHead className="text-right">Tạm tính</TableHead>
                                        <TableHead className="w-10"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {cartItems.map((it) => {
                                        const prod = it.productBaseResponse;
                                        const varr = it.productVariantResponse;
                                        const line = varr.price * it.quantity;
                                        const size = varr.variantAttributes.find((a) => a.attribute.toLowerCase().includes("kích thước"))?.value;
                                        const color = varr.variantAttributes.find((a) => a.attribute.toLowerCase().includes("màu"))?.value;

                                        return (
                                            <TableRow key={it.id}>
                                                <TableCell>
                                                    <img src={prod.urlCoverImage} alt={prod.name} className="h-14 w-14 rounded object-cover" />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm font-medium leading-tight line-clamp-2">{prod.name}</div>
                                                    <div className="text-xs text-muted-foreground">SKU: {varr.sku}</div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    <div>
                                                        Size: <span className="font-medium">{size ?? "-"}</span>
                                                    </div>
                                                    <div>
                                                        Màu: <span className="font-medium">{color ?? "-"}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Tồn: {varr.quantity}</div>
                                                </TableCell>
                                                <TableCell className="text-right align-top">{formatVND(varr.price)}</TableCell>
                                                <TableCell className="align-top">
                                                    <div className="flex items-center justify-center">
                                                        <Button size="icon" variant="ghost" onClick={() => updateQty(it.id, it.quantity - 1)} disabled={it.quantity <= 1}>
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <Input
                                                            value={it.quantity}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value || 1);
                                                                updateQty(it.id, val);
                                                            }}
                                                            type="number"
                                                            className="mx-1 h-9 w-16 text-center"
                                                            min={1}
                                                            max={Math.max(1, it.productVariantResponse.quantity)}
                                                        />
                                                        <Button size="icon" variant="ghost" onClick={() => updateQty(it.id, it.quantity + 1)} disabled={it.quantity >= it.productVariantResponse.quantity}>
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right align-top font-medium">{formatVND(line)}</TableCell>
                                                <TableCell className="text-right align-top">
                                                    <Button size="icon" variant="ghost" onClick={() => removeItem(it.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* RIGHT: Summary + form */}
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
