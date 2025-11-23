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

    cancelOrder: async (orderId: number) => {
        try {
            const response = await axiosInstance.delete(`orders/cancel?orderId=${orderId}`);
            return response.data;
        } catch (error) {
            console.error("Cancel order failed", error);
            throw error;
        }
    },
    completeOrder: async (orderId: number) => {
        try {
            const response = await axiosInstance.put(`/orders/complete/${orderId}`);
            return response.data;
        } catch (error) {
            console.error("Complete order failed", error);
            throw error;
        }
    },
    getOrderDetail: async (orderId: number) => {
        try {
            const response = await axiosInstance.get(`/orders/${orderId}`);
            return response.data;
        } catch (error) {
            console.error("Get order detail failed", error);
            throw error;
        }
    },
    returnOrder: async (orderId: number, reason: string, imageReturnOrder: string[], items: { orderItemId: number; quantity: number }[]) => {
        try {
            const response = await axiosInstance.post(`/return_order/add`, { orderId, reason, imageReturnOrder, items });
            return response.data;
        } catch (error) {
            console.error("Return order failed", error);
            throw error;
        }
    },
};
