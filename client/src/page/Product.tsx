import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import Title from "@/components/Title";
import { ProductAPI } from "@/api/product.api";
import type { Product, ProductDetail } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { calculateDiscountPercent, formatVND, toSlug } from "@/lib/helper";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { renderStars } from "@/lib/helper.tsx";
import ProductDialog from "@/components/ProductDialog";
import { Link } from "react-router-dom";
import { FavoriteAPI } from "@/api/favorite.api";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Product() {
    const [products, setProducts] = useState<Product[]>([]);
    const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [sortOrder, setSortOrder] = useState<string>("default");

    const initProducts = async (size: number = 20) => {
        setIsLoading(true);
        try {
            const { data } = await ProductAPI.getProduct(size);
            setOriginalProducts(data.data);
            setProducts(data.data);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to load products:", error);
            toast.error("Không thể tải danh sách sản phẩm");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        initProducts(pageSize);
    }, [currentPage, pageSize]);

    // Xử lý sắp xếp sản phẩm
    useEffect(() => {
        if (!originalProducts.length) return;

        if (sortOrder === "default") {
            setProducts([...originalProducts]);
            return;
        }

        const sortedProducts = [...originalProducts].sort((a, b) => {
            switch (sortOrder) {
                case "price-asc":
                    return a.salePrice - b.salePrice;
                case "price-desc":
                    return b.salePrice - a.salePrice;
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "rating":
                    return b.avgRating - a.avgRating;
                case "sold":
                    return b.soldQuantity - a.soldQuantity;
                default:
                    return 0;
            }
        });
        setProducts(sortedProducts);
    }, [sortOrder, originalProducts]);

    const handleProduct = (id: number) => async () => {
        try {
            const data = await ProductAPI.getProductById(id);
            setSelectedProduct(data.data);
        } catch (error) {
            console.error("Failed to load product details:", error);
            toast.error("Không thể tải thông tin sản phẩm");
        }
    };

    const handleFavorite = (productId: number) => async () => {
        try {
            await FavoriteAPI.addFavorite(productId);
            toast.success("Đã thêm vào danh sách yêu thích!");
        } catch (error) {
            console.error("Failed to add favorite:", error);
            toast.error("Không thể thêm vào yêu thích");
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handlePageSizeChange = (value: string) => {
        setPageSize(Number(value));
        setCurrentPage(0);
    };

    const handleSortChange = (value: string) => {
        setSortOrder(value);
    };

    return (
        <div className="container mx-auto px-2 space-y-4">
            <div className="mt-2">
                <BreadcrumbCustom title="Trang chủ" link_title="/" subtitle="Sản phẩm" />
            </div>

            <div className="w-full max-w-[1600px] mx-auto mb-4">
                <img src="https://cdn.hstatic.net/files/1000253775/file/banner-hang-moi-pc.jpg" alt="Banner Effect" className="w-full h-auto" />
                <Title title="Hàng Mới" />
            </div>

            {/* Bộ lọc và sắp xếp */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Hiển thị:</span>
                    <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="20" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="12">12</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="40">40</SelectItem>
                            <SelectItem value="60">60</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-gray-600">sản phẩm</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sắp xếp:</span>
                    <Select value={sortOrder} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Mặc định" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Mặc định</SelectItem>
                            <SelectItem value="price-asc">Giá: Thấp đến cao</SelectItem>
                            <SelectItem value="price-desc">Giá: Cao đến thấp</SelectItem>
                            <SelectItem value="name-asc">Tên: A-Z</SelectItem>
                            <SelectItem value="name-desc">Tên: Z-A</SelectItem>
                            <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                            <SelectItem value="sold">Bán chạy nhất</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Hiển thị trạng thái loading */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="text-gray-500">Đang tải sản phẩm...</div>
                </div>
            ) : (
                <>
                    {/* Grid sản phẩm */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2">
                        {products && products.length > 0 ? (
                            products.map((product) => (
                                <Card key={product.id} className="group p-0 shadow-none rounded-none cursor-pointer gap-0">
                                    <CardContent className="relative p-2">
                                        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-none font-medium z-10">{calculateDiscountPercent(product.listPrice, product.salePrice)}%</Badge>
                                        <img src={product.urlCoverImage} alt={product.name} className="object-cover w-full max-h-[250px] transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Button size="sm" onClick={handleProduct(product.id)} variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white text-xs px-3 py-1.5 rounded-none cursor-pointer backdrop-blur-sm">
                                                Xem nhanh
                                            </Button>
                                            <Button size="sm" variant="secondary" className="bg-white/90 text-gray-900 hover:bg-white text-xs px-3 py-1.5 rounded-none cursor-pointer backdrop-blur-sm mx-2" onClick={handleFavorite(product.id)}>
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
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-500">Không tìm thấy sản phẩm nào</div>
                        )}
                    </div>

                    {/* Phân trang */}
                    {products && products.length > 0 && (
                        <div className="flex justify-center items-center gap-4 mt-8 mb-8">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} className="rounded-none">
                                <ChevronLeft className="h-4 w-4" />
                                Trước
                            </Button>

                            <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                        pageNumber = i;
                                    } else if (currentPage < 3) {
                                        pageNumber = i;
                                    } else if (currentPage > totalPages - 3) {
                                        pageNumber = totalPages - 5 + i;
                                    } else {
                                        pageNumber = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button key={pageNumber} variant={currentPage === pageNumber ? "default" : "outline"} size="sm" onClick={() => handlePageChange(pageNumber)} className="rounded-none min-w-10">
                                            {pageNumber + 1}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className="rounded-none">
                                Sau
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Product Dialog */}
            <ProductDialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
        </div>
    );
}
