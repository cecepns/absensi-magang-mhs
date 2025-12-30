import { useState, useEffect } from 'react';
import Layout from '../components/Layout/Layout';
import ApiService from '../utils/api';
import { getUserFromToken } from '../utils/auth';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const tokenUser = getUserFromToken();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    try {
      const userData = await ApiService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setError(err.message || 'Gagal memuat data profil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="card p-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="card p-6">
          <p className="text-gray-600">Data profil tidak ditemukan</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-600 mt-1">Data diri dan informasi akun Anda</p>
        </div>

        {/* Profile Card */}
        <div className="card p-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Informasi Pribadi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nama Lengkap
                  </label>
                  <p className="text-gray-900 font-medium">{user.nama_lengkap || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900">{user.email || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nomor HP/WhatsApp
                  </label>
                  <p className="text-gray-900">{user.nomor_hp || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Tempat Lahir
                  </label>
                  <p className="text-gray-900">{user.tempat_lahir || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Tanggal Lahir
                  </label>
                  <p className="text-gray-900">
                    {user.tanggal_lahir 
                      ? new Date(user.tanggal_lahir).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Agama
                  </label>
                  <p className="text-gray-900">{user.agama || '-'}</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Alamat Rumah/Kos
                  </label>
                  <p className="text-gray-900">{user.alamat || '-'}</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Informasi Akademik
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Asal Universitas
                  </label>
                  <p className="text-gray-900">{user.asal_universitas || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Jurusan
                  </label>
                  <p className="text-gray-900">{user.jurusan || '-'}</p>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Informasi Unit Kerja
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Unit Eselon 2
                  </label>
                  <p className="text-gray-900">{user.ue2 || '-'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Unit Eselon 3
                  </label>
                  <p className="text-gray-900">{user.ue3 || '-'}</p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                Informasi Akun
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Role
                  </label>
                  <p className="text-gray-900 capitalize">
                    {user.role === 'mahasiswa' ? 'Mahasiswa' : 
                     user.role === 'mentor' ? 'Mentor' : 
                     user.role === 'pengurus' ? 'Pengurus' : 
                     user.role || '-'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Tanggal Daftar
                  </label>
                  <p className="text-gray-900">
                    {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

