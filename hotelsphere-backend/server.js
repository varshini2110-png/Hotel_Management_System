const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get('/api/hotels', async (req, res) => {
  try {
    const { page = 1, limit = 4, search = '', minPrice = '', maxPrice = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM hotels WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM hotels WHERE 1=1';
    const params = [];
    const countParams = [];

    if (search) {
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
      query += ` AND title ILIKE $${params.length}`;
      countQuery += ` AND title ILIKE $${countParams.length}`;
    }
    if (minPrice) {
      params.push(minPrice);
      countParams.push(minPrice);
      query += ` AND price >= $${params.length}`;
      countQuery += ` AND price >= $${countParams.length}`;
    }
    if (maxPrice) {
      params.push(maxPrice);
      countParams.push(maxPrice);
      query += ` AND price <= $${params.length}`;
      countQuery += ` AND price <= $${countParams.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY id DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const hotelsResult = await pool.query(query, params);
    const countResult = await pool.query(countQuery, countParams);

    const total = parseInt(countResult.rows[0].count, 10);
    res.json({
      hotels: hotelsResult.rows,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/hotels/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM hotels WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Hotel not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hotels', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, latitude, longitude, imageUrl } = req.body;
    if (!title || !description || !price || !latitude || !longitude) {
      return res.status(400).json({ error: 'All hotel fields are required' });
    }
    const image = req.file ? `/uploads/${req.file.filename}` : imageUrl || '';
    const result = await pool.query(
      'INSERT INTO hotels (title, description, price, latitude, longitude, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, price, latitude, longitude, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/hotels/:id', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, latitude, longitude, imageUrl } = req.body;
    let query = 'UPDATE hotels SET title=$1, description=$2, price=$3, latitude=$4, longitude=$5';
    let params = [title, description, price, latitude, longitude];

    if (req.file) {
      params.push(`/uploads/${req.file.filename}`);
      query += `, image=$${params.length}`;
    } else if (imageUrl) {
      params.push(imageUrl);
      query += `, image=$${params.length}`;
    }

    params.push(req.params.id);
    query += ` WHERE id=$${params.length} RETURNING *`;

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/hotels/:id', async (req, res) => {
  try {
    const existing = await pool.query('SELECT image FROM hotels WHERE id = $1', [req.params.id]);
    await pool.query('DELETE FROM hotels WHERE id = $1', [req.params.id]);

    const imagePath = existing.rows[0]?.image;
    if (imagePath && imagePath.startsWith('/uploads/')) {
      const fullPath = path.join(__dirname, imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'User already exists' });

    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email.toLowerCase(), password, role || 'customer']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE email = $1 AND password = $2',
      [email.toLowerCase(), password]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    const { email } = req.query;
    let query = 'SELECT * FROM bookings ORDER BY created_at DESC';
    let params = [];
    if (email) {
      query = 'SELECT * FROM bookings WHERE user_email = $1 ORDER BY created_at DESC';
      params = [email.toLowerCase()];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { id, hotelId, hotelTitle, guestName, userEmail, phone, checkIn, checkOut, guests, rooms, totalPrice } = req.body;
    const result = await pool.query(
      'INSERT INTO bookings (id, hotel_id, hotel_title, guest_name, user_email, phone, check_in, check_out, guests, rooms, total_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [id, hotelId, hotelTitle, guestName, userEmail.toLowerCase(), phone || '', checkIn, checkOut, guests, rooms, totalPrice]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/bookings/:id/cancel', async (req, res) => {
  try {
    await pool.query("ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'Confirmed'");
    const result = await pool.query(
      "UPDATE bookings SET status = 'Cancelled' WHERE id = $1 AND COALESCE(status, 'Confirmed') <> 'Cancelled' RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Booking not found or already cancelled' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/wishlist/:email', async (req, res) => {
  try {
    const result = await pool.query('SELECT hotel_id FROM wishlists WHERE user_email = $1', [req.params.email.toLowerCase()]);
    res.json(result.rows.map((r) => r.hotel_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wishlist/toggle', async (req, res) => {
  try {
    const { email, hotelId } = req.body;
    const existing = await pool.query('SELECT * FROM wishlists WHERE user_email = $1 AND hotel_id = $2', [email.toLowerCase(), hotelId]);
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM wishlists WHERE user_email = $1 AND hotel_id = $2', [email.toLowerCase(), hotelId]);
      res.json({ action: 'removed', hotelId });
    } else {
      await pool.query('INSERT INTO wishlists (user_email, hotel_id) VALUES ($1, $2)', [email.toLowerCase(), hotelId]);
      res.json({ action: 'added', hotelId });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`PostgreSQL Server running on http://localhost:${PORT}`));