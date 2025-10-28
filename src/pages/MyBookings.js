import { useEffect, useState } from "react";
import axios from "axios";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:5000/api/services/my-bookings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data))
      .catch(() => alert("Failed to fetch bookings"));
  }, [token]);

  const cancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
        await axios.post(
        `http://localhost:5000/api/services/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Booking cancelled successfully!");
        setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
        alert("Failed to cancel booking.");
    }
    };

    const formatBookingSlot = (slot) => {
        if (!slot?.date || !slot?.time) return "—";
        const date = new Date(slot.date);
        return `${date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        })} at ${slot.time}`;
    };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">My Booked Services</h2>

      {bookings.length === 0 ? (
        <p className="text-gray-500">You have no active bookings.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((s) => (
            <div key={s._id} className="card">
              <div className="flex flex-col gap-2">
                <h4 className="font-semibold text-lg">{s.title}</h4>
                <p className="text-sm text-gray-600">{s.description}</p>

                {/* Provider Info */}
                {s.provider && (
                  <p className="text-sm text-gray-500">
                    Provider: <b>{s.provider.name}</b> ({s.provider.email})
                  </p>
                )}

                {s.bookedSlot ? (
                    <p className="text-sm text-gray-700">
                        <b>Booked Slot:</b> {formatBookingSlot(s.bookedSlot)}
                    </p>
                ) : (
                    <p className="text-sm text-gray-400 italic">(No slot booked yet)</p>
                )}


                {/* Provider's available window (for reference) */}
                {s.availableTimes && (
                  <p className="text-sm text-gray-500">
                    <b>Provider Availability:</b>{" "}
                    {s.availableTimes.start} - {s.availableTimes.end}
                  </p>
                )}

                {/* Status */}
                <p className="text-sm">
                  <b>Status:</b>{" "}
                  <span
                    className={
                      s.status === "booked"
                        ? "text-green-600"
                        : s.status === "completed"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                  >
                    {s.status}
                  </span>
                </p>
                {s.status === "booked" && (
                    <button
                        onClick={() => cancelBooking(s._id)}
                        className="bg-red-600 p-3 rounded-lg text-white font-semibold"
                    >
                        Cancel Booking
                    </button>
                    )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
