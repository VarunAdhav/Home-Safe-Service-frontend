import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react"; // 👁️ lightweight icon library

export default function AccountSettings() {
  const [user, setUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", address: "", phoneNumber: "" });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [message, setMessage] = useState("");
  const token = JSON.parse(localStorage.getItem("user") || "{}")?.token;

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data);
        setEditForm({
          name: data.name,
          email: data.email,
          address: data.address || "",
          phoneNumber: data.phoneNumber || "",
        });
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    })();
  }, [token]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const { data } = await axios.put(
        "http://localhost:5000/api/user/update",
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated successfully!");
      setUser(data.user);
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword)
      return setMessage("New passwords do not match.");
    if (newPassword.length < 8)
      return setMessage("Password must be at least 8 characters long.");

    try {
      await axios.put(
        "http://localhost:5000/api/user/change-password",
        passwordForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Password changed successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Error changing password:", err);
      setMessage(err.response?.data?.message || "Failed to change password.");
    }
  };

  if (!user) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Account Settings</h2>

      {message && (
        <div className="bg-blue-100 text-blue-800 border border-blue-300 rounded p-2 mb-3 text-sm">
          {message}
        </div>
      )}

      {/* 🔹 Update Profile Section */}
      <form onSubmit={handleProfileUpdate} className="space-y-3 mb-6">
        <h3 className="text-lg font-semibold mb-2">Update Profile</h3>
        <input
          type="text"
          name="name"
          value={editForm.name}
          onChange={handleEditChange}
          placeholder="Full Name"
          className="input w-full"
          required
        />
        <input
          type="email"
          name="email"
          value={editForm.email}
          onChange={handleEditChange}
          placeholder="Email"
          className="input w-full"
          required
        />
        <input
          type="text"
          name="address"
          value={editForm.address}
          onChange={handleEditChange}
          placeholder="Address"
          className="input w-full"
          required
        />
        <input
          type="text"
          name="phoneNumber"
          value={editForm.phoneNumber}
          onChange={handleEditChange}
          placeholder="Phone Number"
          className="input w-full"
          required
        />
        <button
          type="submit"
          className="btn bg-blue-600 hover:bg-blue-700 text-white w-full"
        >
          Save Changes
        </button>
      </form>

      {/* 🔹 Change Password Section */}
      <form onSubmit={handlePasswordUpdate} className="space-y-3">
        <h3 className="text-lg font-semibold mb-2">Change Password</h3>

        {["oldPassword", "newPassword", "confirmPassword"].map((field, idx) => {
          const labels = {
            oldPassword: "Current Password",
            newPassword: "New Password",
            confirmPassword: "Confirm New Password",
          };

          const fieldKey = field.includes("old")
            ? "old"
            : field.includes("confirm")
            ? "confirm"
            : "new";

          return (
            <div key={idx} className="relative">
              <input
                type={showPassword[fieldKey] ? "text" : "password"}
                name={field}
                value={passwordForm[field]}
                onChange={handlePasswordChange}
                placeholder={labels[field]}
                className="input w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => togglePassword(fieldKey)}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                aria-label="Toggle password visibility"
              >
                {showPassword[fieldKey] ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          );
        })}

        <button
          type="submit"
          className="btn bg-green-600 hover:bg-green-700 text-white w-full"
        >
          Change Password
        </button>
      </form>
    </div>
  );
}
