import axios from "axios";
const apiURL = import.meta.env.VITE_API_URL;

const api = axios.create({
    // baseURL: "http://localhost:5050/api",
    baseURL: apiURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach the stored JWT on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("captionFlowToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.dispatchEvent(new Event("auth:expired"));
        }
        return Promise.reject(error);
    }
);

export default api;