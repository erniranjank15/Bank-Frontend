import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const API_URL = import.meta.env.VITE_API_URL || "https://bank-4-yt2f.onrender.com";

  // Load user data on app startup if token exists
  useEffect(() => {
    const loadUserData = async () => {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        try {
          const userRes = await axios.get(`${API_URL}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          setUser(userRes.data);
          setToken(savedToken);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
    };

    loadUserData();
  }, []);

  // LOGIN function
  const login = async (data) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', data.username);
      formData.append('password', data.password);
      
      const res = await axios.post(`${API_URL}/login`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      setToken(res.data.access_token);
      localStorage.setItem("token", res.data.access_token);
      
      // Get user info
      const userRes = await axios.get(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${res.data.access_token}`
        }
      });
      setUser(userRes.data);
      
      toast.success("Login successful!");
      return res.data;
    } catch (error) {
      toast.error("Login failed! Please check your credentials.");
      throw error;
    }
  };

  // REGISTER function
  const register = async (data) => {
    try {
      const registerData = {
        username: data.username,
        email: data.email,
        mob_no: parseInt(data.mob_no),
        hashed_password: data.password,
        role: data.role || "user"
      };
      
      const res = await axios.post(`${API_URL}/users/`, registerData);
      toast.success("Registration successful!");
      return res.data;
    } catch (error) {
      toast.error("Registration failed! Please try again.");
      throw error;
    }
  };

  // LOGOUT function
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    toast.info("Logged out successfully!");
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
