import { ProductAPI } from "@/api/product.api";
import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import type { ProductDetail } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { renderStars } from "@/lib/helper.tsx";
import { calculateDiscountPercent, formatVND } from "@/lib/helper";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CircleDollarSign, ShoppingCart } from "lucide-react";

export default function ProductDetail() {
    const { id, slug, description } = useParams();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);

    const initProductDetail = async () => {
        const data = await ProductAPI.getProductById(Number(id));
        setProduct(data.data);
        console.log("Product Detail Data:", data.data);
    };

    useEffect(() => {
        initProductDetail();
    }, []);

    useEffect(() => {
        if (!carouselApi) return;
        carouselApi.on("select", () => {
            setCurrentSlide(carouselApi.selectedScrollSnap());
        });
    }, [carouselApi]);

    return (
        <div className="container mx-auto p-2">
            <BreadcrumbCustom title="Sản phẩm" link_title="/product" subtitle={slug ?? ""} />

            {/* chia 2 cột */}
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* LEFT */}
                <div className="relative bg-muted/20 p-4 ">
                    {product && <Badge className="absolute z-10 left-3 top-3 bg-red-600 text-white rounded-none shadow-sm">{calculateDiscountPercent(product.listPrice, product.salePrice)}%</Badge>}
                    <Carousel className="max-w-[550px]!" opts={{ loop: true }} setApi={setCarouselApi}>
                        <CarouselContent>
                            {product && product.imageProduct.length > 0 ? (
                                product.imageProduct.map((img, i) => (
                                    <CarouselItem key={i}>
                                        <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                                            <img src={img} alt={`${product.name} - Ảnh ${i + 1} của ${product.imageProduct.length}`} className="h-full w-full object-cover" loading="lazy" />
                                        </div>
                                    </CarouselItem>
                                ))
                            ) : (
                                <CarouselItem>
                                    <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                                        <div className="grid h-full w-full place-items-center text-sm text-muted-foreground">Không có ảnh</div>
                                    </div>
                                </CarouselItem>
                            )}
                        </CarouselContent>
                        {product && product.imageProduct.length > 1 && (
                            <>
                                <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
                                <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
                            </>
                        )}
                    </Carousel>
                    {/* thumbnail */}
                    {product && product.imageProduct.length > 1 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin" role="tablist" aria-label="Ảnh sản phẩm">
                            {product.imageProduct.map((src, i) => (
                                <button
                                    key={`thumb-${src}-${i}`}
                                    onClick={() => carouselApi?.scrollTo(i)}
                                    role="tab"
                                    aria-selected={i === currentSlide}
                                    aria-label={`Xem ảnh ${i + 1}`}
                                    className={`h-16 w-16 shrink-0 rounded-md overflow-hidden border transition-all ${i === currentSlide ? "ring-2 ring-foreground ring-offset-2" : "opacity-70 hover:opacity-100"}`}
                                >
                                    <img src={src} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {/* RIGHT */}
                <div className="p-5 md:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                    <div className="space-y-2">
                        <h1 className="text-xl md:text-2xl font-semibold leading-tight">{product?.name}</h1>
                        {product && <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>}
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                        {product && (
                            <>
                                {renderStars(product.avgRating ?? 0)}
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-none font-medium">{product.avgRating} đánh giá</Badge>
                                <Badge className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-none font-medium">Còn Hàng</Badge>
                            </>
                        )}
                    </div>
                    {/* Price */}
                    <div className="flex items-end gap-3">
                        <div className="text-2xl font-bold text-red-600">{formatVND(product?.salePrice)}</div>
                        <div className="text-sm text-muted-foreground line-through">{formatVND(product?.listPrice)}</div>
                    </div>

                    {/* color */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium mb-2">
                            Màu sắc: <span className="font-normal"></span>
                        </p>
                        <div className="flex gap-2 flex-wrap" role="group">
                            <Button variant="default" size="sm">
                                Trắng
                            </Button>
                            <Button variant="outline" size="sm">
                                Đen
                            </Button>
                        </div>
                    </div>
                    {/* size */}
                    <div className="space-y-2">
                        <p className="text-sm font-medium mb-2">
                            Kích thước: <span className="font-normal"></span>
                            <Link to="/cloth-size" className="text-xs font-normal underline hover:text-purple-400 ml-2">
                                Hướng dẫn chọn size
                            </Link>
                        </p>
                        <div className="flex gap-2 flex-wrap" role="group">
                            <Button variant="default" size="sm">
                                S
                            </Button>
                            <Button variant="outline" size="sm">
                                M
                            </Button>
                            <Button variant="outline" size="sm">
                                L
                            </Button>
                        </div>
                    </div>
                    {/* quantity + action */}
                    <div className="flex items-start gap-3 flex-col">
                        <div className="flex gap-2 items-center w-full">
                            <p className="text-sm font-medium mb-2">
                                Số lượng: <span className="font-normal"></span>
                            </p>
                            <div className="flex items-center rounded-md border" role="group">
                                <Button type="button" variant="ghost" size="icon" className="rounded-r-none h-10">
                                    –
                                </Button>
                                <input type="number" min={1} max={20} value={1} className="w-16 text-center h-10 border-y outline-none bg-transparent" />
                                <Button type="button" variant="ghost" size="icon" className="rounded-l-none h-10">
                                    +
                                </Button>
                            </div>
                        </div>
                        <div className="flex gap-2 items-end">
                            <Button variant="outline" className="flex-1 w-full sm:w-auto h-10">
                                <ShoppingCart /> Thêm vào giỏ hàng
                            </Button>
                            <Button className="flex-1 w-full sm:w-auto h-10">
                                <CircleDollarSign /> Mua ngay
                            </Button>
                        </div>
                    </div>
                    <Separator />
                </div>
            </div>
            <div> teststtst</div>
        </div>
    );
}
