import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

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
      // login() returns { access_token, token_type, user: { role, ... } }
      const result = await login(data);

      // Redirect based on role from the returned user data
      if (result?.user?.role === 'admin') {
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

        {/* Forgot password link */}
        <div className="mb-4 text-right">
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Forgot Password?
          </a>
        </div>

        <Button type="submit">Sign In</Button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
            Register here
          </a>
        </p>
      </form>

    </div>
  );
};

export default Login;
