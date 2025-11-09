import { ProductAPI } from "@/api/product.api";
import type { Product, ProductDetail } from "@/components/types";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { calculateDiscountPercent, formatVND, toSlug } from "@/lib/helper";
import { Heart } from "lucide-react";
import { renderStars } from "@/lib/helper.tsx";
import ProductDialog from "@/components/ProductDialog";
import { Link } from "react-router-dom";
import { FavoriteAPI } from "@/api/favorite.api";
import { toast } from "sonner";
import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import Title from "@/components/Title";

export default function ProductCategory() {
    const { id,  name } = useParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const pageSize = 10;

    const init = useCallback(async () => {
        try {
            setLoading(true);
            setPage(0);
            const data = await ProductAPI.getProductByCategory(Number(id), pageSize, 0);
            console.log("Product by category:", data);
            setProducts(data.data || []);
            // Check if there are more products
            setHasMore(data.pageNumber < data.totalPages);
        } catch (error) {
            console.error("Failed to load products:", error);
            setProducts([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        init();
    }, [init]);

    const loadMore = async () => {
        try {
            setLoadingMore(true);
            const nextPage = page + 1;
            const data = await ProductAPI.getProductByCategory(Number(id), pageSize, nextPage);
            console.log("Load more products:", data);
            // Append new products to existing ones
            setProducts((prev) => [...prev, ...(data.data || [])]);
            setPage(nextPage);
            // Check if there are more products
            setHasMore(data.pageNumber < data.totalPages);
        } catch (error) {
            console.error("Failed to load more products:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handelProduct = (productId: number) => async () => {
        try {
            const data = await ProductAPI.getProductById(productId);
            setSelectedProduct(data.data);
        } catch (error) {
            console.error("Failed to load product detail:", error);
        }
    };

    const handelFavorite = (productId: number) => async () => {
        try {
            await FavoriteAPI.addFavorite(productId);
            toast.success("Đã thêm vào danh sách yêu thích!");
        } catch (error) {
            console.error("Failed to add favorite:", error);
            toast.error("Thêm vào yêu thích thất bại!");
        }
    };

    return (
        <div className="container mx-auto p-2">
            <BreadcrumbCustom title="Danh mục" link_title="/product" subtitle={name ?? "Sản phẩm"} />

            <div className="mt-6">
                <Title title={name ?? "Sản phẩm theo danh mục"} />

                {loading ? (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">Đang tải sản phẩm...</p>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 mt-6">
                            {products.map((product) => (
                                <Card key={product.id} className="group p-0 shadow-none rounded-none cursor-pointer gap-0">
                                    <CardContent className="relative p-2">
                                        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-none font-medium z-10">{calculateDiscountPercent(product.listPrice, product.salePrice)}%</Badge>
                                        <img src={product.urlCoverImage} alt={product.name} className="object-cover w-full max-h-[250px] transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Button size="sm" onClick={handelProduct(product.id)} variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white text-xs px-3 py-1.5 rounded-none cursor-pointer backdrop-blur-sm">
                                                Xem nhanh
                                            </Button>
                                            <Button size="sm" variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white text-xs px-3 py-1.5 rounded-none cursor-pointer backdrop-blur-sm mx-2" onClick={handelFavorite(product.id)}>
                                                <Heart /> Yêu thích
                                            </Button>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-2 p-3 items-start">
                                        <div className="flex flex-col gap-1">
                                            <Link to={`/product/${product.id}/${toSlug(product.name)}/${toSlug(product.description)}`} className="text-l font-medium text-gray-700 line-clamp-2 hover:underline">
                                                {product.name}
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                {renderStars(product.avgRating)}
                                                <Badge className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-none font-medium">{product.avgRating} Đánh giá</Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-3">
                                                <span className="text-gray-500 text-xs line-through">{formatVND(product.listPrice)}</span>
                                                <span className="text-lg font-semibold text-gray-900">{formatVND(product.salePrice)}</span>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-none font-medium">{product.soldQuantity} Đã Bán</Badge>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                        <div className="text-center mt-8 space-y-4">
                            <div className="text-sm text-muted-foreground">Hiển thị {products.length} sản phẩm</div>
                            {hasMore && (
                                <Button onClick={loadMore} disabled={loadingMore} variant="outline" size="lg" className="min-w-[200px]">
                                    {loadingMore ? "Đang tải..." : "Xem thêm"}
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg">Không có sản phẩm nào trong danh mục này</p>
                    </div>
                )}
            </div>

            <ProductDialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
        </div>
    );
}
