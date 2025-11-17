import type { ProductDetail } from "@/components/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { useCallback, useEffect, useMemo, useState } from "react";
import { calculateDiscountPercent, findVariant, formatVND, hasVariantWithSelection, toSlug } from "@/lib/helper";
import { Link, useNavigate } from "react-router-dom";
import { CircleDollarSign, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { CartAPI } from "@/api/cart.api";
import { useCartStore } from "@/stores/useCartStore";

type Props = {
    open: boolean;
    onClose: () => void;
    product: ProductDetail | null;
};

export default function ProductDialog({ open, onClose, product }: Props) {
    const { fetchCart } = useCartStore();
    const navigate = useNavigate();

    // --- Extract attributes ---
    const colorAttr = useMemo(() => product?.attributes.find((a) => a.name.toLowerCase().includes("màu")) ?? null, [product?.attributes]);
    const sizeAttr = useMemo(() => product?.attributes.find((a) => a.name.toLowerCase().includes("kích") || a.name.toLowerCase().includes("size")) ?? null, [product?.attributes]);

    // --- Default selections ---
    const defaultPick = useMemo(() => {
        const obj: Record<string, string> = {};
        if (colorAttr?.attributeValue?.[0]) obj[colorAttr.name] = colorAttr.attributeValue[0].value;
        if (sizeAttr?.attributeValue?.[0]) obj[sizeAttr.name] = sizeAttr.attributeValue[0].value;
        return obj;
    }, [colorAttr, sizeAttr]);

    // --- Component state ---
    const [pick, setPick] = useState<Record<string, string>>(defaultPick);
    const [qty, setQty] = useState(1);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);

    // --- Reset state when dialog opens ---
    useEffect(() => {
        if (open && product) {
            setPick(defaultPick);
            setQty(1);
            setCurrentSlide(0);
            carouselApi?.scrollTo(0);
        }
    }, [open, product, defaultPick, carouselApi]);

    // --- Track carousel slide changes ---
    useEffect(() => {
        if (!carouselApi) return;
        carouselApi.on("select", () => {
            setCurrentSlide(carouselApi.selectedScrollSnap());
        });
    }, [carouselApi]);

    // --- Handlers ---
    const handleOpenChange = useCallback(
        (next: boolean) => {
            if (!next) onClose();
        },
        [onClose]
    );

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

    // --- Available sizes based on selected color ---
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

    // --- Early return if no product ---
    if (!product) return null;

    // --- Computed values ---
    const variant = findVariant(product.productVariant, pick);
    const images = product.imageProduct?.length ? product.imageProduct : product.coverImage ? [product.coverImage] : [];
    const inStock = (variant?.quantity ?? 0) > 0;
    const maxQty = Math.max(1, variant?.quantity ?? 1);
    const discountPercent = calculateDiscountPercent(product.listPrice, product.salePrice);
    const displayPrice = variant?.price ?? product.salePrice;

    const handleAddToCart = async () => {
        try {
            if (!variant || !inStock) return;
            await CartAPI.addCartItem(variant.id, qty);
            // Sync with cart store
            fetchCart();
            toast.success("Đã thêm vào giỏ hàng");
        } catch (error) {
            if (error instanceof Error && error.message === "UNAUTH") {
                toast.error("Vui lòng đăng nhập để mua hàng");
                return;
            }
            console.error("Error adding to cart:", error);
            toast.error("Thêm vào giỏ hàng thất bại. Vui lòng thử lại.");
        } finally {
            onClose();
        }
    };

    const handleBuyNow = async () => {
        try {
            if (!variant || !inStock) return;
            await CartAPI.addCartItem(variant.id, qty);
            // Sync with cart store
            fetchCart();
            navigate("/cart");
        } catch (error) {
            if (error instanceof Error && error.message === "UNAUTH") {
                toast.error("Vui lòng đăng nhập để mua hàng");
                return;
            }
            console.error("Error adding to cart:", error);
            toast.error("Thêm vào giỏ hàng thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {/* TỐI ƯU: Responsive width, max-height và cho phép toàn bộ dialog cuộn */}
            <DialogContent className="p-0 sm:max-w-fit max-w-[95vw] max-h-[95vh] overflow-y-auto overflow-x-hidden grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* LEFT: CAROUSEL GALLERY */}
                <div className="relative bg-muted/40 p-3">
                    {discountPercent > 0 && <Badge className="absolute left-3 top-3 z-10 bg-red-600 text-white rounded-none shadow-sm">{discountPercent}%</Badge>}
                    <Carousel setApi={setCarouselApi} className="w-full" opts={{ loop: true }}>
                        <CarouselContent>
                            {images.length > 0 ? (
                                images.map((src, i) => (
                                    <CarouselItem key={`${src}-${i}`}>
                                        <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                                            <img src={src} alt={`${product.name} - Ảnh ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                                        </div>
                                    </CarouselItem>
                                ))
                            ) : (
                                <CarouselItem>
                                    <div className="aspect-square grid place-items-center w-full overflow-hidden rounded-md bg-muted text-sm text-muted-foreground">Không có ảnh</div>
                                </CarouselItem>
                            )}

                            {/* video
                            {product.video && (
                                <CarouselItem>
                                    <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                                        <video controls className="h-full w-full object-cover" loading="lazy">
                                            <source src={product.video} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                </CarouselItem>
                            )} */}
                        </CarouselContent>
                        {images.length > 1 && (
                            <>
                                <CarouselPrevious className="left-2" />
                                <CarouselNext className="right-2" />
                            </>
                        )}
                    </Carousel>
                    {images.length > 1 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto p-2" role="tablist">
                            {images.map((src, i) => (
                                <button
                                    key={`thumb-${src}-${i}`}
                                    onClick={() => carouselApi?.scrollTo(i)}
                                    role="tab"
                                    aria-selected={i === currentSlide}
                                    className={`h-16 w-16 shrink-0 rounded-md overflow-hidden border transition-all ${i === currentSlide ? "ring-2 ring-primary ring-offset-2" : "opacity-70 hover:opacity-100"}`}
                                >
                                    <img src={src} alt={`Thumbnail ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT: INFO */}
                <div className="p-4 space-y-4">
                    <DialogHeader className="space-y-2">
                        <DialogTitle className="text-xl md:text-2xl font-semibold leading-tight text-left">{product.name}</DialogTitle>
                        {product.description && <p className="text-sm text-muted-foreground line-clamp-2 text-left">{product.description}</p>}
                        {/* {product.video} */}
                    </DialogHeader>
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                        <Badge variant="secondary">⭐ {(product.avgRating ?? 0).toFixed(1)}</Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">{product.soldQuantity.toLocaleString()} đã bán</Badge>
                        <Badge className={`${inStock ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>{inStock ? "Còn hàng" : "Hết hàng"}</Badge>
                        {variant && inStock && variant.quantity <= 10 && <Badge variant="destructive">Chỉ còn {variant.quantity} sản phẩm</Badge>}
                    </div>
                    <div className="flex items-end gap-3">
                        <div className="text-2xl font-bold text-red-600">{formatVND(displayPrice)}</div>
                        {discountPercent > 0 && <div className="text-sm text-muted-foreground line-through">{formatVND(product.listPrice)}</div>}
                    </div>
                    <Separator />
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
                    <div className="flex flex-row items-center gap-3 pt-2">
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
                    </div>
                    <Separator />
                    <Button variant="link" className="w-full" asChild>
                        <Link to={`/product/${product.id}/${toSlug(product.name)}/${toSlug(product.description)}`}>Xem chi tiết sản phẩm</Link>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
