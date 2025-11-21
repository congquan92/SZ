import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const PRODUCT_API_BASE = process.env.PRODUCT_API_BASE || "http://localhost:8080/product/list/detail";
export async function fetchProducts() {
    const res = await axios.get(PRODUCT_API_BASE);
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
    }));
}
