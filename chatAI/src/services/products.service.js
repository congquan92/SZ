import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });
const API_PRODUCT = process.env.PRODUCT_API_URL;

export function toSlug(str) {
    return str
        .normalize("NFD") // tách dấu khỏi ký tự (vd: "Á" -> "A" + ́)
        .replace(/[\u0300-\u036f]/g, "") // xóa toàn bộ dấu
        .replace(/đ/g, "d") // xử lý đặc biệt tiếng Việt
        .replace(/Đ/g, "D")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-") // thay ký tự không hợp lệ bằng "-"
        .replace(/^-+|-+$/g, ""); // xóa "-" thừa đầu/cuối
}
export async function fetchProducts() {
    const res = await axios.get(API_PRODUCT);
    return res.data.data.map((p) => ({
        id: p.id,
        name: p.name,
        listPrice: p.listPrice,
        salePrice: p.salePrice,
        image: p.coverImage,
        sold: p.soldQuantity,
        category: p.categoryParents[0].name,
        rating: p.avgRating,
        description: p.description,
        url: `/product/${p.id}/${toSlug(p.name)}/${toSlug(p.description)}`,
    }));
}
