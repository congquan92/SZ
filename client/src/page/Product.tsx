import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import Title from "@/components/Title";

export default function Product() {
    return (
        <div className="container mx-auto px-2 space-y-4">
            <div className="mt-2">
                <BreadcrumbCustom title="Trang chủ" link_title="/" subtitle="Sản phẩm" />
            </div>

            <div className="w-full max-w-[1600px] mx-auto mb-4">
                <img src="https://cdn.hstatic.net/files/1000253775/file/banner-hang-moi-pc.jpg" alt="Banner Effect" className="w-full h-auto" />
                <Title title="Hàng Mới" />
            </div>
        </div>
    );
}
