import { useEffect, useState } from "react";
import axios from "axios";
import { getDailyBeaconId, logEncounter, getEncounters } from "../utils/tracing";

export default function Tracing() {
  const [myBeacon, setMyBeacon] = useState("");
  const [encounters, setEncounters] = useState([]);
  const [positiveCount, setPositiveCount] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [otherId, setOtherId] = useState("");
  const [profile, setProfile] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    setMyBeacon(getDailyBeaconId());
    setEncounters(getEncounters());
  }, []);

  const simulateEncounter = () => {
    if (!otherId) return alert("Enter a peer beacon id to simulate");
    const list = logEncounter(otherId);
    setEncounters(list);
    setOtherId("");
  };

  const fetchPositives = async () => {
    const { data } = await axios.get("http://localhost:5000/api/tracing/positives");
    setPositiveCount(data.count);
    const posSet = new Set(data.positives);
    const myMatches = getEncounters().filter(e => posSet.has(e.id));
    setMatchCount(myMatches.length);
    if (myMatches.length > 0) alert("⚠️ Exposure detected with your local encounters!");
  };

  const reportPositive = async () => {

    await axios.post("http://localhost:5000/api/health/report", { status: "exposed" }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    window.dispatchEvent(new Event("healthStatusUpdated"));

    const { data: updated } = await axios.get("http://localhost:5000/api/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    localStorage.setItem("user", JSON.stringify(updated));

    window.dispatchEvent(new Event("healthStatusUpdated"));
  };

  useEffect(() => {
    (async () => {
      if (!token) return;
      const { data } = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(data);
    })();
  }, [token]);

  const nowLocked =
    profile?.healthStatus === "positive" &&
    profile?.restrictedUntil &&
    new Date(profile.restrictedUntil) > new Date();

  const remainingDays = (() => {
    if (!profile?.restrictedUntil) return 0;
    const d = Math.ceil((new Date(profile.restrictedUntil) - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, d);
  })();


  return (
    <div className="mt-6 space-y-4">
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">My Daily Beacon (anonymous)</h2>
        <p className="text-xs break-all">{myBeacon}</p>
        <p className="text-sm text-slate-600 mt-2">Share this (e.g., via QR) with people you meet; they store it locally only.</p>
      </div>

      <div className="card space-y-2">
        <h3 className="font-semibold">Simulate Encounter</h3>
        <div className="flex space-x-2">
          <input className="input" placeholder="Peer beacon id" value={otherId} onChange={(e) => setOtherId(e.target.value)} />
          <button className="btn" onClick={simulateEncounter}>Log Encounter</button>
        </div>
        <p className="text-sm text-slate-600">Recorded encounters: {encounters.length}</p>
      </div>

      <div className="card space-y-2">
        <h3 className="font-semibold">Exposure Check</h3>
        <div className="space-x-2">
          <button className="btn" onClick={fetchPositives}>Fetch Positives</button>
          <button className="btn bg-amber-600 hover:bg-amber-700" onClick={reportPositive}>I tested Positive (upload my beacon ids)</button>
        </div>
        <p className="text-sm text-slate-600">Positive list size: {positiveCount} | Matches with my encounters: {matchCount}</p>
      </div>
    </div>
  );
}
