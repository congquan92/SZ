import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

export default function BannerCarousel() {
    const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }));

    const banners = [
        {
            src: "https://cdn.hstatic.net/files/1000253775/file/store_160_dk.jpg",
            alt: "Banner 1",
        },
        {
            src: "https://cdn.hstatic.net/files/1000253775/file/banner_kv-02__custom__e3ecf48ea75a4f05b9860c37c4bb7982.jpg",
            alt: "Banner 2",
        },
        {
            src: "https://file.hstatic.net/1000253775/file/new_banner_pc_copy_3be13f0b4b0d4ad19455f1eb05b7b22f.jpg",
            alt: "Banner 3",
        },
        {
            src: "https://file.hstatic.net/1000253775/file/ngang-_2048x813__1_.jpg",
            alt: "Banner 4",
        },
        {
            src: "https://file.hstatic.net/1000253775/file/banner_pc_3688a7ee993a48a3aa2ceda425abfa7b.jpg",
            alt: "Banner 5",
        },
    ];

    return (
        <div className="w-full max-w-[1600px] mx-auto">
            <Carousel plugins={[plugin.current]} className="w-full" opts={{ loop: true }}>
                <CarouselContent>
                    {banners.map((banner, index) => (
                        <CarouselItem key={index}>
                            <div className="relative w-full h-[250px] sm:h-[400px] md:h-[600px]">
                                <img src={banner.src} alt={banner.alt} className="w-full h-full object-cover rounded-lg" />
                                {/* Overlay nếu cần */}
                                {/* <div className="absolute inset-0 bg-black/30 rounded-lg" /> */}
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 sm:left-4 bg-white/40 hover:bg-white/60 text-black rounded-full p-2 sm:p-3 cursor-pointer" />
                <CarouselNext className="right-2 sm:right-4 bg-white/40 hover:bg-white/60 text-black rounded-full p-2 sm:p-3 cursor-pointer" />
            </Carousel>
        </div>
    );
}
