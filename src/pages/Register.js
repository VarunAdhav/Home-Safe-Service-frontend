import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    address: "",
    phoneNumber: "",
    companyName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password || !form.address || !form.phoneNumber) {
      return setError("All fields are required.");
    }

    if (form.role === "provider" && !form.companyName) {
      return setError("Company Name is required for Service Providers.");
    }

    if (!validateEmail(form.email)) {
      return setError("Invalid email format.");
    }

    if (!validatePassword(form.password)) {
      return setError(
        "Password must be at least 8 characters long, contain uppercase, lowercase, and a number."
      );
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      setSuccess("Registration successful! You can now log in.");
      setForm({
        name: "",
        email: "",
        password: "",
        role: "customer",
        address: "",
        phoneNumber: "",
        companyName: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Register</h2>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-3">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="input w-full"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          className="input w-full"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <div className="relative">
          <input
            className="input w-full pr-10"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
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

        <select
          className="input w-full"
          name="role"
          value={form.role}
          onChange={handleChange}
          required
        >
          <option value="customer">Customer</option>
          <option value="provider">Service Provider</option>
        </select>

        <input
          className="input w-full"
          name="address"
          placeholder="Address"
          value={form.address}
          onChange={handleChange}
          required
        />

        <input
          className="input w-full"
          name="phoneNumber"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={handleChange}
          required
        />

        {form.role === "provider" && (
          <input
            className="input w-full"
            name="companyName"
            placeholder="Business / Company Name"
            value={form.companyName}
            onChange={handleChange}
            required
          />
        )}

        <button
          type="submit"
          className="btn bg-blue-600 hover:bg-blue-700 text-white w-full"
        >
          Register
        </button>
      </form>
    </div>
  );
}
