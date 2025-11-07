import { FavoriteAPI } from "@/api/favorite.api";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import { calculateDiscountPercent, formatVND } from "@/lib/helper";
import { Heart, ShoppingCart, Star, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface FavoriteItem {
    avgRating: number;
    description: string;
    id: number;
    listPrice: number;
    name: string;
    salePrice: number;
    soldQuantity: number;
    status: "ACTIVE";
    urlCoverImage: string;
    urlvideo: string;
}

export default function Wishlist() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

    const init = async () => {
        try {
            setLoading(true);
            const res = await FavoriteAPI.getFavorites();
            setFavorites(res.data);
        } catch (error) {
            console.error("Failed to fetch favorites:", error);
            toast.error("Không thể tải danh sách yêu thích");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (favoriteId: number) => {
        try {
            setRemovingIds((prev) => new Set(prev).add(favoriteId));
            await FavoriteAPI.deleteFavorite(favoriteId);
            setFavorites((prev) => prev.filter((item) => item.id !== favoriteId));
            toast.success("Đã xóa khỏi danh sách yêu thích");
        } catch (error) {
            console.error("Failed to remove favorite:", error);
            toast.error("Không thể xóa sản phẩm");
        } finally {
            setRemovingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(favoriteId);
                return newSet;
            });
        }
    };

    useEffect(() => {
        init();
    }, []);

    if (favorites.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-20">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Heart className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Chưa có sản phẩm yêu thích</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">Hãy thêm những sản phẩm bạn yêu thích vào danh sách để dễ dàng tìm lại sau này</p>
                    <Link to="/product">
                        <Button>
                            <Package className="h-4 w-4 mr-2" />
                            Khám phá sản phẩm
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-6">
            <BreadcrumbCustom title="Trang chủ" link_title="/" subtitle="Danh sách yêu thích" />

            <div className="mt-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Danh sách yêu thích</h1>
                            <p className="text-sm text-muted-foreground">{favorites.length} sản phẩm</p>
                        </div>
                    </div>
                </div>

                {favorites.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2">
                        {favorites.map((item) => {
                            const discount = calculateDiscountPercent(item.listPrice, item.salePrice);
                            const isRemoving = removingIds.has(item.id);

                            return (
                                <Card key={item.id} className="group p-0 shadow-none rounded-none cursor-pointer gap-0">
                                    <CardContent className="relative p-2">
                                        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-none font-medium z-10">{discount}%</Badge>
                                        <Link to={`/product/${item.id}`}>
                                            <img src={item.urlCoverImage} alt={item.name} className="object-cover w-full max-h-[250px] transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                        </Link>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="bg-white/90 text-gray-900 hover:bg-white text-xs px-3 py-1.5 rounded-none cursor-pointer backdrop-blur-sm"
                                                onClick={() => handleRemoveFavorite(item.id)}
                                                disabled={isRemoving}
                                            >
                                                {isRemoving ? (
                                                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                                ) : (
                                                    <>
                                                        <Trash2 className="h-4 w-4" /> Xóa
                                                    </>
                                                )}
                                            </Button>
                                            <Link to={`/product/${item.id}`} className="mx-2">
                                                <Button size="sm" variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white text-xs px-3 py-1.5 rounded-none cursor-pointer backdrop-blur-sm">
                                                    <ShoppingCart /> Mua ngay
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                    <div className="flex flex-col gap-2 p-3 items-start">
                                        <div className="flex flex-col gap-1">
                                            <Link to={`/product/${item.id}`} className="text-l font-medium text-gray-700 line-clamp-2 hover:underline">
                                                {item.name}
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(item.avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                                                    ))}
                                                </div>
                                                <Badge className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-none font-medium">{item.avgRating} Đánh giá</Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-500 text-xs line-through">{formatVND(item.listPrice)}</span>
                                                <span className="text-lg font-semibold text-gray-900">{formatVND(item.salePrice)}</span>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-none font-medium">{item.soldQuantity} Đã Bán</Badge>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
