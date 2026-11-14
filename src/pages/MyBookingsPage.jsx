import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { fetchBookings, removeBooking } from "../redux/hotelSlice";
import Navbar from "../components/Navbar";

function MyBookingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.hotels?.currentUser);
  const bookings = useSelector((state) => state.hotels?.bookings || []);

  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (currentUser?.email) {
      dispatch(fetchBookings(currentUser.email));
    }
  }, [dispatch, currentUser]);

  const activeCount = bookings.filter((b) => b.status !== "Cancelled").length;

  const confirmCancel = async () => {
    if (
      !bookingToCancel ||
      isCancelling ||
      bookingToCancel.status === "Cancelled"
    )
      return;
    setIsCancelling(true);
    try {
      await dispatch(removeBooking(bookingToCancel.id)).unwrap();
      setToastMsg(
        `Booking #${bookingToCancel.id} for ${bookingToCancel.hotel_title || bookingToCancel.hotelTitle} has been cancelled.`,
      );
    } catch (err) {
      setToastMsg(typeof err === "string" ? err : "Unable to cancel booking.");
    } finally {
      setIsCancelling(false);
      setBookingToCancel(null);
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Helmet>
        <title>My Bookings | HotelSphere</title>
      </Helmet>

      <Navbar />

      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "14px 22px",
            borderRadius: "12px",
            zIndex: 3000,
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
            fontWeight: 600,
            fontSize: "0.9rem",
          }}
        >
          {toastMsg}
        </div>
      )}

      <main
        style={{
          maxWidth: "1000px",
          margin: "30px auto",
          padding: "0 20px 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "22px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
              }}
            >
              My Reservations ({activeCount} Active)
            </h1>
            <p
              style={{
                color: "#64748b",
                fontSize: "0.9rem",
                margin: "4px 0 0",
              }}
            >
              Manage your upcoming, confirmed, and cancelled property stays
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#ffffff",
              borderRadius: "16px",
              border: "1px dashed #cbd5e1",
            }}
          >
            <p
              style={{
                color: "#64748b",
                fontSize: "1rem",
                marginBottom: "16px",
              }}
            >
              No active bookings found in your account.
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-brand"
            >
              Explore Hotels
            </button>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {bookings.map((b) => {
              const isCancelled = b.status === "Cancelled";
              return (
                <div
                  key={b.id}
                  className="modern-card"
                  style={{
                    padding: "22px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    opacity: isCancelled ? 0.82 : 1,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          color: "#0284c7",
                        }}
                      >
                        BOOKING #{b.id}
                      </span>
                      <span
                        style={{
                          backgroundColor: isCancelled ? "#fee2e2" : "#dcfce7",
                          color: isCancelled ? "#b91c1c" : "#166534",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "50px",
                        }}
                      >
                        {b.status || "Confirmed"}
                      </span>
                    </div>
                    <h3
                      style={{
                        margin: "4px 0 6px",
                        color: "#0f172a",
                        fontSize: "1.2rem",
                        fontWeight: 800,
                      }}
                    >
                      {b.hotel_title || b.hotelTitle}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.86rem",
                        color: "#64748b",
                        display: "block",
                      }}
                    >
                      📅 {b.check_in?.slice(0, 10) || b.checkIn} to{" "}
                      {b.check_out?.slice(0, 10) || b.checkOut} • {b.guests}{" "}
                      Guests • {b.rooms} Room(s)
                    </span>
                    {b.phone && (
                      <span
                        style={{
                          fontSize: "0.84rem",
                          color: "#0284c7",
                          fontWeight: 600,
                          display: "block",
                          marginTop: "5px",
                        }}
                      >
                        📞 Contact: +91 {b.phone}
                      </span>
                    )}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: "1.35rem",
                        fontWeight: 800,
                        color: isCancelled ? "#64748b" : "#059669",
                        marginBottom: "10px",
                      }}
                    >
                      ₹{Number(b.total_price || b.totalPrice).toLocaleString()}
                    </div>
                    {!isCancelled ? (
                      <button
                        type="button"
                        onClick={() => setBookingToCancel(b)}
                        style={{
                          background: "#fee2e2",
                          border: "1px solid #fecaca",
                          color: "#ef4444",
                          padding: "8px 16px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        Cancel Booking
                      </button>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: "#ef4444",
                        }}
                      >
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {bookingToCancel && (
        <div
          className="center-modal-overlay"
          onClick={() => !isCancelling && setBookingToCancel(null)}
        >
          <div
            className="center-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#fee2e2",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
                fontSize: "1.3rem",
                fontWeight: "bold",
              }}
            >
              !
            </div>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "1.25rem",
                color: "#0f172a",
                fontWeight: 800,
              }}
            >
              Cancel Reservation?
            </h3>
            <p
              style={{
                margin: "0 0 22px 0",
                color: "#64748b",
                fontSize: "0.92rem",
                lineHeight: "1.5",
              }}
            >
              Are you sure you want to cancel your booking at{" "}
              <strong>
                {bookingToCancel.hotel_title || bookingToCancel.hotelTitle}
              </strong>
              ?
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setBookingToCancel(null)}
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
                disabled={isCancelling}
                onClick={confirmCancel}
                className="modal-btn"
                style={{ backgroundColor: "#ef4444", color: "#ffffff" }}
              >
                {isCancelling ? "Cancelling..." : "Yes, Cancel Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookingsPage;
