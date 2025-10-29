import { create } from "zustand";
import { AuthAPI } from "@/api/auth.api";
import { axiosInstance } from "@/lib/axios";

interface User {
    id: number;
    userName: string;
    fullName: string;
    gender: "MALE" | "FEMALE" | "BOTH";
    dateOfBirth: string;
    email: string;
    phone: string;
    avatar: string | null;
    totalSpent: number;
    userRankResponse: {
        id: number;
        name: string;
        minSpent: number;
        status: string;
    };
    roles: [
        {
            name: string;
            description: string;
            permissions: string[];
        }
    ];
}
interface AuthState {
    user: User | null;
    loading: boolean;
    token: string | null;
    login: (username: string, password: string) => Promise<{ status: number; data: { userId: string; email: string } }>;
    signup: (fullName: string, gender: string, dateOfBirth: string, email: string, phone: string, username: string, password: string) => Promise<{ data: string }>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    clearState: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: false,
    token: localStorage.getItem("auth_token"),

    clearState: () => set({ user: null, token: null, loading: false }),

    login: async (username, password) => {
        set({ loading: true });
        try {
            const { token, data, status } = await AuthAPI.login(username, password);
            if (status !== 1000 && status !== 1006 && status !== 500 && status !== 401 && token) {
                localStorage.setItem("auth_token", token);
                set({ token });
                get().fetchUser();
            }
            return { status, data };
        } catch (error) {
            console.error("Login failed ", error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    signup: async (fullName: string, gender: string, dateOfBirth: string, email: string, phone: string, username: string, password: string) => {
        set({ loading: true });
        try {
            const { data } = await AuthAPI.signup(fullName, gender, dateOfBirth, email, phone, username, password);
            return data;
        } catch (error) {
            console.error("Signup failed ", error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        try {
            localStorage.removeItem("auth_token");
            await AuthAPI.logout(get().token!);
            get().clearState();
            delete axiosInstance.defaults.headers.Authorization;
        } catch (error) {
            console.error("Logout failed ", error);
        }
    },

    fetchUser: async () => {
        set({ loading: true });
        try {
            const data = await AuthAPI.getProfile();
            set({ user: data.data });
        } catch (error) {
            set({ user: null, token: null });
            localStorage.removeItem("auth_token");
            delete axiosInstance.defaults.headers.Authorization;
            console.error("Fetch user failed ", error);
        } finally {
            set({ loading: false });
        }
    },
}));
