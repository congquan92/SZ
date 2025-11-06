import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { axiosInstance } from "@/lib/axios";

type VerifyResult = {
    success: boolean;
    message: string;
    orderId?: string;
    transactionId?: string;
};

function formatAmount(v?: string) {
    const n = Number(v || 0) / 100;
    return n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
function formatDate(v?: string) {
    if (!v || v.length !== 14) return "-";
    const yyyy = v.slice(0, 4);
    const MM = v.slice(4, 6);
    const dd = v.slice(6, 8);
    const hh = v.slice(8, 10);
    const mm = v.slice(10, 12);
    const ss = v.slice(12, 14);
    return `${hh}:${mm}:${ss} ${dd}/${MM}/${yyyy}`;
}

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

export default function PaymentStatus() {
    const location = useLocation();
    const navigate = useNavigate();

    // ✅ 1) Lưu query + full URL NGAY LẬP TỨC (phải gọi hooks trước mọi return)
    const originalSearchRef = useRef(location.search);
    const rawUrlRef = useRef(typeof window !== "undefined" ? window.location.href : "");

    // Dùng params từ query đã lưu
    const params = useMemo(() => new URLSearchParams(originalSearchRef.current), []);

    const vnp_ResponseCode = params.get("vnp_ResponseCode") || undefined;
    const vnp_TransactionStatus = params.get("vnp_TransactionStatus") || undefined;

    // Heuristic client-side (tạm trước verify)
    const initial = vnp_ResponseCode === "00" && vnp_TransactionStatus === "00" ? "success" : vnp_TransactionStatus === "02" ? "pending" : "fail";

    const [status, setStatus] = useState<"success" | "fail" | "pending">(initial);
    const [verifying, setVerifying] = useState(true);
    const [verify, setVerify] = useState<VerifyResult | null>(null);

    // ✅ 2) Không có query -> đá sang /unauthorized (replace) để khỏi back
    useEffect(() => {
        if (!location.search || location.search === "") {
            navigate("/unauthorized", { replace: true });
        }
    }, [location.search, navigate]);

    // ✅ 3) Ẩn query khỏi address bar (không tạo history mới)
    useEffect(() => {
        if (!location.search) return; // Đã bị redirect, skip

        // Log full URL để debug/lưu lại khi cần
        console.log("[VNPAY RAW URL]", rawUrlRef.current);

        if (typeof window !== "undefined") {
            const clean = window.location.pathname; // /payment/vnpay-return
            window.history.replaceState({}, "", clean);
        }
    }, [location.search]);

    // ✅ 4) Verify với server bằng query gốc (URL trên thanh địa chỉ đã sạch)
    useEffect(() => {
        if (!originalSearchRef.current) return; // Không có query thì skip

        let mounted = true;
        (async () => {
            try {
                const url = `/payment/vnpay-return${originalSearchRef.current}`;
                const res = await axiosInstance.get<VerifyResult>(url);
                if (!mounted) return;

                setVerify(res.data);
                if (res.data.success) setStatus("success");
                else {
                    const isPending = vnp_TransactionStatus === "02" || /đang xử lý|pending/i.test(res.data.message || "");
                    setStatus(isPending ? "pending" : "fail");
                }
            } catch {
                if (!mounted) return;
                setVerify({
                    success: initial === "success",
                    message: "Không xác thực được với server. Hiển thị tạm theo URL.",
                });
            } finally {
                if (mounted) setVerifying(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [initial, vnp_TransactionStatus]);

    // Nếu đang redirect thì hiển thị loading
    if (!location.search) {
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

    const Icon = status === "success" ? CheckCircle2 : status === "fail" ? XCircle : Clock;
    const title = status === "success" ? "Thanh toán thành công 🎉" : status === "pending" ? "Đang xử lý ⏳" : "Thanh toán thất bại 😿";

    const badgeVariant = status === "success" ? "default" : status === "pending" ? "secondary" : "destructive";

    const amount = formatAmount(params.get("vnp_Amount") || undefined);
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
                    <Button
                        variant="ghost"
                        onClick={() => {
                            // Reload để re-verify (URL vẫn sạch do đã replaceState)
                            window.location.reload();
                        }}
                    >
                        Tải lại trạng thái
                    </Button>
                </CardFooter>
            </Card>

            {/* Debug: hiển thị params đã parse (URL bar không còn query) */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-base">Chi tiết kỹ thuật (debug)</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                    {Array.from(params.entries()).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4 py-1 border-b last:border-b-0">
                            <span className="text-muted-foreground">{k}</span>
                            <span className="font-mono break-all">{v}</span>
                        </div>
                    ))}
                </CardContent>
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
