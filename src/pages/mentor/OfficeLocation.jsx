import { useState, useEffect } from 'react';
import ApiService from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getUserFromToken } from '../../utils/auth';

export default function OfficeLocation() {
  const user = getUserFromToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [location, setLocation] = useState({
    latitude: '',
    longitude: '',
    nama_lokasi: '',
    alamat: '',
    max_distance_meters: 500
  });
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    fetchOfficeLocation();
  }, []);

  const fetchOfficeLocation = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ApiService.getOfficeLocation();
      setLocation({
        latitude: data.latitude?.toString() || '',
        longitude: data.longitude?.toString() || '',
        nama_lokasi: data.nama_lokasi || '',
        alamat: data.alamat || '',
        max_distance_meters: data.max_distance_meters || 500
      });
    } catch (err) {
      setError('Gagal memuat lokasi kantor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda');
      return;
    }

    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocation(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setSuccess('Lokasi saat ini berhasil didapatkan');
        setTimeout(() => setSuccess(''), 3000);
      },
      (error) => {
        setError('Gagal mendapatkan lokasi: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocation(prev => ({
      ...prev,
      [name]: name === 'max_distance_meters' ? parseInt(value) || 500 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    // Validation
    if (!location.latitude || !location.longitude) {
      setError('Latitude dan longitude harus diisi');
      setSaving(false);
      return;
    }

    const lat = parseFloat(location.latitude);
    const lon = parseFloat(location.longitude);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('Latitude harus berupa angka antara -90 dan 90');
      setSaving(false);
      return;
    }

    if (isNaN(lon) || lon < -180 || lon > 180) {
      setError('Longitude harus berupa angka antara -180 dan 180');
      setSaving(false);
      return;
    }

    try {
      await ApiService.updateOfficeLocation({
        latitude: lat,
        longitude: lon,
        nama_lokasi: location.nama_lokasi || 'Kantor Utama',
        alamat: location.alamat || null,
        max_distance_meters: location.max_distance_meters || 500
      });
      
      setSuccess('Lokasi kantor berhasil diupdate');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal mengupdate lokasi kantor: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (user?.role !== 'pengurus') {
    return (
      <div className="card-gradient p-6">
        <div className="text-center py-8">
          <p className="text-red-600 font-medium">Akses ditolak. Hanya pengurus yang dapat mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gradient p-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Pengaturan Lokasi Kantor</h2>
        <p className="text-gray-700 font-medium">
          Atur koordinat lokasi kantor untuk validasi absensi. Koordinat ini akan digunakan untuk menghitung jarak saat mahasiswa melakukan clock in/out.
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Form */}
      <div className="card-gradient p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Location Button */}
          <div>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Gunakan Lokasi Saat Ini</span>
            </button>
            {currentLocation && (
              <p className="text-sm text-gray-600 mt-2">
                Lokasi terdeteksi: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </p>
            )}
          </div>

          {/* Latitude */}
          <div>
            <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
              Latitude <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="latitude"
              name="latitude"
              value={location.latitude}
              onChange={handleChange}
              className="input-field"
              placeholder="-6.1751"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Range: -90 sampai 90</p>
          </div>

          {/* Longitude */}
          <div>
            <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
              Longitude <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="longitude"
              name="longitude"
              value={location.longitude}
              onChange={handleChange}
              className="input-field"
              placeholder="106.8650"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Range: -180 sampai 180</p>
          </div>

          {/* Nama Lokasi */}
          <div>
            <label htmlFor="nama_lokasi" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lokasi
            </label>
            <input
              type="text"
              id="nama_lokasi"
              name="nama_lokasi"
              value={location.nama_lokasi}
              onChange={handleChange}
              className="input-field"
              placeholder="Kantor Utama"
            />
          </div>

          {/* Alamat */}
          <div>
            <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <textarea
              id="alamat"
              name="alamat"
              value={location.alamat}
              onChange={handleChange}
              className="input-field"
              rows={3}
              placeholder="Alamat lengkap kantor..."
            />
          </div>

          {/* Max Distance */}
          <div>
            <label htmlFor="max_distance_meters" className="block text-sm font-medium text-gray-700 mb-1">
              Jarak Maksimal (meter)
            </label>
            <input
              type="number"
              id="max_distance_meters"
              name="max_distance_meters"
              value={location.max_distance_meters}
              onChange={handleChange}
              className="input-field"
              min="100"
              max="5000"
              step="50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Jarak maksimal dari kantor untuk absensi (default: 500 meter)
            </p>
          </div>

          {/* Preview Map Link */}
          {location.latitude && location.longitude && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Preview Lokasi:</p>
              <a
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Buka di Google Maps →
              </a>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Lokasi</span>
              )}
            </button>
            <button
              type="button"
              onClick={fetchOfficeLocation}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800">Informasi Penting</h4>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Koordinat yang diatur akan digunakan untuk validasi jarak absensi</li>
                <li>Pastikan koordinat akurat untuk menghindari masalah validasi</li>
                <li>Jarak maksimal menentukan radius absensi yang diizinkan</li>
                <li>Perubahan lokasi akan mempengaruhi semua absensi selanjutnya</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

