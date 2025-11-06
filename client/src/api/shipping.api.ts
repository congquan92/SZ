import { axiosInstance } from "@/lib/axios";
export const ShippingAPI = {
    estimateDimensions: async (items: { nameProduct: string; length: number; width: number; height: number; weight: number; quantity: number }[]) => {
        try {
            const response = await axiosInstance.post("/api/shipping/estimate-dimensions", items);
            return response.data;
        } catch (error) {
            console.error("Calculate shipping fee failed:", error);
            throw error;
        }
    },
    caculateShippingFee: async (items: {
        toDistrictId: number;
        toWardCode: string;
        serviceTypeId: number;
        weight: number;
        length: number;
        width: number;
        height: number;
        items: Array<{ name: string; length: number; width: number; height: number; weight: number; quantity: number }>;
    }) => {
        try {
            const response = await axiosInstance.post("/api/shipping/fee", items);
            return response.data;
        } catch (error) {
            console.error("Calculate shipping fee failed:", error);
            throw error;
        }
    },
};
