import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { AuthAPI } from "@/api/auth.api";
import { useAuthStore } from "@/stores/useAuthStores";

export default function AuthCallback() {
    const location = useLocation();
    const navigate = useNavigate();
    const { fetchUser } = useAuthStore();
    const [message, setMessage] = useState("Đang xử lý đăng nhập với Google...");

    useEffect(() => {
        const handleGoogleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const code = params.get("code");
            const error = params.get("error");
            console.log("code: {}", code);

            if (error) {
                console.error("Google error:", error);
                setMessage("Đã xảy ra lỗi khi đăng nhập với Google. Đang chuyển hướng...");
                setTimeout(() => navigate("/login"), 2000);
                return;
            }

            if (!code) {
                setMessage("Không tìm thấy mã xác thực. Đang chuyển hướng...");
                setTimeout(() => navigate("/login"), 2000);
                return;
            }

            try {
                // Gọi API backend với code
                const response = await AuthAPI.loginWithGoogle(code);

                console.log("Login with Google:", response);

                // Kiểm tra response và lưu token
                if (response.status === 200 && response.data?.token) {
                    const token = response.data.token;
                    localStorage.setItem("auth_token", token);

                    setMessage("Đăng nhập thành công! Đang chuyển hướng...");

                    // Fetch user profile sau khi đăng nhập
                    await fetchUser();

                    setTimeout(() => navigate("/"), 1000);
                } else {
                    setMessage("Đăng nhập thất bại. Đang chuyển hướng...");
                    setTimeout(() => navigate("/login"), 2000);
                }
            } catch (err) {
                console.error("Login with Google failed:", err);
                setMessage("Đăng nhập thất bại. Đang chuyển hướng...");
                setTimeout(() => navigate("/login"), 2000);
            }
        };

        handleGoogleCallback();
    }, [location, navigate, fetchUser]);

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-[400px] shadow-lg">
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader className="w-12 h-12 animate-spin text-blue-600" />
                        <p className="text-center text-muted-foreground">{message}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
