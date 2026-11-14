import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  fetchHotels,
  deleteHotel,
  toggleWishlistApi,
  createBooking,
} from "../redux/hotelSlice";
import Navbar from "../components/Navbar";
import HotelCard from "../components/HotelCard";
import Pagination from "../components/Pagination";
import "./ListPage.css";

const DESTINATIONS = [
  {
    name: "Goa",
    stays: "140+ Luxury Villas",
    img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Jaipur",
    stays: "85+ Heritage Palaces",
    img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Manali",
    stays: "60+ Mountain Cabins",
    img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Alleppey",
    stays: "45+ Backwater Cottages",
    img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80",
  },
];

const INITIAL_BOOKING = {
  checkIn: "2026-12-01",
  checkOut: "2026-12-04",
  guests: 2,
  rooms: 1,
  phone: "",
};

function ListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    currentUser,
    hotelList: hotels = [],
    totalPages = 1,
    totalHotels = 0,
    wishlists = {},
  } = useSelector((state) => state.hotels || {});

  const isLoggedIn = Boolean(currentUser?.name);
  const isAdmin = currentUser?.role === "admin";
  const userWishlist =
    !isAdmin && currentUser?.email
      ? wishlists[currentUser.email.toLowerCase()] || []
      : [];

  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [bookingHotel, setBookingHotel] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingData, setBookingData] = useState(INITIAL_BOOKING);
  const [bookingError, setBookingError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    dispatch(fetchHotels({ ...filters, page: currentPage, limit: 4 }));
  }, [dispatch, filters, currentPage]);

  const showToast = (msg, duration = 3000) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), duration);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({ search: "", minPrice: "", maxPrice: "" });
    setCurrentPage(1);
  };

  const confirmDelete = async () => {
    if (!hotelToDelete) return;
    try {
      await dispatch(deleteHotel(hotelToDelete.id)).unwrap();
      setHotelToDelete(null);
      await dispatch(fetchHotels({ ...filters, page: currentPage, limit: 4 }));
      showToast("Hotel removed successfully!");
    } catch {
      setHotelToDelete(null);
      showToast("Failed to remove hotel.");
    }
  };

  const handleBookClick = (hotel) => {
    if (!isLoggedIn) return setShowLoginModal(true);
    setBookingError("");
    setBookingHotel(hotel);
  };

  const handleWishlistToggle = (e, hotelId) => {
    e.stopPropagation();
    if (!isLoggedIn) return setShowLoginModal(true);
    dispatch(toggleWishlistApi({ email: currentUser.email, hotelId }));
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleConfirmBooking = () => {
    if (!bookingHotel) return;
    const { checkIn, checkOut, guests, rooms, phone } = bookingData;

    if (!checkIn || !checkOut) {
      return setBookingError(
        "Please select valid check-in and check-out dates."
      );
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      return setBookingError("Check-out date must be after check-in date.");
    }
    if (!/^\d{10}$/.test(phone)) {
      return setBookingError("Please enter a valid 10-digit mobile number.");
    }

    const numericGuests = Number(guests) || 1;
    const numericRooms = Number(rooms) || 1;
    const nights = Math.max(
      1,
      Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000) || 1
    );
    const totalPrice = Number(bookingHotel.price) * nights * numericRooms;

    dispatch(
      createBooking({
        id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        hotelId: bookingHotel.id,
        hotelTitle: bookingHotel.title,
        guestName: currentUser?.name || "Customer",
        userEmail: currentUser?.email?.toLowerCase(),
        phone,
        checkIn,
        checkOut,
        guests: numericGuests,
        rooms: numericRooms,
        totalPrice,
        status: "Confirmed",
      })
    );

    const reservedTitle = bookingHotel.title;
    setBookingHotel(null);
    setBookingError("");
    showToast(
      `Reservation Confirmed for ${reservedTitle}! Total: ₹${totalPrice.toLocaleString()}`,
      4000
    );
  };

  return (
    <div className="list-page">
      <Helmet>
        <title>HotelSphere | Luxury Hotels, Stays & Booking</title>
        <meta
          name="description"
          content="Explore handpicked luxury hotels, boutique villas, and resorts across India with instant booking on HotelSphere."
        />
      </Helmet>

      <Navbar />

      {toastMsg && <div className="list-toast">{toastMsg}</div>}

      <main className="list-container">
        <section className="hero-banner">
          <div className="hero-overlay">
            <span className="badge-anim hero-badge">
              LUXURY HOSPITALITY & EXPERIENCES
            </span>
            <h1 className="hero-title">Find Your Perfect Sanctuary</h1>
            <p className="hero-subtitle">
              Handpicked boutique villas, beachside resorts, and mountain
              hideaways with verified locations and instant booking.
            </p>
          </div>
        </section>

        <section className="filter-bar">
          <div className="filter-group title-group">
            <span className="filter-label">PROPERTY / TITLE</span>
            <input
              type="text"
              placeholder="Search hotel name..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-divider" />
          <div className="filter-group">
            <span className="filter-label">MIN BUDGET (₹)</span>
            <input
              type="number"
              min="0"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => updateFilter("minPrice", e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-divider" />
          <div className="filter-group">
            <span className="filter-label">MAX BUDGET (₹)</span>
            <input
              type="number"
              min="0"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => updateFilter("maxPrice", e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-actions">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="btn-search"
            >
              SEARCH
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-reset"
            >
              Reset Filters
            </button>
          </div>
        </section>

        <section className="list-section">
          <div className="section-header">
            <h2 className="section-title">Top Travel Destinations</h2>
            <p className="section-subtitle">
              Explore trending locations across India with premier hospitality
            </p>
          </div>
          <div className="dest-grid">
            {DESTINATIONS.map((dest) => (
              <div
                key={dest.name}
                className="dest-card"
                onClick={() => updateFilter("search", dest.name)}
              >
                <img src={dest.img} alt={dest.name} />
                <div className="dest-overlay">
                  <h4 className="dest-name">{dest.name}</h4>
                  <span className="dest-stays">{dest.stays}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="list-section">
          <div className="featured-bar">
            <div>
              <h2 className="featured-title">
                Featured Accommodations ({totalHotels})
              </h2>
              <span className="featured-count">
                Showing page {currentPage} of {totalPages}
              </span>
            </div>
            {isAdmin && (
              <span className="admin-badge">
                Admin Mode: Edit / Delete Enabled
              </span>
            )}
          </div>

          {hotels.length > 0 ? (
            <div className="hotels-stack">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                  isAdmin={isAdmin}
                  isWishlisted={userWishlist.includes(hotel.id)}
                  onWishlistToggle={handleWishlistToggle}
                  onBookClick={handleBookClick}
                  onDeleteClick={setHotelToDelete}
                />
              ))}
            </div>
          ) : (
            <div className="empty-hotels">
              <h3 className="empty-hotels-title">
                No hotels found matching your search
              </h3>
              <p className="empty-hotels-text">
                Adjust your budget filters or search keyword.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-brand"
              >
                Clear Filters
              </button>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </main>

      {showLoginModal && (
        <div
          className="center-modal-overlay"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="center-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon info">🔒</div>
            <h3 className="modal-heading">Login Required</h3>
            <p className="modal-body-text">
              Please log in or create an account to continue with your wishlist
              and reservations.
            </p>
            <div className="modal-actions-center">
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="modal-btn btn-modal-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="modal-btn btn-modal-primary"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="modal-btn btn-modal-dark"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      )}

      {bookingHotel && (
        <div
          className="center-modal-overlay"
          onClick={() => setBookingHotel(null)}
        >
          <div
            className="center-modal-card reserve-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-heading">Reserve {bookingHotel.title}</h3>
            <p className="reserve-modal-sub">
              ₹{Number(bookingHotel.price).toLocaleString()} / night • Select
              dates & party size
            </p>

            {bookingError && (
              <div className="booking-error">{bookingError}</div>
            )}

            <div className="booking-fields">
              <div>
                <label className="field-label">Check-in Date</label>
                <input
                  type="date"
                  value={bookingData.checkIn}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, checkIn: e.target.value })
                  }
                  className="modern-input"
                />
              </div>
              <div>
                <label className="field-label">Check-out Date</label>
                <input
                  type="date"
                  value={bookingData.checkOut}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, checkOut: e.target.value })
                  }
                  className="modern-input"
                />
              </div>
              <div className="booking-grid">
                <div>
                  <label className="field-label">Guests</label>
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
                  <label className="field-label">Rooms</label>
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
                <label className="field-label">Mobile Number</label>
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
            </div>

            <div className="modal-actions-right">
              <button
                type="button"
                onClick={() => setBookingHotel(null)}
                className="modal-btn btn-modal-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="modal-btn btn-modal-success"
              >
                Confirm Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {hotelToDelete && (
        <div
          className="center-modal-overlay"
          onClick={() => setHotelToDelete(null)}
        >
          <div
            className="center-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon danger">!</div>
            <h3 className="modal-heading">Confirm Property Deletion</h3>
            <p className="modal-body-text">
              Are you sure you want to delete{" "}
              <strong>{hotelToDelete.title}</strong>? This action cannot be
              undone.
            </p>
            <div className="modal-actions-center">
              <button
                type="button"
                onClick={() => setHotelToDelete(null)}
                className="modal-btn btn-modal-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="modal-btn btn-modal-danger"
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

export default ListPage;