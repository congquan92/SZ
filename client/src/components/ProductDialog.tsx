import type { ProductDetail } from "@/components/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { useCallback, useEffect, useMemo, useState } from "react";
import { calculateDiscountPercent, findVariant, formatVND, hasVariantWithSelection } from "@/lib/helper";
import { Link } from "react-router-dom";

type Props = {
    open: boolean;
    onClose: () => void;
    product: ProductDetail | null;
};

export default function ProductDialog({ open, onClose, product }: Props) {
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

    const handleAddToCart = () => {
        if (!variant || !inStock) return;

        // TODO: Integrate with cart API
        console.log("ADD_TO_CART", {
            productId: product.id,
            variantId: variant.id,
            selections: pick,
            quantity: qty,
        });
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="p-0 w-full max-w-[980px]! overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* LEFT: CAROUSEL GALLERY */}
                    <div className="relative bg-muted/40 p-4">
                        {discountPercent > 0 && <Badge className="absolute left-3 top-3 z-10 bg-red-600 text-white rounded-none shadow-sm">-{discountPercent}%</Badge>}

                        <Carousel setApi={setCarouselApi} className="w-full">
                            <CarouselContent>
                                {images.length > 0 ? (
                                    images.map((src, i) => (
                                        <CarouselItem key={`${src}-${i}`}>
                                            <div className="aspect-square w-full overflow-hidden rounded-md bg-muted">
                                                <img src={src} alt={`${product.name} - Ảnh ${i + 1} của ${images.length}`} className="h-full w-full object-cover" loading="lazy" />
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
                            {images.length > 1 && (
                                <>
                                    <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
                                    <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
                                </>
                            )}
                        </Carousel>

                        {/* Thumbnail Navigation */}
                        {images.length > 1 && (
                            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-thin" role="tablist" aria-label="Ảnh sản phẩm">
                                {images.map((src, i) => (
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

                    {/* RIGHT: INFO */}
                    <div className="p-5 md:p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                        <DialogHeader className="space-y-2">
                            <DialogTitle className="text-xl md:text-2xl font-semibold leading-tight">{product.name}</DialogTitle>
                            {product.description && <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>}
                        </DialogHeader>

                        <div className="flex items-center flex-wrap gap-2 text-xs">
                            <Badge variant="secondary" className="rounded-none">
                                ⭐ {(product.avgRating ?? 0).toFixed(1)}
                            </Badge>
                            <Badge className="bg-yellow-100 text-yellow-800 rounded-none">{product.soldQuantity.toLocaleString()} đã bán</Badge>
                            <Badge className={`${inStock ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"} rounded-none`}>{inStock ? "Còn hàng" : "Hết hàng"}</Badge>
                            {variant && inStock && variant.quantity <= 10 && (
                                <Badge variant="destructive" className="rounded-none">
                                    Chỉ còn {variant.quantity} sản phẩm
                                </Badge>
                            )}
                        </div>

                        {/* Price Display */}
                        <div className="flex items-end gap-3">
                            <div className="text-2xl font-bold text-red-600">{formatVND(displayPrice)}</div>
                            {discountPercent > 0 && <div className="text-sm text-muted-foreground line-through">{formatVND(product.listPrice)}</div>}
                        </div>

                        <Separator />

                        {/* Color Selection */}
                        {colorAttr && (
                            <div>
                                <p className="text-sm font-medium mb-2">
                                    Màu sắc: <span className="font-normal">{pick[colorAttr.name] || "Chọn màu"}</span>
                                </p>
                                <div className="flex gap-2 flex-wrap" role="group" aria-label="Chọn màu sắc">
                                    {colorAttr.attributeValue.map((cv) => {
                                        const nextPick = { ...pick, [colorAttr.name]: cv.value };
                                        const enabled = hasVariantWithSelection(product.productVariant, { ...nextPick, [sizeAttr?.name ?? ""]: pick[sizeAttr?.name ?? ""] });
                                        const active = pick[colorAttr.name] === cv.value;
                                        return (
                                            <button
                                                key={cv.id}
                                                onClick={() => handleColorChange(cv.value, colorAttr.name)}
                                                disabled={!enabled}
                                                aria-pressed={active}
                                                aria-label={`Màu ${cv.value}`}
                                                className={`h-9 rounded-md border px-3 text-sm transition-all ${
                                                    active ? "bg-foreground text-background border-foreground" : !enabled ? "bg-muted text-muted-foreground border-transparent cursor-not-allowed" : "hover:bg-muted border-border"
                                                }`}
                                                title={cv.value}
                                            >
                                                {cv.image ? <img src={cv.image} alt={cv.value} className="h-9 w-9 object-cover rounded" /> : cv.value}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Size Selection */}
                        {sizeAttr && (
                            <div>
                                <p className="text-sm font-medium mb-2">
                                    Kích thước: <span className="font-normal">{pick[sizeAttr.name] || "Chọn size"}</span>
                                </p>
                                <div className="flex gap-2 flex-wrap" role="group" aria-label="Chọn kích thước">
                                    {availableSizes.map(({ value, stock, enabled }) => {
                                        const active = pick[sizeAttr.name] === value;
                                        return (
                                            <button
                                                key={value}
                                                disabled={!enabled}
                                                onClick={() => handleSizeChange(value, sizeAttr.name)}
                                                aria-pressed={active}
                                                aria-label={`Size ${value}${!enabled ? " - Hết hàng" : stock <= 3 ? ` - Còn ${stock}` : ""}`}
                                                className={`px-3 py-1.5 rounded-md border text-sm transition-all ${
                                                    active ? "bg-foreground text-background border-foreground" : !enabled ? "bg-muted text-muted-foreground border-transparent cursor-not-allowed" : "hover:bg-muted border-border"
                                                }`}
                                            >
                                                {value}
                                                {!enabled && <span className="ml-1 text-[11px]">(Hết)</span>}
                                                {enabled && stock <= 3 && stock > 0 && <span className="ml-1 text-[11px] text-red-600">(Còn {stock})</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-md border" role="group" aria-label="Chọn số lượng">
                                <Button type="button" variant="ghost" size="icon" className="rounded-none" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Giảm số lượng">
                                    –
                                </Button>
                                <input type="number" min={1} max={maxQty} value={qty} onChange={(e) => handleQuantityChange(Number(e.target.value), maxQty)} className="w-16 text-center py-1 border-x outline-none" aria-label="Số lượng" />
                                <Button type="button" variant="ghost" size="icon" className="rounded-none" onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="Tăng số lượng">
                                    +
                                </Button>
                            </div>

                            <Button className="flex-1" disabled={!variant || !inStock} onClick={handleAddToCart} aria-label={variant ? "Thêm vào giỏ hàng" : "Vui lòng chọn thuộc tính sản phẩm"}>
                                {variant ? "Thêm vào giỏ" : "Chọn thuộc tính"}
                            </Button>
                        </div>

                        <Separator className="my-2" />

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-block w-1 h-1 rounded-full bg-current"></span>
                                <span>Giao nhanh nội thành trong 24h</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-block w-1 h-1 rounded-full bg-current"></span>
                                <span>Đổi trả miễn phí trong 7 ngày</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-block w-1 h-1 rounded-full bg-current"></span>
                                <span>Hỗ trợ tư vấn size 24/7</span>
                            </div>
                        </div>
                        <Button variant="link" className="flex justify-end w-full">
                            <Link to="/product-detail">Xem Chi Tiết</Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
