import { useEffect, useState } from "react";
import axios from "axios";

export default function PrivacyDashboard() {
  const [consent, setConsent] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (user?.consentTracing) setConsent(true);
  }, [user]);

  const saveConsent = async () => {
    const { data } = await axios.post("http://localhost:5000/api/auth/consent", { userId: user?._id || user?.id, consent });
    localStorage.setItem("user", JSON.stringify({ ...user, consentTracing: data.consentTracing }));
    alert("Consent updated.");
  };

  const exportData = () => {
    const encounters = JSON.parse(localStorage.getItem("encounters") || "[]");
    const blob = new Blob([JSON.stringify({ encounters }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "my_privacy_data.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const deleteData = () => {
    localStorage.removeItem("encounters");
    alert("Local encounters deleted.");
  };

  return (
    <div className="card mt-6 space-y-4">
      <h2 className="text-xl font-semibold">Privacy Dashboard</h2>
      <div className="flex items-center space-x-3">
        <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <label htmlFor="consent">I consent to privacy-preserving contact tracing</label>
      </div>
      <div className="space-x-2">
        <button className="btn" onClick={saveConsent}>Save Consent</button>
        <button className="btn" onClick={exportData}>Export My Data</button>
        <button className="btn bg-red-600 hover:bg-red-700" onClick={deleteData}>Delete My Data</button>
      </div>
      <p className="text-sm text-slate-600">
        This dashboard demonstrates <b>data minimization</b>, <b>user control</b>, and <b>right to erasure</b> (Privacy-by-Design).
      </p>
    </div>
  );
}
