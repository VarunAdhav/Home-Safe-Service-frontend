import { useEffect, useState } from "react";
import axios from "axios";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/bookings/mine", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data || []))
      .catch((err) => console.error("Error fetching bookings:", err));
  }, [token]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
      {bookings.length === 0 && <p>No bookings found.</p>}
      {bookings.map((b) => (
        <div key={b._id} className="card mb-3">
          <h4 className="font-semibold">
            {b.service?.title || "Deleted Service"}
          </h4>
          <p>Provider: {b.provider?.name || "N/A"}</p>
          <p>Date: {b.selectedDate} | Time: {b.selectedTime}</p>
          <p>Status: <b>{b.status}</b></p>
        </div>
      ))}
    </div>
  );
}
