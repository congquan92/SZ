import { ProductAPI } from "@/api/product.api";
import type { Product, ProductDetail } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { calculateDiscountPercent, formatVND, toSlug } from "@/lib/helper";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { renderStars } from "@/lib/helper.tsx";
import ProductDialog from "@/components/ProductDialog";
import { Link } from "react-router-dom";
import { FavoriteAPI } from "@/api/favorite.api";
import { toast } from "sonner";

export default function ProductHot() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);

    const initProducts = async () => {
        const { data } = await ProductAPI.getProduct(10);
        setProducts(data.data);
        // console.log("Hot Products:", data.data);
    };

    useEffect(() => {
        initProducts();
    }, []);

    const handelProduct = (id: number) => async () => {
        console.log("Product ID:", id);
        const data = await ProductAPI.getProductById(id);
        setSelectedProduct(data.data);
        console.log("Product Data:", data.data);
    };
    const handelFavorite = (productId: number) => async () => {
        try {
            await FavoriteAPI.addFavorite(productId);
            toast.success("Đã thêm vào danh sách yêu thích!");
        } catch (error) {
            console.error("Failed to add favorite:", error);
        }
    };

    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2 mt-6">
                {products &&
                    products.map((product) => (
                        <Card key={product.id} className="group p-0 shadow-none rounded-none cursor-pointer gap-0">
                            <CardContent className=" relative p-2">
                                <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-none font-medium z-10"> {calculateDiscountPercent(product.listPrice, product.salePrice)}%</Badge>
                                <img src={product.urlCoverImage} alt={product.name} className=" object-cover w-full max-h-[250px] transition-transform duration-500 group-hover:scale-105" loading="lazy" />
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
                                    <div className=" flex items-center gap-3">
                                        <span className="text-gray-500 text-xs line-through">{formatVND(product.listPrice)}</span>
                                        <span className="text-lg font-semibold text-gray-900">{formatVND(product.salePrice)}</span>
                                    </div>

                                    <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-none font-medium ">{product.soldQuantity} Đã Bán</Badge>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
            </div>
            <ProductDialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
        </>
    );
}
