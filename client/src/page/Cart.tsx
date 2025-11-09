import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatVND } from "@/lib/helper";
import { Home, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStores";

export default function Cart() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Sử dụng cart store thay vì local state
    const { cartItems, loading, totalAmount, fetchCart, updateQuantity, removeItem } = useCartStore();

    // Kiểm tra đăng nhập và load giỏ hàng
    useEffect(() => {
        if (!user) return;
        fetchCart();
    }, [fetchCart, user]);

    // Handler: Cập nhật số lượng
    const handleUpdateQuantity = async (itemId: number, newQty: number) => {
        try {
            await updateQuantity(itemId, newQty);
            toast.success("Đã cập nhật số lượng");
        } catch {
            toast.error("Cập nhật số lượng thất bại. Vui lòng thử lại.");
        }
    };

    // Handler: Xóa sản phẩm
    const handleRemoveItem = async (itemId: number) => {
        try {
            await removeItem(itemId);
            toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
        } catch {
            toast.error("Xoá sản phẩm thất bại. Vui lòng thử lại.");
        }
    };

    // Handler: Tiến hành thanh toán
    const handleCheckout = () => {
        navigate("/payment");
    };

    if (!user) {
        return (
            <div className="container mx-auto flex items-center justify-center flex-col min-h-[500px]">
                <div className="mt-6">Vui lòng đăng nhập để xem giỏ hàng.</div>
                <Button className="mt-6">
                    <Link to="/login">
                        <Home className="inline-flex mr-2" /> Đăng nhập ngay
                    </Link>
                </Button>
            </div>
        );
    }

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
                                                        <Button size="icon" variant="ghost" onClick={() => handleUpdateQuantity(it.id, it.quantity - 1)} disabled={it.quantity <= 1 || loading}>
                                                            <Minus className="h-4 w-4" />
                                                        </Button>
                                                        <Input
                                                            value={it.quantity}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value || 1);
                                                                handleUpdateQuantity(it.id, val);
                                                            }}
                                                            type="number"
                                                            className="mx-1 h-9 w-16 text-center"
                                                            min={1}
                                                            max={Math.max(1, it.productVariantResponse.quantity)}
                                                            disabled={loading}
                                                        />
                                                        <Button size="icon" variant="ghost" onClick={() => handleUpdateQuantity(it.id, it.quantity + 1)} disabled={it.quantity >= it.productVariantResponse.quantity || loading}>
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right align-top font-medium">{formatVND(line)}</TableCell>
                                                <TableCell className="text-right align-top">
                                                    <Button size="icon" variant="ghost" onClick={() => handleRemoveItem(it.id)} disabled={loading}>
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

                {/* RIGHT: Order summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tóm tắt đơn hàng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tạm tính ({cartItems.length} sản phẩm)</span>
                                <span className="font-medium">{formatVND(totalAmount)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-base font-semibold">
                                <span>Tổng cộng</span>
                                <span className="text-lg">{formatVND(totalAmount)}</span>
                            </div>
                        </div>

                        <Button className="w-full mt-4" size="lg" disabled={loading || cartItems.length === 0} onClick={handleCheckout}>
                            {loading ? "Đang xử lý..." : "Tiến hành thanh toán"}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground mt-2">Phí vận chuyển và giảm giá sẽ được tính ở bước thanh toán</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
