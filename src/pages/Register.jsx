import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    nomor_hp: '',
    asal_universitas: '',
    jurusan: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    agama: '',
    ue2: '',
    ue3: '',
    password: '',
    confirm_password: '',
    role: 'mahasiswa'
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      await ApiService.register(formData);
      navigate('/login', { 
        state: { message: 'Registrasi berhasil! Silakan login.' }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const agamaOptions = [
    'Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'
  ];

  const ue2Options = [
    'Sekretariat Direktorat Jenderal',
    'Direktorat Pinjaman dan Hibah',
    'Direktorat Surat Utang Negara',
    'Direktorat Pembiayaan Syariah',
    'Direktorat Pengelolaan Risiko Keuangan Negara',
    'Direktorat Pengelolaan Dukungan Pemerintah dan Pembiayaan Infrastruktur',
    'Direktorat Strategi dan Portofolio Pembiayaan',
    'Direktorat Evaluasi, Akuntansi, dan Setelmen',
    'Lembaga Dana Kerja Sama Pembangunan Intenasional'
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <h1 className="text-2xl font-bold text-primary-600">
            Absensi Magang
          </h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Daftarkan akun baru
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Atau{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            masuk ke akun yang sudah ada
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="card py-8 px-4 shadow sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="nama_lengkap" className="block text-sm font-medium text-gray-700">
                Nama Lengkap *
              </label>
              <input
                id="nama_lengkap"
                name="nama_lengkap"
                type="text"
                required
                className="input-field mt-1"
                value={formData.nama_lengkap}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field mt-1"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="nomor_hp" className="block text-sm font-medium text-gray-700">
                Nomor HP/WhatsApp *
              </label>
              <input
                id="nomor_hp"
                name="nomor_hp"
                type="tel"
                required
                className="input-field mt-1"
                value={formData.nomor_hp}
                onChange={handleChange}
                placeholder="08xxx"
              />
            </div>

            <div>
              <label htmlFor="asal_universitas" className="block text-sm font-medium text-gray-700">
                Asal Universitas *
              </label>
              <input
                id="asal_universitas"
                name="asal_universitas"
                type="text"
                required
                className="input-field mt-1"
                value={formData.asal_universitas}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="jurusan" className="block text-sm font-medium text-gray-700">
                Jurusan *
              </label>
              <input
                id="jurusan"
                name="jurusan"
                type="text"
                required
                className="input-field mt-1"
                value={formData.jurusan}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tempat_lahir" className="block text-sm font-medium text-gray-700">
                  Tempat Lahir *
                </label>
                <input
                  id="tempat_lahir"
                  name="tempat_lahir"
                  type="text"
                  required
                  className="input-field mt-1"
                  value={formData.tempat_lahir}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="tanggal_lahir" className="block text-sm font-medium text-gray-700">
                  Tanggal Lahir *
                </label>
                <input
                  id="tanggal_lahir"
                  name="tanggal_lahir"
                  type="date"
                  required
                  className="input-field mt-1"
                  value={formData.tanggal_lahir}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
                Alamat Rumah/Kos *
              </label>
              <textarea
                id="alamat"
                name="alamat"
                rows={3}
                required
                className="input-field mt-1"
                value={formData.alamat}
                onChange={handleChange}
              ></textarea>
            </div>

            <div>
              <label htmlFor="agama" className="block text-sm font-medium text-gray-700">
                Agama *
              </label>
              <select
                id="agama"
                name="agama"
                required
                className="input-field mt-1"
                value={formData.agama}
                onChange={handleChange}
              >
                <option value="">Pilih Agama</option>
                {agamaOptions.map(agama => (
                  <option key={agama} value={agama}>{agama}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ue2" className="block text-sm font-medium text-gray-700">
                Unit Eselon 2 *
              </label>
              <select
                id="ue2"
                name="ue2"
                required
                className="input-field mt-1"
                value={formData.ue2}
                onChange={handleChange}
              >
                <option value="">Pilih Unit Eselon 2</option>
                {ue2Options.map(ue2 => (
                  <option key={ue2} value={ue2}>{ue2}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ue3" className="block text-sm font-medium text-gray-700">
                Unit Eselon 3 *
              </label>
              <input
                id="ue3"
                name="ue3"
                type="text"
                required
                className="input-field mt-1"
                value={formData.ue3}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field mt-1"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                Konfirmasi Password *
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                required
                className="input-field mt-1"
                value={formData.confirm_password}
                onChange={handleChange}
                minLength={6}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex justify-center py-3"
              >
                {loading ? <LoadingSpinner size="small" /> : 'Daftar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}