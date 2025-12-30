import { useState, useEffect } from 'react';
import ApiService from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/time';

export default function MentorClockIn() {
  const [pendingAttendances, setPendingAttendances] = useState([]);
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [manualForm, setManualForm] = useState({
    userId: '',
    tanggal: new Date().toISOString().split('T')[0],
    jam: '08:00',
    keterangan: 'Terlambat - Diabsenkan mentor'
  });
  const [scheduleForm, setScheduleForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    jam_masuk: '07:30',
    batas_masuk: '08:00',
    keterangan: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const [pending, studentsData, schedulesData] = await Promise.all([
        ApiService.getPendingAttendances('clock_in'),
        ApiService.getStudents(),
        ApiService.getAttendanceSchedule(today.getMonth() + 1, today.getFullYear())
      ]);
      setPendingAttendances(pending);
      setStudents(studentsData);
      setSchedules(schedulesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (attendanceId, approved) => {
    try {
      await ApiService.approveAttendance(attendanceId, approved, 'clock_in');
      await fetchData();
    } catch (error) {
      alert('Gagal mengupdate approval: ' + error.message);
    }
  };

  const handleManualAttendance = async (e) => {
    e.preventDefault();
    if (!manualForm.userId || !manualForm.tanggal || !manualForm.jam) {
      alert('Mohon isi semua field yang diperlukan');
      return;
    }

    try {
      await ApiService.manualAttendance({
        ...manualForm,
        type: 'clock_in',
        status: 'MANUAL'
      });
      alert('Absensi manual berhasil ditambahkan');
      setShowManualForm(false);
      setManualForm({
        userId: '',
        tanggal: new Date().toISOString().split('T')[0],
        jam: '08:00',
        keterangan: 'Terlambat - Diabsenkan mentor'
      });
      await fetchData();
    } catch (error) {
      alert('Gagal menambahkan absensi manual: ' + error.message);
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await ApiService.createAttendanceSchedule({
        ...scheduleForm,
        jam_keluar: '17:00',
        batas_keluar: '17:30'
      });
      alert('Jadwal berhasil dibuat');
      setShowScheduleForm(false);
      setScheduleForm({
        tanggal: new Date().toISOString().split('T')[0],
        jam_masuk: '07:30',
        batas_masuk: '08:00',
        keterangan: ''
      });
      await fetchData();
    } catch (error) {
      alert('Gagal membuat jadwal: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="card p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Kelola Clock In</h2>
            <p className="text-gray-600 mt-1">Atur jadwal dan approval clock in mahasiswa</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowScheduleForm(true)}
              className="btn-primary"
            >
              Buat Jadwal
            </button>
            <button
              onClick={() => setShowManualForm(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Absensi Manual
            </button>
          </div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daftar Jadwal Clock In
        </h3>
        
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Belum ada jadwal yang dibuat</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Jam Masuk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Batas Masuk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Keterangan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules
                  .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
                  .map((schedule) => (
                    <tr key={schedule.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(new Date(schedule.tanggal))}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {schedule.jam_masuk}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {schedule.batas_masuk}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {schedule.keterangan || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          schedule.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {schedule.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Approvals */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pending Approval ({pendingAttendances.length})
        </h3>
        
        {pendingAttendances.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Tidak ada clock in yang menunggu approval</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mahasiswa
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Jam
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Jarak
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Keterangan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingAttendances.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {attendance.nama_lengkap || `User ID: ${attendance.user_id}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(new Date(attendance.tanggal))}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {attendance.jam}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {attendance.distance ? `${attendance.distance} m` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {attendance.keterangan || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(attendance.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Setujui
                        </button>
                        <button
                          onClick={() => handleApprove(attendance.id, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Attendance Modal */}
      {showManualForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Absensi Manual Clock In</h3>
            <form onSubmit={handleManualAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mahasiswa
                </label>
                <select
                  value={manualForm.userId}
                  onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Pilih Mahasiswa</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.nama_lengkap}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={manualForm.tanggal}
                  onChange={(e) => setManualForm({ ...manualForm, tanggal: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jam
                </label>
                <input
                  type="time"
                  value={manualForm.jam}
                  onChange={(e) => setManualForm({ ...manualForm, jam: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  value={manualForm.keterangan}
                  onChange={(e) => setManualForm({ ...manualForm, keterangan: e.target.value })}
                  className="input-field"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Buat Jadwal Clock In</h3>
            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={scheduleForm.tanggal}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, tanggal: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jam Masuk
                </label>
                <input
                  type="time"
                  value={scheduleForm.jam_masuk}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, jam_masuk: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batas Masuk
                </label>
                <input
                  type="time"
                  value={scheduleForm.batas_masuk}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, batas_masuk: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  value={scheduleForm.keterangan}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, keterangan: e.target.value })}
                  className="input-field"
                  rows={2}
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowScheduleForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

