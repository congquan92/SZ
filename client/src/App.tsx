import Login from "@/auth/Login";
import Signup from "@/auth/Signup";
import AuthCallback from "@/auth/AuthCallback";
import ClothSize from "@/page/ClothSize";
import Footer from "@/page/Footer";
import Home from "@/page/Home";
import Navbar from "@/page/Navbar";
import NotFound_404 from "@/page/NotFound_404";
import Notifications from "@/page/Notifications";
import Product from "@/page/Product";
import ProductDetail from "@/components/ProductDetail";
import Profile from "@/page/Profile";
import Sale from "@/page/Sale";
import { useAuthStore } from "@/stores/useAuthStores";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Cart from "@/page/Cart";
import Payment from "@/page/Payment";
import Wishlist from "@/page/Wishlist";
import PaymentStatus from "@/page/PaymentStatus";
import UnauthorizedAccess from "@/page/UnauthorizedAccess";
import Order from "@/page/Order";
import ProductCategory from "@/page/ProductCategory";
import About from "@/page/About";
import Contact from "@/page/Contact";
import BackToTop from "@/components/BackToTop";
import PhoneContact from "@/components/PhoneContact";

function App() {
    const { fetchUser, token, user } = useAuthStore();

    const init = async () => {
        if (token && !user) {
            await fetchUser();
        }
    };

    useEffect(() => {
        init();
    }, []);

    const LinkRoute = [
        { path: "/", element: <Home /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        { path: "/auth/callback", element: <AuthCallback /> },
        { path: "/product", element: <Product /> },
        { path: "/product/:id/:slug/:description", element: <ProductDetail /> },
        { path: "/cloth-size", element: <ClothSize /> },
        { path: "/notifications", element: <Notifications /> },
        { path: "/profile", element: <Profile /> },
        { path: "/sale", element: <Sale /> },
        { path: "/cart", element: <Cart /> },
        { path: "/payment", element: <Payment /> },
        { path: "/wishlist", element: <Wishlist /> },
        { path: "/orders", element: <Order /> },
        { path: "/payment/vnpay-return", element: <PaymentStatus /> },
        { path: "/payment/momo-return", element: <PaymentStatus /> },
        { path: "/payment/cash-return", element: <PaymentStatus /> },
        { path: "/unauthorized", element: <UnauthorizedAccess /> },
        { path: "/category/:id/:slug/:name", element: <ProductCategory /> },
        { path: "/about", element: <About /> },
        { path: "/contact", element: <Contact /> },
        { path: "/*", element: <NotFound_404 /> },
    ];

    return (
        <>
            <Navbar />
            <Routes>
                {LinkRoute.map(({ path, element }) => (
                    <Route key={path} path={path} element={element} />
                ))}
            </Routes>
            <Footer />
            {/* <BackToTop />
            <PhoneContact /> */}
        </>
    );
}

export default App;
