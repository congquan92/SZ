import Topbar from "@/components/Topbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
    const user = { userName: "Nguyen Van A", avatar: "" };
    const logout = () => {
        // Xử lý đăng xuất
        console.log("Đăng xuất");
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-b-accent/10 bg-accent-foreground/10 backdrop-blur-sm">
            {/* Top bar - Contact info */}
            <Topbar />

            {/* Main navbar - Logo, Search, Cart, User */}
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
                    <div className="flex-1 mx-6 max-w-lg relative hidden sm:block border border-neutral-700 rounded-none">
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Bạn đang tìm gì..." className="pr-10 text-neutral-700" />
                        <Search className="absolute right-3 top-2.5 h-5 w-5 text-neutral-700 cursor-pointer" />
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
                                <Badge variant="destructive" className="text-xs px-1 min-w-[16px] h-5">
                                    3
                                </Badge>
                            </div>
                        </Link>

                        {/* User dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user?.avatar || <User size={16} />} alt="User Avatar" className="object-cover" />
                                        <AvatarFallback className="w-8 h-8 bg-gray-800 text-white flex items-center justify-center rounded-full">{user?.userName?.slice(0, 2).toUpperCase() || <User size={16} />}</AvatarFallback>
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
                                        <div className="cursor-pointer flex items-center" onClick={logout}>
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
                                    <Badge variant="destructive" className="text-xs px-1 min-w-[16px] h-5">
                                        5
                                    </Badge>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
