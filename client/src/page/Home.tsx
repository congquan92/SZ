import BannerCarousel from "@/components/BannerCarousel";
import ButtonCenter from "@/components/ButtonCenter";
import ProductHot from "@/components/ProductHot";
import Title from "@/components/Title";

export default function Home() {
    return (
        <div className="container mx-auto px-2 space-y-4 ">
            {/* Giới thiệu sản phẩm */}
            <div className="mt-3">
                <BannerCarousel />
            </div>

            {/* Sản Phẩm Mới Nhất - */}
            <div className="mt-3">
                <div className="w-full max-w-[1600px] mx-auto mb-3">
                    <img src="https://cdn.hstatic.net/files/1000253775/file/banner-hang-moi-pc.jpg" alt="Banner Effect" className="w-full h-auto" />
                </div>
                <Title title="Sản Phẩm Mới Nhất" subtitle="Khám Phá Sản Phẩm Mới" />
                <ProductHot />
                <ButtonCenter input="Xem Tất Cả" />
            </div>

            {/* San Phẩm Bán Chạy -- lấy theo soldQuantity:desc  */}
            <div className="mt-3">
                <div className="w-full max-w-[1600px] mx-auto mt-3">
                    <img src="https://file.hstatic.net/1000253775/file/h_ng_b_n_ch_y_6__2_.jpg" alt="Banner Effect" className="w-full h-auto" />
                </div>
            </div>
        </div>
    );
}
