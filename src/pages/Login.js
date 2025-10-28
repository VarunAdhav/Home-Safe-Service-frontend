import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", { email, password });


      localStorage.setItem("user", JSON.stringify(data));


      if (data.role === "provider") {
        window.location.href = "/add-service";
      } else if (data.role === "admin") {
        window.location.href = "/privacy";
      } else {
        window.location.href = "/book";
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed.";
      alert(msg);
    }
  };


  return (
    <div className="card mt-6">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <form onSubmit={loginHandler} className="space-y-3">
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn" type="submit">Login</button>
      </form>
    </div>
  );
}
