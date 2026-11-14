# HotelSphere — Full-Stack Hotel Booking & Management Platform

HotelSphere is a full-stack web application built with **React (Redux Toolkit)**, **Node.js / Express**, and **PostgreSQL (native SQL queries)**. It provides customers with property browsing, search and budget filtering, wishlists, and instant room reservations, alongside an admin dashboard for full hotel CRUD operations and local image uploads.

---

## Tech Stack

- **Frontend:** React, Redux Toolkit, React Router, React Helmet, Custom CSS
- **Backend:** Node.js, Express.js, Multer (local server image storage)
- **Database:** PostgreSQL (`pg` native SQL queries without an ORM)

---

## Key Features

### Customer Portal
- **Browse & Filter Stays:** Search properties by title/destination and filter by minimum and maximum budget (`₹`) with server-side pagination (`LIMIT` / `OFFSET`).
- **Property Details & Location:** View property descriptions, pricing, and embedded location maps.
- **Instant Reservations:** Book stays with check-in/check-out date validation, guest/room counts, automatic night/price calculation, and booking cancellation.
- **Personal Wishlist:** Save and toggle favorite properties synced with PostgreSQL.

### Admin Portal
- **Property Management (CRUD):** Add new hotels, edit existing details, and delete listings.
- **Local Image Uploads:** Upload property images stored directly on the Node.js server (`/uploads`) with automatic file cleanup upon deletion.
- **Booking Overview:** View and manage customer reservations.

---

## Demo Credentials

- **Admin Login URL:** `/admin-login`
- **Admin Email:** `admin@hotelsphere.com`
- **Admin Password:** `admin123`

*(Customer accounts can be created directly from the `/register` page.)*

---

## Database Setup (PostgreSQL)

Create a PostgreSQL database and run the following SQL statements to set up the required tables:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(30) DEFAULT 'customer'
);

CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  latitude VARCHAR(50) NOT NULL,
  longitude VARCHAR(50) NOT NULL,
  image TEXT
);

CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE SET NULL,
  hotel_title VARCHAR(200) NOT NULL,
  guest_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  check_in VARCHAR(30) NOT NULL,
  check_out VARCHAR(30) NOT NULL,
  guests INTEGER DEFAULT 1,
  rooms INTEGER DEFAULT 1,
  total_price NUMERIC(12, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'Confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wishlists (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(150) NOT NULL,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
  UNIQUE(user_email, hotel_id)
);

-- Seed Default Admin Account
INSERT INTO users (name, email, password, role)
VALUES ('HotelSphere Admin', 'admin@hotelsphere.com', 'admin123', 'admin');

-- Seed Sample Hotels (Optional Demo Data)
INSERT INTO hotels (title, description, price, latitude, longitude, image) VALUES
('The Taj Mahal Palace, Mumbai', 'Iconic sea-facing luxury heritage hotel overlooking the Gateway of India with world-class dining and spa.', 18500, '18.9217', '72.8332', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'),
('ITC Grand Chola, Chennai', 'Palatial luxury hotel in Guindy featuring grand Chola architecture, fine dining restaurants, and lush pools.', 12000, '13.0108', '80.2206', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'),
('The Leela Palace, Bengaluru', 'Opulent garden palace hotel inspired by Mysore architecture with serene lagoons and luxury suites.', 15500, '12.9606', '77.6484', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'),
('Rambagh Palace, Jaipur', 'Former royal residence offering regal suites, peacock gardens, and authentic Rajasthani hospitality.', 24000, '26.8980', '75.8081', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800');