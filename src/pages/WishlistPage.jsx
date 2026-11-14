import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { fetchWishlist, toggleWishlistApi, fetchHotels } from '../redux/hotelSlice';
import Navbar from '../components/Navbar';

function WishlistPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.hotels?.currentUser);
  const hotels = useSelector((state) => state.hotels?.hotelList || []);
  const wishlists = useSelector((state) => state.hotels?.wishlists || {});

  const [itemToRemove, setItemToRemove] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const userKey = currentUser?.email?.toLowerCase();
  const savedIds = userKey ? wishlists[userKey] || [] : [];

  useEffect(() => {
    dispatch(fetchHotels({ limit: 100 }));
    if (currentUser?.email) {
      dispatch(fetchWishlist(currentUser.email));
    }
  }, [dispatch, currentUser]);

  const savedHotels = hotels.filter((h) => savedIds.includes(h.id));

  const confirmRemove = () => {
    if (!currentUser?.email || !itemToRemove) return;
    dispatch(toggleWishlistApi({ email: currentUser.email, hotelId: itemToRemove.id }));
    setToastMsg(`Removed "${itemToRemove.title}" from your wishlist.`);
    setItemToRemove(null);
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Helmet>
        <title>Saved Wishlist | HotelSphere</title>
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

      <main style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px 60px' }}>
        <div style={{ marginBottom: '22px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            My Saved Stays ({savedHotels.length})
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0' }}>
            Properties bookmarked for your future trips
          </p>
        </div>

        {savedHotels.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1'
            }}
          >
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '16px' }}>
              Your wishlist is currently empty.
            </p>
            <button type="button" onClick={() => navigate('/')} className="btn-brand">
              Explore Hotels
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {savedHotels.map((hotel) => {
              const rawImg = hotel.imageUrl || hotel.image || '';
              const imgSrc = rawImg.startsWith('/uploads/') ? `http://localhost:5000${rawImg}` : rawImg;

              return (
                <div key={hotel.id} className="modern-card">
                  <div className="zoom-img-container" style={{ height: '195px' }}>
                    <img
                      src={imgSrc}
                      alt={hotel.title}
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                      className="zoom-img"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', display: 'block' }}
                    />
                  </div>
                  <div style={{ padding: '18px' }}>
                    <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontSize: '1.12rem', fontWeight: 800 }}>
                      {hotel.title}
                    </h3>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7', marginBottom: '14px' }}>
                      ₹{Number(hotel.price).toLocaleString()}{' '}
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>/ night</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/hotel/${hotel.id}`)}
                        className="btn-brand"
                        style={{ flex: 1, padding: '9px 14px', fontSize: '0.86rem' }}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        onClick={() => setItemToRemove(hotel)}
                        style={{
                          padding: '9px 14px',
                          background: '#fee2e2',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          borderRadius: '10px',
                          fontWeight: 600,
                          fontSize: '0.86rem',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {itemToRemove && (
        <div className="center-modal-overlay" onClick={() => setItemToRemove(null)}>
          <div className="center-modal-card" onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                width: '48px',
                height: '48px',
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
              ♥
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              Remove from Wishlist?
            </h3>
            <p style={{ margin: '0 0 22px 0', color: '#64748b', fontSize: '0.92rem', lineHeight: '1.5' }}>
              Are you sure you want to remove <strong>{itemToRemove.title}</strong> from your saved stays?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setItemToRemove(null)}
                className="modal-btn"
                style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' }}
              >
                Keep Saved
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className="modal-btn"
                style={{ backgroundColor: '#ef4444', color: '#ffffff' }}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WishlistPage;