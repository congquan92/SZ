import { FavoriteAPI } from "@/api/favorite.api";
import { ProductAPI } from "@/api/product.api";
import ProductDialog from "@/components/ProductDialog";
import type { Product, ProductDetail } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { calculateDiscountPercent, formatVND, toSlug } from "@/lib/helper";
import { renderStars } from "@/lib/helper.tsx";
import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Props {
    products: Product[];
}

export default function ProductCarousel({ products }: Props) {
    const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);

    const handleProduct = (productId: number) => async () => {
        try {
            const data = await ProductAPI.getProductById(productId);
            setSelectedProduct(data.data);
        } catch (error) {
            console.error("Failed to load product detail:", error);
        }
    };

    const handleFavorite = (productId: number) => async () => {
        try {
            await FavoriteAPI.addFavorite(productId);
            toast.success("Đã thêm vào danh sách yêu thích!");
        } catch (error) {
            console.error("Failed to add favorite:", error);
            toast.error("Thêm vào yêu thích thất bại!");
        }
    };

    return (
        <div className="container mx-auto p-2 my-8">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full mt-6"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {products.map((product) => (
                        <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                            <Card className="group p-0 shadow-none rounded-none cursor-pointer gap-0 h-full">
                                <CardContent className="relative p-2">
                                    {calculateDiscountPercent(product.listPrice, product.salePrice) > 0 && (
                                        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-none font-medium z-10">{calculateDiscountPercent(product.listPrice, product.salePrice)}%</Badge>
                                    )}
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
                                    <div className="flex flex-col gap-1 w-full">
                                        <Link to={`/product/${product.id}/${toSlug(product.name)}/${toSlug(product.description)}`} className="text-sm font-medium text-gray-700 line-clamp-2 hover:underline">
                                            {product.name}
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            {renderStars(product.avgRating)}
                                            <Badge className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-none font-medium">{product.avgRating} Đánh giá</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col gap-1">
                                            {calculateDiscountPercent(product.listPrice, product.salePrice) > 0 && <span className="text-gray-500 text-xs line-through">{formatVND(product.listPrice)}</span>}
                                            <span className="text-lg font-semibold text-gray-900">{formatVND(product.salePrice)}</span>
                                        </div>
                                        <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-none font-medium">{product.soldQuantity} Đã Bán</Badge>
                                    </div>
                                </CardFooter>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </Carousel>

            <ProductDialog open={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} />
        </div>
    );
}
