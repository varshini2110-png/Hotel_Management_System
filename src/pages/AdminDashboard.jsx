import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { fetchHotels, deleteHotel } from '../redux/hotelSlice';
import Navbar from '../components/Navbar';

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const hotels = useSelector((state) => state.hotels?.hotelList || []);
  const totalHotels = useSelector((state) => state.hotels?.totalHotels || hotels.length);

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');

  const [deletingHotel, setDeletingHotel] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const loadAllBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch('http://localhost:5000/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
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
      showToast('Failed to delete property.');
    }
  };
  const activeBookings = bookings.filter((b) => (b.status || 'Confirmed') !== 'Cancelled');
  const totalRevenue = bookings
  .filter((b) => (b.status || 'Confirmed') !== 'Cancelled')
  .reduce((sum, b) => sum + Number(b.total_price || b.totalPrice || 0), 0);
  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', overflowX: 'hidden' }}>
      <Helmet>
        <title>Admin Dashboard | HotelSphere</title>
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

      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Admin Control Center
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={loadAllBookings}
              className="btn-secondary"
              style={{ backgroundColor: '#ffffff', padding: '10px 16px' }}
            >
              ↻ Refresh Data
            </button>
            <button
              type="button"
              onClick={() => navigate('/add-hotel', { state: { returnTo: '/admin' } })}
              className="btn-brand"
            >
              + Add New Hotel
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '26px' }}>
          <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              TOTAL PROPERTIES
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
              {totalHotels}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              TOTAL BOOKINGS
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0284c7', marginTop: '6px' }}>
              {activeBookings.length}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.04em' }}>
              TOTAL BOOKING VALUE
            </span>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
              ₹{totalRevenue.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'bookings' ? '#0f172a' : '#e2e8f0',
              color: activeTab === 'bookings' ? '#ffffff' : '#475569'
            }}
          >
            Customer Bookings ({bookings.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hotels')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'hotels' ? '#0f172a' : '#e2e8f0',
              color: activeTab === 'hotels' ? '#ffffff' : '#475569'
            }}
          >
            Manage Hotels ({totalHotels})
          </button>
        </div>

        {activeTab === 'bookings' && (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)' }}>
            {loadingBookings ? (
              <div style={{ padding: '44px', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>
                Loading live customer bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div style={{ padding: '44px', textAlign: 'center', color: '#64748b', fontWeight: 500 }}>
                No customer bookings yet.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>BOOKING ID</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>GUEST & CONTACT</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>HOTEL</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>STAY DATES</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>ROOMS / GUESTS</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>AMOUNT</th>
                    <th style={{ padding: '14px 16px', fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0284c7', fontSize: '0.85rem' }}>{b.id}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <strong style={{ display: 'block', color: '#0f172a', fontSize: '0.92rem' }}>{b.guest_name || b.guestName}</strong>
                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>{b.user_email || b.userEmail}</span>
                        {b.phone && (
                          <span style={{ display: 'inline-block', marginTop: '3px', fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>
                            📞 +91 {b.phone}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                        {b.hotel_title || b.hotelTitle}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.84rem', color: '#334155' }}>
                        {(b.check_in || b.checkIn || '').slice(0, 10)} → {(b.check_out || b.checkOut || '').slice(0, 10)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.84rem', color: '#475569' }}>
                        {b.rooms} Room(s), {b.guests} Guest(s)
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                        ₹{Number(b.total_price || b.totalPrice).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '50px', fontSize: '0.76rem', fontWeight: 700 }}>
                          {b.status || 'Confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'hotels' && (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>HOTEL</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>PRICE</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>COORDINATES</th>
                  <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => {
                  const rawImg = hotel.imageUrl || hotel.image || '';
                  const imgSrc = rawImg.startsWith('/uploads/') ? `http://localhost:5000${rawImg}` : rawImg;

                  return (
                    <tr key={hotel.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={imgSrc}
                          alt={hotel.title}
                          style={{ width: '54px', height: '54px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div>
                          <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.95rem' }}>{hotel.title}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {hotel.description ? `${hotel.description.slice(0, 55)}...` : ''}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0284c7' }}>
                        ₹{Number(hotel.price).toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#64748b' }}>
                        {hotel.latitude}, {hotel.longitude}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => navigate(`/edit-hotel/${hotel.id}`, { state: { returnTo: '/admin' } })}
                          style={{
                            padding: '6px 14px',
                            marginRight: '8px',
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.82rem'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingHotel(hotel)}
                          style={{
                            padding: '6px 14px',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#ef4444',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.82rem'
                          }}
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
        <div className="center-modal-overlay" onClick={() => setDeletingHotel(null)}>
          <div className="center-modal-card" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                fontSize: '1.3rem',
                fontWeight: 'bold'
              }}
            >
              !
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Delete Hotel Property
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Are you sure you want to permanently remove <strong>{deletingHotel.title}</strong>?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeletingHotel(null)}
                className="modal-btn"
                style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="modal-btn"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
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