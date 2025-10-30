import { AuthAPI } from "@/api/auth.api";
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

interface UserProfile {
    id: number;
    userName: string;
    fullName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: string;
    email: string;
    userRank: string;
    avatar: string | null; // URL hiện tại đã lưu ở backend
    phone: string;
    totalSpent?: number;
}

export default function ProfileTab() {
    const { user } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // Ảnh mới (chỉ lưu cục bộ để preview; CHƯA upload)
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // đồng bộ profile với user khi user thay đổi
    useEffect(() => {
        if (!user) return;
        setProfile({
            id: user.id,
            userName: user.userName,
            fullName: user.fullName,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            email: user.email,
            phone: user.phone,
            userRank: user.userRankResponse.name,
            avatar: user.avatar,
            totalSpent: user.totalSpent,
        });
        setAvatarFile(null);
        setIsEditing(false);
    }, [user]);
    // Bỏ ảnh mới, quay lại ảnh cũ (chưa đụng tới server)
    const handleClearAvatar = () => {
        setAvatarFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePickAvatar = () => fileInputRef.current?.click();

    // Chọn ảnh: chỉ validate + lưu file để preview. KHÔNG upload ở đây.
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;

        if (!f.type.startsWith("image/")) {
            toast.error("Vui lòng chọn tệp hình ảnh hợp lệ.");
            // reset input để lần sau chọn lại cùng file vẫn trigger
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            toast.error("Ảnh quá lớn (tối đa 5MB).");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setAvatarFile(f);
        // reset input để có thể chọn lại cùng tệp
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Tạo preview: ưu tiên blob của ảnh mới, nếu không thì dùng URL cũ từ user
    const avatarPreview = useMemo(() => {
        if (avatarFile) return URL.createObjectURL(avatarFile);
        // console.log("Using existing avatar URL:", user?.avatar);
        return profile?.avatar ?? "";
    }, [avatarFile, profile?.avatar]);

    // Dọn URL blob khi thay đổi/huỷ components
    useEffect(() => {
        return () => {
            if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const disabledInput = !isEditing ? "bg-muted" : "";
    const disableSelectWrap = !isEditing ? "pointer-events-none opacity-70 select-none" : "";

    const handleUpdateProfile = async () => {
        if (!profile) return;
        console.log("Updating profile...", profile, avatarFile);
        try {
            let avatarUrl = profile.avatar || "";
            if (avatarFile) {
                const data_url = await AuthAPI.uploadImg(avatarFile);
                avatarUrl = data_url.data[0];
            }
            await AuthAPI.updateProfile(profile.fullName, profile.gender, profile.dateOfBirth, profile.phone, avatarUrl);
        } catch (error) {
            console.error("Cancel edit profile failed", error);
        }
        setIsSaving(false);
        setIsEditing(false);
    };
    const handleCancelEdit = async () => {
        if (!user) return;
        setProfile({
            id: user.id,
            userName: user.userName,
            fullName: user.fullName,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            email: user.email,
            phone: user.phone,
            userRank: user.userRankResponse.name,
            avatar: user.avatar,
            totalSpent: user.totalSpent,
        });
        setAvatarFile(null);
        setIsEditing(false);
    };

    return (
        <div>
            <Card>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2">
                        <User className="size-5" /> Thông Tin Cá Nhân
                    </CardTitle>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                            Rank: {user?.userRankResponse.name}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => setIsEditing((prev) => !prev)} className="gap-2" disabled={isSaving}>
                            <Edit2 className="size-4" />
                            {isEditing ? "Hủy" : "Chỉnh sửa"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {profile && (
                        <>
                            {/* avatar */}
                            <div className="flex items-center justify-center mb-4">
                                <div className="relative">
                                    <Avatar className="h-32 w-32 shrink-0 rounded-full ring-2 ring-border shadow-sm overflow-hidden">
                                        <AvatarImage src={avatarPreview} alt={profile.userName} className="h-full w-full object-cover" loading="eager" />
                                        <AvatarFallback className="bg-black text-white font-bold">{profile.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>

                                    {isEditing && (
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                                            <Button size="sm" variant="secondary" className="gap-2" onClick={handlePickAvatar} disabled={isSaving}>
                                                <ImageIcon className="size-4" />
                                                Đổi ảnh
                                            </Button>

                                            {avatarFile && (
                                                <Button size="sm" variant="outline" className="gap-2" onClick={handleClearAvatar} disabled={isSaving}>
                                                    <X className="size-4" />
                                                    Bỏ chọn
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* input file ẩn */}
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                </div>
                            </div>
                            {/* Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">
                                        <CircleUser className="size-5" /> Họ và tên
                                    </Label>
                                    <Input id="fullName" value={profile.fullName} onChange={(e) => setProfile((prev) => (prev ? { ...prev, fullName: e.target.value } : prev))} disabled={!isEditing} className={disabledInput} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="userName">
                                        <User className="size-5" /> Tên đăng nhập
                                    </Label>
                                    <Input id="userName" value={profile.userName} disabled className="bg-muted" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="size-5" /> Email
                                    </Label>
                                    <Input id="email" type="email" value={profile.email} onChange={(e) => setProfile((prev) => (prev ? { ...prev, email: e.target.value } : prev))} disabled={!isEditing} className={disabledInput} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2">
                                        <Phone className="size-5" /> Số điện thoại
                                    </Label>
                                    <Input id="phone" value={profile.phone} onChange={(e) => setProfile((prev) => (prev ? { ...prev, phone: e.target.value } : prev))} disabled={!isEditing} className={disabledInput} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">
                                        <VenusAndMars className="size-5" /> Giới tính
                                    </Label>
                                    <div className={disableSelectWrap}>
                                        <Select value={profile.gender} onValueChange={(v: UserProfile["gender"]) => setProfile((prev) => (prev ? { ...prev, gender: v } : prev))} disabled={!isEditing}>
                                            <SelectTrigger id="gender" className="h-9">
                                                <SelectValue placeholder="Chọn giới tính" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MALE">Nam</SelectItem>
                                                <SelectItem value="FEMALE">Nữ</SelectItem>
                                                <SelectItem value="BOTH">Khác (Beta)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
                                        <Calendar className="size-4" /> Ngày sinh
                                    </Label>
                                    <Input id="dateOfBirth" type="date" value={profile.dateOfBirth} onChange={(e) => setProfile((prev) => (prev ? { ...prev, dateOfBirth: e.target.value } : prev))} disabled={!isEditing} className={disabledInput} />
                                </div>
                            </div>
                            {/* khung rank */}

                            {/* Luu thay doi */}
                            {isEditing && (
                                <div className="flex gap-2 pt-1 mt-2">
                                    <Button onClick={handleUpdateProfile} disabled={isSaving}>
                                        {isSaving && <Loader2 className="size-4 mr-2 animate-spin" />}
                                        Lưu thay đổi
                                    </Button>
                                    <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                                        Hủy
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
