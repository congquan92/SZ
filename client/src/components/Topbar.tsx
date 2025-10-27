import { MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Topbar() {
    return (
        <div className="bg-gray-900 text-white text-xs">
            <div className="container mx-auto px-4 py-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <Phone size={12} />
                            Hotline: 1900-1234
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                            <MapPin size={12} />
                            Miễn phí vận chuyển đơn từ 500k
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/tracking" className="hover:underline">
                            Tra cứu đơn hàng
                        </Link>
                        <Link to="/cloth-size" className="hover:underline">
                            Hướng dẫn chọn size
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
