import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet";
import {
  toggleWishlistApi,
  fetchWishlist,
  createBooking,
} from "../redux/hotelSlice";
import Navbar from "../components/Navbar";
import "./DetailPage.css";

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.hotels?.currentUser);
  const wishlists = useSelector((state) => state.hotels?.wishlists || {});

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 2,
    rooms: 1,
    phone: "",
  });
  const [bookingError, setBookingError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const isAdmin = currentUser?.role === "admin";
  const userKey = currentUser?.email?.toLowerCase();
  const isWishlisted =
    userKey && hotel ? (wishlists[userKey] || []).includes(hotel.id) : false;

  useEffect(() => {
    fetch(`http://localhost:5000/api/hotels/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Hotel not found");
        return res.json();
      })
      .then((data) => {
        setHotel({
          ...data,
          imageUrl: data.image?.startsWith("/uploads/")
            ? `http://localhost:5000${data.image}`
            : data.image,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));

    if (currentUser?.email && !isAdmin) {
      dispatch(fetchWishlist(currentUser.email));
    }
  }, [id, currentUser, isAdmin, dispatch]);

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleWishlistClick = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    dispatch(
      toggleWishlistApi({ email: currentUser.email, hotelId: hotel.id })
    );
    showNotification(
      isWishlisted ? "Removed from Wishlist" : "Saved to Wishlist ❤️"
    );
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setBookingError("Please select check-in and check-out dates.");
      return;
    }
    if (new Date(bookingData.checkOut) <= new Date(bookingData.checkIn)) {
      setBookingError("Check-out date must be after check-in date.");
      return;
    }
    if (!/^\d{10}$/.test(bookingData.phone)) {
      setBookingError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) /
          (1000 * 60 * 60 * 24)
      )
    );
    const totalPrice = nights * Number(hotel.price) * Number(bookingData.rooms);

    dispatch(
      createBooking({
        id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        hotelId: hotel.id,
        hotelTitle: hotel.title,
        guestName: currentUser.name,
        userEmail: currentUser.email.toLowerCase(),
        phone: bookingData.phone,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: bookingData.guests,
        rooms: bookingData.rooms,
        totalPrice,
        status: "Confirmed",
      })
    );

    setShowBookingModal(false);
    setBookingError("");
    setBookingData({
      checkIn: "",
      checkOut: "",
      guests: 2,
      rooms: 1,
      phone: "",
    });
    showNotification("Booking Confirmed!");
  };

  if (loading) {
    return (
      <div className="detail-page">
        <Navbar />
        <div className="detail-status">Loading property details...</div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="detail-page">
        <Navbar />
        <div className="detail-status">Hotel property not found!</div>
      </div>
    );
  }

  const lat = Number(hotel.latitude) || 11.0168;
  const lng = Number(hotel.longitude) || 76.9558;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="detail-page">
      <Helmet>
        <title>{hotel.title} | HotelSphere</title>
        <meta name="description" content={hotel.description} />
      </Helmet>

      <Navbar />

      {toastMsg && <div className="detail-toast">{toastMsg}</div>}

      <main className="detail-container">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary btn-back"
        >
          ← Back to Hotels
        </button>

        <div className="fade-in detail-card">
          <div className="detail-hero">
            <img
              src={hotel.imageUrl}
              alt={hotel.title}
              className="detail-hero-img"
            />
            <span className="detail-badge">
              ★ {hotel.rating || 4.5} Verified Stay
            </span>
          </div>

          <div className="detail-body">
            <div className="detail-header-row">
              <div>
                <h1 className="detail-title">{hotel.title}</h1>
                <span className="detail-coords">
                  📍 Coordinates: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                </span>
              </div>

              <div className="detail-price-box">
                <div className="detail-price">
                  ₹{Number(hotel.price).toLocaleString()}{" "}
                  <span className="detail-price-unit">/ night</span>
                </div>
                {!isAdmin && (
                  <div className="detail-cta-row">
                    <button
                      type="button"
                      onClick={handleWishlistClick}
                      className={`btn-wishlist ${isWishlisted ? "saved" : ""}`}
                    >
                      {isWishlisted ? "❤️ Saved" : "🤍 Wishlist"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          navigate("/login");
                        } else {
                          setBookingError("");
                          setShowBookingModal(true);
                        }
                      }}
                      className="btn-brand btn-book"
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="detail-desc">{hotel.description}</p>

            <div className="map-section">
              <div className="map-header">
                <h3 className="map-title">
                  🗺️ Property Location & Geolocation
                </h3>
                <p className="map-subtitle">
                  Pinned at Latitude {lat.toFixed(4)}° N, Longitude{" "}
                  {lng.toFixed(4)}° E
                </p>
              </div>

              <div className="map-frame-wrap">
                <iframe
                  title={`Map location of ${hotel.title}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`}
                  className="map-iframe"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {showBookingModal && (
        <div
          className="center-modal-overlay"
          onClick={() => setShowBookingModal(false)}
        >
          <div
            className="center-modal-card booking-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="booking-modal-title">Book {hotel.title}</h3>
            <p className="booking-modal-sub">
              ₹{Number(hotel.price).toLocaleString()} per night • Instant
              confirmation
            </p>

            {bookingError && (
              <div className="booking-error">{bookingError}</div>
            )}

            <form onSubmit={handleConfirmBooking} className="booking-form">
              <div className="booking-grid">
                <div>
                  <label className="booking-label">Check-In</label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={bookingData.checkIn}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        checkIn: e.target.value,
                      })
                    }
                    className="modern-input"
                  />
                </div>
                <div>
                  <label className="booking-label">Check-Out</label>
                  <input
                    type="date"
                    required
                    min={bookingData.checkIn || today}
                    value={bookingData.checkOut}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        checkOut: e.target.value,
                      })
                    }
                    className="modern-input"
                  />
                </div>
              </div>

              <div className="booking-grid">
                <div>
                  <label className="booking-label">Guests</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={bookingData.guests}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        guests: Number(e.target.value),
                      })
                    }
                    className="modern-input"
                  />
                </div>
                <div>
                  <label className="booking-label">Rooms</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={bookingData.rooms}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        rooms: Number(e.target.value),
                      })
                    }
                    className="modern-input"
                  />
                </div>
              </div>

              <div>
                <label className="booking-label">Mobile Number</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                  placeholder="Enter 10-digit mobile number"
                  value={bookingData.phone}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="modern-input"
                />
              </div>

              <div className="booking-modal-actions">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="modal-btn btn-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn btn-modal-confirm"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DetailPage;