import { AuthAPI } from "@/api/auth.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OTP({ email, id_user, onBack }: { email: string; id_user: string; onBack: () => void }) {
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
    const [resendAvailable, setResendAvailable] = useState(false);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };
    useEffect(() => {
        if (timeLeft <= 0) {
            setResendAvailable(true);
            return;
        }
        const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const handleVerify = async () => {
        const response = await AuthAPI.verifyOTP(id_user, otp);
        await AuthAPI.verifyAccount(id_user, response.data);
        toast.success("Xác thực thành công! Bạn có thể đăng nhập ngay bây giờ.");
        setTimeout(() => {
            window.location.reload();
        }, 2000);

        // if (response.data.status === 1000) {
        //     toast.success("Xác thực thành công!");
        // } else {
        //     toast.error("Mã OTP không đúng!");
        // }
    };

    const handleResend = () => {
        setTimeLeft(300);
        setResendAvailable(false);
        fetch(`${import.meta.env.VITE_API_URL}/otp/send?userId=${id_user}&otpType=VERIFICATION`, {
            method: "POST",
        });
        toast.info("Mã OTP mới đã được gửi lại vào email của bạn");
    };

    return (
        <div className="flex items-center justify-center p-5">
            <Card className="w-[450px] shadow-lg rounded-none">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Xác thực Email</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 text-center">
                    <p className="text-sm text-gray-600">
                        Nhập mã OTP đã gửi tới email: <span className="font-semibold">{email}</span>
                    </p>

                    <Input type="text" placeholder="Nhập mã gồm 6 chữ số" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="text-center tracking-widest text-lg" />

                    <p className="text-sm text-gray-500">
                        {resendAvailable ? (
                            <span className="text-red-500">Mã đã hết hạn</span>
                        ) : (
                            <>
                                Mã sẽ hết hạn sau: <b>{formatTime(timeLeft)}</b>
                            </>
                        )}
                    </p>
                </CardContent>

                <Separator />

                <CardFooter className="flex flex-col gap-2">
                    <Button onClick={handleVerify} className="w-full cursor-pointer">
                        Xác nhận
                    </Button>
                    <Button variant="outline" onClick={onBack} className="w-full cursor-pointer">
                        Quay lại
                    </Button>
                    <Button variant="ghost" disabled={!resendAvailable} onClick={handleResend} className="w-full cursor-pointer text-blue-600">
                        Gửi lại mã
                    </Button>
                    <Button variant="secondary" onClick={() => window.location.reload()} className="w-full cursor-pointer">
                        Đăng nhập ngay
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
