import type { ProductVariant } from "@/components/types";

export function formatVND(value?: number | null) {
    if (!value && value !== 0) return "";
    try {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
    } catch {
        return `${value}₫`;
    }
}
// Normalize attribute name để so sánh (loại bỏ khoảng trắng thừa, lowercase, remove diacritics)
export const normalizeAttrName = (name: string): string => {
    return name
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
};

// tinh phần trăm giảm giá
export const calculateDiscountPercent = (listPrice: number, salePrice: number): number => {
    if (!listPrice || !salePrice || listPrice <= 0 || salePrice <= 0) return 0;
    if (listPrice <= salePrice) return 0;
    const percent = ((listPrice - salePrice) / listPrice) * 100;
    return Math.round(Math.max(0, Math.min(100, percent)));
};

// tìm variant dựa trên lựa chọn (cải thiện với normalize attribute name)
export const findVariant = (variants: ProductVariant[], selections: Record<string, string>): ProductVariant | null => {
    if (!variants.length || !Object.keys(selections).length) return null;

    return (
        variants.find((variant) => {
            if (variant.quantity <= 0) return false;

            return variant.variantAttributes.every((attr) => {
                const normalizedAttr = normalizeAttrName(attr.attribute);
                const selectionKey = Object.keys(selections).find((key) => normalizeAttrName(key) === normalizedAttr);

                if (!selectionKey) return true; // nếu không có trong selections thì bỏ qua
                return selections[selectionKey] === attr.value;
            });
        }) ?? null
    );
};

// kiểm tra có variant nào khớp với lựa chọn không (cải thiện với normalize)
export const hasVariantWithSelection = (variants: ProductVariant[], selections: Record<string, string>): boolean => {
    if (!variants.length) return false;

    return variants.some((variant) => {
        if (variant.quantity <= 0) return false;

        return variant.variantAttributes.every((attr) => {
            const normalizedAttr = normalizeAttrName(attr.attribute);
            const selectionKey = Object.keys(selections).find((key) => normalizeAttrName(key) === normalizedAttr);

            if (!selectionKey || !selections[selectionKey]) return true;
            return selections[selectionKey] === attr.value;
        });
    });
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

export function formatDate(v?: string) {
    if (!v || v.length !== 14) return "-";
    const yyyy = v.slice(0, 4);
    const MM = v.slice(4, 6);
    const dd = v.slice(6, 8);
    const hh = v.slice(8, 10);
    const mm = v.slice(10, 12);
    const ss = v.slice(12, 14);
    return `${hh}:${mm}:${ss} ${dd}/${MM}/${yyyy}`;
}
