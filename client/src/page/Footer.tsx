import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-neutral-900 text-neutral-300 mt-10">
            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
                {/* Logo + Intro */}
                <div className="flex items-start gap-3">
                    <Avatar className="size-15">
                        <AvatarImage src="/logo-shop.jpg" alt="SHOP ZUES" className="object-cover" />
                        <AvatarFallback className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold rounded">SZ</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-white">ShopZeus</h2>
                        <p className="text-sm leading-6">Thời trang nam trẻ trung, hiện đại. Sản phẩm chính hãng, giá tốt, dịch vụ nhanh chóng.</p>
                    </div>
                </div>

                {/* Liên kết */}
                <div className="text-left md:text-center">
                    <h3 className="text-white font-semibold mb-4">Liên kết</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link to="/about" className="hover:text-white">
                                Giới thiệu
                            </Link>
                        </li>
                        <li>
                            <Link to="/product" className="hover:text-white">
                                Sản phẩm
                            </Link>
                        </li>
                        <li>
                            <Link to="/blog" className="hover:text-white">
                                Tin tức
                            </Link>
                        </li>
                        <li>
                            <Link to="/contact" className="hover:text-white">
                                Liên hệ
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Hỗ trợ */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <Link to="/shipping" className="hover:text-white">
                                Chính sách giao hàng
                            </Link>
                        </li>
                        <li>
                            <Link to="/returns" className="hover:text-white">
                                Đổi trả & Hoàn tiền
                            </Link>
                        </li>
                        <li>
                            <Link to="/privacy" className="hover:text-white">
                                Chính sách bảo mật
                            </Link>
                        </li>
                        <li>
                            <Link to="/terms" className="hover:text-white">
                                Điều khoản sử dụng
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Liên hệ */}
                <div>
                    <h3 className="text-white font-semibold mb-4">Liên hệ</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <Phone size={16} /> 0123 456 789
                        </li>
                        <li className="flex items-center gap-2">
                            <Mail size={16} /> support@shopzeus.vn
                        </li>
                    </ul>
                    <div className="flex gap-4 mt-4">
                        <Link to="https://facebook.com" target="_blank">
                            <Facebook className="hover:text-white" />
                        </Link>
                        <Link to="https://instagram.com" target="_blank">
                            <Instagram className="hover:text-white" />
                        </Link>
                        <Link to="https://youtube.com" target="_blank">
                            <Youtube className="hover:text-white" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-neutral-700 py-4 text-center text-sm text-neutral-400">© {new Date().getFullYear()} ShopZeus. All rights reserved.</div>
        </footer>
    );
}
