import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Globe, Facebook } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStores";
import OTP from "@/auth/OTP";
import { AuthAPI } from "@/api/auth.api";
export default function Signup() {
    const [formData, setFormData] = useState({
        fullName: "",
        gender: "",
        dateOfBirth: "",
        email: "",
        phone: "",
        username: "",
        password: "",
        confirm: "",
    });
    const [message, setMessage] = useState("");
    const { loading, signup } = useAuthStore();
    const navigate = useNavigate();
    const [step, setStep] = useState<"form" | "verify">("form");
    const [userId, setUserId] = useState("");

    const validate = () => {
        if (!/^[\p{L}\s]+$/u.test(formData.fullName)) return "Họ và tên chỉ chứa chữ và khoảng trắng.";
        if (!formData.gender) return "Chọn giới tính.";
        if (!formData.dateOfBirth) return "Nhập ngày sinh.";
        // tuổi >= 16
        const dob = new Date(formData.dateOfBirth);
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const md = now.getMonth() - dob.getMonth();
        if (md < 0 || (md === 0 && now.getDate() < dob.getDate())) age--;
        if (age < 16) return "Bạn phải trên 16 tuổi.";
        // email
        if (!/^[a-zA-Z0-9]+([._%+-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/.test(formData.email)) return "Email không hợp lệ.";
        // phone
        if (!/^[0-9]{9,11}$/.test(formData.phone)) return "Số điện thoại không hợp lệ.";
        // username
        if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/.test(formData.username)) return "Tên đăng nhập phải có cả chữ và số.";
        // password
        if (formData.password.length < 8) return "Mật khẩu tối thiểu 8 ký tự.";
        if (formData.password !== formData.confirm) return "Mật khẩu không khớp.";
        return "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // const err = validate();
        // if (err) {
        //     setMessage(err);
        //     return;
        // }
        setMessage("");
        try {
            const d = await signup(formData.fullName, formData.gender, formData.dateOfBirth, formData.email, formData.phone, formData.username, formData.password);
            setUserId(d.data);
            await AuthAPI.sendOTP(d.data);
            setStep("verify");
        } catch (e) {
            console.error(e);
            setMessage("Đăng ký thất bại, thử lại nhé.");
        }
    };

    return (
        <>
            {step === "form" ? (
                <div className="flex items-center justify-center p-5">
                    <Card className="w-[450px] shadow-lg rounded-none">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Đăng Ký</CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            {/* Social */}
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" className="w-full flex items-center gap-2 cursor-pointer" disabled={loading}>
                                    <Globe className="w-5 h-5 text-red-500" /> Đăng Nhập Với Google
                                </Button>
                                <Button variant="outline" className="w-full flex items-center gap-2 cursor-pointer" disabled={loading}>
                                    <Facebook className="w-5 h-5" /> Đăng Nhập Với Facebook
                                </Button>
                            </div>

                            <Separator className="my-4" />

                            {message && <p className="text-red-500 text-center">{message}</p>}

                            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                                {/* Họ tên + Giới tính */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="fullName">Họ và Tên</Label>
                                        <Input id="fullName" type="text" placeholder="Nguyễn Văn A" required className="w-full" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} disabled={loading} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="gender">Giới tính</Label>
                                        <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                                            <SelectTrigger id="gender" className="w-full">
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MALE">Nam</SelectItem>
                                                <SelectItem value="FEMALE">Nữ</SelectItem>
                                                <SelectItem value="BOTH">Beta</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Ngày sinh + Email */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="dateOfBirth">Ngày sinh</Label>
                                        <Input id="dateOfBirth" type="date" required className="w-full" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} disabled={loading} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="email@example.com" required className="w-full" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} disabled={loading} />
                                    </div>
                                </div>

                                {/* Số điện thoại */}
                                <div className="space-y-1">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input id="phone" type="tel" placeholder="0123456789" required className="w-full" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={loading} />
                                </div>

                                {/* Username */}
                                <div className="space-y-1">
                                    <Label htmlFor="username">Tên đăng nhập</Label>
                                    <Input id="username" type="text" placeholder="username" required className="w-full" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} disabled={loading} />
                                </div>

                                {/* Mật khẩu */}
                                <div className="space-y-1">
                                    <Label htmlFor="password">Mật khẩu</Label>
                                    <Input id="password" type="password" placeholder="Mật khẩu" required className="w-full" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} disabled={loading} />
                                </div>

                                {/* Xác nhận mật khẩu */}
                                <div className="space-y-1">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Xác nhận mật khẩu"
                                        required
                                        className="w-full"
                                        value={formData.confirm}
                                        onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
                                        disabled={loading}
                                    />
                                </div>

                                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                                    {loading ? "Đang xử lý..." : "Đăng Ký"}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="flex justify-between items-center text-sm">
                            <Link to="#" className="text-blue-500 hover:underline">
                                Quên mật khẩu?
                            </Link>
                            <Link to="/login" className="text-blue-500 hover:underline">
                                Đã có tài khoản? Đăng nhập
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            ) : (
                <OTP email={formData.email} id_user={userId} onBack={() => setStep("form")} onLogin={() => navigate("/login")} />
            )}
        </>
    );
}
