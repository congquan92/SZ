export default function About() {
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 py-12 lg:py-20">
                {/* Heading trung tâm */}
                <div className="text-center mb-12 lg:mb-16">
                    <p className="tracking-[0.35em] text-xs md:text-sm uppercase text-muted-foreground mb-3">VỀ CHÚNG TÔI</p>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[0.08em]">THƯƠNG HIỆU THỜI TRANG NAM SZ</h1>
                </div>

                {/* BLOCK 1 — HÌNH TRÁI / CÂU CHUYỆN THƯƠNG HIỆU BÊN PHẢI */}
                <section className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-20 lg:mb-24">
                    {/* Hình minh họa */}
                    <div className="w-full">
                        <img src="/about01_introduce1_img.jpg" alt="Bộ sưu tập thời trang SZ" className="w-full h-auto object-cover" />
                    </div>

                    {/* Text */}
                    <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground">
                        <p className="tracking-[0.35em] text-xs md:text-sm uppercase text-muted-foreground">SZ BRAND</p>
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-[0.08em] mb-2 text-foreground">CÂU CHUYỆN THƯƠNG HIỆU</h2>

                        <p>
                            SZ là thương hiệu thời trang nam được định hướng theo phong cách hiện đại, lịch lãm và trẻ trung. Từ những ngày đầu thành lập, chúng tôi luôn theo đuổi mục tiêu mang lại cho phái mạnh những lựa chọn trang phục chỉn chu
                            nhưng vẫn thoải mái, dễ ứng dụng trong mọi hoàn cảnh.
                        </p>
                        <p>Trải qua quá trình phát triển, SZ dần xây dựng hệ thống cửa hàng và kênh bán hàng online trên toàn quốc, giúp khách hàng dễ dàng tiếp cận sản phẩm chất lượng với mức giá hợp lý.</p>
                        <p>Mỗi sản phẩm tại SZ đều được chọn lọc kỹ từ chất liệu đến form dáng, hướng tới sự tối giản, tinh tế và dễ phối đồ trong cuộc sống hàng ngày.</p>
                        <p>Phong cách của SZ tập trung vào sự gọn gàng, thanh lịch nhưng vẫn gần gũi, dễ mặc. Các dòng sản phẩm như áo polo, sơ mi, quần tây, quần jean… đều được thiết kế theo form chuẩn, dễ chọn size cho khách hàng Việt.</p>
                    </div>
                </section>

                {/* BLOCK 2 — GIÁ TRỊ CỐT LÕI (CHỮ GIỮA / HÌNH BÊN PHẢI) */}
                <section className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Text trung tâm */}
                    <div className="text-center lg:text-left space-y-5">
                        <p className="tracking-[0.35em] text-xs md:text-sm uppercase text-muted-foreground">MODE FASHION</p>
                        <h2 className="text-2xl md:text-3xl font-semibold tracking-[0.08em] text-foreground">GIÁ TRỊ CỐT LÕI</h2>

                        <div className="space-y-3 text-sm md:text-base leading-relaxed text-muted-foreground max-w-xl mx-auto lg:mx-0">
                            <p>
                                <span className="font-semibold text-foreground">Tinh gọn:</span> Thiết kế tối giản, tập trung vào những item dễ phối, bền xu hướng và phù hợp với nhiều hoàn cảnh sử dụng.
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">Chất lượng:</span> Chú trọng từ khâu chọn sợi vải, xử lý màu, đường may đến kiểm tra thành phẩm trước khi đến tay khách hàng.
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">Trải nghiệm:</span> Mua sắm online hay tại cửa hàng đều được thiết kế mạch lạc, rõ ràng, hỗ trợ khách hàng từ khâu chọn size đến đổi trả.
                            </p>
                            <p>
                                <span className="font-semibold text-foreground">Uy tín:</span> Minh bạch về giá, chương trình ưu đãi và chính sách bảo hành – xây dựng niềm tin dài lâu với khách hàng.
                            </p>
                        </div>
                    </div>

                    {/* Hình minh họa core value */}
                    <div className="w-full">
                        <img src="/about01_introduce2_img.jpg" alt="Phụ kiện và thời trang SZ" className="w-full h-auto object-cover" />
                    </div>
                </section>
            </div>
        </div>
    );
}
