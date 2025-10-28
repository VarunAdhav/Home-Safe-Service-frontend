import { useEffect, useState } from "react";
import axios from "axios";

const formatBookingSlot = (slot) => {
  if (!slot?.date || !slot?.time) return "—";
  const date = new Date(slot.date);
  return `${date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })} at ${slot.time}`;
};

export default function MyCustomers() {
  const [bookings, setBookings] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [expanded, setExpanded] = useState({});
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:5000/api/services/my-customers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data))
      .catch(() => alert("Failed to fetch customer bookings"));
  }, [token]);

  const updateStatus = async (id) => {
    const newStatus = statusUpdates[id];
    if (!newStatus) return alert("Please select a status first.");
    try {
      await axios.post(
        `http://localhost:5000/api/services/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Status changed to ${newStatus}`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id
            ? {
                ...b,
                status: newStatus,
                statusHistory: [
                  ...(b.statusHistory || []),
                  { status: newStatus, changedAt: new Date().toISOString() },
                ],
              }
            : b
        )
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">My Customers</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500">No active bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((s) => {
            const latest = s.statusHistory?.[s.statusHistory.length - 1];
            const pastHistory = s.statusHistory?.slice(0, -1) || [];
            return (
              <div key={s._id} className="card">
                <div className="flex flex-col gap-2">
                  <h4 className="font-semibold text-lg">{s.title}</h4>
                  <p className="text-sm text-gray-600">{s.description}</p>

                  {s.customer && (
                    <p className="text-sm text-gray-700">
                      <b>Customer:</b> {s.customer.name} ({s.customer.email})
                    </p>
                  )}

                  {s.bookedSlot && (
                    <p className="text-sm text-gray-700">
                      <b>Booking:</b> {formatBookingSlot(s.bookedSlot)}
                    </p>
                  )}

                  <p className="text-sm">
                    <b>Current Status:</b>{" "}
                    <span
                      className={
                        s.status === "completed"
                          ? "text-blue-600"
                          : s.status === "booked"
                          ? "text-green-600"
                          : s.status === "cancelled"
                          ? "text-red-600"
                          : "text-gray-500"
                      }
                    >
                      {s.status}
                    </span>
                  </p>

                  {/* 🔄 Dropdown + Change Button */}
                  <div className="flex gap-2 mt-2 items-center">
                    <select
                      className="input flex-1"
                      value={statusUpdates[s._id] || ""}
                      onChange={(e) =>
                        setStatusUpdates((prev) => ({
                          ...prev,
                          [s._id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">-- change status --</option>
                      <option value="booked">Booked</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="available">Available</option>
                    </select>
                    <button
                      onClick={() => updateStatus(s._id)}
                      className="btn bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Change Status
                    </button>
                  </div>

                  {/* 🕓 Latest History Always Visible */}
                  {latest && (
                    <div className="mt-2 text-xs text-gray-500">
                      <b>Last Update:</b>{" "}
                      {latest.status} on{" "}
                      {new Date(latest.changedAt).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}

                  {/* 🔽 Collapsible History */}
                  {pastHistory.length > 0 && (
                    <div className="mt-2 text-xs">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [s._id]: !prev[s._id],
                          }))
                        }
                      >
                        {expanded[s._id] ? "Hide History ▲" : "View History ▼"}
                      </button>

                      {expanded[s._id] && (
                        <ul className="list-disc ml-4 mt-2 text-gray-500">
                          {pastHistory
                            .slice()
                            .reverse()
                            .map((h, i) => (
                              <li key={i}>
                                {h.status} on{" "}
                                {new Date(h.changedAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
