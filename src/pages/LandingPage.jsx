import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function LandingPage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">
                Absensi Magang
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center" data-aos="fade-up">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Sistem Absensi dan
              <span className="text-primary-600 block">
                Logbook Mahasiswa Magang
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Platform digital untuk mengelola absensi dan aktivitas harian mahasiswa magang 
              dengan sistem lokasi dan validasi waktu yang akurat.
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-3"
              >
                Mulai Sekarang
              </Link>
              <Link
                to="/login"
                className="bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50 font-medium text-lg px-8 py-3 rounded-lg transition-colors duration-200"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600">
              Solusi lengkap untuk manajemen kehadiran dan aktivitas mahasiswa magang
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Absensi Berbasis Lokasi
              </h3>
              <p className="text-gray-600">
                Sistem validasi lokasi dengan radius 500 meter dari kantor untuk memastikan kehadiran yang akurat.
              </p>
            </div>

            <div className="card p-8 text-center" data-aos="fade-up" data-aos-delay="200">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Validasi Waktu
              </h3>
              <p className="text-gray-600">
                Clock in (07:30-08:00) dan clock out (17:00-17:30) dengan sistem validasi waktu yang ketat.
              </p>
            </div>

            <div className="card p-8 text-center" data-aos="fade-up" data-aos-delay="300">
              <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Logbook Digital
              </h3>
              <p className="text-gray-600">
                Catat hingga 4 kegiatan per hari dengan durasi waktu untuk memantau produktivitas mahasiswa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cara Kerja
            </h2>
            <p className="text-xl text-gray-600">
              Proses sederhana untuk memulai menggunakan sistem
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Daftarkan Akun",
                description: "Isi data pribadi dan informasi magang lengkap"
              },
              {
                step: 2,
                title: "Pilih Role",
                description: "Tentukan sebagai mahasiswa atau mentor/pengurus"
              },
              {
                step: 3,
                title: "Izinkan Lokasi",
                description: "Berikan akses lokasi untuk validasi absensi"
              },
              {
                step: 4,
                title: "Mulai Absensi",
                description: "Clock in/out dan isi logbook harian"
              }
            ].map((item, index) => (
              <div key={index} className="text-center" data-aos="fade-up" data-aos-delay={index * 100}>
                <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8" data-aos="fade-up">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Memulai Magang Anda?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Bergabunglah dengan ribuan mahasiswa magang yang telah menggunakan platform kami
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 hover:bg-gray-50 font-semibold text-lg px-8 py-4 rounded-lg transition-colors duration-200 inline-block"
          >
            Daftar Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Absensi Magang</h3>
            <p className="text-gray-400">
              Platform digital untuk manajemen absensi dan logbook mahasiswa magang
            </p>
            <div className="mt-4 text-gray-500 text-sm">
              © 2025 Absensi Magang. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}