import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/signup", formData);
      toast.success("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 to-pink-300">
      <form
        onSubmit={handleSubmit}
        className="bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl hover:shadow-blue-400/50 transition-all p-8 rounded-2xl w-full max-w-md animate-fade-in"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Create Account
        </h2>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full mb-5 p-3 rounded-lg border focus:ring-2 focus:ring-pink-400 focus:outline-none"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full mb-5 p-3 rounded-lg border focus:ring-2 focus:ring-pink-400 focus:outline-none"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full mb-8 p-3 rounded-lg border focus:ring-2 focus:ring-pink-400 focus:outline-none"
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full mb-8 p-3 rounded-lg border focus:ring-2 focus:ring-pink-400 focus:outline-none"
        >
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          Signup
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
