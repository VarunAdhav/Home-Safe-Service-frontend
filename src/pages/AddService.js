import { useEffect, useState } from "react";
import axios from "axios";

const weekdays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function AddService() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [myServices, setMyServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [eTitle, setETitle] = useState("");
  const [eDesc, setEDesc] = useState("");
  const [eDays, setEDays] = useState([]);
  const [eStart, setEStart] = useState("");
  const [eEnd, setEEnd] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const toggleDay = (day) => {
    setDays((prev) => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]));
  };

  const toggleDayEdit = (day) => {
    setEDays((prev) => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]));
  };

  const loadMine = async () => {
    const { data } = await axios.get("http://localhost:5000/api/services/my-services", auth);
    setMyServices(data);
  };

  useEffect(() => {
    if (token) loadMine();
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");
    if (!start || !end) return alert("Provide available start & end time");

    const { data } = await axios.post(
      "http://localhost:5000/api/services/add",
      { title, description },
      auth
    );

    await axios.post(
      `http://localhost:5000/api/services/${data._id}/availability`,
      { availableDays: days, availableTimes: { start, end } },
      auth
    );

    alert("Service added with availability!");
    setTitle(""); setDescription(""); setDays([]); setStart(""); setEnd("");
    await loadMine();
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setETitle(s.title || "");
    setEDesc(s.description || "");
    setEDays(s.availableDays || []);
    setEStart(s.availableTimes?.start || "");
    setEEnd(s.availableTimes?.end || "");
  };

  // save edit
  const saveEdit = async () => {
    if (!eTitle.trim()) return alert("Title is required");
    if (!eStart || !eEnd) return alert("Provide available start & end time");

    await axios.put(
      `http://localhost:5000/api/services/${editingId}`,
      {
        title: eTitle,
        description: eDesc,
        availableDays: eDays,
        availableTimes: { start: eStart, end: eEnd },
      },
      auth
    );

    alert("Service updated");
    setEditingId(null);
    await loadMine();
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <div className="mt-6 space-y-6">

      {/* CREATE NEW */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Provide a Service (Provider role)</h2>
        <form onSubmit={submit} className="space-y-3">
          <input className="input" placeholder="Title"
                 value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="input" placeholder="Description"
                    value={description} onChange={(e) => setDescription(e.target.value)} />

          <div>
            <p className="font-semibold">Available Days:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {weekdays.map((day) => (
                <button key={day} type="button"
                        className={`px-3 py-1 rounded ${days.includes(day) ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                        onClick={() => toggleDay(day)}>
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

      {/* MY SERVICES (EDIT) */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-3">My Services</h3>

        {myServices.length === 0 ? (
          <p className="text-sm text-slate-500">You haven't added any services yet.</p>
        ) : (
          <div className="space-y-4">
            {myServices.map((s) => (
              <div key={s._id} className="border rounded p-3">
                {editingId === s._id ? (
                  // EDIT MODE
                  <div className="space-y-3">
                    <input className="input" value={eTitle} onChange={(e)=>setETitle(e.target.value)} />
                    <textarea className="input" value={eDesc} onChange={(e)=>setEDesc(e.target.value)} />

                    <div>
                      <p className="font-semibold">Available Days:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {weekdays.map((day) => (
                          <button key={day} type="button"
                            className={`px-3 py-1 rounded ${eDays.includes(day) ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                            onClick={() => toggleDayEdit(day)}>
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div>
                        <label className="block text-sm font-semibold">Start</label>
                        <input type="time" className="input" value={eStart} onChange={(e)=>setEStart(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold">End</label>
                        <input type="time" className="input" value={eEnd} onChange={(e)=>setEEnd(e.target.value)} />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="btn" onClick={saveEdit}>Save</button>
                      <button className="btn-red" type="button" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  // READ MODE
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{s.title}</h4>
                      {/* <span className="text-xs uppercase tracking-wide text-slate-500">Status: {s.status}</span> */}
                    </div>
                    <p className="text-sm text-slate-600">{s.description}</p>

                    <p className="text-xs mt-1">
                      <b>Days:</b> {s.availableDays?.length ? s.availableDays.join(", ") : "—"}
                    </p>
                    <p className="text-xs">
                      <b>Time:</b>{" "}
                      {s.availableTimes?.start && s.availableTimes?.end
                        ? `${s.availableTimes.start} – ${s.availableTimes.end}`
                        : "—"}
                    </p>

                    <div className="mt-2">
                      <button className="btn" onClick={() => startEdit(s)}>Edit</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
