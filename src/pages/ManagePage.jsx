import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createHotel, updateHotel, fetchHotels } from '../redux/hotelSlice';
import Navbar from '../components/Navbar';

function ManagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const returnTo = location.state?.returnTo || '/';

  const isEdit = Boolean(id);
  const currentHotel = useSelector((state) =>
    state.hotels?.hotelList?.find((item) => String(item.id) === String(id))
  );

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    latitude: '13.0827',
    longitude: '80.2707',
    rating: '4.5',
    imageUrl: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (isEdit && currentHotel) {
      const existingImg = currentHotel.imageUrl || currentHotel.image || '';
      setForm({
        title: currentHotel.title || '',
        description: currentHotel.description || '',
        price: currentHotel.price || '',
        latitude: currentHotel.latitude || '13.0827',
        longitude: currentHotel.longitude || '80.2707',
        rating: currentHotel.rating || '4.5',
        imageUrl: existingImg
      });
      setPreview(existingImg);
    }
  }, [isEdit, currentHotel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError('');
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const titleTrim = form.title.trim();
    const desc = form.description.trim();
    const priceNum = Number(form.price);
    const latNum = Number(form.latitude);
    const lngNum = Number(form.longitude);

    if (!titleTrim || titleTrim.length < 3) {
      return setError('Hotel title must be at least 3 characters long');
    }
    if (/^\d+$/.test(titleTrim)) {
      return setError('Hotel title cannot contain only numbers');
    }
    if (!desc || desc.length < 20) {
      return setError('Description must be at least 20 characters long');
    }
    if (/^\d+$/.test(desc)) {
      return setError('Description cannot contain only numbers');
    }
    if (!form.price || Number.isNaN(priceNum) || priceNum <= 0) {
      return setError('Price must be greater than zero');
    }
    if (form.latitude === '' || Number.isNaN(latNum) || latNum < -90 || latNum > 90) {
      return setError('Latitude must be a valid coordinate between -90 and 90');
    }
    if (form.longitude === '' || Number.isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      return setError('Longitude must be a valid coordinate between -180 and 180');
    }
    if (!imageFile && !form.imageUrl) {
      return setError('Please upload a hotel image');
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', titleTrim);
      data.append('description', desc);
      data.append('price', priceNum);
      data.append('latitude', latNum);
      data.append('longitude', lngNum);

      if (imageFile) {
        data.append('image', imageFile);
      } else if (form.imageUrl) {
        data.append('imageUrl', form.imageUrl);
      }

      if (isEdit) {
        await dispatch(updateHotel({ id, formData: data })).unwrap();
      } else {
        await dispatch(createHotel(data)).unwrap();
      }

      dispatch(fetchHotels({ page: 1, limit: 4 }));
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || 'Failed to save hotel details.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    navigate(returnTo);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{ maxWidth: '580px', margin: '40px auto', padding: '0 16px 60px', position: 'relative' }}>
        {showSuccessModal && (
          <div style={modalOverlayStyle}>
            <div style={modalCardStyle}>
              <div style={checkIconStyle}>✓</div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '19px', color: '#111827' }}>
                {isEdit ? 'Hotel Updated Successfully!' : 'Hotel Added Successfully!'}
              </h3>
              <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '14px' }}>
                Your hotel details have been saved successfully.
              </p>
              <button type="button" onClick={handleModalClose} style={btnOkStyle}>
                OK
              </button>
            </div>
          </div>
        )}

        <div style={formCardStyle}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '700', color: '#111827' }}>
              {isEdit ? 'Edit Property Details' : 'Add New Property'}
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
              Fill in the essential listing information and coordinates below.
            </p>
          </div>

          {error && <div style={errorBannerStyle}>{error}</div>}

          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={labelStyle}>Hotel Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. The Taj Hotel"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                rows="3"
                value={form.description}
                onChange={handleChange}
                placeholder="Brief overview about the rooms, ambiance, and location..."
                required
                style={{ ...inputStyle, fontFamily: 'inherit' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Price (₹ per night)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 10000"
                min="1"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="18.9217"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="72.8332"
                  required
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Property Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                style={{ display: 'block', width: '100%', fontSize: '13px', color: '#4b5563', padding: '8px 0' }}
              />
              {preview && (
                <div style={{ marginTop: '10px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', height: '170px' }}>
                  <img src={preview} alt="Selected preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" disabled={loading || showSuccessModal} style={btnSubmitStyle}>
                {loading ? 'Saving...' : isEdit ? 'Update Hotel' : 'Create Hotel'}
              </button>
              <button type="button" onClick={() => navigate(returnTo)} style={btnCancelStyle}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', background: '#f9fafb', color: '#111827' };
const formCardStyle = { background: '#ffffff', borderRadius: '12px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' };
const errorBannerStyle = { background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' };

const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 };
const modalCardStyle = { background: '#ffffff', padding: '28px 36px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)', minWidth: '300px' };
const checkIconStyle = { width: '52px', height: '52px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' };

const btnOkStyle = { background: '#2563eb', color: '#ffffff', border: 'none', padding: '10px 28px', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' };
const btnSubmitStyle = { flex: 1, padding: '12px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.2)' };
const btnCancelStyle = { flex: 1, padding: '12px', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' };

export default ManagePage;