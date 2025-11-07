import { ProductAPI } from "@/api/product.api";
import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import type { ProductDetail as ProductDetailType } from "@/components/types";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { renderStars } from "@/lib/helper.tsx";
import { calculateDiscountPercent, findVariant, formatVND, hasVariantWithSelection } from "@/lib/helper";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CircleDollarSign, ShoppingCart } from "lucide-react";
import { CartAPI } from "@/api/cart.api";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";

export default function ProductDetail() {
    const { id, slug } = useParams();
    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);
    const { fetchCart } = useCartStore();

    // State sử dụng Record như ProductDialog
    const [pick, setPick] = useState<Record<string, string>>({});
    const [qty, setQty] = useState<number>(1);

    const initProductDetail = useCallback(async () => {
        try {
            const data = await ProductAPI.getProductById(Number(id));
            setProduct(data.data);
        } catch (error) {
            console.error("Failed to load product detail:", error);
            setProduct(null);
        }
    }, [id]);

    // --- Extract attributes giống ProductDialog ---
    const colorAttr = useMemo(() => product?.attributes.find((a) => a.name.toLowerCase().includes("màu")) ?? null, [product?.attributes]);
    const sizeAttr = useMemo(() => product?.attributes.find((a) => a.name.toLowerCase().includes("kích") || a.name.toLowerCase().includes("size")) ?? null, [product?.attributes]);

    // --- Default selections giống ProductDialog ---
    const defaultPick = useMemo(() => {
        const obj: Record<string, string> = {};
        if (colorAttr?.attributeValue?.[0]) obj[colorAttr.name] = colorAttr.attributeValue[0].value;
        if (sizeAttr?.attributeValue?.[0]) obj[sizeAttr.name] = sizeAttr.attributeValue[0].value;
        return obj;
    }, [colorAttr, sizeAttr]);

    useEffect(() => {
        initProductDetail();
    }, [initProductDetail]);

    // Reset state khi product thay đổi
    useEffect(() => {
        if (product) {
            setPick(defaultPick);
            setQty(1);
            setCurrentSlide(0);
            carouselApi?.scrollTo(0);
        }
    }, [product, defaultPick, carouselApi]);

    useEffect(() => {
        if (!carouselApi) return;
        const handler = () => setCurrentSlide(carouselApi.selectedScrollSnap());
        carouselApi.on("select", handler);
        return () => {
            carouselApi.off("select", handler);
        };
    }, [carouselApi]);

    // --- Handlers giống ProductDialog ---
    const handleQuantityChange = useCallback((value: number, maxQty: number) => {
        const sanitized = Math.max(1, Math.min(maxQty, Math.floor(value) || 1));
        setQty(sanitized);
    }, []);

    const handleColorChange = useCallback(
        (colorValue: string, colorName: string) => {
            setCurrentSlide(0);
            carouselApi?.scrollTo(0);
            setQty(1);
            const nextPick = { ...pick, [colorName]: colorValue };
            // Reset size if current size is unavailable with new color
            if (sizeAttr && product) {
                const tryVar = findVariant(product.productVariant, { ...nextPick, [sizeAttr.name]: pick[sizeAttr.name] });
                if (!tryVar) {
                    const firstAvailable = sizeAttr.attributeValue.find((sv) => findVariant(product.productVariant, { ...nextPick, [sizeAttr.name]: sv.value }));
                    setPick({ ...nextPick, ...(firstAvailable ? { [sizeAttr.name]: firstAvailable.value } : {}) });
                    return;
                }
            }
            setPick(nextPick);
        },
        [pick, sizeAttr, product, carouselApi]
    );

    const handleSizeChange = useCallback(
        (sizeValue: string, sizeName: string) => {
            setQty(1);
            setPick({ ...pick, [sizeName]: sizeValue });
        },
        [pick]
    );

    // --- Available sizes based on selected color giống ProductDialog ---
    const availableSizes = useMemo(() => {
        if (!sizeAttr || !product) return [];
        return sizeAttr.attributeValue.map((sv) => {
            const tryPick = { ...pick, [sizeAttr.name]: sv.value };
            const matched = findVariant(product.productVariant, tryPick);
            const stock = matched?.quantity ?? 0;
            return {
                value: sv.value,
                stock,
                enabled: Boolean(matched) && stock > 0,
            };
        });
    }, [sizeAttr, pick, product]);

    // --- Computed values giống ProductDialog ---
    if (!product) return null;

    const variant = findVariant(product.productVariant, pick);
    const inStock = (variant?.quantity ?? 0) > 0;
    const maxQty = Math.max(1, variant?.quantity ?? 1);
    const discountPercent = calculateDiscountPercent(product.listPrice, product.salePrice);
    const displayPrice = variant?.price ?? product.salePrice;

    const handleAddToCart = async () => {
        if (!variant || !inStock) {
            toast.error("Vui lòng chọn đủ thông tin sản phẩm");
            return;
        }
        try {
            await CartAPI.addCartItem(variant.id, qty);
            // Sync with cart store
            fetchCart();
            toast.success("Đã thêm vào giỏ hàng");
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error("Thêm vào giỏ hàng thất bại. Vui lòng thử lại.");
        }
    };

    const handleBuyNow = () => {
        if (!variant || !inStock) {
            console.warn("Không thể mua: chưa chọn đủ màu/size hoặc hết hàng");
            return;
        }
        // TODO: Navigate to checkout
        console.log("BUY_NOW", {
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            sku: variant.sku,
            price: variant.price,
            selections: pick,
            quantity: qty,
            totalPrice: variant.price * qty,
        });
    };

    return (
        <div className="container mx-auto p-2">
            <BreadcrumbCustom title="Sản phẩm" link_title="/product" subtitle={slug ?? ""} />

            {/* chia 2 cột */}
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* LEFT */}
                <div className="relative bg-muted/20 p-4">
                    {discountPercent > 0 && <Badge className="absolute z-10 left-3 top-3 bg-red-600 text-white rounded-none shadow-sm">-{discountPercent}%</Badge>}
                    <Carousel className="max-w-[550px]!" opts={{ loop: true }} setApi={setCarouselApi}>
                        <CarouselContent>
                            {product && product.imageProduct && product.imageProduct.length > 0 ? (
                                product.imageProduct.map((img, i) => (
                                    <CarouselItem key={`${img}-${i}`}>
                                        <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                                            <img src={img} alt={`${product.name} - Ảnh ${i + 1} / ${product.imageProduct.length}`} className="h-full w-full object-cover" loading="lazy" />
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
                        {product && product.imageProduct && product.imageProduct.length > 1 && (
                            <>
                                <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
                                <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
                            </>
                        )}
                    </Carousel>

                    {/* thumbnail */}
                    {product && product.imageProduct && product.imageProduct.length > 1 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto p-3 scrollbar-thin" role="tablist" aria-label="Ảnh sản phẩm">
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

                    <div className="flex items-center flex-wrap gap-2 text-xs">
                        {renderStars(product.avgRating ?? 0)}
                        <Badge variant="secondary">⭐ {(product.avgRating ?? 0).toFixed(1)}</Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">{product.soldQuantity.toLocaleString()} đã bán</Badge>
                        <Badge className={`${inStock ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>{inStock ? "Còn hàng" : "Hết hàng"}</Badge>
                        {variant && inStock && variant.quantity <= 10 && <Badge variant="destructive">Chỉ còn {variant.quantity} sản phẩm</Badge>}
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-3">
                        <div className="text-2xl font-bold text-red-600">{formatVND(displayPrice)}</div>
                        {discountPercent > 0 && <div className="text-sm text-muted-foreground line-through">{formatVND(product.listPrice)}</div>}
                    </div>

                    <Separator />

                    {/* Color */}
                    {colorAttr && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                Màu sắc: <span className="font-normal text-muted-foreground">{pick[colorAttr.name] || "..."}</span>
                            </p>
                            <div className="flex gap-2 flex-wrap" role="group">
                                {colorAttr.attributeValue.map((cv) => {
                                    const enabled = hasVariantWithSelection(product.productVariant, { ...pick, [colorAttr.name]: cv.value });
                                    const active = pick[colorAttr.name] === cv.value;
                                    return (
                                        <Button key={cv.id} variant={active ? "default" : "outline"} size="sm" onClick={() => handleColorChange(cv.value, colorAttr.name)} disabled={!enabled}>
                                            {cv.value}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Size */}
                    {sizeAttr && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium">
                                Kích thước: <span className="font-normal text-muted-foreground">{pick[sizeAttr.name] || "..."}</span>
                            </p>
                            <div className="flex gap-2 flex-wrap" role="group">
                                {availableSizes.map(({ value, enabled }) => {
                                    const active = pick[sizeAttr.name] === value;
                                    return (
                                        <Button key={value} variant={active ? "default" : "outline"} size="sm" disabled={!enabled} onClick={() => handleSizeChange(value, sizeAttr.name)}>
                                            {value}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Hướng dẫn size */}
                    <Link to="/cloth-size" className="text-xs font-normal underline hover:text-purple-400">
                        Hướng dẫn chọn size
                    </Link>

                    {/* Quantity + Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <div className="flex justify-start flex-col gap-3">
                            <div className="flex flex-row items-center gap-3">
                                <p className="text-sm font-medium">Số lượng:</p>
                                <div className="flex items-center rounded-md border" role="group">
                                    <Button type="button" variant="ghost" size="icon" className="rounded-r-none h-10" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>
                                        –
                                    </Button>
                                    <input type="number" min={1} max={maxQty} value={qty} onChange={(e) => handleQuantityChange(Number(e.target.value), maxQty)} className="w-16 text-center h-10 border-y outline-none bg-transparent" />
                                    <Button type="button" variant="ghost" size="icon" className="rounded-l-none h-10" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty}>
                                        +
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <Button className="flex-1 w-full sm:w-auto h-10" disabled={!variant || !inStock} onClick={handleAddToCart}>
                                    <ShoppingCart /> {variant ? "Thêm vào giỏ hàng" : "Vui lòng chọn phân loại"}
                                </Button>
                                <Button className="flex-1 w-full sm:w-auto h-10" disabled={!variant || !inStock} onClick={handleBuyNow}>
                                    <CircleDollarSign /> Mua ngay
                                </Button>
                            </div>
                        </div>

                        {/* SKU + tồn kho */}
                        {variant && (
                            <div className="text-xs text-muted-foreground">
                                SKU: <span className="font-medium">{variant.sku}</span> • Tồn: <span className="font-medium">{variant.quantity}</span>
                            </div>
                        )}
                    </div>

                    <Separator />
                </div>
            </div>

            {/* mô tả/spare */}
            <div className="mt-4 text-sm text-muted-foreground">sadad{/* thêm content nếu cần */}</div>
        </div>
    );
}
