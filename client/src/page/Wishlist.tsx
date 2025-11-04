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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {favorites.map((item) => {
                            const discount = calculateDiscountPercent(item.listPrice, item.salePrice);
                            const isRemoving = removingIds.has(item.id);

                            return (
                                <Card key={item.id} className="group overflow-hidden rounded-none hover:shadow-lg transition-all duration-300 ">
                                    <CardContent className="p-0">
                                        {/* Image Section */}
                                        <Link to={`/product/${item.id}`}>
                                            <div className="relative aspect-square overflow-hidden bg-muted">
                                                <img src={item.urlCoverImage} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                                                {/* Discount Badge */}
                                                {discount > 0 && <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">-{discount}%</Badge>}
                                            </div>
                                        </Link>

                                        {/* Content Section */}
                                        <div className="p-4 space-y-3">
                                            <Link to={`/product/${item.id}`}>
                                                <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors min-h-10">{item.name}</h3>
                                            </Link>

                                            {/* Rating & Sold */}
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    <span>{item.avgRating.toFixed(1)}</span>
                                                </div>
                                                <span>•</span>
                                                <span>Đã bán {item.soldQuantity}</span>
                                            </div>

                                            {/* Price Section */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-primary">{formatVND(item.salePrice)}</span>
                                                    {discount > 0 && <span className="text-xs text-muted-foreground line-through">{formatVND(item.listPrice)}</span>}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-2">
                                                <Button size="sm" variant="outline" className="flex-1" onClick={() => handleRemoveFavorite(item.id)} disabled={isRemoving}>
                                                    {isRemoving ? (
                                                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                                    ) : (
                                                        <>
                                                            <Trash2 className="h-4 w-4 mr-1" />
                                                            Xóa
                                                        </>
                                                    )}
                                                </Button>
                                                <Link to={`/product/${item.id}`} className="flex-1">
                                                    <Button size="sm" className="w-full">
                                                        <ShoppingCart className="h-4 w-4 mr-1" />
                                                        Mua
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
