import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { loginUser } from '../redux/hotelSlice';
import Navbar from '../components/Navbar';

function AdminLoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username.trim(), password })
      });

      const data = await response.json();
      if (!response.ok || data.role !== 'admin') {
        throw new Error('Unauthorized. Use valid admin credentials.');
      }

      dispatch(loginUser(data));
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Unauthorized. Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>Admin Portal Login | HotelSphere</title>
      </Helmet>

      <Navbar />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px' }}>
        <div
          className="fade-in"
          style={{
            backgroundColor: '#1e293b',
            width: '100%',
            maxWidth: '420px',
            borderRadius: '20px',
            padding: '36px 32px',
            boxShadow: '0 20px 45px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ffffff'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '50px',
                fontWeight: 800,
                letterSpacing: '0.06em'
              }}
            >
              MANAGEMENT ACCESS ONLY
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '12px 0 6px' }}>
              Admin Dashboard Sign In
            </h2>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.86rem' }}>
              Authorized hotel management personnel
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#451a1a',
                border: '1px solid #7f1d1d',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.83rem',
                marginBottom: '16px',
                fontWeight: 600
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Admin Email
              </label>
              <input
                type="email"
                required
                placeholder="Enter admin email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid #475569',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Master Key / Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid #475569',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '8px',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Authenticating...' : 'Authenticate as Admin'}
            </button>
          </form>

          <p style={{ textAlign: 'center', margin: '22px 0 0', fontSize: '0.86rem', color: '#94a3b8' }}>
            Regular customer?{' '}
            <Link to="/login" style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>
              Customer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;