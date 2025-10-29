import { axiosInstance } from "@/lib/axios";

export const ProductAPI = {
    getProduct: async (size: number) => {
        try {
            const response = await axiosInstance.get(`/product/list?&page=0&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Get products failed", error);
            throw error;
        }
    },
    getProductById: async (id: number) => {
        try {
            const response = await axiosInstance.get(`/product/detail/${id}`);
            return response.data;
        } catch (error) {
            console.error("Get product by ID failed", error);
            throw error;
        }
    },
};
