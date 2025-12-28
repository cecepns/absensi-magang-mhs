import { useState, useEffect } from 'react';
import ApiService from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/time';

export default function MentorLogbook() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [logbooks, setLogbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentLogbooks();
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

  const fetchStudentLogbooks = async () => {
    if (!selectedStudent) return;
    
    setLoading(true);
    try {
      const data = await ApiService.getStudentLogbooks(
        selectedStudent.id,
        monthFilter,
        yearFilter
      );
      setLogbooks(data);
    } catch (error) {
      console.error('Error fetching logbooks:', error);
      setLogbooks([]);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const groupedLogbooks = logbooks.reduce((groups, log) => {
    const date = log.tanggal;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {});

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Logbook Mahasiswa</h2>
        <p className="text-gray-600">Lihat dan pantau kegiatan harian mahasiswa (Read-only)</p>
      </div>

      {/* Student Selection */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Mahasiswa
            </label>
            <select
              value={selectedStudent?.id || ''}
              onChange={(e) => {
                const student = students.find(s => s.id === Number(e.target.value));
                setSelectedStudent(student || null);
              }}
              className="input-field"
            >
              <option value="">-- Pilih Mahasiswa --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.nama_lengkap} - {student.asal_universitas}
                </option>
              ))}
            </select>
          </div>
          
          {selectedStudent && (
            <div className="flex space-x-3">
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
          )}
        </div>
      </div>

      {/* Logbook Display */}
      {selectedStudent && (
        <div className="card p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Logbook - {selectedStudent.nama_lengkap}
            </h3>
            <p className="text-sm text-gray-600">
              {monthNames[monthFilter - 1]} {yearFilter}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="medium" />
            </div>
          ) : Object.keys(groupedLogbooks).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedLogbooks)
                .sort(([a], [b]) => new Date(b) - new Date(a))
                .map(([date, logs]) => (
                  <div key={date} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      {formatDate(new Date(date))}
                    </h4>
                    <div className="space-y-3">
                      {logs.map((log, index) => (
                        <div
                          key={log.id}
                          className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded">
                                Kegiatan {index + 1}
                              </span>
                              <span className="text-sm text-gray-500">{log.durasi}</span>
                            </div>
                          </div>
                          <p className="text-gray-900">{log.kegiatan}</p>
                          {log.kategori && (
                            <p className="text-sm text-gray-600 mt-1">
                              Kategori: {log.kategori}
                            </p>
                          )}
                          {log.output && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium text-gray-700">Output:</span>
                              <p className="text-gray-600">{log.output}</p>
                            </div>
                          )}
                          {log.kendala && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium text-gray-700">Kendala:</span>
                              <p className="text-gray-600">{log.kendala}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-500">
                      Total: {logs.length} kegiatan
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>Tidak ada data logbook untuk periode ini</p>
            </div>
          )}
        </div>
      )}

      {!selectedStudent && (
        <div className="card p-6">
          <div className="text-center py-12 text-gray-500">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>Pilih mahasiswa untuk melihat logbook mereka</p>
          </div>
        </div>
      )}
    </div>
  );
}

