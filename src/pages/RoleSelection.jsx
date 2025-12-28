import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserFromToken, getUserRole } from '../utils/auth';

export default function RoleSelection() {
  const navigate = useNavigate();
  const user = getUserFromToken();
  const role = getUserRole();
  const [selectedRole, setSelectedRole] = useState('');

  // Auto-redirect berdasarkan role dari token
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Jika role sudah ada di token, langsung redirect
    if (role === 'mahasiswa') {
      navigate('/dashboard', { replace: true });
    } else if (role === 'mentor' || role === 'pengurus') {
      navigate('/mentor', { replace: true });
    }
  }, [user, role, navigate]);

  const handleRoleSelect = () => {
    if (selectedRole) {
      // Redirect berdasarkan role yang dipilih
      if (selectedRole === 'mahasiswa') {
        navigate('/dashboard');
      } else if (selectedRole === 'mentor' || selectedRole === 'pengurus') {
        navigate('/mentor');
      }
    }
  };

  if (!user) {
    return null;
  }

  // Jika sudah ada role di token, tidak perlu render form (akan redirect)
  if (role) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-2xl font-bold text-primary-600 text-center mb-6">
          Absensi Magang
        </h1>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Pilih Role Anda
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Selamat datang, {user.nama_lengkap}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 shadow sm:px-10">
          <div className="space-y-4">
            <div>
              <label className="block">
                <input
                  type="radio"
                  name="role"
                  value="mahasiswa"
                  checked={selectedRole === 'mahasiswa'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="sr-only"
                />
                <div className={`card p-6 cursor-pointer border-2 transition-colors ${
                  selectedRole === 'mahasiswa' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedRole === 'mahasiswa'
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedRole === 'mahasiswa' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Mahasiswa Magang
                      </h3>
                      <p className="text-sm text-gray-600">
                        Akses untuk melakukan absensi dan mengisi logbook
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            </div>

            <div>
              <label className="block">
                <input
                  type="radio"
                  name="role"
                  value="mentor"
                  checked={selectedRole === 'mentor'}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="sr-only"
                />
                <div className={`card p-6 cursor-pointer border-2 transition-colors ${
                  selectedRole === 'mentor' 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-primary-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedRole === 'mentor'
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedRole === 'mentor' && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pengurus Magang / Mentor
                      </h3>
                      <p className="text-sm text-gray-600">
                        Akses untuk mengelola dan memantau mahasiswa magang
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleRoleSelect}
              disabled={!selectedRole}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                selectedRole 
                  ? 'btn-primary' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Lanjutkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}