export default function Privacy() {
    return (
        <div className="bg-white py-10 lg:py-16">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Heading */}
                <h2 className="text-xl font-semibold text-neutral-700 mb-3">Chính sách bảo mật</h2>

                <h1 className="text-3xl md:text-4xl font-bold tracking-wide mb-10">BẢO MẬT THÔNG TIN KHÁCH HÀNG SZ</h1>

                {/* Section 1 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">1. Thu thập và sử dụng thông tin của SZ</h3>

                    <p className="mb-4 leading-relaxed text-neutral-700">
                        SZ chỉ thu thập các loại thông tin cơ bản liên quan đến đơn đặt hàng như: họ tên khách hàng, số điện thoại, địa chỉ giao hàng, email và một số thông tin cần thiết khác để phục vụ quá trình mua sắm.
                    </p>

                    <p className="mb-4 leading-relaxed text-neutral-700">Các thông tin này được sử dụng nhằm mục đích xử lý đơn hàng, nâng cao chất lượng dịch vụ, nghiên cứu thị trường, chăm sóc khách hàng và đảm bảo quyền lợi của khách.</p>

                    <p className="mb-4 leading-relaxed text-neutral-700">SZ cam kết:</p>

                    <ul className="list-disc ml-6 space-y-2 text-neutral-700">
                        <li>Thông tin cá nhân của khách hàng chỉ được sử dụng đúng mục đích đã thông báo.</li>
                        <li>Mọi việc thu thập và sử dụng thông tin đều được sự đồng ý của khách hàng.</li>
                        <li>Không chia sẻ hoặc bán dữ liệu của khách cho bên thứ ba.</li>
                        <li>Chỉ lưu trữ thông tin trong thời gian cần thiết để phục vụ khách hàng.</li>
                    </ul>

                    <p className="mt-4 leading-relaxed text-neutral-700">SZ chỉ cung cấp thông tin cho các đơn vị liên quan khi có yêu cầu hợp pháp từ cơ quan nhà nước hoặc theo yêu cầu của khách hàng.</p>
                </section>

                {/* Section 2 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">2. Cách thức bảo mật thông tin khách hàng</h3>

                    <p className="mb-4 leading-relaxed text-neutral-700">
                        Chúng tôi đảm bảo rằng mọi thông tin cá nhân được khách hàng cung cấp đều được lưu trữ an toàn. SZ áp dụng các biện pháp kỹ thuật hiện đại để tránh việc mất mát hoặc tấn công dữ liệu.
                    </p>

                    <p className="mb-4 leading-relaxed text-neutral-700">Trong trường hợp máy chủ bị tấn công dẫn đến mất dữ liệu, SZ sẽ thông báo cho khách hàng và phối hợp với cơ quan chức năng để xử lý.</p>
                </section>

                {/* Section 3 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">3. Trách nhiệm bảo mật thông tin khách hàng</h3>

                    <p className="mb-4 leading-relaxed text-neutral-700">Khách hàng cần cung cấp thông tin đầy đủ và chính xác khi mua hàng. Mọi thông tin sai lệch sẽ ảnh hưởng đến quá trình xử lý đơn hàng và chăm sóc khách hàng.</p>

                    <p className="leading-relaxed text-neutral-700">
                        Khách hàng có trách nhiệm tự bảo mật thông tin tài khoản của mình và không chia sẻ cho người khác. SZ không chịu trách nhiệm đối với thiệt hại do việc tiết lộ thông tin cá nhân từ phía khách hàng.
                    </p>
                </section>

                {/* Section 4 */}
                <section className="mb-10">
                    <h3 className="font-semibold text-lg mb-3">4. Luật áp dụng khi xảy ra tranh chấp</h3>

                    <p className="mb-4 leading-relaxed text-neutral-700">Mọi tranh chấp xảy ra giữa Khách hàng và TORANO sẽ được hòa giải. Nếu hòa giải không thành sẽ được giải quyết tại Tòa án có thẩm quyền và tuân theo pháp luật Việt Nam</p>
                </section>
            </div>
        </div>
    );
}
