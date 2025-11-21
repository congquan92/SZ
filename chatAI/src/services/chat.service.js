import { ai } from "../config/gemini.config.js";
import { fetchProducts } from "./products.service.js";

export async function chatWithStylist(message, history = []) {
    // 1. Lấy sản phẩm từ API
    const products = await fetchProducts();

    // 2. Giới hạn kích thước JSON để đỡ nặng prompt
    const productJson = JSON.stringify(products, null, 2).slice(0, 8000);

    const systemPrompt = `
Mày là stylist cho shop thời trang.
- Chỉ được dùng sản phẩm trong JSON bên dưới, không được tự bịa thêm.
- Trả lời tiếng Việt, thân thiện, rõ ràng, gợi ý đúng nhu cầu.

DANH SÁCH SẢN PHẨM (JSON):
${productJson}

YÊU CẦU CỦA KHÁCH: ${message}
`.trim();

    // Nếu có history từ FE thì map lại
    const historyParts =
        history?.map((m) => ({
            role: m.role === "model" ? "model" : "user",
            parts: [{ text: m.text }],
        })) || [];

    // 3. Gọi Gemini
    const result = await ai.models.generateContent({
        model: "gemini-2.0-flash", // hoặc "gemini-2.5-flash" nếu account mày có
        contents: [
            ...historyParts,
            {
                role: "user",
                parts: [{ text: systemPrompt }],
            },
        ],
    });

    // ❗ SDK này: text nằm trực tiếp ở result.text
    const reply = result.text;

    return reply;
}
