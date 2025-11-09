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
    getReviewProductsById: async (productId: number, page: number = 0, size: number = 10) => {
        try {
            const response = await axiosInstance.get(`/review/product/list/${productId}?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch review products:", error);
            throw error;
        }
    },
    getReviewProductVariantsById: async (productVariantId: number, page: number = 0, size: number = 10) => {
        try {
            const response = await axiosInstance.get(`/review/productVariant/list/${productVariantId}?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch review product variants:", error);
            throw error;
        }
    },

    //lay review theo id ( bị thừa =)))
    getReviewById: async (reviewId: number) => {
        try {
            const response = await axiosInstance.get(`/review/${reviewId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch review by id:", error);
            throw error;
        }
    },

    // Lấy review của người dùng đang đăng nhập
    getReviewMe: async (productId: number) => {
        try {
            const response = await axiosInstance.get(`/review/product/${productId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch review by user id:", error);
            throw error;
        }
    },

    // Cập nhật review
    updateReview: async (id: number, rating: number, comment: string) => {
        try {
            const response = await axiosInstance.put(`/review/update`, { id, rating, comment });
            return response.data;
        } catch (error) {
            console.error("Failed to update review:", error);
            throw error;
        }
    },
    // xoa anh review
    deleteImgReview: async (imageDelete: number[]) => {
        try {
            const response = await axiosInstance.put(`/review/delete-image`, imageDelete);
            return response.data;
        } catch (error) {
            console.error("Failed to delete review image:", error);
            throw error;
        }
    },
    // them anh review
    addImgReview: async (reviewId: number, imageAdd: string[]) => {
        try {
            const response = await axiosInstance.put(`/review/${reviewId}/add-image`, imageAdd);
            return response.data;
        } catch (error) {
            console.error("Failed to add review image:", error);
            throw error;
        }
    },
};
