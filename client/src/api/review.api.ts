import { axiosInstance } from "@/lib/axios";
export const ReviewAPI = {
    addReview: async (orderItemId: number, rating: number, comment: string, imageUrl: string[]) => {
        try {
            const response = await axiosInstance.post(`/review/add`, { orderItemId, rating, comment, imageUrl });
            return response.data;
        } catch (error) {
            console.error("Failed to add review:", error);
            throw error;
        }
    },
    getReviewProductsById: async (productId: number) => {
        try {
            const response = await axiosInstance.get(`review/product/${productId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch review products:", error);
            throw error;
        }
    },
    getReviewById: async (reviewId: number) => {
        try {
            const response = await axiosInstance.get(`review/${reviewId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch review:", error);
            throw error;
        }
    },
};
