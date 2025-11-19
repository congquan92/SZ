import { ProductAPI } from "@/api/product.api";
import SearchBar from "@/components/SearchBar";
import Topbar from "@/components/Topbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { toSlug } from "@/lib/helper";
import type { Category } from "@/page/type";
import { useAuthStore } from "@/stores/useAuthStores";
import { useCartStore } from "@/stores/useCartStore";
import { Bell, Heart, LogIn, LogOut, MapPin, Menu, ShoppingCart, Store, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [category, setCategory] = useState<Category[]>();
    const { user, logout } = useAuthStore();
    const { cartCount, fetchCart, clearCart } = useCartStore();
    const navigate = useNavigate();

    const init = async () => {
        // Lấy danh mục sản phẩm
        const category_data = await ProductAPI.getCategory();
        setCategory(category_data.data);
        // console.log("Categories:", category_data.data);
    };

    useEffect(() => {
        init();
        // Fetch cart khi component mount và khi user đã đăng nhập
        if (user) {
            fetchCart();
        }
    }, [user, fetchCart]);

    // Các action trong phần user (dropdown desktop + khu vực mobile)
    const userActionLinks = [
        { label: "Cửa hàng", to: "/stores", icon: MapPin, desktopOnly: true },
        { label: "Đơn hàng", to: "/orders", icon: Store },
        { label: "Yêu thích", to: "/wishlist", icon: Heart },
    ];

    // Main nav cho desktop (hàng dưới) + dùng lại cho mobile
    const mainNavLinks = [
        { label: "Trang chủ", to: "/", simple: true },
        { label: "🔥 Hàng Mới", to: "/product", simple: true, className: "text-red-500 font-medium" },
        { label: "🏷️ SALE -50%", to: "/sale", simple: true, className: "text-red-500 font-bold" },
    ];

    const handleLogout = () => {
        // Xử lý đăng xuất
        logout();
        clearCart();
        window.location.href = "/";
        console.log("Đăng xuất");
    };

    const hasChildren = (c?: Category) => !!(c?.childCategory && c.childCategory.length);

    return (
        <nav className="w-full sticky top-0 z-50">
            {/* Top bar - Contact info */}
            <Topbar />

            {/* Main navbar - Logo, Search, Cart, User */}
            <div className="bg-white! shadow border-b">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center py-2">
                        {/* Mobile menu button & Logo */}
                        <div className="flex items-center gap-4">
                            <button className="md:hidden p-2 rounded-md hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>

                            <a href="/" className="flex items-center gap-3">
                                <Avatar className="size-12">
                                    <AvatarImage src="/logo-shop.jpg" className="object-cover" alt="SHOP ZUES" />
                                    <AvatarFallback className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold rounded">SZ</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-semibold tracking-tight">Shop Zues</span>
                                    <span className="leading-none text-sm text-muted-foreground">Tự tin sống chất</span>
                                </div>
                            </a>
                        </div>

                        {/* Search */}
                        <SearchBar className="flex-1 mx-6 max-w-lg hidden sm:block" />

                        {/* Right actions */}
                        <div className="flex items-center gap-3 text-sm">
                            {/* Cửa hàng (desktop only) */}
                            {userActionLinks
                                .filter((l) => l.desktopOnly)
                                .map(({ to, label, icon: Icon }) => (
                                    <Link key={to} to={to} className="hidden md:flex items-center gap-1 hover:underline">
                                        <Icon size={16} /> {label}
                                    </Link>
                                ))}

                            <Link to="/cart" className="relative p-2 rounded-md hover:bg-gray-100">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <div className="absolute -top-2 -right-2">
                                        <Badge variant="destructive" className="text-xs px-1 min-w-4 h-5">
                                            {cartCount}
                                        </Badge>
                                    </div>
                                )}
                            </Link>

                            {/* User dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={user?.avatar ?? undefined} alt="User Avatar" className="object-cover" />
                                            <AvatarFallback className="w-8 h-8 bg-gray-800 text-white flex items-center justify-center rounded-full">{user?.fullName?.slice(0, 2).toUpperCase() ?? <User size={16} />}</AvatarFallback>
                                        </Avatar>

                                        {/* <Avatar className="w-8 h-8">
                                            <div className="flex items-center justify-center bg-gray-800 text-white rounded-full w-full">{user?.userName?.slice(0, 2).toUpperCase() || <User size={16} />}</div>
                                        </Avatar> */}
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-48 ">
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile" className="flex items-center">
                                            <User size={16} className="mr-2" /> {user ? user.fullName : "Tài khoản"}
                                        </Link>
                                    </DropdownMenuItem>

                                    {userActionLinks
                                        .filter((l) => !l.desktopOnly)
                                        .map(({ to, label, icon: Icon }) => (
                                            <DropdownMenuItem key={to} asChild>
                                                <Link to={to} className="flex items-center gap-2">
                                                    <Icon size={16} /> {label}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}

                                    <DropdownMenuItem asChild>
                                        {user ? (
                                            <div className="cursor-pointer flex items-center" onClick={handleLogout}>
                                                <LogOut size={16} className="mr-2" /> Đăng xuất
                                            </div>
                                        ) : (
                                            <Link to="/login" className="flex items-center">
                                                <LogIn size={16} className="mr-2" /> Đăng nhập
                                            </Link>
                                        )}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/*Notifications */}
                            <div className="flex items-center">
                                <Link to="/notifications" className="p-2 rounded-md hover:bg-gray-100 relative">
                                    <Bell size={20} />
                                    <div className="absolute -top-2 -right-1">
                                        <Badge variant="destructive" className="text-xs px-1 min-w-4 h-5">
                                            5
                                        </Badge>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom navigation (desktop) */}
            <div className="bg-white border-b hidden md:block py-1">
                <div className="container mx-auto">
                    <NavigationMenu viewport={false}>
                        <NavigationMenuList>
                            {/* Simple links */}
                            {mainNavLinks.map(({ to, label, className }) => (
                                <NavigationMenuItem key={to}>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link to={to} className={`px-4 py-3 font-medium hover:text-black ${className || ""}`}>
                                            {label}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}

                            {/* Dropdown groups */}
                            {category?.map((top) => (
                                <NavigationMenuItem key={top.id}>
                                    <NavigationMenuTrigger>{top.name}</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <div className="p-4">
                                            <div className="grid gap-4 min-w-[680px] grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                {(top.childCategory ?? []).map((mid) => (
                                                    <div key={mid.id} className="space-y-2">
                                                        {/* Link cấp 2 */}
                                                        <NavigationMenuLink asChild>
                                                            <Link to={`/category/${mid.id}/${toSlug(mid.name)}/${mid.name}`} className="font-medium leading-none hover:underline">
                                                                {mid.name}
                                                            </Link>
                                                        </NavigationMenuLink>

                                                        {/* List cấp 3 */}
                                                        {hasChildren(mid) && (
                                                            <ul className="space-y-1">
                                                                {mid.childCategory!.map((sub) => (
                                                                    <li key={sub.id}>
                                                                        <NavigationMenuLink asChild>
                                                                            <Link to={`/category/${sub.id}/${toSlug(sub.name)}/${sub.name}`} className="block text-sm text-muted-foreground hover:text-foreground">
                                                                                {sub.name}
                                                                            </Link>
                                                                        </NavigationMenuLink>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>
            {/* Mobile menu overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden ">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" onClick={() => setMobileOpen(false)} />

                    {/* Off-canvas menu */}
                    <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-10">
                                    <AvatarImage src="/logo-shop.jpg" alt="SHOP ZUES" className="object-cover" />
                                    <AvatarFallback className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold rounded">SZ</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-sm">Shop Zues</span>
                                    <span className="text-xs text-muted-foreground">Tự tin sống chất</span>
                                </div>
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-gray-100" aria-label="Close menu">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search bar */}
                        <div className="p-4 border-b">
                            <SearchBar className="w-full" />
                        </div>

                        {/* User info */}
                        {user && (
                            <div className="p-4 border-b bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12">
                                        <div className="flex items-center justify-center bg-gray-800 text-white rounded-full w-full">{user?.fullName?.slice(0, 2).toUpperCase()}</div>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{user?.fullName}</span>
                                        <span className="text-xs text-muted-foreground">Xin chào!</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Menu content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="px-4 py-2">
                                <div className="flex flex-col">
                                    {/* Main navigation */}
                                    <div className="mb-4">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Danh mục</h3>
                                        {[
                                            ...mainNavLinks,
                                            // Chèn thêm các nhóm lớn để người dùng mobile truy cập nhanh
                                            { label: "Áo Nam", to: "/tee" },
                                            { label: "Quần Nam", to: "/pants" },
                                            { label: "Bộ Sưu Tập", to: "/collections" },
                                            { label: "Phụ Kiện", to: "/accessories" },
                                        ].map((item) => (
                                            <Link key={item.to} to={item.to} className={`flex items-center px-2 py-3 hover:bg-gray-50 rounded-md transition-colors ${"className" in item ? item.className : ""}`} onClick={() => setMobileOpen(false)}>
                                                <span>{item.label}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* User actions */}
                                    <div className="border-t pt-4">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Tài khoản</h3>

                                        {/* Cửa hàng + các link tài khoản (re-use) */}
                                        {[{ label: "Cửa hàng", to: "/stores", icon: MapPin }, ...userActionLinks.filter((l) => !l.desktopOnly)].map(({ to, label, icon: Icon }) => (
                                            <Link key={to} to={to} className="flex items-center gap-3 px-2 py-3 hover:bg-gray-50 rounded-md transition-colors" onClick={() => setMobileOpen(false)}>
                                                <Icon size={18} className="text-gray-500" />
                                                <span>{label}</span>
                                            </Link>
                                        ))}

                                        {/* Đăng nhập/Đăng xuất */}
                                        <div
                                            className="flex items-center gap-3 px-2 py-3 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                                            onClick={() => {
                                                if (user) {
                                                    logout();
                                                }
                                                setMobileOpen(false);
                                            }}
                                        >
                                            {user ? (
                                                <>
                                                    <LogOut size={18} className="text-gray-500" />
                                                    <span>Đăng xuất</span>
                                                </>
                                            ) : (
                                                <Link to="/login" className="flex items-center gap-3">
                                                    <LogIn size={18} className="text-gray-500" />
                                                    <span>Đăng nhập</span>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-gray-50">
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                                <Link to="notifications" className="flex items-center gap-1 hover:underline">
                                    <Bell size={16} /> Thông báo
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
