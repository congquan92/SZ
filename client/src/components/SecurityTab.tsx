import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import { AuthAPI } from "@/api/auth.api";

export default function SecurityTab() {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const resetForm = () => {
        setFormData({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
        setShowOld(false);
        setShowNew(false);
        setShowConfirm(false);
    };

    const handleChangePassword = async () => {
        // Xử lý thay đổi mật khẩu ở đây
        await AuthAPI.changePassword(formData.oldPassword, formData.newPassword, formData.confirmPassword);
        console.log("Đổi mật khẩu:", formData);
        setOpen(false);
        resetForm();
    };

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="size-5" />
                        Bảo Mật Tài Khoản
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        {/* Đổi mật khẩu */}
                        <div className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Đổi mật khẩu</h4>
                                <p className="text-sm text-gray-600">Cập nhật mật khẩu để bảo mật tài khoản</p>
                            </div>

                            <Dialog
                                open={open}
                                onOpenChange={(isOpen) => {
                                    setOpen(isOpen);
                                    if (!isOpen) resetForm();
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button variant="outline">Thay đổi</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[400px]">
                                    <DialogHeader>
                                        <DialogTitle>Đổi mật khẩu</DialogTitle> <DialogDescription>Nhập mật khẩu cũ và mật khẩu mới để tiếp tục.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-2">
                                        <div className="grid gap-2 relative">
                                            <Label htmlFor="oldPassword">Mật khẩu cũ</Label>{" "}
                                            <Input id="oldPassword" type={showOld ? "text" : "password"} placeholder="Nhập mật khẩu hiện tại" value={formData.oldPassword} onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })} />{" "}
                                            <div className="absolute right-3 top-[33px] cursor-pointer" onClick={() => setShowOld(!showOld)}>
                                                {showOld ? <EyeOff className="size-4 text-gray-500" /> : <Eye className="size-4 text-gray-500" />}
                                            </div>
                                        </div>
                                        <div className="grid gap-2 relative">
                                            <Label htmlFor="newPassword">Mật khẩu mới</Label>{" "}
                                            <Input id="newPassword" type={showNew ? "text" : "password"} placeholder="Nhập mật khẩu mới" value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} />
                                            <div className="absolute right-3 top-[33px] cursor-pointer" onClick={() => setShowNew(!showNew)}>
                                                {showNew ? <EyeOff className="size-4 text-gray-500" /> : <Eye className="size-4 text-gray-500" />}
                                            </div>
                                        </div>
                                        <div className="grid gap-2 relative">
                                            <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirm ? "text" : "password"}
                                                placeholder="Nhập lại mật khẩu mới"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            />
                                            <div className="absolute right-3 top-[33px] cursor-pointer" onClick={() => setShowConfirm(!showConfirm)}>
                                                {showConfirm ? <EyeOff className="size-4 text-gray-500" /> : <Eye className="size-4 text-gray-500" />}
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" onClick={handleChangePassword}>
                                            Lưu thay đổi
                                        </Button>
                                        <Button
                                            type="submit"
                                            onClick={() => {
                                                setOpen(false);
                                                resetForm();
                                            }}
                                            variant="outline"
                                        >
                                            Hủy
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Xác thực 2 bước */}
                        <div className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Xác thực 2 bước</h4>
                                <p className="text-sm text-gray-600">Thêm lớp bảo mật cho tài khoản của bạn</p>
                            </div>
                            <Button variant="outline">Bật</Button>
                        </div>

                        {/* Thiết bị đăng nhập */}
                        <div className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                                <h4 className="font-medium">Thiết bị đăng nhập</h4>
                                <p className="text-sm text-gray-600">Quản lý các thiết bị đã đăng nhập</p>
                            </div>
                            <Button variant="outline">Xem</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
