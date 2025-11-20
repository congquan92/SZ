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

    // lọc sản phẩm trường createdAt:desc
    getProductHot: async (size: number, page: number = 0) => {
        try {
            const response = await axiosInstance.get(`product/list?sort=createdAt%3Adesc&page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Get products failed", error);
            throw error;
        }
    },

    // lọc sản phẩm trường salePrice asc (giá thấp đến cao)
    getProductSale: async (size: number, page: number = 0) => {
        try {
            const response = await axiosInstance.get(`/product/list?sort=salePrice%3Aasc&page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Get sale products failed", error);
            throw error;
        }
    },

    // lọc sản phẩm theo soldQuantity giảm dần desc
    getProductSelling: async (size: number, page: number = 0) => {
        try {
            const response = await axiosInstance.get(`/product/list?sort=soldQuantity%3Adesc&page=${page}&size=${size}`);
            return response.data;
        } catch (error) {
            console.error("Get selling products failed", error);
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

    getProductByBehavior: async (size: number, page: number = 0, guestId?: string | null, sort?: string) => {
        try {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("size", size.toString());
            if (sort) params.append("sort", sort);
            if (guestId) params.append("guestId", guestId);

            const response = await axiosInstance.get(`/product/list/recommend?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error("Get products by behavior failed", error);
            throw error;
        }
    },
};
