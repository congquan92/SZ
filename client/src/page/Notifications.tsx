import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Package, Truck, CheckCircle2, Clock, XCircle, type LucideProps } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStores";

interface OrderItemResponse {
    orderItemId: number;
    nameProductSnapShot: string;
    urlImageSnapShot: string;
    variantSnapShot: string;
}

interface FirebaseOrder {
    id: number;
    deliveryStatus: string;
    paymentStatus: string;
    paymentType: string;
    orderItemResponses: OrderItemResponse[];
}

interface FirebaseOrdersData {
    [orderId: string]: FirebaseOrder;
}

// Helper functions
const getDeliveryStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>; bgColor: string }> = {
        PENDING: { label: "Chờ xác nhận", color: "text-orange-600", icon: Clock, bgColor: "bg-orange-50" },
        CONFIRMED: { label: "Đã xác nhận", color: "text-blue-600", icon: Package, bgColor: "bg-blue-50" },
        SHIPPING: { label: "Đang giao", color: "text-purple-600", icon: Truck, bgColor: "bg-purple-50" },
        DELIVERED: { label: "Đã giao", color: "text-green-600", icon: CheckCircle2, bgColor: "bg-green-50" },
        CANCELLED: { label: "Đã hủy", color: "text-red-600", icon: XCircle, bgColor: "bg-red-50" },
        REFUNDED: { label: "Đã hoàn tiền", color: "text-red-600", icon: XCircle, bgColor: "bg-red-50" },
        PACKED: { label: "Đã đóng gói", color: "text-teal-600", icon: Package, bgColor: "bg-teal-50" },
        COMPLETED: { label: "Hoàn thành", color: "text-green-600", icon: CheckCircle2, bgColor: "bg-green-50" },
    };
    return statusMap[status] || statusMap.PENDING;
};

const getPaymentStatusBadge = (paymentStatus: string) => {
    if (paymentStatus === "PAID") {
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-800">Chưa thanh toán</Badge>;
};

const getPaymentTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
        CASH: "Tiền mặt",
        VNPAY: "VNPay",
        MOMO: "Momo",
        BANKING: "Chuyển khoản",
    };
    return typeMap[type] || type;
};

export default function Notifications() {
    const [orders, setOrders] = useState<FirebaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuthStore();

    useEffect(() => {
        // chưa có user thì khỏi sub
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const ordersRef = ref(db, `users/${user.id}/orders`);

        const unsubscribe = onValue(
            ordersRef,
            (snapshot) => {
                const data = snapshot.val() as FirebaseOrdersData | null;
                console.log(" Firebase snapshot:", data);

                if (!data) {
                    setOrders([]);
                    setLoading(false);
                    return;
                }

                const list: FirebaseOrder[] = Object.values(data);
                list.sort((a, b) => b.id - a.id);
                setOrders(list);
                setLoading(false);
            },
            (err) => {
                console.error(" Firebase error:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => {
            unsubscribe();
        };
    }, [user?.id]); // phụ thuộc user.id

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="size-5" />
                        Thông Báo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 text-sm">Đang tải thông báo...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500 text-sm">Lỗi Firebase: {error}</div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Bell className="size-12 mx-auto mb-4 opacity-50" />
                            <p>Không có thông báo mới</p>
                            <p className="text-sm">Các thông báo về đơn hàng, khuyến mãi sẽ hiển thị tại đây</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order) => {
                                const statusInfo = getDeliveryStatusInfo(order.deliveryStatus);
                                const StatusIcon = statusInfo.icon;
                                const firstItem = order.orderItemResponses?.[0];
                                const itemCount = order.orderItemResponses?.length || 0;

                                return (
                                    <div key={order.id} className="flex gap-3 p-3 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
                                        {/* Product Image */}
                                        <div className="shrink-0">
                                            <img src={firstItem?.urlImageSnapShot} alt={firstItem?.nameProductSnapShot} className="w-16 h-16 object-cover rounded border" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <StatusIcon className={`size-4 ${statusInfo.color}`} />
                                                    <span className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
                                                </div>
                                                <span className="text-xs text-gray-400 shrink-0">{new Date().toLocaleString("vi-VN")}</span>
                                            </div>

                                            {/* Order Info */}
                                            <p className="text-sm font-medium text-gray-900 mb-1">Đơn hàng #{order.id}</p>
                                            <p className="text-sm text-gray-600 line-clamp-1 mb-2">{firstItem?.nameProductSnapShot}</p>

                                            {/* Badges */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {getPaymentStatusBadge(order.paymentStatus)}
                                                <Badge variant="outline" className="text-xs">
                                                    {getPaymentTypeLabel(order.paymentType)}
                                                </Badge>
                                                {itemCount > 1 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{itemCount - 1} sản phẩm
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
