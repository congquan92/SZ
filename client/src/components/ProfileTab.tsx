import { AuthAPI } from "@/api/auth.api";
import { UploadImgAPI } from "@/api/uploadImg.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/stores/useAuthStores";
import { Calendar, CircleUser, Edit2, ImageIcon, Loader2, Mail, Phone, User, VenusAndMars, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface ProfileFormData {
    fullName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: string;
    phone: string;
}

export default function ProfileTab() {
    const { user, fetchUser } = useAuthStore();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // State riêng cho dữ liệu trên form, tách biệt với 'user'
    const [formData, setFormData] = useState<ProfileFormData | null>(null);

    // Ảnh mới (chỉ lưu cục bộ để preview)
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Đồng bộ form data khi 'user' thay đổi
    useEffect(() => {
        if (!user) return;
        setFormData({
            fullName: user.fullName,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            phone: user.phone,
        });
        setAvatarFile(null); // Reset file ảnh đã chọn
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [user]);

    // Khi bấm nút "Chỉnh sửa" / "Hủy"
    const toggleEditMode = () => {
        if (isEditing) {
            // Nếu đang edit mà bấm "Hủy", reset lại form
            if (!user) return;
            setFormData({
                fullName: user.fullName,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth,
                phone: user.phone,
            });
            setAvatarFile(null); // Reset file ảnh đã chọn
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
        setIsEditing((prev) => !prev);
    };

    // Tạo preview: ưu tiên blob của ảnh mới, nếu không thì dùng URL cũ từ 'user'
    const avatarPreview = useMemo(() => {
        if (avatarFile) return URL.createObjectURL(avatarFile);
        return user?.avatar ?? "";
    }, [avatarFile, user?.avatar]);

    // Dọn dẹp URL blob
    useEffect(() => {
        const previewUrl = avatarPreview;
        return () => {
            if (previewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [avatarPreview]);

    const handleSave = async () => {
        if (!formData || !user) return;
        setIsSaving(true);
        try {
            let updatedAvatarUrl = user.avatar || ""; // Giữ URL cũ làm mặc định

            // 1. Nếu có ảnh mới, upload và lấy URL
            if (avatarFile) {
                const uploadResponse = await UploadImgAPI.uploadImg(avatarFile);
                if (uploadResponse.data && uploadResponse.data.length > 0) {
                    updatedAvatarUrl = uploadResponse.data[0];
                } else {
                    throw new Error("Lỗi upload ảnh.");
                }
            }

            // 2. Tạo payload để gửi đi
            const updatePayload = {
                ...formData,
                avatar: updatedAvatarUrl,
            };

            // 3. Gọi API cập nhật profile.
            await AuthAPI.updateProfile(updatePayload.fullName, updatePayload.gender, updatePayload.dateOfBirth, updatePayload.phone, updatePayload.avatar);

            // 4. THÀNH CÔNG:
            await fetchUser();

            toast.success("Cập nhật thông tin thành công!");
            setIsEditing(false); // Thoát chế độ chỉnh sửa
        } catch (error) {
            console.error("Update profile failed:", error);
            toast.error("Cập nhật thất bại. Vui lòng thử lại.");
            // Giữ nguyên trạng thái isEditing và formData để người dùng sửa lại
        } finally {
            setIsSaving(false);
        }
    };

    // Các hàm xử lý avatar (không thay đổi nhiều)
    const handlePickAvatar = () => fileInputRef.current?.click();
    const handleClearAvatar = () => {
        setAvatarFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn tệp hình ảnh hợp lệ.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            // 5MB
            toast.error("Kích thước ảnh không được vượt quá 5MB.");
            return;
        }
        setAvatarFile(file);
    };

    const disabledInput = !isEditing ? "bg-muted" : "";
    const disableSelectWrap = !isEditing ? "pointer-events-none opacity-70 select-none" : "";

    if (!user || !formData) {
        return <div>Đang tải thông tin...</div>;
    }

    return (
        <div>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2">
                        <User className="size-5" /> Thông Tin Cá Nhân
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                            Rank: {user.userRankResponse.name}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={toggleEditMode} className="gap-2" disabled={isSaving}>
                            <Edit2 className="size-4" />
                            {isEditing ? "Hủy" : "Chỉnh sửa"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Avatar Section */}
                    <div className="flex items-center justify-center mb-4">
                        <div className="relative">
                            <Avatar className="h-32 w-32 shrink-0 rounded-full ring-2 ring-border shadow-sm overflow-hidden">
                                <AvatarImage src={avatarPreview} alt={user.userName} className="h-full w-full object-cover" loading="eager" />
                                <AvatarFallback className="bg-black text-white font-bold">{user.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>

                            {isEditing && (
                                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                                    <Button size="sm" variant="secondary" className="gap-2" onClick={handlePickAvatar} disabled={isSaving}>
                                        <ImageIcon className="size-4" /> Đổi ảnh
                                    </Button>
                                    {avatarFile && (
                                        <Button size="sm" variant="outline" className="gap-2" onClick={handleClearAvatar} disabled={isSaving}>
                                            <X className="size-4" /> Bỏ chọn
                                        </Button>
                                    )}
                                </div>
                            )}

                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        </div>
                    </div>

                    {/* Information Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">
                                <CircleUser className="size-5" /> Họ và tên
                            </Label>
                            <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} disabled={!isEditing} className={disabledInput} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="userName">
                                <User className="size-5" /> Tên đăng nhập
                            </Label>
                            <Input id="userName" value={user.userName} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="size-5" /> Email
                            </Label>
                            <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="flex items-center gap-2">
                                <Phone className="size-5" /> Số điện thoại
                            </Label>
                            <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} disabled={!isEditing} className={disabledInput} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">
                                <VenusAndMars className="size-5" /> Giới tính
                            </Label>
                            <div className={disableSelectWrap}>
                                <Select value={formData.gender} onValueChange={(v: "MALE" | "FEMALE" | "OTHER") => setFormData({ ...formData, gender: v })} disabled={!isEditing}>
                                    <SelectTrigger id="gender">
                                        <SelectValue placeholder="Chọn giới tính" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MALE">Nam</SelectItem>
                                        <SelectItem value="FEMALE">Nữ</SelectItem>
                                        <SelectItem value="OTHER">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                                <Calendar className="size-4" /> Ngày sinh
                            </Label>
                            <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} disabled={!isEditing} className={disabledInput} />
                        </div>
                    </div>

                    {/* Save/Cancel Buttons */}
                    {isEditing && (
                        <div className="flex gap-2 pt-4 mt-2">
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
                                Lưu thay đổi
                            </Button>
                            <Button variant="outline" onClick={toggleEditMode} disabled={isSaving}>
                                Hủy
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
