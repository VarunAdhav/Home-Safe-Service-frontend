import { useState } from "react";
import axios from "axios";

export default function AddService() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await axios.post(
      "http://localhost:5000/api/services/add",
      { title, description },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await axios.post(
      `http://localhost:5000/api/services/${data._id}/availability`,
      { availableDays: days, availableTimes: { start, end } },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Service added with availability!");
    setTitle("");
    setDescription("");
    setDays([]);
    setStart("");
    setEnd("");
  };

  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="card mt-6">
      <h2 className="text-xl font-semibold mb-4">Provide a Service (Provider role)</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

        <div>
          <p className="font-semibold">Available Days:</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {weekdays.map((day) => (
              <button
                key={day}
                type="button"
                className={`px-3 py-1 rounded ${days.includes(day) ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div>
            <label className="block text-sm font-semibold">Start Time</label>
            <input type="time" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold">End Time</label>
            <input type="time" className="input" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>

        <button className="btn" type="submit">Add Service</button>
      </form>
    </div>
  );
}
