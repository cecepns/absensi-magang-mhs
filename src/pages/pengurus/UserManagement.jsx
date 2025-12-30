import { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import ApiService from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    email: '',
    nomor_hp: '',
    asal_universitas: '',
    jurusan: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    alamat: '',
    agama: 'Islam',
    ue2: '',
    ue3: '',
    password: '',
    role: 'mahasiswa',
    mentor_id: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchMentors();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getAllUsers(roleFilter || null, searchTerm || null);
      
      // Fetch mentor details for students
      const usersWithMentors = await Promise.all(
        data.map(async (user) => {
          if (user.role === 'mahasiswa') {
            try {
              const userDetail = await ApiService.getUserById(user.id);
              return { ...user, mentor: userDetail.mentor || null };
            } catch (err) {
              console.error(`Error fetching mentor for user ${user.id}:`, err);
              return { ...user, mentor: null };
            }
          }
          return user;
        })
      );
      
      setUsers(usersWithMentors);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    try {
      const data = await ApiService.getAllMentors();
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nama_lengkap: user.nama_lengkap || '',
        email: user.email || '',
        nomor_hp: user.nomor_hp || '',
        asal_universitas: user.asal_universitas || '',
        jurusan: user.jurusan || '',
        tempat_lahir: user.tempat_lahir || '',
        tanggal_lahir: user.tanggal_lahir ? user.tanggal_lahir.split('T')[0] : '',
        alamat: user.alamat || '',
        agama: user.agama || 'Islam',
        ue2: user.ue2 || '',
        ue3: user.ue3 || '',
        password: '',
        role: user.role || 'mahasiswa',
        mentor_id: user.mentor?.id || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        nama_lengkap: '',
        email: '',
        nomor_hp: '',
        asal_universitas: '',
        jurusan: '',
        tempat_lahir: '',
        tanggal_lahir: '',
        alamat: '',
        agama: 'Islam',
        ue2: '',
        ue3: '',
        password: '',
        role: 'mahasiswa',
        mentor_id: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      nama_lengkap: '',
      email: '',
      nomor_hp: '',
      asal_universitas: '',
      jurusan: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      alamat: '',
      agama: 'Islam',
      ue2: '',
      ue3: '',
      password: '',
      role: 'mahasiswa',
      mentor_id: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await ApiService.updateUser(editingUser.id, updateData);
        alert('User berhasil diupdate');
      } else {
        // Create user
        if (!formData.password) {
          alert('Password harus diisi untuk user baru');
          return;
        }
        await ApiService.createUser(formData);
        alert('User berhasil dibuat');
      }
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.message || 'Gagal menyimpan user');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menonaktifkan user ini?')) {
      return;
    }
    try {
      await ApiService.deleteUser(id);
      alert('User berhasil dinonaktifkan');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.message || 'Gagal menonaktifkan user');
    }
  };

  const handleOpenAssignModal = async (user) => {
    try {
      // Fetch user detail to get current mentor assignment
      const userDetail = await ApiService.getUserById(user.id);
      setSelectedStudent(userDetail);
      setShowAssignModal(true);
    } catch (error) {
      console.error('Error fetching user detail:', error);
      // Fallback to user data if detail fetch fails
      setSelectedStudent(user);
      setShowAssignModal(true);
    }
  };

  const handleAssignMentor = async (mentorId) => {
    if (!selectedStudent) return;
    try {
      if (mentorId) {
        await ApiService.assignMentorToStudent(selectedStudent.id, mentorId);
        alert('Mentor berhasil diassign');
      } else {
        await ApiService.unassignMentorFromStudent(selectedStudent.id);
        alert('Mentor berhasil diunassign');
      }
      setShowAssignModal(false);
      setSelectedStudent(null);
      fetchUsers();
    } catch (error) {
      console.error('Error assigning mentor:', error);
      alert(error.message || 'Gagal assign mentor');
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      mahasiswa: 'Mahasiswa',
      mentor: 'Mentor',
      pengurus: 'Pengurus'
    };
    return labels[role] || role;
  };

  const filteredUsers = users.filter(user => {
    if (roleFilter && user.role !== roleFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        user.nama_lengkap?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (loading && users.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
        >
          + Tambah User
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Semua Role</option>
              <option value="mahasiswa">Mahasiswa</option>
              <option value="mentor">Mentor</option>
              <option value="pengurus">Pengurus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari User
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama atau email..."
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card p-6">
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
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UE2 / UE3
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada user ditemukan
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.nama_lengkap}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === 'pengurus' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'mentor' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.ue2 || '-'} / {user.ue3 || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {user.mentor?.nama_lengkap || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        {user.role === 'mahasiswa' && (
                          <button
                            onClick={() => handleOpenAssignModal(user)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Assign Mentor
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={!user.is_active}
                        >
                          {user.is_active ? 'Nonaktifkan' : 'Nonaktif'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingUser ? 'Edit User' : 'Tambah User Baru'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama_lengkap}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor HP
                    </label>
                    <input
                      type="text"
                      value={formData.nomor_hp}
                      onChange={(e) => setFormData({ ...formData, nomor_hp: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value, mentor_id: '' })}
                      className="input-field"
                    >
                      <option value="mahasiswa">Mahasiswa</option>
                      <option value="mentor">Mentor</option>
                      <option value="pengurus">Pengurus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asal Universitas
                    </label>
                    <input
                      type="text"
                      value={formData.asal_universitas}
                      onChange={(e) => setFormData({ ...formData, asal_universitas: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jurusan
                    </label>
                    <input
                      type="text"
                      value={formData.jurusan}
                      onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      value={formData.tempat_lahir}
                      onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agama
                    </label>
                    <select
                      value={formData.agama}
                      onChange={(e) => setFormData({ ...formData, agama: e.target.value })}
                      className="input-field"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password {!editingUser && '*'}
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field"
                      placeholder={editingUser ? 'Kosongkan jika tidak ingin mengubah' : ''}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Eselon 2
                    </label>
                    <input
                      type="text"
                      value={formData.ue2}
                      onChange={(e) => setFormData({ ...formData, ue2: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Eselon 3
                    </label>
                    <input
                      type="text"
                      value={formData.ue3}
                      onChange={(e) => setFormData({ ...formData, ue3: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  {formData.role === 'mahasiswa' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign Mentor
                      </label>
                      <select
                        value={formData.mentor_id}
                        onChange={(e) => setFormData({ ...formData, mentor_id: e.target.value })}
                        className="input-field"
                      >
                        <option value="">Pilih Mentor (Opsional)</option>
                        {mentors.map((mentor) => (
                          <option key={mentor.id} value={mentor.id}>
                            {mentor.nama_lengkap} ({mentor.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="input-field"
                    rows="3"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingUser ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Mentor Modal */}
      {showAssignModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Assign Mentor
                </h2>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedStudent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Mahasiswa: <span className="font-semibold">{selectedStudent.nama_lengkap}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Mentor saat ini: <span className="font-semibold">
                    {selectedStudent.mentor?.nama_lengkap || 'Belum ada'}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Mentor
                  </label>
                  <select
                    defaultValue={selectedStudent.mentor?.id || ''}
                    className="input-field"
                    id="mentor-select"
                  >
                    <option value="">Tidak ada mentor (Unassign)</option>
                    {mentors.map((mentor) => (
                      <option key={mentor.id} value={mentor.id}>
                        {mentor.nama_lengkap} ({mentor.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedStudent(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      const select = document.getElementById('mentor-select');
                      handleAssignMentor(select.value || null);
                    }}
                    className="btn-primary"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
}

