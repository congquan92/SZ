import type { ProductVariant } from "@/components/types";

export function formatVND(value?: number | null) {
    if (!value && value !== 0) return "";
    try {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
    } catch {
        return `${value}₫`;
    }
}
// tinh phần trăm giảm giá
export const calculateDiscountPercent = (listPrice: number, salePrice: number): number => {
    if (listPrice <= salePrice) return 0;
    return Math.round(((listPrice - salePrice) / listPrice) * 100);
};
// tìm variant dựa trên lựa chọn
export const findVariant = (variants: ProductVariant[], selections: Record<string, string>): ProductVariant | null => {
    if (!variants.length || !Object.keys(selections).length) return null;
    return variants.find((variant) => variant.variantAttributes.every((attr) => selections[attr.attribute] === attr.value)) ?? null;
};
// kiểm tra có variant nào khớp với lựa chọn không
export const hasVariantWithSelection = (variants: ProductVariant[], selections: Record<string, string>): boolean => {
    if (!variants.length) return false;
    return variants.some((variant) => variant.variantAttributes.every((attr) => !selections[attr.attribute] || selections[attr.attribute] === attr.value));
};

export function toSlug(str: string): string {
    return str
        .normalize("NFD") // tách dấu khỏi ký tự (vd: "Á" -> "A" + ́)
        .replace(/[\u0300-\u036f]/g, "") // xóa toàn bộ dấu
        .replace(/đ/g, "d") // xử lý đặc biệt tiếng Việt
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-") // thay ký tự không hợp lệ bằng "-"
        .replace(/^-+|-+$/g, ""); // xóa "-" thừa đầu/cuối
}
