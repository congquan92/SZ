import { axiosInstance } from "@/lib/axios";
import type { AxiosError } from "axios";
export const CartAPI = {
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
    updateCartItem: async (cartItemId: number, quantity: number) => {
        try {
            const response = await axiosInstance.put(`/cart/${cartItemId}/update`, { quantity });
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
            const err = error as AxiosError;
            if (err.response?.status === 401) {
                throw new Error("UNAUTH");
            }

            console.error("Add cart item failed", error);
            throw error;
        }
    },
};
