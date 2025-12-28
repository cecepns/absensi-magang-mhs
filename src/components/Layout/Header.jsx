import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { removeToken, getUserFromToken } from '../../utils/auth';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUserFromToken();

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-primary-600">
                Absensi Magang
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dashboard
            </Link>
            
            {user.role === 'mahasiswa' && (
              <>
                <Link
                  to="/clock-in"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/clock-in')
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Clock In
                </Link>
                <Link
                  to="/clock-out"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/clock-out')
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Clock Out
                </Link>
                <Link
                  to="/logbook"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/logbook')
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Logbook
                </Link>
              </>
            )}

            {(user.role === 'mentor' || user.role === 'pengurus') && (
              <>
                <Link
                  to="/mentor/students"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/mentor/students')
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Mahasiswa
                </Link>
                <Link
                  to="/mentor/attendance"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive('/mentor/attendance')
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Kelola Absensi
                </Link>
              </>
            )}

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.nama_lengkap}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
            >
              <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                {isOpen ? (
                  <path fillRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"/>
                ) : (
                  <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            
            {user.role === 'mahasiswa' && (
              <>
                <Link
                  to="/clock-in"
                  className="block px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Clock In
                </Link>
                <Link
                  to="/clock-out"
                  className="block px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Clock Out
                </Link>
                <Link
                  to="/logbook"
                  className="block px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  Logbook
                </Link>
              </>
            )}

            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="px-3 py-2 text-sm text-gray-700">
                {user.nama_lengkap}
              </div>
              <button
                onClick={handleLogout}
                className="block px-3 py-2 text-sm text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}