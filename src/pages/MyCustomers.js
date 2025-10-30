import { useEffect, useState } from "react";
import axios from "axios";

export default function MyCustomers() {
  const [bookings, setBookings] = useState([]);
  const [pendingStatus, setPendingStatus] = useState({});
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/bookings/provider", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data || []))
      .catch((err) => console.error("Error fetching bookings:", err));
  }, [token]);

  const handleSelectChange = (id, value) => {
    setPendingStatus((prev) => ({ ...prev, [id]: value }));
  };

  const updateStatus = async (id) => {
    const status = pendingStatus[id];
    if (!status) return alert("Please select a new status first.");
    try {
      await axios.put(
        `http://localhost:5000/api/bookings/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );
      setPendingStatus((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      alert("Booking status updated!");
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Customers</h2>

      {bookings.length === 0 && <p>No bookings found.</p>}

      {bookings.map((b) => (
        <div key={b._id} className="card mb-3 p-3 border rounded-lg">
          <h4 className="font-semibold">{b.service?.title || "Deleted Service"}</h4>
          <p>Customer: {b.customer?.name || "N/A"}</p>
          <p>Date: {b.selectedDate} | Time: {b.selectedTime}</p>

          <div className="flex flex-col gap-2 items-center mt-2">
            <select
              value={pendingStatus[b._id] ?? b.status}
              onChange={(e) => handleSelectChange(b._id, e.target.value)}
              className="input"
            >
              <option value="booked">Booked</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => updateStatus(b._id)}
              className={`btn px-3 py-1 ${
                pendingStatus[b._id]
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!pendingStatus[b._id]}
            >
              Update Status
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
