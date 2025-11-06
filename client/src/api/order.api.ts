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
        note: string,
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
                note,
                voucherId,
            });
            return response.data;
        } catch (error) {
            console.error("Place order failed", error);
            throw error;
        }
    },
    getOrderAll: async () => {
        try {
            const response = await axiosInstance.get(`orders/list?isAll=true`);
            return response.data;
        } catch (error) {
            console.error("Get order failed", error);
            throw error;
        }
    },
};
