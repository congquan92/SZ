import { useState } from "react";
import { X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PromoPopup() {
    const [open, setOpen] = useState(true);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* Nút mở lại popup (góc màn hình, kiểu Flash Sale) */}
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors rounded-none fixed bottom-4 right-4 shadow-md cursor-pointer z-40">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Flash Sale</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg rounded-none p-0 overflow-hidden border border-red-500/70 shadow-2xl">
                {/* Header Flash Sale */}
                <div className="bg-gradient-to-r from-red-700 via-red-600 to-orange-500 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-start gap-3 text-white">
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-none bg-white/10">
                            <Zap className="w-5 h-5" />
                        </div>

                        <DialogHeader className="p-0 space-y-1">
                            <div className="inline-flex items-center gap-2">
                                <span className="inline-flex items-center rounded-none bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]">🔥 Flash Sale</span>
                                <span className="text-[11px] font-medium text-orange-100">Số lượng có hạn</span>
                            </div>
                            <DialogTitle className="text-base sm:text-lg font-bold text-white leading-snug">
                                Giảm đến <span className="text-yellow-300">70%</span> – Chỉ trong hôm nay
                            </DialogTitle>
                            <p className="text-xs sm:text-sm text-red-100">Deal sốc cho các item hot nhất ShopZues, hết là thôi, không refill!</p>
                        </DialogHeader>
                    </div>

                    <button onClick={() => setOpen(false)} className="text-red-100 hover:text-white hover:bg-white/10 rounded-none p-1 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 bg-white">
                    {/* Tagline */}
                    <div className="inline-flex items-center gap-2 rounded-none bg-red-50 border border-red-200 px-3 py-1">
                        <span className="w-1.5 h-1.5 rounded-none bg-red-600 animate-pulse" />
                        <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wide">Đang diễn ra • Không chờ ai</span>
                    </div>

                    {/* Text giới thiệu */}
                    <div className="space-y-2">
                        <p className="text-sm text-slate-800 leading-relaxed">Gom nhanh các item hot: áo thun, sơ mi, quần jeans, outerwear... giá hời hơn cả người yêu cũ.</p>
                        <ul className="text-sm text-slate-800 space-y-1.5">
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-none bg-red-600" />
                                <span>
                                    <b>Deal siêu sốc</b> – Sản phẩm chọn lọc, giảm sâu, không giảm cho có.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-none bg-red-600" />
                                <span>
                                    <b>Canh giờ vàng</b> – Một số khung giờ giá còn <b>rẻ hơn cả Flash Sale thường</b>.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-none bg-red-600" />
                                <span>
                                    <b>Freeship đơn từ 300K</b> – Không lo phí ship phá mood mua sắm.
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 h-1.5 w-1.5 rounded-none bg-red-600" />
                                <span>
                                    <b>Đổi trả 7 ngày</b> – Mặc không ưng, đổi nhẹ, không drama.
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Hình minh hoạ */}
                    <div className="border border-red-200 rounded-none overflow-hidden bg-red-50">
                        <img
                            src="https://cdn.hstatic.net/200000000000/1000800000/flash-sale-banner.jpg"
                            alt="Flash Sale"
                            className="w-full h-40 object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                    parent.innerHTML = '<div class="w-full h-40 flex items-center justify-center"><p class="text-red-500 text-sm font-semibold uppercase tracking-wide">🔥 Flash Sale đang diễn ra</p></div>';
                                }
                            }}
                        />
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        <Button
                            className="flex-1 gap-2 cursor-pointer rounded-none bg-red-600 hover:bg-red-700 text-white shadow-md"
                            onClick={() => {
                                setOpen(false);
                                window.location.href = "/flash-sale";
                            }}
                        >
                            <Zap className="w-4 h-4" />
                            Vào khu Flash Sale
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 cursor-pointer rounded-none border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Để lát nữa xem
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
