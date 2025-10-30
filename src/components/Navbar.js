import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import MarkPositiveButton from "./MarkPositiveButton";
import HealthBanner from "./HealthBanner";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [restriction, setRestriction] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    const handleRestrictionChange = (e) => setRestriction(e.detail);
    window.addEventListener("restrictionChanged", handleRestrictionChange);
    return () => window.removeEventListener("restrictionChanged", handleRestrictionChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    alert("Logged out successfully.");
    navigate("/");
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (!user) navigate("/");
    else if (user.role === "provider") navigate("/add-service");
    else if (user.role === "admin") navigate("/privacy");
    else navigate("/book");
  };

  const isRestricted = restriction && restriction.endDate && new Date(restriction.endDate) > new Date();

  const disabledClass = "opacity-50 cursor-not-allowed pointer-events-none";

  return (
    <>
      <HealthBanner />
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-3">
          <Link
            to="/"
            onClick={handleHomeClick}
            className="font-semibold text-blue-700 hover:text-blue-900"
          >
            Safe Home Services
          </Link>

          <div className="space-x-4 flex items-center">
            {!user && (
              <>
                <Link to="/" className="link">Login</Link>
                <Link to="/register" className="link">Register</Link>
              </>
            )}

            {user && (
              <>
                {/* Customer Links */}
                {user.role === "customer" && (
                  <>
                    <Link
                      to="/book"
                      className={`link ${isRestricted ? disabledClass : ""}`}
                    >
                      Book
                    </Link>
                    <Link
                      to="/my-bookings"
                      className={`link ${isRestricted ? disabledClass : ""}`}
                    >
                      My Bookings
                    </Link>
                  </>
                )}

                {/* Provider Links */}
                {user.role === "provider" && (
                  <>
                    <Link
                      to="/add-service"
                      className={`link ${isRestricted ? disabledClass : ""}`}
                    >
                      Provide
                    </Link>
                    <Link
                      to="/my-services"
                      className={`link ${isRestricted ? disabledClass : ""}`}
                    >
                      My Services
                    </Link>
                    <Link
                      to="/my-customers"
                      className={`link ${isRestricted ? disabledClass : ""}`}
                    >
                      My Customers
                    </Link>
                  </>
                )}

                <Link to="/account" className="link">Account</Link>

                <MarkPositiveButton />
                <button
                  onClick={handleLogout}
                  className="link text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
