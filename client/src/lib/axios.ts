import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { "Content-Type": "application/json" },
});

/* ============================================
   1. Request Interceptor → tự gắn Bearer token
===============================================*/
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

/* ===========================================================
   2. Refresh Token Logic → giữ cực đơn giản, không vòng lặp
==============================================================*/

let isRefreshing = false;
let waitingRequests: ((token: string) => void)[] = [];

/* Hàm chạy lại request cũ */
const retryFailedRequests = (newToken: string) => {
    waitingRequests.forEach((cb) => cb(newToken));
    waitingRequests = [];
};

axiosInstance.interceptors.response.use(
    (res) => res,

    async (error) => {
        const originalRequest = error.config;

        // Token hết hạn -> cần refresh
        const isExpired = error.response?.status === 401;

        // Không refresh cho login/register/refresh,....
        const isAuthAPI = originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/register") || originalRequest.url.includes("/auth/refresh");

        if (isExpired && !originalRequest._retry && !isAuthAPI) {
            originalRequest._retry = true;

            /* Nếu đang refresh → đợi */
            if (isRefreshing) {
                return new Promise((resolve) => {
                    waitingRequests.push((token: string) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const oldToken = localStorage.getItem("auth_token");
                const refreshRes = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, { token: oldToken });
                const newToken = refreshRes.data.data.token;

                localStorage.setItem("auth_token", newToken);
                retryFailedRequests(newToken);

                isRefreshing = false;

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                isRefreshing = false;
                localStorage.removeItem("auth_token");
                window.location.href = "/login";
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);
