import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import BookService from "./pages/BookService";
import AddService from "./pages/AddService";
import PrivacyDashboard from "./pages/PrivacyDashboard";
import Tracing from "./pages/Tracing";
import Navbar from "./components/Navbar";
import MyBookings from "./pages/MyBookings";
import MyCustomers from "./pages/MyCustomers";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book" element={<BookService />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/add-service" element={<AddService />} />
          <Route path="/privacy" element={<PrivacyDashboard />} />
          <Route path="/tracing" element={<Tracing />} />
          <Route path="/my-customers" element={<MyCustomers />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
