import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "/";
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Invalid email or password.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="input w-full"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="input w-full pr-10"
            required
          />
          <button
            type="button"
            onClick={togglePassword}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          className="btn bg-blue-600 hover:bg-blue-700 text-white w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
}
