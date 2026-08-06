import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5050/api",
    // baseURL: "https://captionflow-xxls.onrender.com/api",
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

export default api;