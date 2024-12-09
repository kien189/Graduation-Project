import axios from "axios";

const instance = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Thêm interceptor để gửi token trong headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Lấy token từ localStorage
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`; // Thêm token vào headers
    }
    return config; // Trả về config đã được chỉnh sửa
  },
  (error) => {
    return Promise.reject(error); // Xử lý lỗi nếu có
  }
);

export default instance;
