import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    alert("Logged out successfully.");
    navigate("/");
  };

  // 🚀 Handle brand click according to user type
  const handleHomeClick = (e) => {
    e.preventDefault(); // stop normal <Link> navigation
    if (!user) {
      navigate("/"); // not logged in → login page
    } else if (user.role === "provider") {
      navigate("/add-service");
    } else if (user.role === "admin") {
      navigate("/privacy");
    } else {
      navigate("/book"); // default customer
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-3">
        {/* Brand logo/name now has dynamic redirect */}
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
              <Link to="/" className="link">Login</Link>
              <Link to="/register" className="link">Register</Link>
            </>
          )}

          {user && (
            <>
              {user && user.role === "customer" && (
                <Link to="/book" className="link">
                  Book
                </Link>)}
              {user && user.role === "customer" && (
                <Link to="/my-bookings" className="link">
                  My Bookings
                </Link>
              )}
              {user.role === "provider" && (
                <Link to="/my-customers" className="link">My Customers</Link>
              )}
              {user.role === "provider" && (
                <Link to="/add-service" className="link">Provide</Link>
              )}
              <Link to="/privacy" className="link">Privacy</Link>
              <Link to="/tracing" className="link">Tracing</Link>
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
  );
}
