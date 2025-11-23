export default function Return() {
    return (
        <div className="py-10 lg:py-16 relative">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Hiệu ứng tuyết */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    {Array.from({ length: 380 }).map((_, i) => (
                        <span
                            key={i}
                            className="absolute block rounded-full bg-[#80a1d6] opacity-80 animate-snow"
                            style={{
                                width: `${Math.random() * 4 + 2}px`,
                                height: `${Math.random() * 4 + 2}px`,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${6 + Math.random() * 5}s`,
                            }}
                        />
                    ))}
                </div>

                {/* Heading */}
                <h2 className="text-xl font-semibold text-neutral-700 mb-3">Chính sách đổi hàng</h2>
                {/* Section 1 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">1. CHÍNH SÁCH ÁP DỤNG</h3>
                    <p className="leading-relaxed text-neutral-700 mb-4">Áp dụng từ ngày 01/09/2018.</p>
                    <p className="leading-relaxed text-neutral-700 mb-4">Trong vòng 30 ngày kể từ ngày mua sản phẩm với các sản phẩm SZ.</p>
                    <p className="leading-relaxed text-neutral-700 mb-4">Áp dụng đối với sản phẩm nguyên giá và sản phẩm giảm giá ít hơn 50%.</p>
                    <p className="leading-relaxed text-neutral-700 mb-4">Sản phẩm nguyên giá chỉ được đổi 01 lần duy nhất sang sản phẩm nguyên giá khác và không thấp hơn giá trị sản phẩm đã mua.</p>
                    <p className="leading-relaxed text-neutral-700 mb-4">Sản phẩm giảm giá/khuyến mại ít hơn 50% được đổi 01 lần sang màu khác hoặc size khác trên cùng 1 mã trong điều kiện còn sản phẩm.</p>
                    <p className="leading-relaxed text-neutral-700 mb-4">Sản phẩm đã hết hàng khi đó khách hàng sẽ được đổi sang sản phẩm khác có giá trị ngang bằng hoặc cao hơn.</p>
                    <p className="leading-relaxed text-neutral-700 mb-4">Chính sách chỉ áp dụng khi sản phẩm còn hóa đơn mua hàng, còn nguyên nhãn mác, thẻ bài và sản phẩm không bị dơ bẩn, hư hỏng.</p>
                    <p className="leading-relaxed text-neutral-700">Sản phẩm đồ lót và phụ kiện không được đổi trả.</p>
                </section>

                {/* Section 2 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">2. ĐIỀU KIỆN ĐỔI SẢN PHẨM</h3>
                    <p className="leading-relaxed text-neutral-700 mb-4">Đổi hàng trong vòng 07 ngày kể từ ngày khách hàng nhận được sản phẩm.</p>
                    <p className="leading-relaxed text-neutral-700">Sản phẩm còn nguyên tem, mác và chưa qua sử dụng.</p>
                </section>

                {/* Section 3 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">3. THỰC HIỆN ĐỔI SẢN PHẨM</h3>
                    <p className="leading-relaxed text-neutral-700 mb-4">Quý khách có thể đổi hàng Online tại hệ thống cửa hàng và đại lý SZ trên toàn quốc. Lưu ý: vui lòng mang theo sản phẩm và phiếu giao hàng.</p>
                    <p className="leading-relaxed text-neutral-700 mb-4">Nếu tại khu vực bạn không có cửa hàng SZ hoặc sản phẩm bạn muốn đổi thì vui lòng làm theo các bước sau:</p>
                    <p className="leading-relaxed text-neutral-700 mb-3">
                        <strong>Bước 1:</strong> Gọi đến Tổng đài: 0964942121 trong giờ làm việc (trừ ngày lễ) để cung cấp mã đơn hàng và sản phẩm cần đổi.
                    </p>
                    <p className="leading-relaxed text-neutral-700 mb-3">
                        <strong>Bước 2:</strong> Vui lòng gửi hàng đổi về địa chỉ: Kho Online SZ – 123 Đường ABC, TP. Hồ Chí Minh.
                    </p>
                    <p className="leading-relaxed text-neutral-700">
                        <strong>Bước 3:</strong> SZ gửi đổi sản phẩm mới khi nhận được hàng. Trong trường hợp hết hàng, SZ sẽ liên hệ để xác nhận phương án xử lý.
                    </p>
                </section>
            </div>
            {/* CSS animation */}
            <style>{`
@keyframes snow {
    0% { transform: translateY(-10vh) translateX(0); opacity: .3; }
    50% { opacity: 1; }
    100% { transform: translateY(120vh) translateX(40px); opacity: 0; }
}
.animate-snow {
    animation-name: snow;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    position: absolute;
}
`}</style>
        </div>
    );
}
