import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { loginUser, fetchWishlist, fetchBookings } from "../redux/hotelSlice";
import Navbar from "../components/Navbar";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Invalid email or password");
      }

      dispatch(loginUser(data));
      dispatch(fetchWishlist(data.email));
      dispatch(fetchBookings(data.email));

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Helmet>
        <title>Sign In | HotelSphere</title>
      </Helmet>

      <Navbar />

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        <div
          className="fade-in"
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "36px 32px",
            background: "#ffffff",
            borderRadius: "18px",
            boxShadow: "0 10px 30px -5px rgba(15, 23, 42, 0.08)",
            border: "1px solid #e2e8f0",
          }}
        >
          <span
            style={{
              display: "inline-block",
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: "#0284c7",
              backgroundColor: "#e0f2fe",
              padding: "4px 10px",
              borderRadius: "50px",
              marginBottom: "10px",
            }}
          >
            CUSTOMER PORTAL
          </span>
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "1.6rem",
              color: "#0f172a",
              fontWeight: 800,
            }}
          >
            Welcome Back
          </h2>
          <p
            style={{ margin: "0 0 24px", color: "#64748b", fontSize: "0.9rem" }}
          >
            Sign in to access your bookings and wishlist.
          </p>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                padding: "10px 12px",
                borderRadius: "10px",
                marginBottom: "16px",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="modern-input"
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="modern-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brand"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.94rem",
                marginTop: "6px",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "22px",
              fontSize: "0.9rem",
              color: "#64748b",
            }}
          >
            New to HotelSphere?{" "}
            <Link
              to="/register"
              style={{
                color: "#0284c7",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Create Account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
