import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Footer() {
  const currentUser = useSelector((state) => state.hotels?.currentUser);
  const isAdmin = currentUser?.role === 'admin';

  if (isAdmin) {
    return null;
  }

  return (
    <footer
      style={{
        backgroundColor: '#0f172a',
        color: '#cbd5e1',
        marginTop: '60px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '44px 24px 32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '28px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
              HotelSphere
            </span>
            <span
              style={{
                fontSize: '0.65rem',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                padding: '2px 7px',
                borderRadius: '4px',
                fontWeight: 700
              }}
            >
              EXPLORE
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#94a3b8' }}>
            Book verified luxury stays, boutique villas, and scenic resorts across India with instant confirmation.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
            Quick Links
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
            <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home & Hotels</Link>
            <Link to="/my-bookings" style={{ color: '#94a3b8', textDecoration: 'none' }}>My Bookings</Link>
            <Link to="/wishlist" style={{ color: '#94a3b8', textDecoration: 'none' }}>My Wishlist</Link>
          </div>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
            Guest Care
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#94a3b8' }}>
            <span>24/7 Customer Support</span>
            <span>Instant Booking Confirmation</span>
            <span>Verified Property Locations</span>
          </div>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
            Contact Us
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#94a3b8' }}>
            <span>Phone: +91 98765 43210</span>
            <span>Email: support@hotelsphere.com</span>
            <span>Chennai, Tamil Nadu, India</span>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '18px 24px',
          textAlign: 'center',
          fontSize: '0.84rem',
          color: '#64748b'
        }}
      >
        © 2026 HotelSphere. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;