import { useState } from "react";
import axios from "axios";

export default function AddService() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/services/add", { title, description }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Service added!");
      setTitle(""); setDescription("");
    } catch (e) {
      alert(e?.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="card mt-6">
      <h2 className="text-xl font-semibold mb-4">Provide a Service (Provider role)</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="btn" type="submit">Add Service</button>
      </form>
    </div>
  );
}
