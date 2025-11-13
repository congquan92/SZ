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
import { CircleDollarSign, ShoppingCart, Star, FileText, Heart } from "lucide-react";
import { CartAPI } from "@/api/cart.api";
import { useCartStore } from "@/stores/useCartStore";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Title from "@/components/Title";
import { ReviewAPI } from "@/api/review.api";
import type { Review } from "@/components/types";
import { useAuthStore } from "@/stores/useAuthStores";
import SizeZoom from "@/components/SizeZoom";

export default function ProductDetail() {
    const { id, slug } = useParams();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [myReviews, setMyReviews] = useState<Review[]>([]); // Đánh giá của user đăng nhập
    const [product, setProduct] = useState<ProductDetailType | null>(null);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [currentSlide, setCurrentSlide] = useState(0);
    const { user } = useAuthStore();
    const { fetchCart } = useCartStore();

    // State sử dụng Record như ProductDialog
    const [pick, setPick] = useState<Record<string, string>>({});
    const [qty, setQty] = useState<number>(1);

    // State cho pagination reviews
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

    // Size zoom
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxMedia, setLightboxMedia] = useState<{ url: string; isVideo: boolean } | null>(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    const initProductDetail = useCallback(async () => {
        try {
            const data = await ProductAPI.getProductById(Number(id));
            setProduct(data.data);
            // console.log("product detail:", data.data);
        } catch (error) {
            console.error("Failed to load product detail:", error);
            setProduct(null);
        }
    }, [id]);

    const initReviews = useCallback(async () => {
        try {
            // Page 0 cho request đầu tiên (API sử dụng 0-indexed)
            const data_review = await ReviewAPI.getReviewProductsById(Number(id), 0);
            console.log("review data:", data_review.data);

            setReviews(data_review.data.data);
            setCurrentPage(data_review.data?.pageNumber || 1);
            setTotalPages(data_review.data?.totalPages || 1);
        } catch (error) {
            console.error("Failed to load reviews:", error);
            setReviews([]);
        }
    }, [id]);

    const initReviewsMe = useCallback(async () => {
        try {
            const data = await ReviewAPI.getReviewMe(Number(id));
            setMyReviews(data.data);
        } catch (error) {
            console.error("Failed to load my reviews:", error);
            setMyReviews([]); // Nếu lỗi thì set empty
        }
    }, [id]);

    const initCalculateRating = useCallback(async () => {
        try {
            const data = await ReviewAPI.calculateRating(Number(id));
            console.log("Calculated rating:", data);
        } catch (error) {
            console.error("Failed to calculate rating:", error);
        }
    }, [id]);

    const loadMoreReviews = useCallback(async () => {
        if (isLoadingMore || currentPage >= totalPages) return;

        try {
            setIsLoadingMore(true);
            // API sử dụng 0-indexed, currentPage đang lưu là 1-indexed từ response
            const data_review = await ReviewAPI.getReviewProductsById(Number(id), currentPage);
            console.log("load more review data:", data_review.data);

            const newReviewsArray = Array.isArray(data_review.data?.data) ? data_review.data.data : [];
            setReviews((prev) => [...prev, ...newReviewsArray]);
            setCurrentPage(data_review.data?.pageNumber || currentPage + 1);
            setTotalPages(data_review.data?.totalPages || 1);
        } catch (error) {
            console.error("Failed to load more reviews:", error);
            toast.error("Không thể tải thêm đánh giá");
        } finally {
            setIsLoadingMore(false);
        }
    }, [id, currentPage, totalPages, isLoadingMore]);

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
        initReviews();
        initCalculateRating();

        if (user) {
            initReviewsMe();
        } else {
            setMyReviews([]);
        }
    }, [initProductDetail, initReviews, initCalculateRating, initReviewsMe, user]);

    // Reset state khi product thay đổi
    useEffect(() => {
        if (product) {
            setPick(defaultPick);
            setQty(1);
            setCurrentSlide(0);
            setCurrentPage(1);
            setTotalPages(1);
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

    // Merge myReviews (đánh giá của user) ở đầu, sau đó là reviews khác (loại bỏ duplicate)
    const allReviews = useMemo(() => {
        if (!myReviews || myReviews.length === 0) return reviews;

        const myReviewIds = new Set(myReviews.map((r) => r.id));
        // Lọc bỏ reviews trùng với myReviews
        const otherReviews = reviews.filter((r) => !myReviewIds.has(r.id));

        return [...myReviews, ...otherReviews];
    }, [myReviews, reviews]);

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

    const handelEditReview = (review: Review) => {
        console.log("Edit review", review);
    };

    //    Size zoom
    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.25, 3)); // Max 3x
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.25, 0.5)); // Min 0.5x
    };

    const handleResetZoom = () => {
        setZoomLevel(1);
    };

    const handleMediaClick = (url: string, isVideo: boolean) => {
        setLightboxMedia({ url, isVideo });
        setLightboxOpen(true);
        setZoomLevel(1); // Reset zoom khi mở
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
                                    <CarouselItem key={`${img}-${i}`} onClick={() => handleMediaClick(img, false)} className="cursor-pointer">
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
                <div className="p-5 md:p-6 space-y-4 max-h-[80vh]">
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

            {/* Tabs: Mô tả, Đánh giá & Bình luận */}
            <div className="mt-8">
                <Tabs defaultValue="description" className="w-full">
                    <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                        <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
                            <FileText className="w-4 h-4 mr-2" />
                            Mô tả sản phẩm
                        </TabsTrigger>
                        <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">
                            <Star className="w-4 h-4 mr-2" />
                            Đánh giá & Bình luận
                        </TabsTrigger>
                    </TabsList>

                    {/* Mô tả sản phẩm */}
                    <TabsContent value="description" className="mt-6 space-y-4">
                        <div className="prose max-w-none">
                            <h3 className="text-lg font-semibold mb-3">Thông tin chi tiết</h3>
                            <p className="text-muted-foreground leading-relaxed">{product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>

                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium">Thông số kỹ thuật</h4>
                                    <div className="text-sm space-y-1 text-muted-foreground">
                                        <p>• Chất liệu: Cotton cao cấp</p>
                                        <p>• Xuất xứ: Việt Nam</p>
                                        <p>• Phù hợp: Nam/Nữ</p>
                                        <p>• Bảo quản: Giặt máy, không tẩy</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium">Chính sách</h4>
                                    <div className="text-sm space-y-1 text-muted-foreground">
                                        <p>• Đổi trả trong 7 ngày</p>
                                        <p>• Miễn phí vận chuyển đơn &gt; 500k</p>
                                        <p>• Thanh toán khi nhận hàng</p>
                                        <p>• Bảo hành chính hãng</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Đánh giá & Bình luận */}
                    <TabsContent value="reviews" className="mt-6 space-y-8">
                        {/* Tổng quan đánh giá */}
                        <div className="bg-muted/30 rounded-lg p-6">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="text-center">
                                    <div className="text-5xl font-bold">{(product.avgRating ?? 0).toFixed(1)}</div>
                                    <div className="flex justify-center mt-2">{renderStars(product.avgRating ?? 0)}</div>
                                    <div className="text-sm text-muted-foreground mt-1">{allReviews?.length || 0} đánh giá</div>
                                </div>
                                <Separator orientation="vertical" className="h-24 hidden md:block" />
                                <div className="flex-1 w-full space-y-2">
                                    {[5, 4, 3, 2, 1].map((star) => {
                                        const count = allReviews?.filter((r) => r.rating === star).length || 0;
                                        const percentage = allReviews && allReviews.length > 0 ? (count / allReviews.length) * 100 : 0;
                                        return (
                                            <div key={star} className="flex items-center gap-3">
                                                <span className="text-sm w-12">{star} sao</span>
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-yellow-500" style={{ width: `${percentage}%` }} />
                                                </div>
                                                <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Danh sách đánh giá & bình luận */}
                        <div>
                            <h4 className="font-medium mb-4">Đánh giá từ khách hàng ({allReviews?.length || 0})</h4>
                            {allReviews && allReviews.length > 0 ? (
                                <div className="space-y-4">
                                    {allReviews.map((review) => {
                                        try {
                                            const reviewDate = review.createdDate
                                                ? new Date(review.createdDate).toLocaleDateString("vi-VN", {
                                                      year: "numeric",
                                                      month: "long",
                                                      day: "numeric",
                                                  })
                                                : "Không rõ ngày";

                                            const userName = review.userResponse?.fullName || review.fullName || "Người dùng";
                                            const userAvatar = review.userResponse?.avatar || review.avatarUser || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.userResponse?.id || review.id}`;

                                            // Kiểm tra xem review này có phải của user đang đăng nhập không
                                            const isMyReview = user && myReviews.some((mr) => mr.id === review.id);
                                            return (
                                                <div key={review.id} className={`border rounded-lg p-4 ${isMyReview ? "bg-blue-50/50 border-blue-200" : ""}`}>
                                                    <div className="flex items-start gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={userAvatar} />
                                                            <AvatarFallback>{userName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="font-medium">{userName}</div>
                                                                        {isMyReview && (
                                                                            <Badge variant="default" className="text-xs bg-blue-600">
                                                                                Đánh giá của bạn
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        {renderStars(review.rating || 0)}
                                                                        <span className="text-xs text-muted-foreground">{reviewDate}</span>
                                                                    </div>
                                                                </div>
                                                                {review.status && (
                                                                    <Badge variant={review.status === "APPROVED" ? "default" : "secondary"} className="text-xs">
                                                                        {review.status}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-2">{review.comment || "Không có bình luận"}</p>
                                                            {/* Hình ảnh/Video review */}
                                                            {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                                                                <div className="flex gap-2 mt-3 flex-wrap">
                                                                    {review.images.map((img) => {
                                                                        const isVideo = img.url.includes(".mp4") || img.url.includes(".mov") || img.url.includes(".avi") || img.url.includes(".webm");
                                                                        return (
                                                                            <div key={img.id} className="relative cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleMediaClick(img.url, isVideo)}>
                                                                                {isVideo ? (
                                                                                    <video src={img.url} className="w-32 h-32 object-cover rounded-md border" />
                                                                                ) : (
                                                                                    <img src={img.url} alt="Review" className="w-32 h-32 object-cover rounded-md border" loading="lazy" />
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-3 mt-3">
                                                                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                                                                    <Heart /> Thích
                                                                </Button>
                                                                {isMyReview && (
                                                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700" onClick={() => handelEditReview(review)}>
                                                                        Chỉnh sửa
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        } catch (err) {
                                            console.error("Error rendering review:", err, review);
                                            return null;
                                        }
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                                    <p className="text-sm mt-2">Hãy là người đầu tiên đánh giá sản phẩm!</p>
                                </div>
                            )}
                        </div>

                        {allReviews && allReviews.length > 0 && currentPage < totalPages && (
                            <div className="text-center">
                                <Button variant="outline" onClick={loadMoreReviews} disabled={isLoadingMore}>
                                    {isLoadingMore ? "Đang tải..." : "Xem thêm đánh giá"}
                                </Button>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            {/* Lightbox xem ảnh/video */}
            <SizeZoom isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} media={lightboxMedia} zoomLevel={zoomLevel} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onResetZoom={handleResetZoom} />

            <Separator className="mt-10" />
            {/* Gợi ý sản phẩm */}
            <div className="mt-10">
                <Title title="Có thể bạn cũng thích" />
                <div className="mt-4 grid grid-cols-2 gap-4">klasjldj</div>
            </div>
        </div>
    );
}
