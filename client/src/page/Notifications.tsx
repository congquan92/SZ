import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

interface Notification {
    id: number;
    title: string;
    message: string;
    date: string;
    type?: "order" | "promo" | "system" | "other"; // có thể dùng để hiển thị icon khác nhau sau này
}

const mockNotifications: Notification[] = [
    {
        id: 1,
        title: "Đơn hàng #1234 đã được xác nhận",
        message: "Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được chuẩn bị.",
        date: "2025-10-01 14:20",
        type: "order",
    },
    {
        id: 2,
        title: "Khuyến mãi cuối tuần",
        message: "Nhập mã SAVE10 để được giảm 10% cho mọi đơn hàng.",
        date: "2025-10-02 09:00",
        type: "promo",
    },
    {
        id: 3,
        title: "Cập nhật hệ thống",
        message: "Hệ thống sẽ bảo trì vào lúc 0h ngày 05/10.",
        date: "2025-10-02 08:00",
        type: "system",
    },
    {
        id: 4,
        title: "Tin Khẩn cấp!!!!",
        message: "Anh Công Quân quá đẹp trai =)))",
        date: "2025-10-03 16:45",
        type: "other",
    },
];
export default function Notifications() {
    const notifications = mockNotifications; // giả sử sau này fetch từ API

    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="size-5" />
                        Thông Báo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Bell className="size-12 mx-auto mb-4 opacity-50" />
                            <p>Không có thông báo mới</p>
                            <p className="text-sm">Các thông báo về đơn hàng, khuyến mãi sẽ hiển thị tại đây</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((noti) => (
                                <div key={noti.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                                    <p className="font-medium">{noti.title}</p>
                                    <p className="text-sm text-gray-600">{noti.message}</p>
                                    <p className="text-xs text-gray-400">{noti.date}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
