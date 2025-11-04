import { axiosInstance } from "@/lib/axios";

export const AddressAPI = {
    // TODO page , size
    getAddress: async () => {
        try {
            const response = await axiosInstance.get("/user/address/list?page=0&size=10");
            return response.data;
        } catch (error) {
            console.error("Get address failed", error);
            throw error;
        }
    },

    addAddress: async (province: string, district: string, ward: string, provinceId: number, districtId: number, wardId: string, streetAddress: string, addressType: string) => {
        try {
            const response = await axiosInstance.post("/user/add/address", { province, district, ward, provinceId, districtId, wardId, streetAddress, addressType });
            return response.data;
        } catch (error) {
            console.error("Add address failed", error);
            throw error;
        }
    },
    defaultAddress: async (userHasAddressId: number) => {
        try {
            const response = await axiosInstance.put(`/user/address/default/${userHasAddressId}`);
            return response.data;
        } catch (error) {
            console.error("Set default address failed", error);
            throw error;
        }
    },
    deleteAddress: async (userHasAddressId: number) => {
        try {
            const response = await axiosInstance.delete(`/user/address/delete/${userHasAddressId}`);
            return response.data;
        } catch (error) {
            console.error("Delete address failed", error);
            throw error;
        }
    },
    updateAddress: async (userHasAddressId: number, province: string, district: string, ward: string, provinceId: number, districtId: number, wardId: string, streetAddress: string, addressType: string) => {
        try {
            const response = await axiosInstance.put(`/user/address/update/${userHasAddressId}`, { province, district, ward, provinceId, districtId, wardId, streetAddress, addressType });
            return response.data;
        } catch (error) {
            console.error("Update address failed", error);
            throw error;
        }
    },
};
