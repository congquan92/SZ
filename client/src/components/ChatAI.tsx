import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dot, Loader, Loader2Icon, MessageCircle, Send, X } from "lucide-react";
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

const greetingMessages = [
    "Ủa ai gọi oppa stylist dzậy? Lên đồ không? Tao mix cho nát gu luôn =))",
    "Aloooo??? Đi đâu mà mặc vậy cho thiên hạ cười??? Vô tao cứu mày liền.",
    "Trời đất ơi cái gu gì đây… để oppa chỉnh cho chứ để vậy tao quê chung :v",
    "Vô đây con cưng, để stylist quốc tế như tao gánh gu cho =)))",
    "Ê bé cưng, hôm nay muốn nhìn như idol K-pop hay dân chơi Vegas??? Tao cân hết.",
    "Gu mày sao mà tệ dữ vậy hả??? Để tao upgrade cho, nhìn mà mệt luôn đó trời -.-",
    "Nói vibe coi, cute mềm mại hay kiểu quăng ánh mắt là người ta xỉu??? Oppa xử gọn.",
    "Trời ơi fashion là cái nết sống, mày sống kiểu gì vậy? Để tao sửa nết cho.",
    "Ê bro/sis gì đó, mày bước ra đường mà không bị chê là hên á, để tao fix ngay.",
    "Stylist AI đây, thần giữ của gu thời trang mày, vô đi tao cứu liền.",
];

const ServerErrorMessages = [
    "Server tao nghẹn quá trời, chắc nhìn gu mày nên xỉu… thử lại đi =))",
    "Backend thấy request của mày cái bỏ chạy luôn… chịu.",
    "Server quắn quéo vì gu xấu, đợi nó bình tĩnh lại đã :v",
    "Hệ thống sập mood khi thấy outfit mày tính mặc, cho nó nghỉ xíu.",
    "Server bị tụt canxi do stress quá độ… mày chờ nó uống sữa cái.",
    "Backend nhìn vô mà hoảng loạn, đang thở oxy… chịu khó đợi.",
    "Gu mày mạnh quá backend chịu không nổi… để nó reboot.",
    "Server đang trốn trong góc phòng vì sợ mày hỏi outfit nữa =)))",
    "Coi bộ server muốn block mày luôn rồi… để tao dỗ nó.",
    "Hệ thống mệt mỏi với mày rồi, nghỉ giải lao xíu nha trời.",
];

const BotCrashMessages = [
    "Bot tao đơ vì gu mày weird quá, nó không xử lý nổi :v",
    "Bot tự shutdown sau khi thấy outfit mày suggest… đau đầu quá.",
    "AI tao thấy vibe mày cái nó tự ái bỏ đi rồi =)))",
    "Bot bị overload do câu hỏi quá… mạnh… cố lên mày thử lại đi.",
    "Nó đang nằm bất tỉnh trong não tao, chờ hồi sinh.",
    "Gu mày làm bot tao muốn nghỉ việc luôn, để tao ép nó chạy lại.",
    "Bot đang AFK, chắc đi chữa lành sau cú sốc thời trang.",
    "Bot tao bị loạn thần nhẹ, để nó uống thuốc cái rồi trả lời.",
    "Nó tự bấm nút tự hủy, chắc do bị mày làm cho tổn thương logic.",
    "Bot đang tự hỏi vì sao mày hỏi khó vậy, give it a sec.",
];

const BotLoadingMessages = [
    "Hold up bro, tao đang gồng não để chịu đựng vibe của mày...",
    "Wait wait, để oppa nghĩ outfit cho mày coi đỡ quê tý...",
    "Loading… tao đang kiếm đồ hợp với khuôn mặt bất lực của mày =))",
    "Chill đi cưng, tao đang decode gu… hơi rối á lol.",
    "One sec, não tao đang coi nên cho mày look rich hay look tragic.",
    "Từ từ, tao đang cứu thẩm mỹ công cộng trước khi cho mày mặc gì.",
    "Fashion engine của tao đang nghẹn, chắc do câu hỏi mày á.",
    "Hmm lemme cook… nhìn mày tao phải nấu kỹ lắm đó.",
    "Brain is loading… kiểu hơi tê liệt nhưng tao cố vì mày.",
    "Tao đang tính outfit cho mày, mà khó vãi… cho tao thở.",
    "Wait babe, tao đang phân tích vibe của mày… dữ dằn thiệt.",
    "Khoan đã, tao kiểm tra lại xem mày hợp style người hay style trời.",
    "Let me think… mày khó phối quá nên não tao lag 99%.",
    "Hold tight, tao đang double-check xem có outfit nào cứu được mày không.",
];

export default function ChatAI() {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            from: "bot",
            text: greetingMessages[Math.floor(Math.random() * greetingMessages.length)],
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
            const botText = data?.reply || BotCrashMessages[Math.floor(Math.random() * BotCrashMessages.length)];

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
                    text: ServerErrorMessages[Math.floor(Math.random() * ServerErrorMessages.length)],
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
                <Button variant="secondary" size="icon-lg" className="fixed bottom-20 right-5 z-50 rounded-none shadow-lg hover:shadow-xl transition-all duration-300 border border-black" aria-label="Mở trợ lý AI" onClick={() => setOpen(true)}>
                    <MessageCircle className="w-6 h-6" />
                </Button>
            )}

            {open && (
                <div className="fixed bottom-20 right-5 z-50 w-[320px] sm:w-[380px] h-[430px] bg-white border border-gray-200 shadow-2xl rounded-none flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-3 py-2 border-b bg-black text-white">
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold">Stylist AI Tư Vấn</span>
                            <span className="text-[11px] text-gray-300 flex items-center gap-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                Đang hoạt động • Gợi ý outfit theo yêu cầu
                            </span>
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
                            {isLoading && (
                                <div className="flex items-center gap-2 px-2 text-[13px] text-gray-500">
                                    <Loader className="w-3 h-3 animate-spin text-gray-400" />
                                    <span className="animate-pulse">{BotLoadingMessages[Math.floor(Math.random() * BotLoadingMessages.length)]}</span>
                                </div>
                            )}

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
