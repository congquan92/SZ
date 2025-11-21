import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X } from "lucide-react";
import { AiAPI, type AiHistoryItem } from "@/api/ai.api";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
type Sender = "user" | "bot";

interface ChatMessage {
    id: number;
    from: Sender;
    text: string;
}

export default function ChatAI() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            from: "bot",
            text: "Hello hello 😎 Stylist AI đây. Kể tao nghe mày đang cần set đồ đi đâu, tao mix cho 🔥",
        },
    ]);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, open]);

    const handleSend = async () => {
        const value = input.trim();
        if (!value || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now(),
            from: "user",
            text: value,
        };

        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        setInput("");
        setIsLoading(true);

        const lastMessages = nextMessages.slice(-10);
        const historyPayload: AiHistoryItem[] = lastMessages.map((m) => ({
            role: m.from === "bot" ? "model" : "user",
            text: m.text,
        }));

        try {
            const data = await AiAPI.chatStylist(value, historyPayload);
            const botText = data?.reply || "Xin lỗi, hệ thống đang lỗi, bạn thử lại sau nha 😢";

            const botMsg: ChatMessage = {
                id: Date.now() + 1,
                from: "bot",
                text: botText,
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    from: "bot",
                    text: "Mình bị lỗi kết nối server, bạn thử lại chút nữa nha 😥",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {!open && (
                <Button variant="secondary" size="icon" className="fixed bottom-20 right-5 z-50 rounded-none shadow-lg hover:shadow-xl transition-all duration-300 border border-black" aria-label="Mở trợ lý AI" onClick={() => setOpen(true)}>
                    <MessageCircle className="w-6 h-6" />
                </Button>
            )}

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

                    {/* Messages */}
                    <ScrollArea className="flex-1 px-3 py-2 overflow-y-auto">
                        <div className="space-y-2 text-sm">
                            {messages.map((m) => (
                                <div key={m.id} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={
                                            m.from === "user"
                                                ? "max-w-[80%] rounded-2xl rounded-br-sm px-3 py-2 bg-black text-white leading-snug whitespace-pre-line"
                                                : "max-w-[90%] rounded-2xl rounded-bl-sm px-3 py-2 bg-gray-50 text-gray-900 leading-snug border border-gray-200"
                                        }
                                    >
                                        {m.from === "bot" ? (
                                            <ReactMarkdown
                                                rehypePlugins={[rehypeRaw]}
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: (props) => <p className="mb-1 text-[13px]" {...props} />,
                                                    strong: (props) => <strong className="font-semibold text-[13px]" {...props} />,
                                                    ul: (props) => <ul className="list-disc ml-4 mb-1 text-[13px] text-gray-700 space-y-0.5" {...props} />,
                                                    li: (props) => <li {...props} />,
                                                    img: (props) => <img {...props} className="mt-2 rounded-md border border-gray-200 max-h-40 w-auto" />,
                                                    a: ({ href, children, ...rest }) => {
                                                        // Nếu link bắt đầu bằng /product/... => dùng Link của React Router
                                                        if (href?.startsWith("/product/")) {
                                                            return (
                                                                <Link to={href} className="text-blue-600 underline hover:text-blue-800" {...rest}>
                                                                    {children}
                                                                </Link>
                                                            );
                                                        }
                                                        // Không phải link nội bộ → mở tab mới
                                                        return (
                                                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800" {...rest}>
                                                                {children}
                                                            </a>
                                                        );
                                                    },
                                                }}
                                            >
                                                {m.text}
                                            </ReactMarkdown>
                                        ) : (
                                            m.text
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && <div className="text-[11px] text-gray-500 px-2">Stylist đang nghĩ outfit cho bạn...</div>}
                            <div ref={bottomRef} />
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="border-t px-2 py-2 flex items-center gap-2 bg-gray-50">
                        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nhập câu hỏi: VD: quần short đi chơi..." className="h-9 text-sm bg-white" disabled={isLoading} />
                        <Button size="icon" className="h-9 w-9 rounded-full bg-black text-white hover:bg-black/90 disabled:opacity-60" onClick={handleSend} aria-label="Gửi tin nhắn" disabled={isLoading}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}
