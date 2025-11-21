import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X } from "lucide-react";

type Sender = "user" | "bot";

interface ChatMessage {
    id: number;
    from: Sender;
    text: string;
}

export default function ChatAI() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            from: "bot",
            text: "Chào bạn, mình là Stylist AI. Bạn muốn tư vấn quần áo gì nè? 👕",
        },
    ]);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, open]);

    const handleSend = () => {
        const value = input.trim();
        if (!value) return;

        const userMsg: ChatMessage = {
            id: Date.now(),
            from: "user",
            text: value,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        // Tạm thời fake reply cho có UI, mai mốt thay bằng call API
        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    from: "bot",
                    text: "Mình đã nhận câu hỏi rồi, lát nữa nối API vào sẽ tư vấn xịn xò hơn nha 😎",
                },
            ]);
        }, 400);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Nút tròn mở chat – góc phải dưới */}
            {!open && (
                <Button variant="secondary" size="icon" className="fixed bottom-20 right-5 z-50 rounded-none shadow-lg hover:shadow-xl transition-all duration-300 border border-black" aria-label="Mở trợ lý AI" onClick={() => setOpen(true)}>
                    <MessageCircle className="w-6 h-6" />
                </Button>
            )}

            {/* Hộp chat */}
            {open && (
                <div className="fixed bottom-20 right-5 z-50 w-[320px] sm:w-[380px] h-[430px] bg-white border border-gray-200 shadow-2xl rounded-none flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b bg-black text-white">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold">Stylist AI Tư Vấn</span>
                            <span className="text-[11px] text-gray-300">Đang hoạt động • Gợi ý outfit theo yêu cầu</span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-200 hover:text-white hover:bg-white/10" aria-label="Đóng chat" onClick={() => setOpen(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Danh sách tin nhắn */}
                    <ScrollArea className="flex-1 px-3 py-2 overflow-y-auto">
                        <div className="space-y-2 text-sm">
                            {messages.map((m) => (
                                <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 leading-snug ${m.from === "user" ? "bg-black text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>{m.text}</div>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="border-t px-2 py-2 flex items-center gap-2 bg-gray-50">
                        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nhập câu hỏi: VD: quần short đi chơi..." className="h-9 text-sm bg-white" />
                        <Button size="icon" className="h-9 w-9 rounded-full bg-black text-white hover:bg-black/90" onClick={handleSend} aria-label="Gửi tin nhắn">
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
