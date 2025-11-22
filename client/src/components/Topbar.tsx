import { Info, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function Topbar() {
    return (
        <div className="bg-gray-900 text-white text-xs">
            <div className="container mx-auto px-4 py-2">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 hover:underline cursor-pointer">
                            <Phone size={12} />
                            Hotline: 1900-1234
                        </span>
                        <span className="hidden sm:flex items-center gap-1 hover:underline cursor-pointer">
                            <MapPin size={12} />
                            Ship toàn quốc
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* <Link to="/tracking" className="hover:underline">
                            Tra cứu đơn hàng
                        </Link> */}
                        <Link to="/cloth-size" className="hover:underline flex items-center gap-1">
                            <Info size={12} /> Hướng dẫn chọn size
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
