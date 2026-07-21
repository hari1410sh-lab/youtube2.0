import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:5000",
});

// Add a request interceptor to properly handle FormData uploads
axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    // Let axios automatically set Content-Type with boundary for FormData
    if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-Type"];
    }
  }
  return config;
});

export default axiosInstance;
