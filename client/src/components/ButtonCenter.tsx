import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ButtonCenter(props: { input: string }) {
    const navigate = useNavigate();
    return (
        <div className="flex items-center justify-center py-2">
            <Button onClick={() => navigate("/products")} size="sm" className="hover:bg-gray-50 hover:text-gray-800 border hover:border-black text-white px-6 py-2 rounded-none cursor-pointer">
                {props.input}
                <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </Button>
        </div>
    );
}
