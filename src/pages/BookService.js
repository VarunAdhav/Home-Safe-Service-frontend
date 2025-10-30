import { useEffect, useState } from "react";
import axios from "axios";

export default function BookService() {
  const [services, setServices] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState({}); // <-- per-service selections
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:5000/api/services", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {setServices(res.data)})
      
      .catch((err) => console.error("Error fetching services:", err));
  }, [token]);

  const generateTimeSlots = (start, end, interval = 30) => {
    if (!start || !end) return [];
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    const slots = [];
    for (let h = sH, m = sM; h < eH || (h === eH && m < eM); ) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += interval;
      if (m >= 60) (h += Math.floor(m / 60)), (m %= 60);
    }
    return slots;
  };

  const generateNext30Days = () => {
    const today = new Date();
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() + i);
      return {
        date,
        dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
        formatted: date.toLocaleDateString("en-CA")
      };
    });
  };

  const handleSelectDay = (serviceId, formattedDate) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], day: formattedDate },
    }));
  };

  const handleSelectTime = (serviceId, time) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [serviceId]: { ...prev[serviceId], time },
    }));
  };

  const book = async (id) => {
    const selection = selectedSlots[id];
    if (!selection?.day || !selection?.time)
      return alert("Select date and time first!");

    const selectedDate = new Date(selection.day);
    const dayName = selectedDate.toLocaleDateString("en-US", { weekday: "long" });
    console.log(dayName , selectedDate);
    
    try {
      await axios.post(
        `http://localhost:5000/api/services/${id}/book`,
        {
          selectedDay: dayName,
          selectedDate: selectedDate.toISOString().split("T")[0],
          selectedTime: selection.time,
        },
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
      {services.map((s) => {
        const selection = selectedSlots[s._id] || {};
        return (
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
                  <p className="font-semibold text-sm">Select Date (Next 30 Days):</p>
                  <div className="grid grid-cols-7 gap-2 mt-3 text-center text-xs">
                    {generateNext30Days().map(({ date, dayName, formatted }) => {
                      const isAvailable = s.availableDays.includes(dayName);
                      return (
                        <button
                          key={formatted}
                          type="button"
                          onClick={() =>
                            isAvailable && handleSelectDay(s._id, formatted)
                          }
                          className={`p-2 rounded border transition ${
                            selection.day === formatted
                              ? "bg-blue-600 text-white border-blue-600"
                              : isAvailable
                              ? "bg-gray-100 hover:bg-blue-50"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                          disabled={!isAvailable}
                        >
                          <p className="font-semibold">{dayName.slice(0, 3)}</p>
                          <p>{date.getDate()}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Select Time */}
              {s.availableTimes && (
                <div>
                  <p className="font-semibold text-sm">Available Time Slots:</p>
                  <select
                    className="input"
                    value={selection.time || ""}
                    onChange={(e) => handleSelectTime(s._id, e.target.value)}
                  >
                    <option value="">-- choose a time --</option>
                    {generateTimeSlots(
                      s.availableTimes.start,
                      s.availableTimes.end,
                      30
                    ).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Summary */}
              {selection.day && selection.time && (
                <p className="mt-2 text-sm text-gray-700">
                  You selected{" "}
                  <b>
                    {new Date(selection.day).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </b>{" "}
                  at <b>{selection.time}</b>.
                </p>
              )}

              {/* Booking Button */}
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
        );
      })}
    </div>
  );
}
