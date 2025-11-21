import axios from "axios";

export type AiHistoryItem = {
    role: "user" | "model";
    text: string;
};

export const AiAPI = {
    chatStylist: async (message: string, history: AiHistoryItem[] = []) => {
        const res = await axios.post("http://localhost:3000/chat", {
            message,
            history, // gửi kèm lịch sử cho backend
        });
        return res.data; // { reply }
    },
};
