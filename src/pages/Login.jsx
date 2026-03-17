import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

const Login = () => {
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
      const userRes = await axios.get("https://bank-4-yt2f.onrender.com/users/profile", {
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Sign In</h2>
        
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
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
            Register here
          </a>
        </p>
      </form>
        {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="text-center">
          <p className="text-sm">
            © 2025 Niranjan Kasote All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Login;
