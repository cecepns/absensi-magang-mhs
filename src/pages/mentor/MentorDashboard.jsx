import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import MentorStudents from './MentorStudents';
import MentorClockIn from './MentorClockIn';
import MentorClockOut from './MentorClockOut';
import MentorLogbook from './MentorLogbook';
import OfficeLocation from './OfficeLocation';
import { getUserFromToken } from '../../utils/auth';
import ApiService from '../../utils/api';

export default function MentorDashboard() {
  const location = useLocation();
  const user = getUserFromToken();

  const navigation = [
    { name: 'Dashboard', path: '/mentor', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Mahasiswa', path: '/mentor/students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Clock In', path: '/mentor/clock-in', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Clock Out', path: '/mentor/clock-out', icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' },
    { name: 'Logbook', path: '/mentor/logbook', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ...(user?.role === 'pengurus' ? [{ name: 'Lokasi Kantor', path: '/mentor/office-location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' }] : []),
  ];

  const isActive = (path) => {
    if (path === '/mentor') {
      return location.pathname === '/mentor';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard {user?.role === 'pengurus' ? 'Pengurus Magang' : 'Mentor'}
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola absensi dan logbook mahasiswa magang
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive(item.path)
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  <span>{item.name}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Content */}
        <Routes>
          <Route index element={<MentorOverview />} />
          <Route path="students" element={<MentorStudents />} />
          <Route path="clock-in" element={<MentorClockIn />} />
          <Route path="clock-out" element={<MentorClockOut />} />
          <Route path="logbook" element={<MentorLogbook />} />
          <Route path="office-location" element={<OfficeLocation />} />
          <Route path="*" element={<Navigate to="/mentor" replace />} />
        </Routes>
      </div>
    </Layout>
  );
}

function MentorOverview() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const students = await ApiService.getStudents();
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's attendance for all students
      const attendancePromises = students.map(async (student) => {
        try {
          const history = await ApiService.getStudentAttendance(student.id, 'all', 
            new Date().getMonth() + 1, 
            new Date().getFullYear()
          );
          const todayClockIn = history.find(item => 
            item.tanggal === today && item.type === 'clock_in'
          );
          const todayClockOut = history.find(item => 
            item.tanggal === today && item.type === 'clock_out'
          );
          
          return {
            id: student.id,
            clockIn: todayClockIn,
            clockOut: todayClockOut
          };
        } catch (err) {
          return { id: student.id, clockIn: null, clockOut: null };
        }
      });

      const attendances = await Promise.all(attendancePromises);
      
      const present = attendances.filter(a => a.clockIn && a.clockOut).length;
      const late = attendances.filter(a => {
        if (!a.clockIn) return false;
        const clockInTime = a.clockIn.jam;
        return clockInTime > '08:00:00';
      }).length;
      const absent = attendances.filter(a => !a.clockIn).length;
      const pending = attendances.filter(a => 
        (a.clockIn && a.clockIn.approved === null) || 
        (a.clockOut && a.clockOut.approved === null)
      ).length;

      setStats({
        totalStudents: students.length,
        presentToday: present,
        lateToday: late,
        absentToday: absent,
        pendingApprovals: pending
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Mahasiswa</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.totalStudents}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Hadir Hari Ini</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.presentToday}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Terlambat</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.lateToday}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tidak Hadir</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.absentToday}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approval</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.pendingApprovals}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/mentor/students" className="card p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Kelola Mahasiswa
          </h3>
          <p className="text-gray-600 mb-4">
            Lihat daftar mahasiswa dan status kehadiran mereka
          </p>
          <div className="text-primary-600 font-medium">
            Lihat Detail →
          </div>
        </Link>

        <Link to="/mentor/clock-in" className="card p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Kelola Clock In
          </h3>
          <p className="text-gray-600 mb-4">
            Atur jadwal dan approval clock in mahasiswa
          </p>
          <div className="text-primary-600 font-medium">
            Kelola Clock In →
          </div>
        </Link>

        <Link to="/mentor/logbook" className="card p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Lihat Logbook
          </h3>
          <p className="text-gray-600 mb-4">
            Pantau kegiatan harian mahasiswa
          </p>
          <div className="text-primary-600 font-medium">
            Lihat Logbook →
          </div>
        </Link>
      </div>
    </div>
  );
}

