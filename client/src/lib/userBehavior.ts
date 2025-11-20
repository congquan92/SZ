import { axiosInstance } from "@/lib/axios";

export function getGuestId() {
    let guestId = localStorage.getItem("guestId");
    if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem("guestId", guestId);
    }
    return guestId;
}

// /**
//  * Gửi hành vi user lên backend
//  * @param {number} productId - ID sản phẩm
//  * @param {string} behaviorType - "VIEW", "CLICK", "LIKE", ...
//  * @param {number|null} userId - nếu đã đăng nhập
//  */
export async function recordUserBehavior(productId: number, behaviorType: "VIEW" | "SEARCH") {
    const guestId = getGuestId();

    const requestBody = {
        productId,
        behaviorType,
        guestId,
    };

    try {
        const res = await axiosInstance.post("/behavior/add", requestBody);
        return res.data;
    } catch (err) {
        console.error("Record behavior error:", err);
    }
}

// /**
//  * Lấy sản phẩm gợi ý từ backend
//  * @param {number|null} userId - nếu đã đăng nhập
//  * @param {number} page - số trang (1-based)
//  * @param {number} size - số lượng sản phẩm trên trang
//  */
// export async function fetchRecommendedProducts(userId = null, page = 1, size = 20) {
//     const guestId = getGuestId();

//     // Tạo query params
//     const params = new URLSearchParams({
//         page,
//         size,
//     });
//     if (userId) params.append("userId", userId);
//     params.append("guestId", guestId);

//     try {
//         const res = await fetch(`/api/recommend-products?${params.toString()}`);
//         if (!res.ok) {
//             console.error("Fetch recommended products failed:", res.statusText);
//             return [];
//         }
//         const data = await res.json();
//         return data.products || [];
//     } catch (err) {
//         console.error("Fetch recommended products error:", err);
//         return [];
//     }
// }

// /**
//  * Ví dụ sử dụng khi user click vào 1 sản phẩm
//  */
// export async function onProductClick(productId, userId = null) {
//     // 1️⃣ Ghi nhận hành vi
//     await recordUserBehavior(productId, "VIEW", userId);

//     // 2️⃣ Lấy sản phẩm gợi ý (có thể cập nhật sidebar / recommend section)
//     const recommendedProducts = await fetchRecommendedProducts(userId);
//     return recommendedProducts;
// }
