interface ProductDescriptionProps {
    description: string;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
    return (
        <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-3">Thông tin chi tiết</h3>
            <p className="text-muted-foreground leading-relaxed">{description || "Chưa có mô tả chi tiết cho sản phẩm này."}</p>

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
    );
}
