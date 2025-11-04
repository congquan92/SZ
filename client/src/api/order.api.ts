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
        serviceDeliveryId: number,
        serviceDeliveryName: string,
        orderItems: Array<{ quantity: number; productVariantId: number }>,
        paymentType: string,
        voucherId: number
    ) => {
        try {
            const response = await axiosInstance.post(`/order/add`, {
                customerName,
                customerPhone,
                deliveryWardName,
                deliveryWardCode,
                deliveryDistrictId,
                deliveryProvinceId,
                deliveryDistrictName,
                deliveryProvinceName,
                deliveryAddress,
                serviceDeliveryId,
                serviceDeliveryName,
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
};
