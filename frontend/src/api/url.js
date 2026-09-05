import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api/v1/noteapp";

const BACKEND_URL = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

BACKEND_URL.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default BACKEND_URL
