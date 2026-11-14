import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { fetchHotels, deleteHotel } from "../redux/hotelSlice";
import Navbar from "../components/Navbar";
import "./AdminDashboard.css";

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const hotels = useSelector((state) => state.hotels?.hotelList || []);
  const totalHotels = useSelector(
    (state) => state.hotels?.totalHotels || hotels.length
  );

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [deletingHotel, setDeletingHotel] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const loadAllBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch("http://localhost:5000/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchHotels({ limit: 100 }));
    loadAllBookings();
  }, [dispatch, loadAllBookings]);

  const handleDeleteConfirm = async () => {
    if (!deletingHotel) return;
    try {
      await dispatch(deleteHotel(deletingHotel.id)).unwrap();
      dispatch(fetchHotels({ limit: 100 }));
      showToast(`Deleted "${deletingHotel.title}" successfully.`);
      setDeletingHotel(null);
    } catch {
      showToast("Failed to delete property.");
    }
  };

  const activeBookings = bookings.filter(
    (b) => (b.status || "Confirmed") !== "Cancelled"
  );
  const totalRevenue = activeBookings.reduce(
    (sum, b) => sum + Number(b.total_price || b.totalPrice || 0),
    0
  );

  return (
    <div className="admin-page">
      <Helmet>
        <title>Admin Dashboard | HotelSphere</title>
      </Helmet>

      <Navbar />

      {toastMsg && <div className="admin-toast">{toastMsg}</div>}

      <main className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Admin Control Center</h1>
          <div className="admin-actions">
            <button
              type="button"
              onClick={loadAllBookings}
              className="btn-secondary btn-refresh"
            >
              ↻ Refresh Data
            </button>
            <button
              type="button"
              onClick={() =>
                navigate("/add-hotel", { state: { returnTo: "/admin" } })
              }
              className="btn-brand"
            >
              + Add New Hotel
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">TOTAL PROPERTIES</span>
            <div className="stat-value">{totalHotels}</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">TOTAL BOOKINGS</span>
            <div className="stat-value blue">{activeBookings.length}</div>
          </div>
          <div className="stat-card">
            <span className="stat-label">TOTAL BOOKING VALUE</span>
            <div className="stat-value green">
              ₹{totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="tab-bar">
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`}
          >
            Customer Bookings ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hotels")}
            className={`tab-btn ${activeTab === "hotels" ? "active" : ""}`}
          >
            Manage Hotels ({totalHotels})
          </button>
        </div>

        {activeTab === "bookings" && (
          <div className="table-card">
            {loadingBookings ? (
              <div className="empty-state">
                Loading live customer bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">No customer bookings yet.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>BOOKING ID</th>
                    <th>GUEST & CONTACT</th>
                    <th>HOTEL</th>
                    <th>STAY DATES</th>
                    <th>ROOMS / GUESTS</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="booking-id">{b.id}</td>
                      <td>
                        <strong className="guest-name">
                          {b.guest_name || b.guestName}
                        </strong>
                        <span className="guest-email">
                          {b.user_email || b.userEmail}
                        </span>
                        {b.phone && (
                          <span className="guest-phone">📞 +91 {b.phone}</span>
                        )}
                      </td>
                      <td className="hotel-col-title">
                        {b.hotel_title || b.hotelTitle}
                      </td>
                      <td>
                        {(b.check_in || b.checkIn || "").slice(0, 10)} →{" "}
                        {(b.check_out || b.checkOut || "").slice(0, 10)}
                      </td>
                      <td>
                        {b.rooms} Room(s), {b.guests} Guest(s)
                      </td>
                      <td className="amount-cell">
                        ₹{Number(b.total_price || b.totalPrice).toLocaleString()}
                      </td>
                      <td>
                        <span className="status-pill">
                          {b.status || "Confirmed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === "hotels" && (
          <div className="table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>HOTEL</th>
                  <th>PRICE</th>
                  <th>COORDINATES</th>
                  <th className="actions-cell">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => {
                  const rawImg = hotel.imageUrl || hotel.image || "";
                  const imgSrc = rawImg.startsWith("/uploads/")
                    ? `http://localhost:5000${rawImg}`
                    : rawImg;

                  return (
                    <tr key={hotel.id}>
                      <td>
                        <div className="hotel-info-cell">
                          <img
                            src={imgSrc}
                            alt={hotel.title}
                            className="hotel-thumb"
                          />
                          <div>
                            <strong className="guest-name">
                              {hotel.title}
                            </strong>
                            <span className="hotel-desc-snippet">
                              {hotel.description
                                ? `${hotel.description.slice(0, 55)}...`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="price-cell">
                        ₹{Number(hotel.price).toLocaleString()}
                      </td>
                      <td className="coords-cell">
                        {hotel.latitude}, {hotel.longitude}
                      </td>
                      <td className="actions-cell">
                        <button
                          type="button"
                          className="btn-edit"
                          onClick={() =>
                            navigate(`/edit-hotel/${hotel.id}`, {
                              state: { returnTo: "/admin" },
                            })
                          }
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-delete"
                          onClick={() => setDeletingHotel(hotel)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {deletingHotel && (
        <div
          className="center-modal-overlay"
          onClick={() => setDeletingHotel(null)}
        >
          <div
            className="center-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-icon">!</div>
            <h3 className="modal-heading">Delete Hotel Property</h3>
            <p className="modal-text">
              Are you sure you want to permanently remove{" "}
              <strong>{deletingHotel.title}</strong>?
            </p>
            <div className="modal-btn-row">
              <button
                type="button"
                onClick={() => setDeletingHotel(null)}
                className="modal-btn btn-cancel-modal"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="modal-btn btn-confirm-delete"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;