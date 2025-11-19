import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Store, Target, Users, Heart, TrendingUp, Award, Shield, Truck } from "lucide-react";

export default function About() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Về Chúng Tôi</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Chào mừng đến với SZ - Điểm đến thời trang hàng đầu dành cho bạn</p>
            </div>

            {/* Company Info */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Store className="w-6 h-6" />
                        Câu Chuyện Của Chúng Tôi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                        SZ được thành lập với sứ mệnh mang đến những sản phẩm thời trang chất lượng cao, phù hợp với mọi phong cách và túi tiền. Chúng tôi tin rằng thời trang không chỉ là về vẻ ngoài, mà còn là cách bạn thể hiện bản thân và tạo nên
                        phong cách riêng.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                        Với đội ngũ chuyên nghiệp và tâm huyết, chúng tôi không ngừng tìm kiếm và cập nhật những xu hướng mới nhất, đồng thời cam kết mang đến trải nghiệm mua sắm tuyệt vời nhất cho khách hàng.
                    </p>
                </CardContent>
            </Card>

            {/* Mission & Vision */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            Sứ Mệnh
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed">Cung cấp sản phẩm thời trang chất lượng cao với giá cả hợp lý, giúp mọi người tự tin thể hiện phong cách và cá tính riêng của mình.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            Tầm Nhìn
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground leading-relaxed">Trở thành thương hiệu thời trang hàng đầu Việt Nam, được khách hàng tin tưởng và lựa chọn bởi chất lượng sản phẩm và dịch vụ xuất sắc.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Core Values */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Heart className="w-6 h-6 text-red-600" />
                        Giá Trị Cốt Lõi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                                <Award className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold">Chất Lượng</h3>
                            <p className="text-sm text-muted-foreground">Cam kết 100% sản phẩm chính hãng, chất lượng cao</p>
                        </div>

                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="font-semibold">Khách Hàng</h3>
                            <p className="text-sm text-muted-foreground">Đặt lợi ích khách hàng lên hàng đầu</p>
                        </div>

                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                                <Shield className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="font-semibold">Uy Tín</h3>
                            <p className="text-sm text-muted-foreground">Minh bạch, trung thực trong mọi giao dịch</p>
                        </div>

                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto">
                                <Truck className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="font-semibold">Giao Hàng</h3>
                            <p className="text-sm text-muted-foreground">Nhanh chóng, an toàn và chu đáo</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Thành Tựu Của Chúng Tôi</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-blue-600">10K+</div>
                            <div className="text-sm text-muted-foreground">Khách hàng</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-purple-600">5K+</div>
                            <div className="text-sm text-muted-foreground">Sản phẩm</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-green-600">50+</div>
                            <div className="text-sm text-muted-foreground">Thương hiệu</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-3xl font-bold text-orange-600">98%</div>
                            <div className="text-sm text-muted-foreground">Hài lòng</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator className="my-8" />

            {/* Call to Action */}
            <div className="text-center">
                <h3 className="text-2xl font-semibold mb-3">Cảm ơn bạn đã tin tưởng SZ!</h3>
                <p className="text-muted-foreground mb-4">Chúng tôi luôn sẵn sàng phục vụ và mang đến trải nghiệm mua sắm tốt nhất cho bạn</p>
                <Badge variant="outline" className="text-sm px-4 py-2">
                    Hotline: 1900-xxxx | Email: support@sz.vn
                </Badge>
            </div>
        </div>
    );
}
