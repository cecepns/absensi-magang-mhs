import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { isLogbookTime, formatDate } from '../../utils/time';
import ApiService from '../../utils/api';

export default function Logbook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    kegiatan: '',
    durasi: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [logbookHistory, setLogbookHistory] = useState([]);

  useEffect(() => {
    fetchTodayActivities();
    fetchLogbookHistory();
  }, []);

  useEffect(() => {
    fetchLogbookHistory();
  }, [monthFilter, yearFilter]);

  const fetchTodayActivities = async () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    try {
      const logbooks = await ApiService.getLogbooks(month, year);
      const todayDate = today.toISOString().split('T')[0];
      const todayActivities = logbooks.filter(log => log.tanggal === todayDate);
      setActivities(todayActivities);
    } catch (err) {
      console.error('Error fetching today activities:', err);
    }
  };

  const fetchLogbookHistory = async () => {
    try {
      const logbooks = await ApiService.getLogbooks(monthFilter, yearFilter);
      setLogbookHistory(logbooks);
    } catch (err) {
      console.error('Error fetching logbook history:', err);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.kegiatan || !newActivity.durasi) {
      setError('Mohon isi semua field');
      return;
    }

    if (activities.length >= 4) {
      setError('Maksimal 4 kegiatan per hari');
      return;
    }

    if (!isLogbookTime()) {
      setError('Logbook hanya dapat diisi antara pukul 07:30 - 17:30');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await ApiService.createLogbook({
        ...newActivity,
        tanggal: new Date().toISOString().split('T')[0]
      });

      setActivities(prev => [...prev, response]);
      setNewActivity({ kegiatan: '', durasi: '' });
      setSuccess('Kegiatan berhasil ditambahkan');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditActivity = (id) => {
    const activity = activities.find(a => a.id === id);
    setNewActivity({
      kegiatan: activity.kegiatan,
      durasi: activity.durasi
    });
    setEditingId(id);
  };

  const handleUpdateActivity = async () => {
    if (!newActivity.kegiatan || !newActivity.durasi) {
      setError('Mohon isi semua field');
      return;
    }

    if (!isLogbookTime()) {
      setError('Logbook hanya dapat diupdate antara pukul 07:30 - 17:30');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ApiService.updateLogbook(editingId, newActivity);
      
      setActivities(prev => prev.map(activity => 
        activity.id === editingId ? { ...activity, ...newActivity } : activity
      ));
      
      setNewActivity({ kegiatan: '', durasi: '' });
      setEditingId(null);
      setSuccess('Kegiatan berhasil diupdate');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!confirm('Yakin ingin menghapus kegiatan ini?')) {
      return;
    }

    if (!isLogbookTime()) {
      setError('Logbook hanya dapat dihapus antara pukul 07:30 - 17:30');
      return;
    }

    setLoading(true);
    
    try {
      await ApiService.deleteLogbook(id);
      setActivities(prev => prev.filter(activity => activity.id !== id));
      setSuccess('Kegiatan berhasil dihapus');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setNewActivity({ kegiatan: '', durasi: '' });
    setEditingId(null);
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const groupedHistory = logbookHistory.reduce((groups, log) => {
    const date = log.tanggal;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {});

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Logbook Harian</h1>
          <p className="text-gray-600">
            Catat kegiatan harian Anda (maksimal 4 kegiatan per hari)
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Waktu akses: 07:30 - 17:30
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Today's Activities */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Kegiatan Hari Ini ({formatDate(new Date())})
          </h2>
          
          {/* Add/Edit Activity Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kegiatan
                </label>
                <textarea
                  rows={2}
                  className="input-field"
                  placeholder="Deskripsikan kegiatan yang dikerjakan..."
                  value={newActivity.kegiatan}
                  onChange={(e) => setNewActivity(prev => ({
                    ...prev,
                    kegiatan: e.target.value
                  }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durasi
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="2 jam 30 menit"
                  value={newActivity.durasi}
                  onChange={(e) => setNewActivity(prev => ({
                    ...prev,
                    durasi: e.target.value
                  }))}
                />
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              {editingId ? (
                <>
                  <button
                    onClick={handleUpdateActivity}
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? <LoadingSpinner size="small" /> : 'Update'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAddActivity}
                  disabled={loading || activities.length >= 4}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activities.length >= 4
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {loading ? <LoadingSpinner size="small" /> : 'Tambah Kegiatan'}
                </button>
              )}
            </div>
          </div>

          {/* Today's Activities List */}
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded">
                          Kegiatan {index + 1}
                        </span>
                        <span className="text-sm text-gray-500">{activity.durasi}</span>
                      </div>
                      <p className="text-gray-900">{activity.kegiatan}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditActivity(activity.id)}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-right text-sm text-gray-500">
                {activities.length}/4 kegiatan terisi
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Belum ada kegiatan yang dicatat hari ini</p>
            </div>
          )}
        </div>

        {/* Logbook History */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Riwayat Logbook</h2>
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
          </div>

          {Object.keys(groupedHistory).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedHistory)
                .sort(([a], [b]) => new Date(b) - new Date(a))
                .map(([date, logs]) => (
                <div key={date} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    {formatDate(new Date(date))}
                  </h3>
                  <div className="space-y-2">
                    {logs.map((log, index) => (
                      <div key={log.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mr-2">
                            {index + 1}
                          </span>
                          {log.kegiatan}
                        </div>
                        <span className="text-sm text-gray-500">{log.durasi}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Tidak ada data logbook untuk {monthNames[monthFilter - 1]} {yearFilter}</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}