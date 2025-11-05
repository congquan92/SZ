import BreadcrumbCustom from "@/components/BreadcrumbCustom";
import Title from "@/components/Title";

export default function Sale() {
    return (
        <div className="container mx-auto px-2 space-y-4">
            <div className="mt-2">
                <BreadcrumbCustom title="Trang chủ" link_title="/" subtitle="Sản phẩm" />
            </div>

            <div className="w-full max-w-[1600px] mx-auto mb-4">
                <img src="https://file.hstatic.net/1000253775/file/flashsale_dk_b277e7264a9c43a190f1bbbd14166c67.jpg" alt="Banner Effect" className="w-full h-auto" />
                <Title title="Sale 50%" />
            </div>
        </div>
    );
}
