import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
const products = [
    {
        id: 1,
        name: "Set Denim Xám",
        img: "https://file.hstatic.net/1000253775/file/01_a324338849ba4d819a8cb9cbc1ca07f3.jpg",
    },
    {
        id: 2,
        name: "Áo sơ mi xanh rêu",
        img: "https://file.hstatic.net/1000253775/file/01_4595a5853bd346f289dcba2c7dd1bad2.jpg",
    },
    {
        id: 3,
        name: "Set kẻ sọc xám",
        img: "https://file.hstatic.net/1000253775/file/01_978de6abb2b945a1a9cb2e9872b91e39.jpg",
    },
    {
        id: 4,
        name: "Áo sơ mi xanh dương",
        img: "https://file.hstatic.net/1000253775/file/01_24e410989d25495e96222379fd9c03fa.jpg",
    },
];

export default function Gallery() {
    const navigate = useNavigate();
    return (
        <div className="">
            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => (
                    <Card key={product.id} className="group relative overflow-hidden p-0 rounded-none border shadow-sm">
                        <CardContent className="p-0">
                            <img src={product.img} alt={product.name} className="w-full max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-105" />

                            {/* Overlay action */}
                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    size="icon"
                                    className="rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
                                    onClick={() =>
                                        toast.success("Đã thêm vào giỏ hàng", {
                                            duration: 2000,
                                            action: {
                                                label: "Xem ngay",
                                                onClick: () => navigate("/cart"),
                                            },
                                        })
                                    }
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
