import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Facebook, Instagram, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
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

        // Simulate API call
        setTimeout(() => {
            toast.success("Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.");
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
            });
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Liên Hệ Với Chúng Tôi</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Hãy để chúng tôi biết nếu bạn có bất kỳ câu hỏi nào. Chúng tôi luôn sẵn sàng hỗ trợ!</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Contact Information */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                Thông Tin Liên Hệ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Address */}
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Địa chỉ</h3>
                                    <p className="text-sm text-muted-foreground">
                                        123 Đường ABC, Quận 1<br />
                                        TP. Hồ Chí Minh, Việt Nam
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Phone */}
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center shrink-0">
                                    <Phone className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Điện thoại</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Hotline: 1900-xxxx
                                        <br />
                                        Mobile: 0901-xxx-xxx
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Email */}
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Email</h3>
                                    <p className="text-sm text-muted-foreground">
                                        support@sz.vn
                                        <br />
                                        info@sz.vn
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            {/* Working Hours */}
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center shrink-0">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Giờ làm việc</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Thứ 2 - Thứ 7: 8:00 - 22:00
                                        <br />
                                        Chủ nhật: 9:00 - 21:00
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Media */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mạng Xã Hội</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-3">
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <Facebook className="w-5 h-5 text-blue-600" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <Instagram className="w-5 h-5 text-pink-600" />
                                </Button>
                                <Button variant="outline" size="icon" className="rounded-full">
                                    <Youtube className="w-5 h-5 text-red-600" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-4">Theo dõi chúng tôi để cập nhật những tin tức và ưu đãi mới nhất!</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gửi Tin Nhắn</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Họ và tên <span className="text-red-500">*</span>
                                        </Label>
                                        <Input id="name" placeholder="Nguyễn Văn A" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email <span className="text-red-500">*</span>
                                        </Label>
                                        <Input id="email" type="email" placeholder="example@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại</Label>
                                        <Input id="phone" placeholder="0901234567" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Chủ đề</Label>
                                        <Input id="subject" placeholder="Tiêu đề tin nhắn" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">
                                        Nội dung <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea id="message" placeholder="Nhập nội dung tin nhắn của bạn..." rows={6} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required className="resize-none" />
                                </div>

                                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>Đang gửi...</>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Gửi tin nhắn
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Map */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Bản Đồ</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="w-full h-[400px] bg-muted rounded-b-lg overflow-hidden">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4967085695937!2d106.69244607480579!3d10.772461889375634!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3330bcc9%3A0x5a1b6c0c2a9e5a2c!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e0!3m2!1svi!2s!4v1699999999999!5m2!1svi!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="SZ Location Map"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
