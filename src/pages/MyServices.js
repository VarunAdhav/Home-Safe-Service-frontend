import { useEffect, useState } from "react";
import axios from "axios";

export default function MyServices() {
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", availableDays: [], start: "", end: "" });
  const [deletingId, setDeletingId] = useState(null);
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/services/my-services", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setServices(res.data))
      .catch((err) => console.error("Error fetching services:", err));
  }, [token]);

  const deleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`http://localhost:5000/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Service deleted successfully!");
      setServices((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting service:", err);
      alert(err.response?.data?.message || "Failed to delete service");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (service) => {
    setEditingId(service._id);
    setEditForm({
      title: service.title,
      description: service.description || "",
      availableDays: service.availableDays || [],
      start: service.availableTimes?.start || "",
      end: service.availableTimes?.end || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (day) => {
    setEditForm((prev) => {
      const updated = prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: updated };
    });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/services/${id}/edit`,
        {
          title: editForm.title,
          description: editForm.description,
          availableDays: editForm.availableDays,
          availableTimes: { start: editForm.start, end: editForm.end },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Service updated!");
      setEditingId(null);
      const { data } = await axios.get("http://localhost:5000/api/services/my-services", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setServices(data);
    } catch (err) {
      console.error("Error updating service:", err);
      alert("Failed to update service.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Services</h2>

      {services.length === 0 && <p>No services found.</p>}

      {services.map((s) => (
        <div key={s._id} className="card p-4 border rounded-lg mb-3">
          {editingId === s._id ? (
            <>
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleChange}
                className="input mb-2 w-full"
                placeholder="Service Title"
              />
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleChange}
                className="input mb-2 w-full"
                placeholder="Description"
              />
              <div className="mb-2">
                <label className="font-semibold block mb-1">Available Days:</label>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                  <label key={day} className="mr-3">
                    <input
                      type="checkbox"
                      checked={editForm.availableDays.includes(day)}
                      onChange={() => handleCheckboxChange(day)}
                      className="mr-1"
                    />
                    {day.slice(0, 3)}
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mb-2">
                <div>
                  <label>Start Time</label>
                  <input
                    type="time"
                    name="start"
                    value={editForm.start}
                    onChange={handleChange}
                    className="input ml-2"
                  />
                </div>
                <div>
                  <label>End Time</label>
                  <input
                    type="time"
                    name="end"
                    value={editForm.end}
                    onChange={handleChange}
                    className="input ml-2"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button className="btn bg-green-600 hover:bg-green-700" onClick={() => saveEdit(s._id)}>
                  Save
                </button>
                <button className="btn bg-gray-400 hover:bg-gray-500" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <h4 className="font-semibold">{s.title}</h4>
              <p>{s.description}</p>
              <p>
                <b>Days:</b> {s.availableDays?.join(", ") || "Not set"}
              </p>
              <p>
                <b>Time:</b>{" "}
                {s.availableTimes?.start && s.availableTimes?.end
                  ? `${s.availableTimes.start} - ${s.availableTimes.end}`
                  : "Not set"}
              </p>
              <div className="flex gap-2 mt-2">
              <button
                className="btn bg-blue-600 hover:bg-blue-700"
                onClick={() => startEdit(s)}
              >
                Edit
              </button>
              <button
                className={`btn bg-red-600 hover:bg-red-700 ${
                  deletingId === s._id ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => deleteService(s._id)}
                disabled={deletingId === s._id}
              >
                {deletingId === s._id ? "Deleting..." : "Delete"}
              </button>

            </div>

            </>
          )}
        </div>
      ))}
    </div>
  );
}
