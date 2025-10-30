import axios from "axios";
import { useState, useEffect } from "react";

export default function MarkPositiveButton() {
  const [loading, setLoading] = useState(false);
  const [restricted, setRestricted] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    const handleRestrictionChange = (e) => {
      const r = e.detail;
      const isRestricted = r && r.endDate && new Date(r.endDate) > new Date();
      setRestricted(isRestricted);
    };

    // Listen for restriction changes
    window.addEventListener("restrictionChanged", handleRestrictionChange);
    return () => window.removeEventListener("restrictionChanged", handleRestrictionChange);
  }, []);

  if (!token) return null;

  const markPositive = async () => {
    if (!window.confirm("Are you sure you want to mark yourself as COVID Positive?")) return;
    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5000/api/health/report",
        { status: "positive" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Status updated. You are now restricted for 10 days.");
      // 🔔 Trigger banner + navbar refresh instantly
      window.dispatchEvent(new Event("healthStatusUpdated"));
    } catch (err) {
      console.error("Error updating health status:", err);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (restricted) {
    return (
      <button
        className="px-3 py-2 rounded-md bg-gray-400 text-white cursor-not-allowed"
        disabled
      >
        Restricted
      </button>
    );
  }

  return (
    <button
      onClick={markPositive}
      className={`px-3 py-2 rounded-md text-white font-semibold transition ${
        loading ? "bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
      }`}
      disabled={loading}
    >
      {loading ? "Updating..." : "Mark COVID Positive"}
    </button>
  );
}
