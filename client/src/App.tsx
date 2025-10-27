import Login from "@/auth/Login";
import Signup from "@/auth/Signup";
import ClothSize from "@/page/ClothSize";
import Footer from "@/page/Footer";
import Home from "@/page/Home";
import Navbar from "@/page/Navbar";
import NotFound_404 from "@/page/NotFound_404";
import Product from "@/page/Product";
import { Route, Routes } from "react-router-dom";

function App() {
    const LinkRoute = [
        { path: "/", element: <Home /> },
        { path: "/login", element: <Login /> },
        { path: "/signup", element: <Signup /> },
        { path: "/new", element: <Product /> },
        { path: "/cloth-size", element: <ClothSize /> },
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
