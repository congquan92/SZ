import { axiosInstance } from "@/lib/axios";

export const AuthAPI = {
    login: async (username: string, password: string) => {
        const response = await axiosInstance.post("/auth/login", { username, password }, { validateStatus: () => true });
        return response.data;
    },

    signup: async (fullName: string, gender: string, dateOfBirth: string, email: string, phone: string, username: string, password: string) => {
        try {
            const response = await axiosInstance.post("/auth/register", { fullName, gender, dateOfBirth, email, phone, username, password });
            return response.data;
        } catch (error) {
            console.error("Signup failed", error);
            throw error;
        }
    },
    logout: async (token: string) => {
        try {
            await axiosInstance.post("/auth/logout", { token });
        } catch (error) {
            console.error("Logout failed", error);
            throw error;
        }
    },

    sendOTP: async (userId: string) => {
        try {
            await axiosInstance.post(`/otp/send?userId=${userId}&otpType=VERIFICATION`);
        } catch (error) {
            console.error("Send OTP failed", error);
            throw error;
        }
    },

    verifyOTP: async (userId: string, code: string) => {
        try {
            const response = await axiosInstance.post(`/otp/verify-otp?userId=${userId}&inputOtp=${code}&otpType=VERIFICATION`);
            return response;
        } catch (error) {
            console.error("Verify OTP failed", error);
            throw error;
        }
    },
    getProfile: async () => {
        try {
            const response = await axiosInstance.get("/user/me");
            return response.data;
        } catch (error) {
            console.error("Get profile failed", error);
            throw error;
        }
    },
    changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string) => {
        try {
            const response = await axiosInstance.post("/user/change-password", { oldPassword, newPassword, confirmPassword });
            return response.data;
        } catch (error) {
            console.error("Change password failed", error);
            throw error;
        }
    },
};
