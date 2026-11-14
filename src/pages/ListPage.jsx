import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { fetchHotels, deleteHotel, toggleWishlistApi, createBooking } from '../redux/hotelSlice';
import Navbar from '../components/Navbar';
import HotelCard from '../components/HotelCard';
import Pagination from '../components/Pagination';

const DESTINATIONS = [
  { name: 'Goa', stays: '140+ Luxury Villas', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80' },
  { name: 'Jaipur', stays: '85+ Heritage Palaces', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80' },
  { name: 'Manali', stays: '60+ Mountain Cabins', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80' },
  { name: 'Alleppey', stays: '45+ Backwater Cottages', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80' }
];

const INITIAL_BOOKING = { checkIn: '2026-12-01', checkOut: '2026-12-04', guests: 2, rooms: 1, phone: '' };

const s = {
  filterGroup: { flex: '1 1 140px', display: 'flex', flexDirection: 'column' },
  filterLabel: { fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' },
  filterInput: { border: 'none', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', padding: '4px 0' },
  divider: { width: '1px', height: '36px', backgroundColor: '#e2e8f0' },
  fieldLabel: { display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '4px' },
  btnCancel: { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' },
  modalIcon: { width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '1.35rem', fontWeight: 'bold' }
};

function ListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser, hotelList: hotels = [], totalPages = 1, totalHotels = 0, wishlists = {} } = useSelector((state) => state.hotels || {});
  const isLoggedIn = Boolean(currentUser?.name);
  const isAdmin = currentUser?.role === 'admin';
  const userWishlist = !isAdmin && currentUser?.email ? wishlists[currentUser.email.toLowerCase()] || [] : [];

  const [filters, setFilters] = useState({ search: '', minPrice: '', maxPrice: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [hotelToDelete, setHotelToDelete] = useState(null);
  const [bookingHotel, setBookingHotel] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookingData, setBookingData] = useState(INITIAL_BOOKING);
  const [bookingError, setBookingError] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    dispatch(fetchHotels({ ...filters, page: currentPage, limit: 4 }));
  }, [dispatch, filters, currentPage]);

  const showToast = (msg, duration = 3000) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), duration);
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({ search: '', minPrice: '', maxPrice: '' });
    setCurrentPage(1);
  };

  const confirmDelete = async () => {
    if (!hotelToDelete) return;
    try {
      await dispatch(deleteHotel(hotelToDelete.id)).unwrap();
      setHotelToDelete(null);
      await dispatch(fetchHotels({ ...filters, page: currentPage, limit: 4 }));
      showToast('Hotel removed successfully!');
    } catch (err) {
      setHotelToDelete(null);
      showToast('Failed to remove hotel.');
    }
  };

  const handleBookClick = (hotel) => {
    if (!isLoggedIn) return setShowLoginModal(true);
    setBookingError('');
    setBookingHotel(hotel);
  };

  const handleWishlistToggle = (e, hotelId) => {
    e.stopPropagation();
    if (!isLoggedIn) return setShowLoginModal(true);
    dispatch(toggleWishlistApi({ email: currentUser.email, hotelId }));
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleConfirmBooking = () => {
    if (!bookingHotel) return;
    const { checkIn, checkOut, guests, rooms, phone } = bookingData;

    if (!checkIn || !checkOut) return setBookingError('Please select valid check-in and check-out dates.');
    if (new Date(checkOut) <= new Date(checkIn)) return setBookingError('Check-out date must be after check-in date.');
    if (!/^\d{10}$/.test(phone)) return setBookingError('Please enter a valid 10-digit mobile number.');

    const numericGuests = Number(guests) || 1;
    const numericRooms = Number(rooms) || 1;
    const nights = Math.max(1, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000) || 1);
    const totalPrice = Number(bookingHotel.price) * nights * numericRooms;

    dispatch(createBooking({
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      hotelId: bookingHotel.id,
      hotelTitle: bookingHotel.title,
      guestName: currentUser?.name || 'Customer',
      userEmail: currentUser?.email?.toLowerCase(),
      phone,
      checkIn,
      checkOut,
      guests: numericGuests,
      rooms: numericRooms,
      totalPrice,
      status: 'Confirmed'
    }));

    const reservedTitle = bookingHotel.title;
    setBookingHotel(null);
    setBookingError('');
    showToast(`Reservation Confirmed for ${reservedTitle}! Total: ₹${totalPrice.toLocaleString()}`, 4000);
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', overflowX: 'hidden' }}>
      <Helmet>
        <title>HotelSphere | Luxury Hotels, Stays & Booking</title>
        <meta name="description" content="Explore handpicked luxury hotels, boutique villas, and resorts across India with instant booking on HotelSphere." />
      </Helmet>

      <Navbar />

      {toastMsg && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0f172a', color: '#ffffff', padding: '14px 22px', borderRadius: '12px', zIndex: 3000, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.22)', fontWeight: 600, fontSize: '0.9rem' }}>
          {toastMsg}
        </div>
      )}

      <main style={{ maxWidth: '1240px', margin: '24px auto 60px', padding: '0 20px' }}>
        <section
          className="hero-banner"
          style={{
            position: 'relative', minHeight: '340px', borderRadius: '24px', overflow: 'hidden',
            backgroundImage: 'url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1800&q=80")',
            backgroundSize: 'cover', backgroundPosition: 'center 40%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.25)'
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.32) 0%, rgba(15,23,42,0.86) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '24px', color: '#ffffff' }}>
            <span className="badge-anim" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(8px)', padding: '5px 16px', borderRadius: '50px', marginBottom: '12px' }}>
              LUXURY HOSPITALITY & EXPERIENCES
            </span>
            <h1 style={{ margin: '4px 0 10px', fontSize: '2.65rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Find Your Perfect Sanctuary</h1>
            <p style={{ margin: 0, fontSize: '1.05rem', color: '#f1f5f9', maxWidth: '620px', lineHeight: '1.5' }}>
              Handpicked boutique villas, beachside resorts, and mountain hideaways with verified locations and instant booking.
            </p>
          </div>
        </section>

        <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', background: '#ffffff', padding: '18px 24px', borderRadius: '18px', boxShadow: '0 16px 36px -6px rgba(15, 23, 42, 0.12)', width: '95%', maxWidth: '1040px', margin: '-38px auto 0', position: 'relative', zIndex: 20, border: '1px solid #e2e8f0' }}>
          <div style={{ ...s.filterGroup, flex: '1 1 200px' }}>
            <span style={s.filterLabel}>PROPERTY / TITLE</span>
            <input type="text" placeholder="Search hotel name..." value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} style={s.filterInput} />
          </div>
          <div style={s.divider} />
          <div style={s.filterGroup}>
            <span style={s.filterLabel}>MIN BUDGET (₹)</span>
            <input type="number" min="0" placeholder="Min Price" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} style={s.filterInput} />
          </div>
          <div style={s.divider} />
          <div style={s.filterGroup}>
            <span style={s.filterLabel}>MAX BUDGET (₹)</span>
            <input type="number" min="0" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} style={s.filterInput} />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button type="button" onClick={() => setCurrentPage(1)} style={{ backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: 700, fontSize: '0.86rem', cursor: 'pointer' }}>
              SEARCH
            </button>
            <button type="button" onClick={handleResetFilters} style={{ ...s.btnCancel, padding: '10px 16px', borderRadius: '10px', fontWeight: 600, fontSize: '0.86rem', cursor: 'pointer' }}>
              Reset Filters
            </button>
          </div>
        </section>

        <section style={{ marginTop: '54px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Top Travel Destinations</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0' }}>Explore trending locations across India with premier hospitality</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            {DESTINATIONS.map((dest) => (
              <div key={dest.name} className="dest-card" onClick={() => updateFilter('search', dest.name)}>
                <img src={dest.img} alt={dest.name} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(15,23,42,0.85) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '16px', color: '#ffffff' }}>
                  <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{dest.name}</h4>
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{dest.stays}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: '54px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '22px', background: '#ffffff', padding: '16px 22px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Featured Accommodations ({totalHotels})</h2>
              <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Showing page {currentPage} of {totalPages}</span>
            </div>
            {isAdmin && (
              <span style={{ background: '#fef3c7', color: '#92400e', padding: '5px 12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                Admin Mode: Edit / Delete Enabled
              </span>
            )}
          </div>

          {hotels.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <div style={{ textAlign: 'center', padding: '54px 20px', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>No hotels found matching your search</h3>
              <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.92rem' }}>Adjust your budget filters or search keyword.</p>
              <button type="button" onClick={handleResetFilters} className="btn-brand">Clear Filters</button>
            </div>
          )}

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </section>
      </main>

      {showLoginModal && (
        <div className="center-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="center-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ ...s.modalIcon, backgroundColor: '#e0f2fe', color: '#0284c7' }}>🔒</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Login Required</h3>
            <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Please log in or create an account to continue with your wishlist and reservations.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setShowLoginModal(false)} className="modal-btn" style={s.btnCancel}>Cancel</button>
              <button type="button" onClick={() => navigate('/login')} className="modal-btn" style={{ backgroundColor: '#0284c7', color: '#ffffff' }}>Login</button>
              <button type="button" onClick={() => navigate('/register')} className="modal-btn" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {bookingHotel && (
        <div className="center-modal-overlay" onClick={() => setBookingHotel(null)}>
          <div className="center-modal-card" style={{ maxWidth: '480px', textAlign: 'left' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Reserve {bookingHotel.title}</h3>
            <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '0.88rem' }}>
              ₹{Number(bookingHotel.price).toLocaleString()} / night • Select dates & party size
            </p>

            {bookingError && (
              <div style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '10px 12px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 600, marginBottom: '14px' }}>
                {bookingError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={s.fieldLabel}>Check-in Date</label>
                <input type="date" value={bookingData.checkIn} onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })} className="modern-input" />
              </div>
              <div>
                <label style={s.fieldLabel}>Check-out Date</label>
                <input type="date" value={bookingData.checkOut} onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })} className="modern-input" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={s.fieldLabel}>Guests</label>
                  <input type="number" min="1" max="10" value={bookingData.guests} onChange={(e) => setBookingData({ ...bookingData, guests: Number(e.target.value) })} className="modern-input" />
                </div>
                <div>
                  <label style={s.fieldLabel}>Rooms</label>
                  <input type="number" min="1" max="5" value={bookingData.rooms} onChange={(e) => setBookingData({ ...bookingData, rooms: Number(e.target.value) })} className="modern-input" />
                </div>
              </div>
              <div>
                <label style={{ ...s.fieldLabel, color: '#334155' }}>Mobile Number</label>
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
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button type="button" onClick={() => setBookingHotel(null)} className="modal-btn" style={s.btnCancel}>Cancel</button>
              <button type="button" onClick={handleConfirmBooking} className="modal-btn" style={{ backgroundColor: '#059669', color: '#ffffff' }}>Confirm Reservation</button>
            </div>
          </div>
        </div>
      )}

      {hotelToDelete && (
        <div className="center-modal-overlay" onClick={() => setHotelToDelete(null)}>
          <div className="center-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ ...s.modalIcon, backgroundColor: '#fee2e2', color: '#ef4444' }}>!</div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Confirm Property Deletion</h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Are you sure you want to delete <strong>{hotelToDelete.title}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button type="button" onClick={() => setHotelToDelete(null)} className="modal-btn" style={s.btnCancel}>Cancel</button>
              <button type="button" onClick={confirmDelete} className="modal-btn" style={{ backgroundColor: '#ef4444', color: '#ffffff' }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListPage;