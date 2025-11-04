import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import ProfileTab from "@/components/ProfileTab";
import SecurityTab from "@/components/SecurityTab";
import Title from "@/components/Title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, MapPinHouse, Shield, User } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStores";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AddressTab from "@/components/AddressTab";
export default function Profile() {
    const { user } = useAuthStore();
    // Get tab from URL query params
    const searchParams = new URLSearchParams(window.location.search);
    const tabFromUrl = searchParams.get("tab") || "profile";
    const [activeTab, setActiveTab] = useState(tabFromUrl);

    if (!user) {
        return (
            <div className="container mx-auto flex items-center justify-center flex-col min-h-[500px]">
                <div className="mt-6">Vui lòng đăng nhập để xem trang cá nhân.</div>
                <Button className="mt-6">
                    <Link to="/login">
                        <Home className="inline-flex mr-2" /> Đăng nhập ngay
                    </Link>
                </Button>
            </div>
        );
    }
    return (
        <div className="container mx-auto p-2 space-y-6">
            <BreadcrumbCustom title="Trang chủ" link_title="/" subtitle="Tài khoản" />

            <Title title="Tài khoản của tôi" subtitle="Quản lý thông tin cá nhân của bạn" />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="size-4" />
                        Thông tin
                    </TabsTrigger>

                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="size-4" />
                        Bảo mật
                    </TabsTrigger>

                    <TabsTrigger value="address" className="flex items-center gap-2">
                        <MapPinHouse className="size-4" />
                        Sổ Địa chỉ
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                    <ProfileTab />
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <SecurityTab />
                </TabsContent>
                {/* Address */}
                <TabsContent value="address">
                    <AddressTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
