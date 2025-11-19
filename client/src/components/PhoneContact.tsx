import { Button } from "@/components/ui/button";
import { PhoneCall } from "lucide-react";

export default function PhoneContact() {
    return (
        <>
            <Button variant="secondary" size="icon" className="fixed bottom-5 left-8 z-50 rounded-none shadow-lg hover:shadow-xl transition-all duration-300 border border-black" aria-label="Liên hệ qua điện thoại">
                <PhoneCall className="w-5 h-5" />
            </Button>
        </>
    );
}
