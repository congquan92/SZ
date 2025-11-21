import { ProductAPI } from "@/api/product.api";
import type { Product } from "@/components/types";
import { useEffect, useState, useCallback } from "react";

import Title from "@/components/Title";
import { getGuestId } from "@/lib/userBehavior";
import { useAuthStore } from "@/stores/useAuthStores";
import ProductCarousel from "@/components/ProductCarousel";

export default function ProductLQ() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuthStore();

    const init = useCallback(async () => {
        try {
            setLoading(true);
            const guestIdValue = user ? null : getGuestId();
            const data = await ProductAPI.getProductByBehavior(10, 0, guestIdValue);

            setProducts(data.data.data || []);
        } catch (error) {
            console.error("Failed to load ProductLQ :", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        init();
    }, [init]);

    if (loading) {
        return (
            <div className="container mx-auto p-2">
                <Title title="Sản phẩm bán chạy" />
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    return <ProductCarousel products={products} />;
}
