import { useEffect, useState } from "react";
import axios from "axios";

export default function HealthBanner() {
  const [restriction, setRestriction] = useState(null);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = user?.token;

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

          if (data?.healthStatus && data.healthStatus !== "healthy") {
          const now = new Date();
            const endDate = data.restrictedUntil ? new Date(data.restrictedUntil) : null;
            if (endDate && endDate > now) {
            const restrictionData = {
              role: data.role,
              healthStatus: data.healthStatus,
              exposureDegree: data.exposureDegree || 0,
              endDate,
            };
            setRestriction(restrictionData);
            window.dispatchEvent(
              new CustomEvent("restrictionChanged", { detail: restrictionData })
            );
          }
        } else {
            setRestriction(null);
            window.dispatchEvent(new CustomEvent("restrictionChanged", { detail: null }));
        }
      } catch (err) {
        console.error("Error fetching health restriction:", err);
      }
    };

      fetchProfile();
      window.addEventListener("healthStatusUpdated", fetchProfile);
    return () => window.removeEventListener("healthStatusUpdated", fetchProfile);
  }, [token]);

    // Keep Navbar synced
  useEffect(() => {
      window.dispatchEvent(new CustomEvent("restrictionChanged", { detail: restriction }));
  }, [restriction]);

  if (!restriction) return null;

    const { healthStatus, exposureDegree, endDate } = restriction;

    const formattedDate = endDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

    // Decide banner color and text
    const isPositive = healthStatus === "positive";
    const isDirectExposure = healthStatus === "exposed" && exposureDegree === 1;
    const isIndirectExposure = healthStatus === "exposed" && exposureDegree === 2;

  const colorClass = isPositive ? "bg-red-600" : "bg-yellow-500";

    // Determine restriction days (for display only)
    const days =
        isPositive || isDirectExposure
            ? 10
            : isIndirectExposure
                ? 2
                : 0;

    let message = "";

    if (isPositive) {
        message = `🦠 You are COVID Positive and restricted for ${days} days until ${formattedDate}. Please isolate and follow health guidelines.`;
    } else if (isDirectExposure) {
        message = `⚠️ You were directly exposed to a COVID-positive individual. You are restricted for ${days} days until ${formattedDate}. Please get tested immediately.`;
    } else if (isIndirectExposure) {
        message = `⚠️ You were indirectly exposed (through contact with another exposed person). You are restricted for ${days} days until ${formattedDate}. Please monitor for symptoms and get tested.`;
    }

    const actionMsg =
        restriction.role === "provider"
            ? "You cannot provide or view customers during this period."
            : "You cannot book or view services during this period.";

  return (
      <div className={`sticky top-0 z-50 ${colorClass} text-white text-sm text-center py-3 shadow-md`}>
          <p className="max-w-3xl mx-auto px-4 leading-snug">
              {message} <br />
              <span className="font-semibold">{actionMsg}</span>
          </p>
    </div>
  );
}
