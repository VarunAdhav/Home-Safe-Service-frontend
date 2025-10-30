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

        if (data?.restrictedUntil) {
          const endDate = new Date(data.restrictedUntil);
          const now = new Date();
          if (endDate > now) {
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
            return;
          }
        }

        // No restriction or expired restriction
        setRestriction(null);
        window.dispatchEvent(new CustomEvent("restrictionChanged", { detail: null }));
      } catch (err) {
        console.error("Error fetching health restriction:", err);
      }
    };

    fetchProfile();

    // Refresh immediately when status is updated elsewhere
    window.addEventListener("healthStatusUpdated", fetchProfile);

    return () => window.removeEventListener("healthStatusUpdated", fetchProfile);
  }, [token]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("restrictionChanged", { detail: restriction })
    );
  }, [restriction]);

  if (!restriction) return null;

  const formattedDate = restriction.endDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const isPositive = restriction.healthStatus === "positive";
  const colorClass = isPositive ? "bg-red-600" : "bg-yellow-500";

  return (
    <div className={`sticky top-0 z-50 ${colorClass} text-white text-sm text-center py-2 shadow-md`}>
      ⚠️ You are {isPositive ? "COVID Positive" : "Exposed"} and restricted until{" "}
      <b>{formattedDate}</b>.{" "}
      {restriction.role === "provider"
        ? "You cannot provide or view customers during this period."
        : "You cannot book or view services during this period."}
    </div>
  );
}
