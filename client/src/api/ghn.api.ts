import axios from "axios";

// GHN API base URL
const GHN_API_URL = "https://online-gateway.ghn.vn/shiip/public-api/master-data";

const GHN_TOKEN = import.meta.env.VITE_GHN_TOKEN;

// Create axios instance for GHN
const ghnAxios = axios.create({
    baseURL: GHN_API_URL,
    headers: {
        "Content-Type": "application/json",
        Token: GHN_TOKEN,
    },
});

export interface GHNProvince {
    ProvinceID: number;
    ProvinceName: string;
    Code: string;
}

export interface GHNDistrict {
    DistrictID: number;
    DistrictName: string;
    ProvinceID: number;
}

export interface GHNWard {
    WardCode: string;
    WardName: string;
    DistrictID: number;
}

export const GHNAPI = {
    // Lấy danh sách tỉnh/thành phố
    getProvinces: async (): Promise<GHNProvince[]> => {
        try {
            const response = await ghnAxios.get("/province");
            return response.data.data || [];
        } catch (error) {
            console.error("Error fetching provinces:", error);
            throw error;
        }
    },

    // Lấy danh sách quận/huyện theo tỉnh
    getDistricts: async (provinceId: number): Promise<GHNDistrict[]> => {
        try {
            const response = await ghnAxios.post("/district", {
                province_id: provinceId,
            });
            return response.data.data || [];
        } catch (error) {
            console.error("Error fetching districts:", error);
            throw error;
        }
    },

    // Lấy danh sách phường/xã theo quận
    getWards: async (districtId: number): Promise<GHNWard[]> => {
        try {
            const response = await ghnAxios.post("/ward", {
                district_id: districtId,
            });
            return response.data.data || [];
        } catch (error) {
            console.error("Error fetching wards:", error);
            throw error;
        }
    },
    getShippingServices: async (fromDistrictId: number, toDistrictId: number): Promise<any[]> => {
        try {
            const response = await ghnAxios.post("/service", {
                from_district_id: fromDistrictId,
                to_district_id: toDistrictId,
            });
            return response.data.data || [];
        } catch (error) {
            console.error("Error fetching shipping services:", error);
            throw error;
        }
    },
};
