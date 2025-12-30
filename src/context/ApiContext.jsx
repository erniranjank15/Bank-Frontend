import axios from "axios";
import { createContext } from "react";

export const ApiContext = createContext();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://bank-4-yt2f.onrender.com",
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const ApiProvider = ({ children }) => {
  return (
    <ApiContext.Provider value={{ api }}>
      {children}
    </ApiContext.Provider>
  );
};

export default api;
