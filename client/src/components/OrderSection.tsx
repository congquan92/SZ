import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatVND } from "@/lib/helper";
import type { DeliveryStatus, OrderItem } from "@/page/type";
import { ChevronRight } from "lucide-react";
import { OrderAPI } from "@/api/order.api";

const STATUS_HEADER: Record<DeliveryStatus, string> = {
    PENDING: "Chờ xử lý",
    CONFIRMED: "Đã xác nhận",
    PACKED: "Đã đóng gói",
    SHIPPED: "Đang vận chuyển",
    DELIVERED: "Đã giao hàng",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã huỷ",
    REFUNDED: "Đã hoàn tiền",
};

const statusTone: Record<DeliveryStatus, string> = {
    PENDING: "bg-blue-50 text-blue-700 border-blue-200",
    CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
    PACKED: "bg-blue-50 text-blue-700 border-blue-200",
    SHIPPED: "bg-amber-50 text-amber-700 border-amber-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
    REFUNDED: "bg-rose-50 text-rose-700 border-rose-200",
};
const handelCancelOrder = async (orderId: number) => {
    console.log("huỷ đơn:", orderId);
    const data = await OrderAPI.cancelOrder(orderId);
    console.log("Kết quả huỷ đơn:", data);
};
const canReorderStatuses: DeliveryStatus[] = ["DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED"];
function renderActions(status: DeliveryStatus, orderId: number) {
    // luôn có xem chi tiết
    const ViewBtn = (
        <Button key="view" variant="secondary" size="sm" onClick={() => console.log("xem chi tiết:", orderId)}>
            Xem chi tiết <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
    );

    // PENDING: chỉ có Huỷ đơn + Xem chi tiết
    if (status === "PENDING") {
        return [
            <Button key="cancel" variant="outline" size="sm" className="border-rose-300 text-rose-700 hover:bg-rose-50" onClick={() => handelCancelOrder(orderId)}>
                Huỷ đơn
            </Button>,
            ViewBtn,
        ];
    }

    // DELIVERED, COMPLETED, CANCELLED, REFUNDED: có Mua lại + Xem chi tiết
    if (canReorderStatuses.includes(status)) {
        return [
            <Button key="reorder" variant="outline" size="sm" onClick={() => console.log("mua lại:", orderId)}>
                Mua lại
            </Button>,
            ViewBtn,
        ];
    }

    // CONFIRMED, PACKED, SHIPPED: chỉ Xem chi tiết
    return [ViewBtn];
}

type Props = { status: DeliveryStatus; orders: OrderItem[] };

export default function OrderSection({ status, orders }: Props) {
    return (
        <section className="space-y-3">
            {/* Section heading */}
            <div className="flex items-center gap-2 text-sm font-semibold">
                <div className={"size-2 rounded-full " + (status === "DELIVERED" || status === "COMPLETED" ? "bg-emerald-500" : status === "CANCELLED" || status === "REFUNDED" ? "bg-rose-500" : "bg-blue-500")} />
                <span>{STATUS_HEADER[status]}</span>
            </div>

            {/* Order list */}
            <div className="space-y-4">
                {orders.map((o) => (
                    <Card key={o.id} className="p-0 border border-border/70 overflow-hidden">
                        {/* Header (Shopee vibe) */}
                        <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm text-muted-foreground">Mã đơn:</span>
                                <span className="text-sm font-medium truncate">#{o.id}</span>
                                <span className="mx-2 text-muted-foreground">•</span>
                                <Badge variant="outline" className={o.paymentStatus === "PAID" ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-amber-200 text-amber-700 bg-amber-50"}>
                                    {o.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                                </Badge>
                            </div>

                            <div className={"text-sm font-medium px-2 py-1 rounded border " + statusTone[status]}>{STATUS_HEADER[status]}</div>
                        </div>

                        {/* Items */}
                        <div>
                            {o.orderItemResponses.map((it, idx) => (
                                <div key={it.orderItemId} className={"flex items-center gap-3 px-4 py-3 " + (idx !== o.orderItemResponses.length - 1 ? "border-b" : "")}>
                                    <img src={it.urlImageSnapShot} alt={it.nameProductSnapShot || it.productVariantResponse.sku} className="size-16 object-cover rounded-md border bg-white" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium line-clamp-1">{it.nameProductSnapShot || it.productVariantResponse.sku}</div>
                                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                            {it.variantSnapShot && <span className="whitespace-nowrap">Phân loại: {it.variantSnapShot}</span>}
                                            <span className="whitespace-nowrap">Giá gốc: {formatVND(it.listPriceSnapShot)}</span>
                                            <span className="whitespace-nowrap">Giá bán: {formatVND(it.finalPrice)}</span>
                                        </div>
                                    </div>

                                    <div className="text-sm text-muted-foreground whitespace-nowrap">x{it.quantity}</div>

                                    <div className="text-sm font-semibold w-28 text-right">{formatVND(it.finalPrice * it.quantity)}</div>
                                </div>
                            ))}
                        </div>

                        {/* Footer totals (Shopee style: dồn phải, dòng làm rõ tổng) */}
                        <div className="px-4 py-3 bg-muted/30">
                            <div className="flex flex-col items-end gap-1">
                                {/* Nếu bạn có trường discountAmount thì show; tạm tính theo original - total - ship */}

                                <div className="text-sm text-muted-foreground">
                                    Tổng tiền hàng: <span className="font-medium text-foreground">{formatVND(o.originalOrderAmount)}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Giảm giá: <span className="font-medium text-foreground">{formatVND(o.originalOrderAmount - o.totalAmount)}</span>
                                </div>

                                <Separator className="my-1" />

                                <div className="text-base">
                                    Thành tiền: <span className="font-bold text-foreground"> {formatVND(o.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action bar (được điều kiện hoá) */}
                        <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3">{renderActions(status, o.id)}</div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
