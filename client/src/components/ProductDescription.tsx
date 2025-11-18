interface ProductDescriptionProps {
    description: string;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
    return (
        <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
            <h3 className="text-lg font-semibold mb-4">Thông tin chi tiết</h3>

            {/* Render HTML description */}
            <div
                className="mb-6 
                [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-3 [&_h3]:mt-0
                [&_strong]:font-semibold [&_strong]:text-foreground
                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4
                [&_li]:mb-1 [&_li]:leading-relaxed
                [&_p]:mb-3 [&_p]:leading-relaxed [&_p]:text-muted-foreground
                [&_br]:content-[''] [&_br]:block [&_br]:mb-1
                [&_hr]:my-4 [&_hr]:border-border
                [&_img]:w-[80%] [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:shadow-sm [&_img]:my-4 [&_img]:mx-auto
                [&_p:has(img)]:text-center [&_p:has(img)]:my-4"
                dangerouslySetInnerHTML={{ __html: description || "Chưa có mô tả chi tiết cho sản phẩm này." }}
            />

            {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div> */}
        </div>
    );
}
