import React from "react";
import { useNavigate } from "react-router-dom";

function HotelCard({
  hotel,
  isAdmin,
  isWishlisted,
  onWishlistToggle,
  onBookClick,
  onDeleteClick,
}) {
  const navigate = useNavigate();

  const imageSrc = hotel.imageUrl || hotel.image || "";
  const resolvedImage = imageSrc.startsWith("/uploads/")
    ? `http://localhost:5000${imageSrc}`
    : imageSrc;

  return (
    <div className="luxury-card" onClick={() => navigate(`/hotel/${hotel.id}`)}>
      <div
        className="hotel-image-wrap"
        style={{
          width: "310px",
          minWidth: "310px",
          height: "225px",
          position: "relative",
        }}
      >
        <img src={resolvedImage} alt={hotel.title || "Hotel property"} />

        <span
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(15, 23, 42, 0.78)",
            color: "#ffffff",
            backdropFilter: "blur(4px)",
            padding: "4px 9px",
            borderRadius: "8px",
            fontSize: "0.78rem",
            fontWeight: 700,
          }}
        >
          ★ {hotel.rating || 4.5}
        </span>

        {!isAdmin && (
          <button
            type="button"
            onClick={(e) => onWishlistToggle(e, hotel.id)}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.92)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1.05rem",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              zIndex: 5,
            }}
          >
            {isWishlisted ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      <div
        style={{
          flex: 1,
          padding: "22px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.3rem",
                  color: "#0f172a",
                  fontWeight: 800,
                }}
              >
                {hotel.title}
              </h3>
              <span
                style={{
                  fontSize: "0.84rem",
                  color: "#64748b",
                  display: "block",
                  marginTop: "3px",
                }}
              >
                📍 Lat: {hotel.latitude}, Long: {hotel.longitude}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 800,
                  color: "#0284c7",
                }}
              >
                ₹{Number(hotel.price).toLocaleString()}
              </span>
              <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
                {" "}
                / night
              </span>
            </div>
          </div>

          <p
            style={{
              margin: "12px 0 16px",
              fontSize: "0.92rem",
              color: "#475569",
              lineHeight: "1.6",
            }}
          >
            {hotel.description && hotel.description.length > 155
              ? `${hotel.description.slice(0, 155)}...`
              : hotel.description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "14px",
            borderTop: "1px solid #f1f5f9",
            flexWrap: "wrap",
            gap: "10px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {!isAdmin && (
            <button
              type="button"
              onClick={() => onBookClick(hotel)}
              style={{
                backgroundColor: "#059669",
                color: "#ffffff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.86rem",
                cursor: "pointer",
              }}
            >
              ⚡ Instant Book Now
            </button>
          )}

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginLeft: isAdmin ? "auto" : "initial",
            }}
          >
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/edit-hotel/${hotel.id}`)}
                  style={{
                    padding: "6px 14px",
                    background: "#f1f5f9",
                    color: "#334155",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.84rem",
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteClick(hotel)}
                  style={{
                    padding: "6px 14px",
                    background: "#fee2e2",
                    color: "#ef4444",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.84rem",
                  }}
                >
                  Delete
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => navigate(`/hotel/${hotel.id}`)}
              style={{
                padding: "6px 14px",
                background: "#ffffff",
                color: "#0284c7",
                border: "1px solid #0284c7",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.84rem",
              }}
            >
              View Map & Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelCard;
