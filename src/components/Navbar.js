import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [restriction, setRestriction] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      fetchRestriction(parsed);
    }
  }, []);

  const fetchRestriction = async (parsedUser) => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/user/profile", {
        headers: { Authorization: `Bearer ${parsedUser.token}` },
      });
      if (
        data.healthStatus === "exposed" &&
        data.restrictedUntil &&
        new Date(data.restrictedUntil) > new Date()
      ) {
        const remainingDays = Math.ceil(
          (new Date(data.restrictedUntil) - new Date()) / (1000 * 60 * 60 * 24)
        );
        setRestriction({
          remainingDays,
          until: new Date(data.restrictedUntil).toDateString(),
          role: data.role,
        });
      } else {
        setRestriction(null);
      }
    } catch (err) {
      console.warn("Could not fetch restriction info");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    alert("Logged out successfully.");
    navigate("/");
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/");
    } else if (user.role === "provider") {
      navigate("/add-service");
    } else if (user.role === "admin") {
      navigate("/privacy");
    } else {
      navigate("/book");
    }
  };

  return (
    <>
      {restriction && (
        <div className="bg-yellow-100 border-b border-yellow-200 text-center py-2 text-sm font-medium text-black ">
          {restriction.role === "provider"
            ? `🕒 ${restriction.remainingDays} day(s) left until you can provide or view customers again. (Ends: ${restriction.until})`
            : `🕒 ${restriction.remainingDays} day(s) left until you can book or view bookings again. (Ends: ${restriction.until})`}
        </div>
      )}

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-3">
          <Link
            to="/"
            onClick={handleHomeClick}
            className="font-semibold text-blue-700 hover:text-blue-900"
          >
            Safe Home Services
          </Link>

          <div className="space-x-4">
            {!user && (
              <>
                <Link to="/" className="link">
                  Login
                </Link>
                <Link to="/register" className="link">
                  Register
                </Link>
              </>
            )}

            {user && (
              <>

                {user.role === "customer" && (
                  <>
                    <Link
                      to="/book"
                      className={`link ${restriction ? "opacity-50 pointer-events-none" : ""
                        }`}
                    >
                      Book
                    </Link>
                    <Link
                      to="/my-bookings"
                      className={`link ${restriction ? "opacity-50 pointer-events-none" : ""
                        }`}
                    >
                      My Bookings
                    </Link>
                  </>
                )}


                {user.role === "provider" && (
                  <>
                    <Link
                      to="/my-customers"
                      className={`link ${restriction ? "opacity-50 pointer-events-none" : ""
                        }`}
                    >
                      My Customers
                    </Link>
                    <Link
                      to="/add-service"
                      className={`link ${restriction ? "opacity-50 pointer-events-none" : ""
                        }`}
                    >
                      Services
                    </Link>
                  </>
                )}


                <Link to="/privacy" className="link">
                  Privacy
                </Link>
                <Link to="/tracing" className="link">
                  Tracing
                </Link>
                <button
                  onClick={handleLogout}
                  className="link text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </>
            )}
            {user && (
              <button
                onClick={async () => {
                  const current = user.healthStatus || "healthy";
                  const next = current === "healthy" ? "exposed" : "healthy";

                  const confirmMsg =
                    next === "exposed"
                      ? "⚠️ Are you sure you want to mark yourself as COVID Positive?\nThis will restrict your access temporarily."
                      : "✅ Mark yourself as healthy again?";

                  if (!window.confirm(confirmMsg)) return;

                  try {
                    const res = await axios.put(
                      "http://localhost:5000/api/health/update",
                      { healthStatus: next },
                      { headers: { Authorization: `Bearer ${user.token}` } }
                    );

                    alert(`Health status updated to ${next.toUpperCase()}`);
                    localStorage.setItem("user", JSON.stringify(res.data.user));
                    setUser(res.data.user);
                  } catch (err) {
                    alert("Failed to update health status.");
                  }
                }}
                className={`ml-2 px-3 py-1 rounded text-sm font-medium ${user.healthStatus === "exposed"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                {user.healthStatus === "exposed" ? "Mark Healthy" : "Tested Positive"}
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
