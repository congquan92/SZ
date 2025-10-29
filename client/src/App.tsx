import Login from "@/auth/Login";
import Signup from "@/auth/Signup";
import ClothSize from "@/page/ClothSize";
import Footer from "@/page/Footer";
import Home from "@/page/Home";
import Navbar from "@/page/Navbar";
import NotFound_404 from "@/page/NotFound_404";
import Notifications from "@/page/Notifications";
import Product from "@/page/Product";
import Profile from "@/page/Profile";
import { useAuthStore } from "@/stores/useAuthStores";
import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

function App() {
    const { fetchUser, token, user, loading } = useAuthStore();

    const init = async () => {
        if (token && !user) {
            await fetchUser();
        }
    };

    useEffect(() => {
        init();
    }, []);

    // if (loading) {
    //     return (
    //         <div className="flex items-center justify-center h-screen">
    //             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
    //         </div>
    //     );
    // }

    const LinkRoute = [
        { path: "/", element: <Home /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        { path: "/product", element: <Product /> },
        { path: "/cloth-size", element: <ClothSize /> },
        { path: "/notifications", element: <Notifications /> },
        { path: "/profile", element: <Profile /> },
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
        </>
    );
}

export default App;
