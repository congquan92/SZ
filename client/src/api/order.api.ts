import { axiosInstance } from "@/lib/axios";
export const OrderAPI = {
    orderAdd: async (
        customerName: string,
        customerPhone: string,
        deliveryWardName: string,
        deliveryWardCode: string,
        deliveryDistrictId: number,
        deliveryProvinceId: number,
        deliveryDistrictName: string,
        deliveryProvinceName: string,
        deliveryAddress: string,
        orderItems: Array<{ quantity: number; productVariantId: number }>,
        paymentType: string,
        voucherId: number | null
    ) => {
        try {
            const response = await axiosInstance.post(`/orders/add`, {
                customerName,
                customerPhone,
                deliveryWardName,
                deliveryWardCode,
                deliveryDistrictId,
                deliveryProvinceId,
                deliveryDistrictName,
                deliveryProvinceName,
                deliveryAddress,
                orderItems,
                paymentType,
                voucherId,
            });
            return response.data;
        } catch (error) {
            console.error("Place order failed", error);
            throw error;
        }
    },

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
