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
    getCategory: async () => {
        try {
            const response = await axiosInstance.get(`/category/all`);
            return response.data;
        } catch (error) {
            console.error("Get categories failed", error);
            throw error;
        }
    },
    getCart: async (size: number) => {
        try {
            const response = await axiosInstance.get(`/cart/listForMe?page=0&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Get cart failed", error);
            throw error;
        }
    },
    deleteCartItem: async (cartItemId: number) => {
        try {
            const response = await axiosInstance.delete(`/cart/${cartItemId}/delete`);
            return response.data;
        } catch (error) {
            console.error("Delete cart item failed", error);
            throw error;
        }
    },
    updateCartItem: async (productVariantId: number, quantity: number) => {
        try {
            const response = await axiosInstance.put(`/cart/update`, { productVariantId, quantity });
            return response.data;
        } catch (error) {
            console.error("Update cart item failed", error);
            throw error;
        }
    },
    addCartItem: async (productVariantId: number, quantity: number) => {
        try {
            const response = await axiosInstance.post(`/cart/add`, { productVariantId, quantity });
            return response.data;
        } catch (error) {
            console.error("Add cart item failed", error);
            throw error;
        }
    },
};
