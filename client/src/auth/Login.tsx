import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Facebook, Globe, Loader } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStores";
import { AuthAPI } from "@/api/auth.api";
import OTP from "@/auth/OTP";
import { googleLogin } from "@/auth/gg";

export default function Login() {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [msg, setMsg] = useState("");
    const { loading, login } = useAuthStore();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(false);
    const [step, setStep] = useState<"form" | "verify">("form");
    const [dataSub, setDataSub] = useState<{ userId: string; email: string }>({ userId: "", email: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg("");
        try {
            const res = await login(formData.username, formData.password);
            if (res.status === 1000) {
                setMsg("Tài khoản chưa được xác thực, vui lòng kiểm tra email để xác thực tài khoản.");
                setVerifying(true);
                setDataSub({ userId: res.data.userId, email: res.data.email });
                return;
            }
            if (res.status !== 1000 && res.status !== 1006 && res.status !== 500 && res.status !== 401) {
                setMsg("Đăng nhập thành công!");
                setVerifying(false);
                navigate("/");
                return;
            }
            setMsg("Tên đăng nhập hoặc mật khẩu không đúng, vui lòng thử lại.");
        } catch (err) {
            setMsg("Đăng nhập thất bại, thử lại nhé.");
            console.error(err);
        }
    };

    const handleVerify = async () => {
        await AuthAPI.sendOTP(dataSub.userId);
        setStep("verify");
    };

    return (
        <>
            {step === "form" ? (
                <div className="flex items-center justify-center p-20">
                    <Card className="w-[400px] shadow-lg rounded-none">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Đăng Nhập</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Social login (placeholder) */}
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" className="w-full flex items-center gap-2 cursor-pointer" onClick={googleLogin}>
                                    <Globe className="w-5 h-5" /> Đăng Nhập Với Google
                                </Button>
                                <Button variant="outline" className="w-full flex items-center gap-2 cursor-pointer">
                                    <Facebook className="w-5 h-5" /> Đăng Nhập Với Facebook
                                </Button>
                            </div>

                            <Separator />

                            {/* Form login */}
                            {msg && <p className="text-red-500 text-sm">{msg}</p>}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="username">Tên đăng nhập</Label>
                                    <Input id="username" placeholder="Tên đăng nhập" type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} disabled={loading} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Input id="password" placeholder="****************" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} disabled={loading} />
                                </div>

                                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin mr-2" /> Đang xử lý...
                                        </>
                                    ) : (
                                        "Đăng Nhập"
                                    )}
                                </Button>
                                {verifying && (
                                    <Button type="submit" className="w-full cursor-pointer" onClick={handleVerify}>
                                        Xác Thực Ngay
                                    </Button>
                                )}
                            </form>
                        </CardContent>

                        <CardFooter className="flex justify-between items-center text-sm">
                            <Link to="#" className="text-sm text-blue-500 hover:underline">
                                Quên mật khẩu?
                            </Link>
                            <Link to="/signup" className="text-sm text-blue-500 hover:underline">
                                Chưa có tài khoản? Đăng Ký
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            ) : (
                <OTP email={dataSub.email} id_user={dataSub.userId} onBack={() => setStep("form")} onLogin={() => navigate("/login")} />
            )}
        </>
    );
}
