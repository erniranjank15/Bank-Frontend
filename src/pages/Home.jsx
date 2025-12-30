import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Input from "../components/Input";
import Button from "../components/Button";

const Home = () => {
  const { login } = useAuth();
  const [data, setData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(data);
      
      // Get user profile to check role
      const token = localStorage.getItem("token");
      const userRes = await axios.get(`${import.meta.env.VITE_API_URL || "https://bank-4-yt2f.onrender.com"}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Redirect based on role
      if (userRes.data.role === 'admin') {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      // Error already handled in AuthContext with toast
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          
          {/* Login Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Sign In</h2>
            
            <form onSubmit={handleSubmit}>
              <Input
                name="username"
                value={data.username}
                onChange={handleChange}
                placeholder="Username"
                required
              />

              <Input
                name="password"
                type="password"
                value={data.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />

              <Button type="submit">Sign In</Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                  Register here
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="text-center">
          <p className="text-sm">
            © 2025 by Niranjan Kasote
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
