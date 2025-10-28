import { useEffect, useState } from "react";
import axios from "axios";

export default function BookService() {
  const [services, setServices] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:5000/api/services", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setServices(res.data));
  }, [token]);

  const book = async (id) => {
    await axios.post(`http://localhost:5000/api/services/${id}/book`, {}, { headers: { Authorization: `Bearer ${token}` } });
    alert("Booked!");
    window.location.reload();
  };

  return (
    <div className="mt-6 space-y-3">
      <h2 className="text-xl font-semibold">Available Services</h2>
      {services.map((s) => (
        <div className="card" key={s._id}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{s.title}</h4>
              <p className="text-sm text-slate-600">{s.description}</p>
              {s.provider && <p className="text-xs mt-1 text-slate-500">By {s.provider.name}</p>}
            </div>
            <button className="btn" onClick={() => book(s._id)}>Book</button>
          </div>
        </div>
      ))}
    </div>
  );
}
