import { axiosInstance } from "@/lib/axios";

export const ProductAPI = {
    // lấy sản phẩm không lọc gì cả
    getProduct: async (size: number, page: number = 0) => {
        try {
            const response = await axiosInstance.get(`/product/list?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Get products failed", error);
            throw error;
        }
    },

    // lọc sản phẩm trường salePrice
    getProductSale: async (size: number, page: number = 0) => {
        try {
            const response = await axiosInstance.get(`product/list?sort=salePrice&page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Get sale products failed", error);
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

    // láy sản phẩm theo category
    getProductByCategory: async (categoryId: number, size: number, page: number = 0) => {
        try {
            const response = await axiosInstance.get(`/product/products/category/${categoryId}?page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Get products by category failed", error);
            throw error;
        }
    },

    searchProduct: async (query: string, size: number) => {
        try {
            const response = await axiosInstance.get(`/product/list?keyword=${encodeURIComponent(query)}&page=0&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Search products failed", error);
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
};
