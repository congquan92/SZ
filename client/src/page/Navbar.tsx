import Topbar from "@/components/Topbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { useAuthStore } from "@/stores/useAuthStores";
import { Bell, Heart, LogIn, LogOut, MapPin, Menu, Search, ShoppingCart, Store, User, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Các action trong phần user (dropdown desktop + khu vực mobile)
    const userActionLinks = [
        { label: "Cửa hàng", to: "/stores", icon: MapPin, desktopOnly: true },
        { label: "Đơn hàng", to: "/orders", icon: Store },
        { label: "Yêu thích", to: "/wishlist", icon: Heart },
    ];
    // Các nhóm dropdown cho desktop
    const desktopDropdowns = [
        {
            trigger: "Áo Nam",
            columns: [
                {
                    items: [
                        { label: "Tất cả áo nam", to: "/tee", strong: true },
                        { label: "Áo Polo", to: "/polo" },
                        { label: "Áo Sơ Mi", to: "/shirt" },
                        { label: "Áo Khoác", to: "/jacket" },
                        { label: "Áo Thun", to: "/tee" },
                        { label: "Áo Hoodie", to: "/hoodie" },
                        { label: "Áo Len / Sweater", to: "/sweater" },
                    ],
                    width: 200,
                },
            ],
        },
        {
            trigger: "Quần Nam",
            columns: [
                {
                    items: [
                        { label: "Tất cả quần nam", to: "/pants", strong: true },
                        { label: "Quần Jeans", to: "/jeans" },
                        { label: "Quần Kaki", to: "/khakis" },
                        { label: "Quần Short", to: "/shorts" },
                        { label: "Quần Joggers", to: "/joggers" },
                        { label: "Quần Tây", to: "/formal-pants" },
                    ],
                    width: 200,
                },
            ],
        },
        {
            trigger: "Bộ Sưu Tập",
            columns: [
                {
                    items: [
                        { label: "Tất cả bộ sưu tập", to: "/collections", strong: true },
                        { label: "Set Quần Áo", to: "/sets" },
                        { label: "Set Thường Ngày", to: "/casual-sets" },
                        { label: "Set Thể Thao", to: "/sport-sets" },
                        { label: "Set Công Sở", to: "/formal-sets" },
                    ],
                    width: 200,
                },
            ],
        },
        {
            trigger: "Phụ Kiện",
            columns: [
                {
                    items: [
                        { label: "Tất cả phụ kiện", to: "/accessories", strong: true },
                        { label: "Mũ/Nón", to: "/caps" },
                        { label: "Túi/Balo", to: "/bags" },
                        { label: "Thắt Lưng", to: "/belts" },
                        { label: "Đồng Hồ", to: "/watches" },
                        { label: "Giày Dép", to: "/shoes" },
                    ],
                    width: 200,
                },
            ],
        },
    ];
    // Main nav cho desktop (hàng dưới) + dùng lại cho mobile
    const mainNavLinks = [
        { label: "Trang chủ", to: "/", simple: true },
        { label: "🔥 Hàng Mới", to: "/product", simple: true, className: "text-red-500 font-medium" },
        { label: "🏷️ SALE -50%", to: "/sale", simple: true, className: "text-red-500 font-bold" },
    ];

    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        // Xử lý đăng xuất
        logout();
        console.log("Đăng xuất");
    };

    const handleSearchClick = () => {
        // Xử lý tìm kiếm
        console.log("Tìm kiếm:", search);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSearchClick();
    };

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
                        <div className="flex-1 mx-6 max-w-lg relative hidden sm:block">
                            <Input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={handleKeyDown} placeholder="Bạn đang tìm gì..." className="pr-10 text-neutral-700 border border-neutral-700 rounded-none" />
                            <Search onClick={handleSearchClick} className="absolute right-3 top-2.5 h-5 w-5 text-neutral-700 cursor-pointer hover:text-black" />
                        </div>

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
                                <div className="absolute -top-2 -right-2">
                                    <Badge variant="destructive" className="text-xs px-1 min-w-4 h-5">
                                        3
                                    </Badge>
                                </div>
                            </Link>

                            {/* User dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={user?.avatar ?? undefined} alt="User Avatar" className="object-cover" />
                                            <AvatarFallback className="w-8 h-8 bg-gray-800 text-white flex items-center justify-center rounded-full">{user?.userName?.slice(0, 2).toUpperCase() ?? <User size={16} />}</AvatarFallback>
                                        </Avatar>

                                        {/* <Avatar className="w-8 h-8">
                                            <div className="flex items-center justify-center bg-gray-800 text-white rounded-full w-full">{user?.userName?.slice(0, 2).toUpperCase() || <User size={16} />}</div>
                                        </Avatar> */}
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-48 ">
                                    <DropdownMenuItem asChild>
                                        <Link to="/profile" className="flex items-center">
                                            <User size={16} className="mr-2" /> {user ? user.userName : "Tài khoản"}
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
                            {desktopDropdowns.map(({ trigger, columns }, idx) => (
                                <NavigationMenuItem key={`${trigger}-${idx}`}>
                                    <NavigationMenuTrigger>{trigger}</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <ul className="grid gap-3 w-[200px]">
                                            {columns.map((col, cIdx) => (
                                                <li key={cIdx} style={{ width: col.width ? `${col.width}px` : undefined }}>
                                                    {col.items.map(({ label, to, strong }) => (
                                                        <NavigationMenuLink key={to} asChild>
                                                            <Link to={to} className={`${strong ? "text-lg" : "hover:text-red-500"}`}>
                                                                {label}
                                                            </Link>
                                                        </NavigationMenuLink>
                                                    ))}
                                                </li>
                                            ))}
                                        </ul>
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
                            <div className="relative">
                                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Bạn đang tìm gì..." className="pl-10" />
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            </div>
                        </div>

                        {/* User info */}
                        {user && (
                            <div className="p-4 border-b bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-12 h-12">
                                        <div className="flex items-center justify-center bg-gray-800 text-white rounded-full w-full">{user?.userName?.slice(0, 2).toUpperCase()}</div>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-sm">{user?.userName}</span>
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
                                        ].map(({ to, label, className }) => (
                                            <Link key={to} to={to} className={`flex items-center px-2 py-3 hover:bg-gray-50 rounded-md transition-colors ${className ?? " "}`} onClick={() => setMobileOpen(false)}>
                                                <span>{label}</span>
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
