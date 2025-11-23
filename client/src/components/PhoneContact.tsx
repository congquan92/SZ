import { Button } from "@/components/ui/button";
import { PhoneCall } from "lucide-react";

export default function PhoneContact() {
    return (
        <>
            <Button variant="secondary" size="icon-lg" className="fixed bottom-20 left-5 z-50 rounded-none shadow-lg hover:shadow-xl transition-all duration-300 border border-black" aria-label="Liên hệ qua điện thoại">
                <PhoneCall size={10} />
            </Button>
            <Button variant="secondary" size="icon-lg" className="fixed bottom-35 left-5 z-50 rounded-none shadow-lg hover:shadow-xl transition-all duration-300 border border-black" aria-label="Liên hệ qua điện thoại">
                <PhoneCall size={10} />
            </Button>
        </>
    );
}
