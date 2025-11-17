import { axiosInstance } from "@/lib/axios";
import type { AxiosError } from "axios";
export const FavoriteAPI = {
    getFavorites: async () => {
        try {
            const response = await axiosInstance.get(`/favorites/listForMe`);
            return response.data;
        } catch (error) {
            const err = error as AxiosError;
            if (err.response?.status === 401) {
                throw new Error("UNAUTH");
            }
            console.error("Get favorites failed", error);
            throw error;
        }
    },
    addFavorite: async (productId: number) => {
        try {
            const response = await axiosInstance.post(`/favorites/add?productId=${productId}`);
            return response.data;
        } catch (error) {
            console.error("Add favorite failed", error);
            throw error;
        }
    },
    deleteFavorite: async (favoriteId: number) => {
        try {
            const response = await axiosInstance.delete(`/favorites/${favoriteId}/delete`);
            return response.data;
        } catch (error) {
            console.error("Delete favorite failed", error);
            throw error;
        }
    },
};
