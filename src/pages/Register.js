import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });

  const registerHandler = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("Registered successfully. Please login.");
      window.location.href = "/";
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      alert(msg);
    }
  };

  return (
    <div className="card mt-6">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form onSubmit={registerHandler} className="space-y-3">
        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="customer">Customer</option>
          <option value="provider">Service Provider</option>
        </select>
        <button className="btn" type="submit">Create account</button>
      </form>
    </div>
  );
}
