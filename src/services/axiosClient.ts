import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const isAdmin = window.location.pathname.startsWith("/admin");

  const token = isAdmin
    ? localStorage.getItem("AccessTokenAdmin")
    : localStorage.getItem("AccessToken");
  console.log("PATH:", window.location.pathname);
  console.log("TOKEN:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;
