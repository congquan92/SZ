import { axiosInstance } from "@/lib/axios";
export const PaymentAPI = {
    getPaymentMethods: async (orderId: number) => {
        try {
            const response = await axiosInstance.post(`/payment/${orderId}/add`);
            return response.data;
        } catch (error) {
            console.error("Get payment methods failed", error);
            throw error;
        }
    },
};
