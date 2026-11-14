import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { registerUser } from "../redux/hotelSlice";
import Navbar from "../components/Navbar";

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (formData.password.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: "customer",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      dispatch(registerUser(data));
      navigate("/");
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
        <title>Create Account | HotelSphere</title>
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
            NEW MEMBER
          </span>
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "1.6rem",
              color: "#0f172a",
              fontWeight: 800,
            }}
          >
            Create Account
          </h2>
          <p
            style={{ margin: "0 0 24px", color: "#64748b", fontSize: "0.9rem" }}
          >
            Join HotelSphere to book and save luxury stays.
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
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
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
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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
              {loading ? "Creating account..." : "Register"}
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
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#0284c7",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;
