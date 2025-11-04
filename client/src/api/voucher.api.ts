import { axiosInstance } from "@/lib/axios";
export const VoucherAPI = {
    getVouchers: async () => {
        try {
            const response = await axiosInstance.get(`/voucher/listForMe`);
            return response.data;
        } catch (error) {
            console.error("Get vouchers failed", error);
            throw error;
        }
    },
};
