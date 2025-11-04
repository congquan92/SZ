import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProductAPI } from "@/api/product.api";
import { Link } from "react-router-dom";
import { calculateDiscountPercent, formatVND, toSlug } from "@/lib/helper";
import type { Product } from "@/components/types";

interface SearchBarProps {
    className?: string;
}

export default function SearchBar({ className }: SearchBarProps) {
    const [search, setSearch] = useState<string>("");
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Debounce search với delay 350ms
    useEffect(() => {
        if (!search.trim()) {
            setProducts([]);
            setShowResults(false);
            return;
        }

        setIsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await ProductAPI.searchProduct(search, 8);
                setProducts(response.data.data || []);
                setShowResults(true);
            } catch (error) {
                console.error("Search failed:", error);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    // Click outside để đóng dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleClearSearch = () => {
        setSearch("");
        setProducts([]);
        setShowResults(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && search.trim()) {
            // Redirect to search page hoặc xử lý search
            window.location.href = `/product?search=${encodeURIComponent(search)}`;
        }
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => search.trim() && setShowResults(true)}
                    placeholder="Bạn đang tìm gì..."
                    className="pr-20 text-neutral-700 border border-neutral-700 rounded-none"
                />

                {/* Loading Spinner */}
                {isLoading && <Loader2 className="absolute right-10 top-2.5 h-5 w-5 text-neutral-500 animate-spin" />}

                {/* Clear Button */}
                {search && !isLoading && <X onClick={handleClearSearch} className="absolute right-10 top-2.5 h-5 w-5 text-neutral-500 cursor-pointer hover:text-black" />}

                {/* Search Icon */}
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-neutral-700 cursor-pointer hover:text-black" />
            </div>

            {/* Search Results Dropdown */}
            {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 shadow-lg rounded-md max-h-[500px] overflow-y-auto z-50">
                    {products.length > 0 ? (
                        <div className="p-2">
                            <div className="text-xs text-gray-500 px-3 py-2 border-b">Tìm thấy {products.length} sản phẩm</div>
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    to={`/product/${product.id}/${toSlug(product.name)}/${toSlug(product.description)}`}
                                    onClick={() => {
                                        setShowResults(false);
                                        setSearch("");
                                    }}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors"
                                >
                                    {/* Product Image */}
                                    <div className="w-16 h-16 shrink-0 bg-gray-100 rounded overflow-hidden">
                                        {product.urlCoverImage ? (
                                            <img src={product.urlCoverImage} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Search size={24} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm font-semibold text-red-600">{formatVND(product.salePrice)}</span>
                                            {product.salePrice < product.listPrice && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">{calculateDiscountPercent(product.listPrice, product.salePrice)}%</span>}
                                        </div>
                                    </div>
                                </Link>
                            ))}

                            {/* View All Results */}
                            <Link
                                to={`/product`}
                                onClick={() => {
                                    setShowResults(false);
                                    setSearch("");
                                }}
                                className="block text-center text-sm text-blue-600 hover:text-blue-800 py-3 border-t mt-2"
                            >
                                Xem tất cả kết quả →
                            </Link>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <Search size={48} className="mx-auto mb-3 text-gray-300" />
                            <p className="text-sm">Không tìm thấy sản phẩm nào</p>
                            <p className="text-xs mt-1">Thử tìm kiếm với từ khóa khác</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
