import { useEffect, useState } from "react";
import axios from "axios";

export default function MyCustomers() {
  const [bookings, setBookings] = useState([]);
  const [pendingStatus, setPendingStatus] = useState({});
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:5000/api/bookings/provider", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data))
      .catch((err) => console.error("Error fetching bookings:", err));
  }, [token]);

  const handleSelectChange = (id, newStatus) => {
    setPendingStatus((prev) => ({ ...prev, [id]: newStatus }));
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
      alert("Booking status updated!");
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status } : b))
      );
      setPendingStatus((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">My Customers</h2>

      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        bookings.map((b) => (
          <div
            key={b._id}
            className="card p-4 mb-3 border rounded-lg shadow-sm bg-white"
          >
            <h4 className="font-semibold text-lg">{b.service?.title}</h4>
            <p className="text-sm text-slate-600">{b.service?.description}</p>
            <p className="text-sm mt-1">
              <b>Customer:</b> {b.customer?.name} ({b.customer?.email})
            </p>
            {b.customer?.phoneNumber && (
              <p className="text-sm">
                <b>Phone:</b> {b.customer.phoneNumber}
              </p>
            )}
            {b.customer?.address && (
              <p className="text-sm">
                <b>Address:</b> {b.customer.address}
              </p>
            )}
            <p className="text-sm">
              <b>Date:</b> {b.selectedDate} | <b>Time:</b> {b.selectedTime}
            </p>
            <p className="text-sm">
              <b>Status:</b>{" "}
              <span
                className={`font-semibold ${
                  b.status === "completed"
                    ? "text-green-600"
                    : b.status === "cancelled"
                    ? "text-red-500"
                    : "text-blue-600"
                }`}
              >
                {b.status}
              </span>
            </p>

            <div className="flex items-center gap-3 mt-3">
              <select
                value={pendingStatus[b._id] ?? b.status}
                onChange={(e) => handleSelectChange(b._id, e.target.value)}
                className="input border rounded p-2"
              >
                <option value="booked">Booked</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={() => updateStatus(b._id)}
                className={`btn px-3 py-1 rounded-md text-white ${
                  pendingStatus[b._id]
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={!pendingStatus[b._id]}
              >
                Update
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}