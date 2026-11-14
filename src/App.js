import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ListPage from "./pages/ListPage";
import DetailPage from "./pages/DetailPage";
import ManagePage from "./pages/ManagePage";
import AdminDashboard from "./pages/AdminDashboard";
import MyBookingsPage from "./pages/MyBookingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import WishlistPage from "./pages/WishlistPage";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/add-hotel") ||
    location.pathname.startsWith("/edit-hotel");

  return (
    <>
      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/hotel/:id" element={<DetailPage />} />
        <Route path="/add-hotel" element={<ManagePage />} />
        <Route path="/edit-hotel/:id" element={<ManagePage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
      </Routes>
      {!isAdminPage && <Footer />}
    </>
  );
}

export default App;
