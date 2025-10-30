import BannerCarousel from "@/components/BannerCarousel";
import ButtonCenter from "@/components/ButtonCenter";
import Gallery from "@/components/Gallery";
import ProductHot from "@/components/ProductHot";
import Title from "@/components/Title";

export default function Home() {
    return (
        <div className="container mx-auto px-2 space-y-4 ">
            {/* Giới thiệu sản phẩm */}
            <div className="mt-3">
                <BannerCarousel />
            </div>

            {/* Sản Phẩm Mới  - */}
            <div className="mt-3">
                <div className="w-full max-w-[1600px] mx-auto mb-3">
                    <img src="https://cdn.hstatic.net/files/1000253775/file/banner-hang-moi-pc.jpg" alt="Banner Effect" className="w-full h-auto" />
                </div>
                <Title title="Sản Phẩm Mới Nhất" subtitle="Khám Phá Sản Phẩm Mới" />
                <ProductHot />
                <ButtonCenter input="Xem Tất Cả" link="/product" />
            </div>

            {/* San Phẩm Bán Chạy -- lấy theo soldQuantity:desc  */}
            <div className="mt-3">
                <div className="w-full max-w-[1600px] mx-auto mt-3">
                    <img src="https://file.hstatic.net/1000253775/file/h_ng_b_n_ch_y_6__2_.jpg" alt="Banner Effect" className="w-full h-auto" />
                </div>
                <Title title="Sản Phẩm Bán Chạy" subtitle="Khám Phá Sản Phẩm Bán Chạy" />
                {/* dung carousel */}
                sản Phẩm bán Chạy
                <ButtonCenter input="Xem Tất Cả" link="/product" />
            </div>

            {/* Hàng Sale 50% */}
            <div className="mt-3">
                <div className="w-full max-w-[1600px] mx-auto mt-3">
                    <img src="https://file.hstatic.net/1000253775/file/flashsale_dk_b277e7264a9c43a190f1bbbd14166c67.jpg" alt="Banner Effect" className="w-full h-auto" />
                </div>
                <Title title="Hàng Sale 50%" subtitle="Khám Phá Sản Phẩm Giảm Giá" />
                hàng sale 50%
                <ButtonCenter input="Xem Tất Cả" link="/sale" />
            </div>

            {/* Gallery  */}
            <div className="mt-3">
                <Title title="Combo Mix & Match Đúng Chuẩn" subtitle="khám phá ngay" />
                <Gallery />
            </div>
        </div>
    );
}
