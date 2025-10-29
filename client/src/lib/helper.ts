export function formatVND(value?: number | null) {
    if (!value && value !== 0) return "";
    try {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
    } catch {
        return `${value}₫`;
    }
}
