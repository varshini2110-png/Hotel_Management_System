import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser, fetchWishlist } from "../redux/hotelSlice";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const currentUser = useSelector((state) => state.hotels?.currentUser);
  const wishlists = useSelector((state) => state.hotels?.wishlists || {});
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isLoggedIn = Boolean(currentUser && currentUser.name);
  const isAdmin = currentUser?.role === "admin";
  const isCustomer = isLoggedIn && !isAdmin;

  const userWishlistCount =
    isCustomer && currentUser?.email
      ? (wishlists[currentUser.email.toLowerCase()] || []).length
      : 0;

  const isActive = (path) =>
    location.pathname === path ? "hs-nav-link active" : "hs-nav-link";

  useEffect(() => {
    if (isCustomer && currentUser?.email) {
      dispatch(fetchWishlist(currentUser.email));
    }
  }, [isCustomer, currentUser, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowLogoutModal(false);
    };
    if (showLogoutModal) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutModal]);

  const handleConfirmLogout = () => {
    dispatch(logoutUser());
    setShowLogoutModal(false);
    navigate("/");
  };

  return (
    <>
      <header className="hs-navbar">
        <div className="hs-nav-inner">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              flexWrap: "wrap",
            }}
          >
            <Link
              to="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                }}
              >
                HotelSphere
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  backgroundColor: "#0284c7",
                  color: "#ffffff",
                  padding: "2px 7px",
                  borderRadius: "4px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                EXPLORE
              </span>
            </Link>

            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              <Link to="/" className={isActive("/")}>
                Home & Hotels
              </Link>

              {isCustomer && (
                <>
                  <Link to="/my-bookings" className={isActive("/my-bookings")}>
                    My Bookings
                  </Link>
                  <Link
                    to="/wishlist"
                    className={isActive("/wishlist")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>❤️ My Wishlist</span>
                    {userWishlistCount > 0 && (
                      <span
                        style={{
                          backgroundColor: "#ef4444",
                          color: "#ffffff",
                          borderRadius: "50%",
                          fontSize: "0.72rem",
                          padding: "1px 6px",
                          fontWeight: 700,
                        }}
                      >
                        {userWishlistCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link
                  to="/admin"
                  className={isActive("/admin")}
                  style={{
                    color: "#38bdf8",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#38bdf8",
                    }}
                  />
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate("/add-hotel")}
                className="btn-brand"
                style={{ padding: "8px 16px", fontSize: "0.85rem" }}
              >
                + Add Hotel
              </button>
            )}

            {isLoggedIn ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span
                  style={{
                    color: "#f8fafc",
                    fontSize: "0.86rem",
                    fontWeight: 600,
                    backgroundColor: "rgba(255, 255, 255, 0.06)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {isAdmin ? "Admin: " : "👤 "}
                  {currentUser.name}
                </span>
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  style={{
                    backgroundColor: "transparent",
                    color: "#f87171",
                    border: "1px solid rgba(248, 113, 113, 0.45)",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Link
                  to="/admin-login"
                  style={{
                    color: "#c084fc",
                    fontSize: "0.85rem",
                    textDecoration: "none",
                    fontWeight: 700,
                    padding: "7px 14px",
                    borderRadius: "8px",
                    border: "1px solid rgba(192, 132, 252, 0.4)",
                  }}
                >
                  Admin
                </Link>
                <Link
                  to="/login"
                  style={{
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    textDecoration: "none",
                    fontWeight: 600,
                    padding: "7px 16px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                  }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  style={{
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    fontSize: "0.88rem",
                    textDecoration: "none",
                    fontWeight: 700,
                    padding: "7px 16px",
                    borderRadius: "8px",
                  }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {showLogoutModal && (
        <div
          className="center-modal-overlay"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="center-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                backgroundColor: "#fee2e2",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: "1.4rem",
                fontWeight: "bold",
              }}
            >
              👋
            </div>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "1.3rem",
                fontWeight: 800,
                color: "#0f172a",
              }}
            >
              Are you sure you want to log out?
            </h3>
            <p
              style={{
                margin: "0 0 24px 0",
                color: "#64748b",
                fontSize: "0.92rem",
                lineHeight: "1.5",
              }}
            >
              Do you really want to end your current session? You can sign back
              in anytime.
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="modal-btn"
                style={{
                  backgroundColor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="modal-btn"
                style={{ backgroundColor: "#ef4444", color: "#ffffff" }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
