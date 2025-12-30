// const API_BASE_URL = 'http://localhost:5000/api';
const API_BASE_URL = 'https://api-inventory.isavralabel.com/absensi-magang-mhs/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  }

  // Auth endpoints
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Attendance endpoints
  async clockIn(attendanceData) {
    return this.request('/attendance/clock-in', {
      method: 'POST',
      body: attendanceData,
    });
  }

  async clockOut(attendanceData) {
    return this.request('/attendance/clock-out', {
      method: 'POST',
      body: attendanceData,
    });
  }

  async getAttendanceHistory(type, month, year) {
    return this.request(`/attendance/history?type=${type}&month=${month}&year=${year}`);
  }

  // Logbook endpoints
  async createLogbook(logbookData) {
    return this.request('/logbook', {
      method: 'POST',
      body: logbookData,
    });
  }

  async getLogbooks(month, year) {
    return this.request(`/logbook?month=${month}&year=${year}`);
  }

  async updateLogbook(id, logbookData) {
    return this.request(`/logbook/${id}`, {
      method: 'PUT',
      body: logbookData,
    });
  }

  async deleteLogbook(id) {
    return this.request(`/logbook/${id}`, {
      method: 'DELETE',
    });
  }

  // Mentor endpoints
  async getStudents() {
    return this.request('/mentor/students');
  }

  async getStudentAttendance(studentId, type, month, year) {
    return this.request(`/mentor/attendance/student/${studentId}?type=${type}&month=${month}&year=${year}`);
  }

  async approveAttendance(attendanceId, approved, type = 'clock_in') {
    return this.request('/mentor/attendance/approve', {
      method: 'POST',
      body: { attendanceId, approved, type },
    });
  }

  async manualAttendance(attendanceData) {
    return this.request('/mentor/attendance/manual', {
      method: 'POST',
      body: attendanceData,
    });
  }

  async getAttendanceSchedule(month, year) {
    return this.request(`/mentor/schedule?month=${month}&year=${year}`);
  }

  async createAttendanceSchedule(scheduleData) {
    return this.request('/mentor/schedule', {
      method: 'POST',
      body: scheduleData,
    });
  }

  async updateAttendanceSchedule(id, scheduleData) {
    return this.request(`/mentor/schedule/${id}`, {
      method: 'PUT',
      body: scheduleData,
    });
  }

  async getPendingAttendances(type) {
    return this.request(`/mentor/attendance/pending?type=${type}`);
  }

  async getStudentLogbooks(studentId, month, year) {
    return this.request(`/mentor/logbook/student/${studentId}?month=${month}&year=${year}`);
  }

  // Office Location endpoints
  async getOfficeLocation() {
    return this.request('/office/location');
  }

  async updateOfficeLocation(locationData) {
    return this.request('/office/location', {
      method: 'PUT',
      body: locationData,
    });
  }

  // Pengurus User Management endpoints
  async getAllUsers(role = null, search = null) {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const query = params.toString();
    return this.request(`/pengurus/users${query ? `?${query}` : ''}`);
  }

  async getUserById(id) {
    return this.request(`/pengurus/users/${id}`);
  }

  async createUser(userData) {
    return this.request('/pengurus/users', {
      method: 'POST',
      body: userData,
    });
  }

  async updateUser(id, userData) {
    return this.request(`/pengurus/users/${id}`, {
      method: 'PUT',
      body: userData,
    });
  }

  async deleteUser(id) {
    return this.request(`/pengurus/users/${id}`, {
      method: 'DELETE',
    });
  }

  async assignMentorToStudent(studentId, mentorId) {
    return this.request(`/pengurus/users/${studentId}/assign-mentor`, {
      method: 'POST',
      body: { mentor_id: mentorId },
    });
  }

  async unassignMentorFromStudent(studentId) {
    return this.request(`/pengurus/users/${studentId}/unassign-mentor`, {
      method: 'POST',
    });
  }

  async getAllMentors() {
    return this.request('/pengurus/mentors');
  }

  async getStudentsByMentor(mentorId) {
    return this.request(`/pengurus/mentors/${mentorId}/students`);
  }
}

export default new ApiService();