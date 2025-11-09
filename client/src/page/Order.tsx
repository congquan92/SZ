import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

import { Search, PackageCheck, Truck, Clock, Ban, Box, CheckCircle, Home } from "lucide-react";
import { OrderAPI } from "@/api/order.api";
import type { DeliveryStatus, OrderItem } from "@/page/type";
import OrderSection from "@/components/OrderSection";
import { useAuthStore } from "@/stores/useAuthStores";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// ===== Label tabs =====
const STATUS_TABS: { key: "ALL" | DeliveryStatus; label: string; icon?: React.ComponentType<{ className?: string }> }[] = [
    { key: "ALL", label: "Tất cả đơn" },
    { key: "PENDING", label: "Chờ xử lý", icon: Clock },
    { key: "CONFIRMED", label: "Đã xác nhận", icon: CheckCircle },
    { key: "PACKED", label: "Đã đóng gói", icon: Box },
    { key: "SHIPPED", label: "Đang vận chuyển", icon: Truck },
    { key: "DELIVERED", label: "Đã giao", icon: PackageCheck },
    { key: "COMPLETED", label: "Hoàn thành", icon: PackageCheck },
    { key: "CANCELLED", label: "Đã huỷ", icon: Ban },
    { key: "REFUNDED", label: "Hoàn tiền", icon: Ban },
];

export default function OrderPage() {
    const [active, setActive] = useState<"ALL" | DeliveryStatus>("ALL");
    const { user } = useAuthStore();
    const [q, setQ] = useState("");
    const [orders, setOrders] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);

    const init = async () => {
        try {
            setLoading(true);
            const response = await OrderAPI.getOrderAll();
            setOrders(response.data.data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        init();
    }, [user]);

    // Filter orders
    const filtered = useMemo(() => {
        let list = orders;
        if (active !== "ALL") list = list.filter((o) => o.deliveryStatus === active);
        if (q.trim()) {
            const kw = q.trim().toLowerCase();
            list = list.filter((o) => o.id.toString().toLowerCase().includes(kw) || o.orderItemResponses.some((it) => it.productVariantResponse.sku.toLowerCase().includes(kw)));
        }
        return list;
    }, [active, q, orders]);

    // Group orders by status
    const grouped = useMemo(() => {
        const map = new Map<DeliveryStatus, OrderItem[]>();
        filtered.forEach((o) => {
            const arr = map.get(o.deliveryStatus) ?? [];
            arr.push(o);
            map.set(o.deliveryStatus, arr);
        });

        const orderStatus: DeliveryStatus[] = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED"];
        return orderStatus.filter((s) => (map.get(s)?.length || 0) > 0).map((s) => ({ status: s, orders: map.get(s)! }));
    }, [filtered]);

    if (!user) {
        return (
            <div className="container mx-auto flex items-center justify-center flex-col min-h-[500px]">
                <div className="mt-6">Vui lòng đăng nhập để xem đơn hàng.</div>
                <Button className="mt-6">
                    <Link to="/login">
                        <Home className="inline-flex mr-2" /> Đăng nhập ngay
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container max-w-5xl mx-auto py-6">
            <h1 className="text-xl md:text-2xl font-semibold mb-4">Đơn hàng của tôi</h1>

            {/* Tabs (UI only) */}
            <Tabs value={active} onValueChange={(v) => setActive(v as "ALL" | DeliveryStatus)} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto gap-1">
                    {STATUS_TABS.map(({ key, label, icon: Icon }) => (
                        <TabsTrigger key={key} value={key} className="gap-2 whitespace-nowrap">
                            {Icon ? <Icon className="h-4 w-4" /> : null}
                            {label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Search */}
                <div className="mt-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Tìm đơn theo Mã đơn hàng, Nhà bán hoặc Tên sản phẩm" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>

                {/* Content */}
                <div className="mt-6 space-y-6">{loading ? <LoadingState /> : grouped.length === 0 ? <EmptyState /> : grouped.map((g) => <OrderSection key={g.status} status={g.status} orders={g.orders} />)}</div>
            </Tabs>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="text-center py-16">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
            <div className="mt-4 text-sm text-muted-foreground">Đang tải đơn hàng...</div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-16">
            <div className="mx-auto size-12 rounded-full bg-muted flex items-center justify-center">
                <PackageCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">Không có đơn hàng nào.</div>
        </div>
    );
}
