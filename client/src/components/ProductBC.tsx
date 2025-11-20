import { ProductAPI } from "@/api/product.api";
import type { Product } from "@/components/types";
import { useEffect, useState, useCallback } from "react";
import Title from "@/components/Title";
import ProductCarousel from "@/components/ProductCarousel";

export default function ProductBC() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const init = useCallback(async () => {
        try {
            setLoading(true);
            const data = await ProductAPI.getProductSelling(10);
            setProducts(data.data.data || []);
        } catch (error) {
            console.error("Failed to load ProductBC :", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

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
