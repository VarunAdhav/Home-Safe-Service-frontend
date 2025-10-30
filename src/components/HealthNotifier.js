import toast from "react-hot-toast";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

export default function HealthNotifier() {
  const [restriction, setRestriction] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;
  const toastIdRef = useRef(null);

  // helper: fetch restriction info from profile
  const fetchRestriction = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.restrictedUntil) {
        const endDate = new Date(data.restrictedUntil);
        const remaining = Math.max(
          0,
          Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))
        );
        setRestriction({
          role: data.role,
          endDate,
          remainingDays: remaining,
          exposureDegree: data.exposureDegree || 0,
          healthStatus: data.healthStatus, // may be "positive" or "exposed"
        });
      } else {
        setRestriction(null);
      }
    } catch (err) {
      console.error("Error fetching restriction:", err);
    }
  };

  // 1️⃣ Fetch once on mount
  useEffect(() => {
    fetchRestriction();
  }, [token]);

  // 2️⃣ Listen for custom event (triggered right after “Tested Positive” click)
  useEffect(() => {
    const handleHealthUpdate = () => {
      console.log("[HealthNotifier] healthStatusUpdated event received");
      fetchRestriction();
    };
    window.addEventListener("healthStatusUpdated", handleHealthUpdate);
    return () => window.removeEventListener("healthStatusUpdated", handleHealthUpdate);
  }, [token]);

  // 3️⃣ Recalculate remaining days every 60 s
  useEffect(() => {
    if (!restriction) return;
    const t = setInterval(() => {
      setRestriction((prev) => {
        if (!prev) return prev;
        const remaining = Math.max(
          0,
          Math.ceil((prev.endDate - new Date()) / (1000 * 60 * 60 * 24))
        );
        return { ...prev, remainingDays: remaining };
      });
    }, 60000);
    return () => clearInterval(t);
  }, [restriction]);

  // 4️⃣ Toast notification
  useEffect(() => {
    if (!restriction) {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      return;
    }

    const actionMsg =
      restriction.role === "provider"
        ? "until you can provide or view customers again."
        : "until you can book or view bookings again.";

    const exposureMsg =
      restriction.exposureDegree > 0
        ? "⚠️ First-degree exposure detected in the last 2 days. "
        : "";

    // Message varies with backend healthStatus
    const statusLabel =
      restriction.healthStatus === "exposed"
        ? "Exposed contact. Temporarily Restricted."
        : restriction.healthStatus === "positive"
        ? "Marked Positive."
        : "Temporarily Restricted.";

    if (toastIdRef.current) toast.dismiss(toastIdRef.current);

    toastIdRef.current = toast.custom((t) => (
      <div className="rounded-xl shadow-lg border border-slate-200 bg-white px-4 py-3 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-lg">🕒</div>
          <div className="flex-1">
            <p className="font-medium">
              {exposureMsg}
              {statusLabel}
            </p>
            <p className="text-sm text-slate-600">
              {restriction.remainingDays} day(s) left {actionMsg}
            </p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50"
            aria-label="Dismiss"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    ));

    return () => {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    };
  }, [restriction]);

  return null;
}
