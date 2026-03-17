import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import axios from "axios";
import { toast } from "react-toastify";

const Register = () => {
  const [data, setData] = useState({
    username: "",
    email: "",
    mob_no: "",
    password: "",
    role: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const registerData = {
        username: data.username,
        email: data.email,
        mob_no: parseInt(data.mob_no),
        hashed_password: data.password,
        role: data.role || "user"
      };

      await axios.post(`${import.meta.env.VITE_API_URL || "https://bank-4-yt2f.onrender.com"}/users/`, registerData);

      toast.success("Registration successful!");
      setData({
        username: "",
        email: "",
        mob_no: "",
        password: "",
        role: "",
      });
    } catch (error) {
      toast.error("Registration failed! Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Create Account</h2>

        <Input
          placeholder="Enter Username"
          type="text"
          value={data.username}
          name="username"
          onChange={handleChange}
          required
        />

        <Input
          placeholder="Enter Email"
          type="email"
          value={data.email}
          name="email"
          onChange={handleChange}
          required
        />

        <Input
          placeholder="Enter Mobile Number"
          type="number"
          value={data.mob_no}
          name="mob_no"
          onChange={handleChange}
          required
        />

        <Input
          placeholder="Enter Password"
          type="password"
          value={data.password}
          name="password"
          onChange={handleChange}
          required
        />

        <select
          name="role"
          value={data.role}
          onChange={handleChange}
          className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <Button type="submit">Create Account</Button>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in here
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

export default Register;
