import { ProductAPI } from "@/api/product.api";
import type { Product } from "@/components/types";
import { useCallback, useEffect, useState } from "react";
import ProductChungGrid from "@/components/ProductGrid";
import Title from "@/components/Title";

export default function ProductHot() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const initProducts = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await ProductAPI.getProductHot(10);
            setProducts(data.data);
        } catch (error) {
            console.error("Failed to load ProductHot : ", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        initProducts();
    }, [initProducts]);

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

    return <ProductChungGrid products={products} />;
}
