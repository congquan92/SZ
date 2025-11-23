import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSmoothScroll } from "@/hook/useSmoothScroll";

export default function Footer() {
    const { scrollToTop } = useSmoothScroll();
    const year = new Date().getFullYear();
    const infoContact = {
        address: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
        phone: "0123 456 789",
        email: "contact@shopzeus.com",
    };
    const GroupLink = [
        {
            label: "Giới thiệu",
            to: "/about",
        },
        {
            label: "Chính sách đổi trả",
            to: "/returns",
        },
        {
            label: "Chính sách bảo mật",
            to: "/privacy",
        },
        {
            label: "Tuyển dụng",
            to: "/careers",
        },
        {
            label: "Liên hệ",
            to: "/contact",
        },
    ];

    return (
        <footer className="bg-neutral-900 text-neutral-300 mt-10">
            {/* 4 cột, có vạch chia giống Torano */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-12 grid gap-10 md:grid-cols-4 md:divide-x md:divide-neutral-800">
                {/* Cột 1: Brand + mô tả + mạng xã hội + phương thức thanh toán */}
                <div className="space-y-4 md:pr-6">
                    <div className="flex items-start gap-3">
                        <Avatar className="h-14 w-14 rounded">
                            <AvatarImage src="/logo-shop.jpg" alt="ShopZeus" className="object-cover" />
                            <AvatarFallback className="bg-black text-white flex items-center justify-center font-bold">SZ</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-lg font-semibold text-neutral-200">Thời trang nam SZ</h2>
                            <p className="text-sm leading-6">Hệ thống thời trang nam trẻ trung, hiện đại, hướng tới phong cách nam tính, lịch lãm và dễ ứng dụng hằng ngày.</p>
                        </div>
                    </div>

                    {/* Social */}
                    <div className="flex gap-3 mt-2">
                        <Link to="https://facebook.com" target="_blank" className="p-2 border border-neutral-700 rounded hover:border-neutral-500">
                            <Facebook size={16} />
                        </Link>
                        <Link to="https://instagram.com" target="_blank" className="p-2 border border-neutral-700 rounded hover:border-neutral-500">
                            <Instagram size={16} />
                        </Link>
                        <Link to="https://youtube.com" target="_blank" className="p-2 border border-neutral-700 rounded hover:border-neutral-500">
                            <Youtube size={16} />
                        </Link>
                    </div>

                    {/* Phương thức thanh toán (placeholder hình) */}
                    <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold text-neutral-100">Phương thức thanh toán</p>
                        <div className="flex flex-wrap gap-2">
                            <img src="/vnpay.png" alt="VNPAY" className="h-8 bg-white rounded-sm object-contain" />
                            {/* <img src="/payments/zalopay.png" alt="ZaloPay" className="h-8 bg-white rounded-sm object-contain" />
                            <img src="/payments/visa.png" alt="Visa" className="h-8 bg-white rounded-sm object-contain" />
                            <img src="/payments/mastercard.png" alt="Mastercard" className="h-8 bg-white rounded-sm object-contain" /> */}
                        </div>
                    </div>
                </div>

                {/* Cột 2: Thông tin liên hệ */}
                <div className="space-y-3 md:px-6">
                    <h3 className="text-lg font-semibold text-neutral-200">Thông tin liên hệ</h3>
                    <div className="text-sm space-y-2">
                        <p>
                            <span className="font-semibold text-neutral-100">Địa chỉ:</span> {infoContact.address}
                        </p>

                        <p className="flex items-center gap-2">
                            <span>
                                <span className="font-semibold text-neutral-100">Điện thoại:</span> {infoContact.phone}
                            </span>
                        </p>

                        <p>
                            <span className="font-semibold text-neutral-100">Email:</span> {infoContact.email}
                        </p>
                    </div>

                    {/* Phương thức vận chuyển (placeholder) */}
                    <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold text-neutral-100">Phương thức vận chuyển</p>
                        <div className="flex flex-wrap gap-2">
                            <img src="/ghn.png" alt="GHN" className="h-8 bg-white rounded-sm object-contain" />
                            {/* <img src="/shipping/ninja.png" alt="Ninja Van" className="h-8 bg-white rounded-sm object-contain" />
                            <img src="/shipping/jtexpress.png" alt="J&T" className="h-8 bg-white rounded-sm object-contain" /> */}
                        </div>
                    </div>
                </div>

                {/* Cột 3: Nhóm liên kết */}
                <div className="space-y-3 md:px-6">
                    <h3 className="text-lg font-semibold text-neutral-200">Nhóm liên kết</h3>
                    <ul className="space-y-2 text-sm mb-4">
                        {GroupLink.map((item, index) => (
                            <li key={index}>
                                <Link to={item.to} className="hover:text-white hover:underline" onClick={() => scrollToTop()}>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Cột 4: Đăng ký nhận tin */}
                <div className="space-y-4 md:pl-6">
                    <h3 className="text-lg font-semibold text-neutral-200">Đăng ký nhận tin</h3>
                    <p className="text-sm">Để cập nhật những sản phẩm mới, nhận thông tin ưu đãi đặc biệt và thông tin giảm giá khác.</p>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            // xử lý subscribe ở đây nếu cần
                        }}
                        className="flex flex-col sm:flex-row gap-2"
                    >
                        <Input type="email" placeholder="Nhập email của bạn" className="bg-neutral-800 border-neutral-700 text-sm placeholder:text-neutral-400" required />
                        <Button type="submit" variant={"secondary"} className="whitespace-nowrap text-sm">
                            ĐĂNG KÝ
                        </Button>
                    </form>
                </div>
            </div>

            {/* Bottom line */}
            <div className="border-t border-neutral-800 py-4 text-center text-xs md:text-sm text-neutral-500">Copyright © {year} ShopZeus. Powered by SZ.</div>
        </footer>
    );
}
