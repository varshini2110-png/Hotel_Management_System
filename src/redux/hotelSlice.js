import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = 'http://localhost:5000/api';

export const fetchHotels = createAsyncThunk('hotels/fetchHotels', async ({ search = '', minPrice = '', maxPrice = '', page = 1, limit = 4 } = {}) => {
  let url = `${API}/hotels?page=${page}&limit=${limit}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (minPrice) url += `&minPrice=${minPrice}`;
  if (maxPrice) url += `&maxPrice=${maxPrice}`;
  const res = await fetch(url);
  return await res.json();
});

export const createHotel = createAsyncThunk('hotels/createHotel', async (formData) => {
  const res = await fetch(`${API}/hotels`, { method: 'POST', body: formData });
  return await res.json();
});

export const updateHotel = createAsyncThunk('hotels/updateHotel', async ({ id, formData }) => {
  const res = await fetch(`${API}/hotels/${id}`, { method: 'PUT', body: formData });
  return await res.json();
});

export const deleteHotel = createAsyncThunk('hotels/deleteHotel', async (id) => {
  await fetch(`${API}/hotels/${id}`, { method: 'DELETE' });
  return id;
});

export const fetchBookings = createAsyncThunk('hotels/fetchBookings', async (email) => {
  const url = email ? `${API}/bookings?email=${encodeURIComponent(email)}` : `${API}/bookings`;
  const res = await fetch(url);
  return await res.json();
});

export const createBooking = createAsyncThunk('hotels/createBooking', async (bookingData) => {
  const res = await fetch(`${API}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData)
  });
  return await res.json();
});

export const removeBooking = createAsyncThunk('hotels/removeBooking', async (id, { rejectWithValue }) => {
  const res = await fetch(`${API}/bookings/${encodeURIComponent(id)}/cancel`, { method: 'PATCH' });
  const data = await res.json();
  if (!res.ok) return rejectWithValue(data.error || 'Failed to cancel booking');
  return data;
});

export const fetchWishlist = createAsyncThunk('hotels/fetchWishlist', async (email) => {
  const res = await fetch(`${API}/wishlist/${encodeURIComponent(email)}`);
  const data = await res.json();
  return { email, items: data };
});

export const toggleWishlistApi = createAsyncThunk('hotels/toggleWishlistApi', async ({ email, hotelId }) => {
  await fetch(`${API}/wishlist/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, hotelId })
  });
  return { email, hotelId };
});

const initialState = {
  hotelList: [],
  totalHotels: 0,
  totalPages: 1,
  currentPage: 1,
  status: 'idle',
  currentUser: JSON.parse(localStorage.getItem('active_session_user')) || null,
  registeredUsers: [],
  bookings: [],
  wishlists: {}
};

const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
      localStorage.setItem('active_session_user', JSON.stringify(action.payload));
    },
    loginUser: (state, action) => {
      state.currentUser = action.payload;
      localStorage.setItem('active_session_user', JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.currentUser = null;
      localStorage.removeItem('active_session_user');
    },
    registerUser: (state, action) => {
      state.currentUser = action.payload;
      localStorage.setItem('active_session_user', JSON.stringify(action.payload));
    },
    addHotel: (state, action) => { state.hotelList.unshift(action.payload); },
    editHotel: (state, action) => {
      const idx = state.hotelList.findIndex(h => h.id === action.payload.id);
      if (idx !== -1) state.hotelList[idx] = action.payload;
    },
    removeHotel: (state, action) => {
      state.hotelList = state.hotelList.filter(h => h.id !== action.payload);
    },
    addBooking: (state, action) => { state.bookings.push(action.payload); },
    cancelBooking: (state, action) => {
      const idx = state.bookings.findIndex(b => b.id === action.payload);
      if (idx !== -1) state.bookings[idx].status = 'Cancelled';
    },
    toggleWishlist: (state, action) => {
      const { userEmail, hotelId } = action.payload;
      if (!userEmail) return;
      const key = userEmail.toLowerCase();
      if (!state.wishlists[key]) state.wishlists[key] = [];
      const idx = state.wishlists[key].indexOf(hotelId);
      if (idx === -1) state.wishlists[key].push(hotelId);
      else state.wishlists[key].splice(idx, 1);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.hotelList = (action.payload.hotels || []).map(h => ({
          ...h,
          imageUrl: h.image?.startsWith('/uploads/') ? `http://localhost:5000${h.image}` : h.image
        }));
        state.totalHotels = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 1;
        state.currentPage = action.payload.page || 1;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.bookings = action.payload || [];
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.bookings.unshift(action.payload);
      })
      .addCase(removeBooking.fulfilled, (state, action) => {
        const idx = state.bookings.findIndex(b => b.id === action.payload.id);
        if (idx !== -1) {
          state.bookings[idx] = { ...state.bookings[idx], ...action.payload, status: 'Cancelled' };
        }
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlists[action.payload.email.toLowerCase()] = action.payload.items;
      })
      .addCase(toggleWishlistApi.fulfilled, (state, action) => {
        const key = action.payload.email.toLowerCase();
        if (!state.wishlists[key]) state.wishlists[key] = [];
        const idx = state.wishlists[key].indexOf(action.payload.hotelId);
        if (idx === -1) state.wishlists[key].push(action.payload.hotelId);
        else state.wishlists[key].splice(idx, 1);
      });
  }
});

export const {
  setCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  addHotel,
  editHotel,
  removeHotel,
  addBooking,
  cancelBooking,
  toggleWishlist
} = hotelSlice.actions;

export default hotelSlice.reducer;