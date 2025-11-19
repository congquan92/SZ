import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useSmoothScroll } from "@/hook/useSmoothScroll";

export default function BackToTop() {
    const { scrollToTop } = useSmoothScroll();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);

        return () => {
            window.removeEventListener("scroll", toggleVisibility);
        };
    }, []);

    return (
        <>
            {isVisible && (
                <Button variant="secondary" onClick={scrollToTop} size="icon" className="fixed bottom-5 right-8 z-50 rounded-none shadow-lg hover:shadow-xl transition-all duration-300 border border-black" aria-label="Về đầu trang">
                    <ArrowUp className="w-5 h-5" />
                </Button>
            )}
        </>
    );
}
