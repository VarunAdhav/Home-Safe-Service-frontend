import { useEffect, useState } from "react";
import axios from "axios";

export default function BookService() {
  const [services, setServices] = useState([]);
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:5000/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setServices(res.data));
  }, [token]);

  const generateTimeSlots = (start, end, interval = 30) => {
    if (!start || !end) return [];
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    const slots = [];
    for (let h = sH, m = sM; h < eH || (h === eH && m < eM);) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += interval;
      if (m >= 60) (h += Math.floor(m / 60)), (m %= 60);
    }
    return slots;
  };


  const book = async (id) => {
    if (!selectedDay || !selectedTime)
      return alert("Select day and time first!");

    const today = new Date();
    const targetDate = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const selectedDayIndex = daysOfWeek.indexOf(selectedDay);
    const currentDayIndex = today.getDay();

    let daysToAdd = selectedDayIndex - currentDayIndex;
    if (daysToAdd < 0) daysToAdd += 7; 
    targetDate.setDate(today.getDate() + daysToAdd);

    const selectedDate = targetDate.toISOString().split("T")[0]; 

    try {
      await axios.post(
        `http://localhost:5000/api/services/${id}/book`,
        { selectedDay, selectedDate, selectedTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Service booked successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Booking failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Booking failed. Please try again.");
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <h2 className="text-xl font-semibold">Available Services</h2>
      {services.map((s) => (
        <div className="card" key={s._id}>
          <div className="flex flex-col gap-2">
            <div>
              <h4 className="font-semibold">{s.title}</h4>
              <p className="text-sm text-slate-600">{s.description}</p>
              {s.provider && (
                <p className="text-xs mt-1 text-slate-500">
                  By {s.provider.name}
                </p>
              )}
            </div>

            {s.availableDays?.length > 0 && (
              <div>
                <p className="font-semibold text-sm">Available Days:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {s.availableDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1 rounded border ${selectedDay === day
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-200 text-gray-800 border-gray-300"
                        }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}


            {s.availableTimes && (
              <div>
                <p className="font-semibold text-sm">Available Time Slots:</p>
                <select
                  className="input"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                >
                  <option value="">-- choose a time --</option>
                  {generateTimeSlots(
                    s.availableTimes.start,
                    s.availableTimes.end,
                    30 // 30-minute interval
                  ).map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            )}


            {user.role === "customer" && (
              <button className="btn mt-2" onClick={() => book(s._id)}>
                Book Slot
              </button>
            )}



            {user.role === "provider" && (
              <p className="text-sm text-slate-500 mt-2">
                (You cannot book services as a provider)
              </p>
            )}

            {s.status === "booked" &&
              (!s.customer ||
                (user.role === "customer" &&
                  s.customer?._id !== user._id)) && (
                <p className="text-sm text-red-500 mt-1">
                  (Already booked by another customer)
                </p>
              )}
          </div>
        </div>
      ))}
    </div>
  );
}
