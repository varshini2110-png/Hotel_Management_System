import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { toggleWishlistApi, fetchWishlist, createBooking } from '../redux/hotelSlice';
import Navbar from '../components/Navbar';

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
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
    phone: ''
  });
  const [bookingError, setBookingError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const userKey = currentUser?.email?.toLowerCase();
  const isWishlisted = userKey && hotel ? (wishlists[userKey] || []).includes(hotel.id) : false;

  useEffect(() => {
    fetch(`http://localhost:5000/api/hotels/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Hotel not found');
        return res.json();
      })
      .then((data) => {
        setHotel({
          ...data,
          imageUrl: data.image?.startsWith('/uploads/') ? `http://localhost:5000${data.image}` : data.image
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
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleWishlistClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    dispatch(toggleWishlistApi({ email: currentUser.email, hotelId: hotel.id }));
    showNotification(isWishlisted ? 'Removed from Wishlist' : 'Saved to Wishlist ❤️');
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setBookingError('Please select check-in and check-out dates.');
      return;
    }
    if (new Date(bookingData.checkOut) <= new Date(bookingData.checkIn)) {
      setBookingError('Check-out date must be after check-in date.');
      return;
    }
    if (!/^\d{10}$/.test(bookingData.phone)) {
      setBookingError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const nights = Math.max(
      1,
      Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))
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
        status: 'Confirmed'
      })
    );

    setShowBookingModal(false);
    setBookingError('');
    setBookingData({ checkIn: '', checkOut: '', guests: 2, rooms: 1, phone: '' });
    showNotification('Booking Confirmed!');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{ padding: '80px 20px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>
          Loading property details...
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{ padding: '80px 20px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>
          Hotel property not found!
        </div>
      </div>
    );
  }

  const lat = Number(hotel.latitude) || 11.0168;
  const lng = Number(hotel.longitude) || 76.9558;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Helmet>
        <title>{hotel.title} | HotelSphere</title>
        <meta name="description" content={hotel.description} />
      </Helmet>

      <Navbar />

      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '14px 22px',
            borderRadius: '12px',
            zIndex: 3000,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          {toastMsg}
        </div>
      )}

      <main style={{ maxWidth: '1020px', margin: '30px auto', padding: '0 20px 60px' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary"
          style={{ marginBottom: '18px', padding: '8px 16px', fontSize: '0.88rem', backgroundColor: '#ffffff' }}
        >
          ← Back to Hotels
        </button>

        <div
          className="fade-in"
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)'
          }}
        >
          <div style={{ position: 'relative' }}>
            <img
              src={hotel.imageUrl}
              alt={hotel.title}
              style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
            />
            <span
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#ffffff',
                backdropFilter: 'blur(6px)',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              ★ {hotel.rating || 4.5} Verified Stay
            </span>
          </div>

          <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
                  {hotel.title}
                </h1>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                  📍 Coordinates: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0284c7' }}>
                  ₹{Number(hotel.price).toLocaleString()}{' '}
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#64748b' }}>/ night</span>
                </div>
                {!isAdmin && (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleWishlistClick}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        border: isWishlisted ? '1px solid #fecaca' : '1px solid #cbd5e1',
                        background: isWishlisted ? '#fee2e2' : '#ffffff',
                        color: isWishlisted ? '#ef4444' : '#334155',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {isWishlisted ? '❤️ Saved' : '🤍 Wishlist'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) {
                          navigate('/login');
                        } else {
                          setBookingError('');
                          setShowBookingModal(true);
                        }
                      }}
                      className="btn-brand"
                      style={{ padding: '10px 22px' }}
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p
              style={{
                color: '#475569',
                fontSize: '1.02rem',
                lineHeight: '1.75',
                marginTop: '22px',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '22px'
              }}
            >
              {hotel.description}
            </p>

            <div
              style={{
                marginTop: '28px',
                background: '#f8fafc',
                borderRadius: '16px',
                padding: '22px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.18rem', fontWeight: 800, color: '#0f172a' }}>
                  🗺️ Property Location & Geolocation
                </h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b', fontWeight: 600 }}>
                  Pinned at Latitude {lat.toFixed(4)}° N, Longitude {lng.toFixed(4)}° E
                </p>
              </div>

              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', height: '330px' }}>
                <iframe
                  title={`Map location of ${hotel.title}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`}
                  style={{ border: 0 }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {showBookingModal && (
        <div className="center-modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div
            className="center-modal-card"
            style={{ textAlign: 'left', maxWidth: '450px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              Book {hotel.title}
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: '0.88rem', color: '#64748b' }}>
              ₹{Number(hotel.price).toLocaleString()} per night • Instant confirmation
            </p>

            {bookingError && (
              <div
                style={{
                  background: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  marginBottom: '12px'
                }}
              >
                {bookingError}
              </div>
            )}

            <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Check-In
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    className="modern-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Check-Out
                  </label>
                  <input
                    type="date"
                    required
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    className="modern-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={bookingData.guests}
                    onChange={(e) => setBookingData({ ...bookingData, guests: Number(e.target.value) })}
                    className="modern-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Rooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={bookingData.rooms}
                    onChange={(e) => setBookingData({ ...bookingData, rooms: Number(e.target.value) })}
                    className="modern-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                  placeholder="Enter 10-digit mobile number"
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value.replace(/\D/g, '') })}
                  className="modern-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="modal-btn"
                  style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn"
                  style={{ background: '#0284c7', color: '#ffffff' }}
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