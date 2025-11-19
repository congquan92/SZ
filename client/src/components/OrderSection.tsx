import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatVND, toSlug } from "@/lib/helper";
import type { DeliveryStatus, OrderItem } from "@/page/type";
import { OrderAPI } from "@/api/order.api";

import ReviewDialog from "@/components/ReviewDialog";
import OrderDetailDialog from "@/components/OrderDetailDialog";
import ReorderDialog from "@/components/ReorderDialog";
import RepaymentDialog from "@/components/RepaymentDialog";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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
const handelCancelOrder = async (orderId: number, onRefresh?: () => void) => {
    try {
        await OrderAPI.cancelOrder(orderId);
        if (onRefresh) onRefresh();
        toast.success("Huỷ đơn hàng thành công.");
    } catch {
        toast.error("Huỷ đơn hàng thất bại.");
    }
};

const handelCompleteOrder = async (orderId: number, onRefresh?: () => void) => {
    try {
        await OrderAPI.completeOrder(orderId);
        if (onRefresh) onRefresh();
        toast.success("Xác nhận nhận hàng thành công.");
    } catch {
        toast.error("Xác nhận nhận hàng thất bại.");
    }
};

const canReorderStatuses: DeliveryStatus[] = ["DELIVERED", "COMPLETED", "CANCELLED", "REFUNDED"];
function renderActions(status: DeliveryStatus, orderId: number, order: OrderItem, onRefresh?: () => void) {
    const actions = [];

    // PENDING: chỉ có Huỷ đơn
    if (status === "PENDING") {
        actions.push(
            <Button key="cancel" variant="outline" size="sm" className="border-rose-300 text-rose-700 hover:bg-rose-50" onClick={() => handelCancelOrder(orderId, onRefresh)}>
                Huỷ đơn
            </Button>
        );
    }

    // Xác nhận đã nhận hàng
    if (status === "DELIVERED" || (status === "COMPLETED" && !order.isConfimed)) {
        actions.push(
            <Button key="complete" variant="outline" size="sm" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => handelCompleteOrder(orderId, onRefresh)}>
                Xác Nhận Đã Nhận Hàng
            </Button>
        );
    }

    // Mua lại
    if (canReorderStatuses.includes(status)) {
        actions.push(<ReorderDialog key="reorder" order={order} />);
    }

    // Thanh toán lại - chỉ hiện với đơn chưa thanh toán, không phải COD, và ở trạng thái Chờ xử lý
    if (order.paymentStatus === "UNPAID" && order.paymentType !== "CASH" && status === "PENDING") {
        actions.push(<RepaymentDialog key="repayment" order={order} />);
    }

    return actions;
}

type Props = { status: DeliveryStatus; orders: OrderItem[]; onRefresh?: () => void };

export default function OrderSection({ status, orders, onRefresh }: Props) {
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
                                <div key={it.orderItemId} className={"px-4 py-3 " + (idx !== o.orderItemResponses.length - 1 ? "border-b" : "")}>
                                    <div className="flex items-center gap-3">
                                        <img src={it.urlImageSnapShot} alt={it.nameProductSnapShot} className="size-16 object-cover rounded-md border bg-white" />
                                        <div className="flex-1 min-w-0">
                                            <Link to={`/product/${it.productBaseResponse.id}/${toSlug(it.productBaseResponse.name)}/${toSlug(it.productBaseResponse.description)}`} className="hover:underline">
                                                <div className="text-sm font-medium line-clamp-1">{it.nameProductSnapShot}</div>
                                            </Link>
                                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                {it.productVariantResponse.sku && <span className="whitespace-nowrap">SKU : {it.productVariantResponse.sku}</span>}
                                                <span className="whitespace-nowrap">{it.productVariantResponse.variantAttributes.map((attr) => attr.attribute + ": " + attr.value).join(", ")}</span>
                                                <span className="whitespace-nowrap">Giá : {formatVND(it.listPriceSnapShot)}</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground whitespace-nowrap">x{it.quantity}</div>
                                        </div>
                                        <div className="text-sm font-semibold w-28 text-right">{formatVND(it.finalPrice * it.quantity)}</div>
                                    </div>

                                    {/* Button đánh giá - chỉ hiện với đơn COMPLETED và sản phẩm chưa được đánh giá và phải xác nhận đơn hàng */}
                                    {status === "COMPLETED" && !it.isReviewed && o.isConfimed && (
                                        <div className="mt-3 flex justify-end">
                                            <ReviewDialog orderItemId={it.orderItemId} productName={it.nameProductSnapShot || it.productVariantResponse.sku} productImage={it.urlImageSnapShot} onSuccess={onRefresh} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Footer totals (Shopee style: dồn phải, dòng làm rõ tổng) */}
                        <div className="px-4 py-3 bg-muted/30 md:min-w-[300px]">
                            <div className="flex flex-col items-end gap-2">
                                <Separator />
                                <div className="text-base">
                                    Thành tiền: <span className="font-bold text-foreground"> {formatVND(o.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                        {/* Action bar (được điều kiện hoá) */}
                        <div className="flex flex-wrap items-center justify-end gap-2 px-4 py-3">
                            <OrderDetailDialog orderId={o.id} />
                            {renderActions(status, o.id, o, onRefresh)}
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}
