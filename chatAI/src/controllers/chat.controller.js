import { chatWithStylist } from "../services/chat.service.js";

export async function handleChat(req, res) {
    try {
        const { message, history } = req.body || {};

        if (!message || typeof message !== "string") {
            return res.status(400).json({ error: "message is required" });
        }

        const reply = await chatWithStylist(message, history || []);

        return res.json({ reply });
    } catch (err) {
        console.error("Chat error:", err);
        return res.status(500).json({
            error: "Internal server error",
            detail: err.message,
        });
    }
}
