import { useState, useEffect } from 'react';
import ApiService from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/time';

export default function MentorStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentAttendance();
    }
  }, [selectedStudent, monthFilter, yearFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttendance = async () => {
    if (!selectedStudent) return;
    
    try {
      const data = await ApiService.getStudentAttendance(
        selectedStudent.id,
        'all',
        monthFilter,
        yearFilter
      );
      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceData([]);
    }
  };

  const getTodayStatus = (studentId) => {
    if (!attendanceData || selectedStudent?.id !== studentId) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const todayClockIn = attendanceData.find(item => 
      item.tanggal === today && item.type === 'clock_in'
    );
    const todayClockOut = attendanceData.find(item => 
      item.tanggal === today && item.type === 'clock_out'
    );

    if (todayClockIn && todayClockOut) {
      return { status: 'present', clockIn: todayClockIn, clockOut: todayClockOut };
    } else if (todayClockIn) {
      const isLate = todayClockIn.jam > '08:00:00';
      return { status: isLate ? 'late' : 'clocked_in', clockIn: todayClockIn, clockOut: null };
    }
    return { status: 'absent', clockIn: null, clockOut: null };
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Daftar Mahasiswa</h2>
        
        {students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Tidak ada mahasiswa yang terdaftar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Universitas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UE2 / UE3
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Hari Ini
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => {
                  const todayStatus = getTodayStatus(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.nama_lengkap}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.asal_universitas}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {student.ue2} / {student.ue3}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {todayStatus ? (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            todayStatus.status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : todayStatus.status === 'late'
                              ? 'bg-yellow-100 text-yellow-800'
                              : todayStatus.status === 'clocked_in'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {todayStatus.status === 'present' ? 'Hadir' :
                             todayStatus.status === 'late' ? 'Terlambat' :
                             todayStatus.status === 'clocked_in' ? 'Sudah Clock In' :
                             'Tidak Hadir'}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            -
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Detail Absensi - {selectedStudent.nama_lengkap}
            </h3>
            <button
              onClick={() => {
                setSelectedStudent(null);
                setAttendanceData(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex space-x-3 mb-4">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(Number(e.target.value))}
              className="input-field py-2"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="input-field py-2"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          {attendanceData && attendanceData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Clock In
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Clock Out
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(
                    attendanceData.reduce((groups, item) => {
                      const date = item.tanggal;
                      if (!groups[date]) {
                        groups[date] = { clockIn: null, clockOut: null };
                      }
                      if (item.type === 'clock_in') {
                        groups[date].clockIn = item;
                      } else {
                        groups[date].clockOut = item;
                      }
                      return groups;
                    }, {})
                  )
                    .sort(([a], [b]) => new Date(b) - new Date(a))
                    .map(([date, { clockIn, clockOut }]) => (
                      <tr key={date}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(new Date(date))}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {clockIn ? (
                            <div>
                              <div className={clockIn.jam > '08:00:00' ? 'text-gray-500' : 'text-gray-900'}>
                                {clockIn.jam}
                              </div>
                              {clockIn.approved === null && (
                                <span className="text-xs text-yellow-600">Pending</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {clockOut ? (
                            <div>
                              <div className={clockOut.status === 'MANUAL' ? 'text-gray-500' : 'text-gray-900'}>
                                {clockOut.jam}
                              </div>
                              {clockOut.approved === null && (
                                <span className="text-xs text-yellow-600">Pending</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {clockIn && clockOut ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Lengkap
                            </span>
                          ) : clockIn ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                              Belum Clock Out
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Tidak Hadir
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Tidak ada data absensi untuk periode ini</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

