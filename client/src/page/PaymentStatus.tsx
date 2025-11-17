import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Clock, ExternalLink, Package } from "lucide-react";
import { axiosInstance } from "@/lib/axios";
import { formatDate, formatVND } from "@/lib/helper";

// ============ TYPES ============
type PaymentType = "VNPAY" | "MOMO" | "CASH";
type PaymentStatus = "success" | "fail" | "pending";

type VerifyResult = {
    success: boolean;
    message: string;
    orderId?: string;
    transactionId?: string;
};

function vnpResponseMessage(code?: string) {
    switch (code) {
        case "00":
            return "Thành công";
        case "24":
            return "Khách hủy giao dịch";
        case "07":
            return "Nghi vấn gian lận";
        case "51":
            return "Tài khoản không đủ tiền";
        default:
            return `Mã phản hồi: ${code || "-"}`;
    }
}

function vnpTxnStatusMessage(st?: string) {
    switch (st) {
        case "00":
            return "Giao dịch thành công";
        case "02":
            return "Đang xử lý / chờ đối soát";
        default:
            return `Trạng thái: ${st || "-"}`;
    }
}

// ============ COMPONENT ============

export default function PaymentStatus() {
    const location = useLocation();
    const navigate = useNavigate();

    // Xác định loại thanh toán từ URL
    const paymentType: PaymentType = useMemo(() => {
        if (location.pathname.includes("/cash-return")) return "CASH";
        if (location.pathname.includes("/momo-return")) return "MOMO";
        return "VNPAY";
    }, [location.pathname]);

    // Lưu query params gốc (trước khi bị xóa khỏi URL)
    const originalSearchRef = useRef(location.search);
    const params = useMemo(() => new URLSearchParams(originalSearchRef.current), []);

    // Data cho từng loại thanh toán
    const cashOrderId = location.state?.orderId || params.get("orderId");
    const vnp_ResponseCode = params.get("vnp_ResponseCode") || undefined;
    const vnp_TransactionStatus = params.get("vnp_TransactionStatus") || undefined;

    // Xác định trạng thái ban đầu
    const initialStatus: PaymentStatus = useMemo(() => {
        if (paymentType === "CASH") return "success";
        if (vnp_ResponseCode === "00" && vnp_TransactionStatus === "00") return "success";
        if (vnp_TransactionStatus === "02") return "pending";
        return "fail";
    }, [paymentType, vnp_ResponseCode, vnp_TransactionStatus]);

    const [status, setStatus] = useState<PaymentStatus>(initialStatus);
    const [verifying, setVerifying] = useState(true);
    const [verify, setVerify] = useState<VerifyResult | null>(null);

    // Redirect nếu thiếu dữ liệu cần thiết
    useEffect(() => {
        if (paymentType !== "CASH" && !location.search) {
            navigate("/unauthorized", { replace: true });
        }

        // CASH: redirect nếu không có orderId
        if (paymentType === "CASH" && !cashOrderId) {
            navigate("/unauthorized", { replace: true });
        }
    }, [location.search, navigate, paymentType, cashOrderId]);

    // Ẩn query params khỏi URL bar (để bảo mật)
    useEffect(() => {
        if (paymentType === "CASH" || !location.search) return;

        if (typeof window !== "undefined") {
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, [location.search, paymentType]);

    // Verify thanh toán với server
    useEffect(() => {
        // COD không cần verify vì đã tạo đơn thành công
        if (paymentType === "CASH") {
            setVerifying(false);
            setVerify({
                success: true,
                message: "Đơn hàng COD đã được tạo thành công. Vui lòng thanh toán khi nhận hàng.",
                orderId: cashOrderId?.toString(),
            });
            return;
        }

        // Online payment cần verify với server
        if (!originalSearchRef.current) return;

        let mounted = true;
        const verifyPayment = async () => {
            try {
                const url = `/payment/${paymentType.toLowerCase()}-return${originalSearchRef.current}`;
                const res = await axiosInstance.get<VerifyResult>(url);

                if (!mounted) return;

                setVerify(res.data);

                if (res.data.success) {
                    setStatus("success");
                } else {
                    const isPending = vnp_TransactionStatus === "02" || /đang xử lý|pending/i.test(res.data.message || "");
                    setStatus(isPending ? "pending" : "fail");
                }
            } catch (error) {
                if (!mounted) return;
                console.error("Verify payment error:", error);
                setVerify({
                    success: initialStatus === "success",
                    message: "Không xác thực được với server. Hiển thị tạm theo dữ liệu URL.",
                });
            } finally {
                if (mounted) setVerifying(false);
            }
        };

        verifyPayment();
        return () => {
            mounted = false;
        };
    }, [initialStatus, vnp_TransactionStatus, paymentType, cashOrderId]);

    // Loading state khi đang redirect
    if (paymentType !== "CASH" && !location.search) {
        return (
            <div className="container max-w-3xl mx-auto p-4">
                <Card className="mt-6">
                    <CardContent className="p-8 text-center">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
                        <p className="text-muted-foreground">Đang chuyển hướng...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // UI data
    const Icon = status === "success" ? CheckCircle2 : status === "fail" ? XCircle : Clock;
    const badgeVariant = status === "success" ? "default" : status === "pending" ? "secondary" : "destructive";

    const title = paymentType === "CASH" ? "Đặt hàng thành công 🎉" : status === "success" ? "Thanh toán thành công 🎉" : status === "pending" ? "Đang xử lý ⏳" : "Thanh toán thất bại 😿";

    // CASH: hiển thị thông tin đơn giản hơn
    if (paymentType === "CASH") {
        return (
            <div className="container max-w-3xl mx-auto p-4">
                <Card className="mt-6">
                    <CardHeader className="flex flex-row items-center gap-3">
                        <Package className="h-8 w-8 text-green-600" />
                        <div className="flex-1">
                            <CardTitle className="text-xl">{title}</CardTitle>
                            <div className="text-sm text-muted-foreground">{verify?.message || "Đơn hàng của bạn đã được tạo. Vui lòng thanh toán khi nhận hàng."}</div>
                        </div>
                        <Badge variant="default" className="ml-auto">
                            COD
                        </Badge>
                    </CardHeader>
                    <Separator />
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <Field label="Mã đơn hàng" value={`CASH#${cashOrderId?.toString()}`} copyable />
                            <Field label="Phương thức thanh toán" value="Thanh toán khi nhận hàng (COD)" />
                            <div className="bg-muted/50 p-4 rounded-lg">
                                <p className="text-sm font-medium mb-2">📦 Lưu ý quan trọng:</p>
                                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                    <li>Vui lòng chuẩn bị đủ tiền mặt khi nhận hàng</li>
                                    <li>Kiểm tra kỹ sản phẩm trước khi thanh toán</li>
                                    <li>Giữ lại mã đơn hàng để tra cứu</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex gap-2 justify-between flex-wrap">
                        <div className="flex gap-2">
                            <Link to="/product">
                                <Button variant="secondary">Tiếp tục mua sắm</Button>
                            </Link>
                            <Link to="/orders">
                                <Button variant="outline">
                                    Xem đơn hàng
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // VNPAY / MOMO: hiển thị đầy đủ thông tin
    const amount = formatVND(Number(params.get("vnp_Amount")) / 100);
    const bank = params.get("vnp_BankCode") || "-";
    const cardType = params.get("vnp_CardType") || "-";
    const orderId = params.get("vnp_TxnRef") || verify?.orderId || "-";
    const transNo = params.get("vnp_TransactionNo") || verify?.transactionId || "-";
    const payTime = formatDate(params.get("vnp_PayDate") || undefined);

    return (
        <div className="container max-w-3xl mx-auto p-4">
            <Card className="mt-6">
                <CardHeader className="flex flex-row items-center gap-3">
                    <Icon className={`h-8 w-8 ${status === "success" ? "text-green-600" : status === "pending" ? "text-amber-600" : "text-red-600"}`} />
                    <div className="flex-1">
                        <CardTitle className="text-xl">{title}</CardTitle>
                        <div className="text-sm text-muted-foreground">{verifying ? "Đang xác thực giao dịch với máy chủ..." : verify?.message || vnpTxnStatusMessage(vnp_TransactionStatus)}</div>
                    </div>
                    <Badge variant={badgeVariant} className="ml-auto">
                        {status === "success" ? "Success" : status === "pending" ? "Pending" : "Failed"}
                    </Badge>
                </CardHeader>
                <Separator />
                <CardContent className="grid sm:grid-cols-2 gap-4 pt-6">
                    <Field label="Mã đơn hàng" value={orderId} copyable />
                    <Field label="Mã giao dịch VNPAY" value={transNo} copyable />
                    <Field label="Số tiền" value={amount} />
                    <Field label="Ngân hàng / Cổng" value={`${bank} (${cardType})`} />
                    <Field label="Thời gian thanh toán" value={payTime} />
                    <Field label="VNP Response" value={vnpResponseMessage(vnp_ResponseCode)} />
                    <Field label="VNP TxnStatus" value={vnpTxnStatusMessage(vnp_TransactionStatus)} />
                </CardContent>
                <CardFooter className="flex gap-2 justify-between flex-wrap">
                    <div className="flex gap-2">
                        <Link to="/product">
                            <Button variant="secondary">Tiếp tục mua sắm</Button>
                        </Link>
                        <Link to="/orders">
                            <Button variant="outline">
                                Xem đơn hàng
                                <ExternalLink className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

function Field({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
    const onCopy = () => navigator.clipboard?.writeText(value).catch(() => {});
    return (
        <div className="space-y-1">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="font-medium break-all">{value}</div>
            {copyable && (
                <button onClick={onCopy} className="text-xs underline text-muted-foreground hover:text-foreground">
                    Copy
                </button>
            )}
        </div>
    );
}
