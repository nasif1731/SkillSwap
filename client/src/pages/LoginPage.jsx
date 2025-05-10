import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData
      );
      
      console.log("Login Response:", res.data); // 👈 ADD THIS
  
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
  
      toast.success("Login successful!");
  
      if (res.data.user.role === 'client' && !res.data.user.isVerified) {
        console.log("Redirecting to /verify-phone"); // 👈 ADD THIS
        navigate('/verify-phone');
      } else {
        console.log("Redirecting to /dashboard"); // 👈 ADD THIS
        navigate('/dashboard');
      }
  
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-blue-400">
      <form
        onSubmit={handleSubmit}
        className="bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl hover:shadow-blue-400/50 transition-all p-8 rounded-2xl w-full max-w-md animate-fade-in"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Welcome Back!
        </h2>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full mb-5 p-3 rounded-lg border focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full mb-8 p-3 rounded-lg border focus:ring-2 focus:ring-blue-400 focus:outline-none"
          required
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
