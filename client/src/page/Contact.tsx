import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        setIsSubmitting(true);

        // fake API
        setTimeout(() => {
            toast.success("Gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");
            setFormData({
                name: "",
                email: "",
                phone: "",
                message: "",
            });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="bg-white">
            {/* MAP FULL WIDTH */}
            <div className="w-full h-[330px] md:h-[380px] bg-muted">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4967085695937!2d106.69244607480579!3d10.772461889375634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0x5a1b6c0c2a9e5a2c!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e0!3m2!1svi!2s!4v1699999999999!5m2!1svi!2s"
                    className="w-full h-full"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    title="SZ Location Map"
                />
            </div>

            {/* FORM + INFO */}
            <div className="container mx-auto px-4 py-12 lg:py-16">
                <div className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] items-start">
                    {/* LEFT: FORM */}
                    <div>
                        <h2 className="text-2xl md:text-3xl font-semibold mb-3">Gửi thắc mắc cho chúng tôi</h2>
                        <p className="text-sm md:text-base text-muted-foreground mb-8">Nếu bạn có thắc mắc gì, có thể gửi yêu cầu cho chúng tôi, và chúng tôi sẽ liên lạc với bạn sớm nhất có thể.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Tên của bạn <span className="text-red-500">*</span>
                                </Label>
                                <Input id="name" placeholder="Nguyễn Văn A" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email của bạn <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="email" type="email" placeholder="example@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại của bạn</Label>
                                    <Input id="phone" placeholder="0901234567" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">
                                    Nội dung <span className="text-red-500">*</span>
                                </Label>
                                <Textarea id="message" rows={6} className="resize-none" placeholder="Nhập nội dung tin nhắn của bạn..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                            </div>

                            <Button type="submit" disabled={isSubmitting} className="px-10">
                                {isSubmitting ? "Đang gửi..." : "GỬI CHO CHÚNG TÔI"}
                            </Button>
                        </form>
                    </div>

                    {/* RIGHT: CONTACT INFO */}
                    <div>
                        <h3 className="text-xl md:text-2xl font-semibold mb-6">Thông tin liên hệ</h3>

                        <div className="space-y-6 text-sm md:text-base text-muted-foreground">
                            {/* Address */}
                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">Địa chỉ</p>
                                    <p>
                                        Tầng 8, tòa nhà SZ Tower
                                        <br />
                                        123 Đường ABC, Quận 1, TP. Hồ Chí Minh
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Phone */}
                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">Điện thoại</p>
                                    <p>Hotline: 1900-xxxx</p>
                                    <p>Mobile: 0901-xxx-xxx</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Time */}
                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">Thời gian làm việc</p>
                                    <p>Thứ 2 đến Thứ 6: 8h30 – 18h00</p>
                                    <p>Thứ 7: 8h30 – 12h00</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Email */}
                            <div className="flex gap-3">
                                <div className="mt-1">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground mb-1">Email</p>
                                    <p>support@sz.vn</p>
                                    <p>cskh@sz.vn</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
