import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });
const API_PRODUCT = process.env.PRODUCT_API_URL;
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
        url: `/product/${p.id}`,
    }));
}
