import { axiosInstance } from "@/lib/axios";
export const UploadImgAPI = {
    uploadImg: async (file: File) => {
        try {
            const formData = new FormData();
            formData.append("files", file);
            const response = await axiosInstance.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Upload image failed", error);
            throw error;
        }
    },
};
