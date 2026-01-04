import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { requestGeolocation, calculateDistance, getOfficeLocation } from '../../utils/geolocation';
import { isClockOutTime, formatTime } from '../../utils/time';
import ApiService from '../../utils/api';

export default function ClockOut() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [keterangan, setKeterangan] = useState('');
  const [canClockOut, setCanClockOut] = useState(false);

  useEffect(() => {
    checkTimeAndLocation();
  }, []);

  const checkTimeAndLocation = async () => {
    // Check time
    if (!isClockOutTime()) {
      setError('Clock out hanya dapat dilakukan antara pukul 17:00 - 17:30');
      return;
    }

    // Get location
    await getCurrentLocation();
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setError('');

    try {
      const [location, officeLocation] = await Promise.all([
        requestGeolocation(),
        getOfficeLocation()
      ]);
      
      setCurrentLocation(location);

      const dist = calculateDistance(
        location.latitude,
        location.longitude,
        officeLocation.latitude,
        officeLocation.longitude
      );

      setDistance(Math.round(dist));

      if (dist <= officeLocation.maxDistance) {
        setCanClockOut(true);
        setSuccess(`Lokasi valid. Jarak dari kantor: ${Math.round(dist)} meter`);
      } else {
        setError(`Jarak terlalu jauh dari kantor: ${Math.round(dist)} meter. Maksimal ${officeLocation.maxDistance} meter.`);
      }
    } catch (err) {
      setError('Gagal mendapatkan lokasi. Pastikan GPS aktif dan berikan izin akses lokasi.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!canClockOut) {
      setError('Tidak dapat melakukan clock out. Periksa waktu dan lokasi Anda.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const clockOutData = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        distance: distance,
        keterangan: keterangan || 'WFO'
      };

      await ApiService.clockOut(clockOutData);
      setSuccess('Clock out berhasil!');
      
      setTimeout(() => {
        navigate('/dashboard', { state: { refresh: true } });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="card-gradient p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">Clock Out</h1>
            <p className="text-gray-700 font-medium">Waktu clock out: 17:00 - 17:30</p>
            <p className="text-lg font-mono font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mt-2">
              {formatTime(new Date())}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Location Status */}
            <div className="card-gradient border-2 border-orange-200 p-6">
              <h3 className="font-semibold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center">
                <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Status Lokasi
              </h3>

              {locationLoading ? (
                <div className="flex items-center justify-center py-4">
                  <LoadingSpinner size="medium" />
                  <span className="ml-3 text-gray-600">Mendapatkan lokasi...</span>
                </div>
              ) : currentLocation ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Latitude:</span>
                    <span className="font-mono text-sm">{currentLocation.latitude.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Longitude:</span>
                    <span className="font-mono text-sm">{currentLocation.longitude.toFixed(6)}</span>
                  </div>
                  {distance !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jarak dari kantor:</span>
                      <span className="font-semibold text-gray-900">
                        {distance} meter
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Akurasi:</span>
                    <span className="text-sm">{Math.round(currentLocation.accuracy)} meter</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <button
                    onClick={getCurrentLocation}
                    className="btn-secondary"
                    disabled={locationLoading}
                  >
                    Dapatkan Lokasi
                  </button>
                </div>
              )}
            </div>

            {/* Keterangan */}
            <div>
              <label htmlFor="keterangan" className="block text-sm font-medium text-gray-700 mb-2">
                Keterangan (Opsional)
              </label>
              <textarea
                id="keterangan"
                rows={3}
                className="input-field"
                placeholder="Tambahkan keterangan jika diperlukan..."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
              />
            </div>

            {/* Clock Out Button */}
            <div className="text-center">
              <button
                onClick={handleClockOut}
                disabled={!canClockOut || loading}
                className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg ${
                  canClockOut && !loading
                    ? 'bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white hover:shadow-xl'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Processing...</span>
                  </div>
                ) : (
                  'Clock Out Sekarang'
                )}
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Informasi Clock Out</h4>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Clock out hanya dapat dilakukan antara pukul 17:00 - 17:30</li>
                      <li>Jarak maksimal dari kantor ditentukan oleh pengurus</li>
                      <li>Pastikan GPS aktif untuk validasi lokasi</li>
                      <li>Waktu presensi akan ditampilkan setelah clock out berhasil</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}