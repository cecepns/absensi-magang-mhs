import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { removeToken, getUserFromToken } from '../../utils/auth';

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    if (path === '/mentor/students') {
      return location.pathname.startsWith(path);
    }
    if (path === '/mentor/attendance') {
      // Active when on attendance, clock-in, or clock-out pages
      return location.pathname === '/mentor/attendance' ||
             location.pathname === '/mentor/clock-in' ||
             location.pathname === '/mentor/clock-out';
    }
    if (path === '/pengurus/users') {
      return location.pathname === path;
    }
    if (path === '/profile') {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      roles: ['mahasiswa', 'mentor', 'pengurus']
    },
    {
      name: 'Clock In',
      path: '/clock-in',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      roles: ['mahasiswa']
    },
    {
      name: 'Clock Out',
      path: '/clock-out',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      roles: ['mahasiswa']
    },
    {
      name: 'Logbook',
      path: '/logbook',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      roles: ['mahasiswa']
    },
    {
      name: 'Mahasiswa',
      path: '/mentor/students',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      roles: ['mentor', 'pengurus']
    },
    {
      name: 'Kelola Absensi',
      path: '/mentor/attendance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      roles: ['mentor', 'pengurus']
    },
    {
      name: 'Manajemen User',
      path: '/pengurus/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      roles: ['pengurus']
    },
    {
      name: 'Profil',
      path: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      roles: ['mahasiswa', 'mentor', 'pengurus']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-transform overflow-hidden
          lg:translate-x-0 lg:sticky lg:top-0 lg:z-auto lg:h-screen
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          w-64 bg-white border-r border-gray-200 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center">
            <h1 className="text-xl font-bold text-primary-600">
              Absensi Magang
            </h1>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                ${isActive(item.path)
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* User info and logout */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-sm">
                  {user.nama_lengkap?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.nama_lengkap || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user.role === 'mahasiswa' ? 'Mahasiswa' : 
                 user.role === 'mentor' ? 'Mentor' : 
                 user.role === 'pengurus' ? 'Pengurus' : 
                 user.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

