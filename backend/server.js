const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads-absensi-mahasiswa-magang');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Database connection
let db;
async function connectDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    });
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

// Haversine formula to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Time validation functions
function isTimeInRange(timeString, startTime, endTime) {
  const time = new Date(`1970-01-01T${timeString}:00`);
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  
  return time >= start && time <= end;
}

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Get office location from database
async function getOfficeLocation() {
  try {
    const [rows] = await db.execute(
      'SELECT latitude, longitude, max_distance_meters FROM office_location WHERE is_active = TRUE LIMIT 1'
    );
    
    if (rows.length > 0) {
      return {
        latitude: parseFloat(rows[0].latitude),
        longitude: parseFloat(rows[0].longitude),
        maxDistance: rows[0].max_distance_meters || 500
      };
    }
    
    // Fallback to environment variables if no record found
    return {
      latitude: parseFloat(process.env.OFFICE_LATITUDE || '-6.1751'),
      longitude: parseFloat(process.env.OFFICE_LONGITUDE || '106.8650'),
      maxDistance: 500
    };
  } catch (error) {
    console.error('Error getting office location:', error);
    // Fallback to environment variables on error
    return {
      latitude: parseFloat(process.env.OFFICE_LATITUDE || '-6.1751'),
      longitude: parseFloat(process.env.OFFICE_LONGITUDE || '106.8650'),
      maxDistance: 500
    };
  }
}

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'User tidak ditemukan' });
    }

    req.user = rows[0];
    next();
  } catch {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
};

// Role middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    next();
  };
};

// AUTHENTICATION ROUTES

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      nama_lengkap,
      email,
      nomor_hp,
      asal_universitas,
      jurusan,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      agama,
      ue2,
      ue3,
      password,
      role = 'mahasiswa'
    } = req.body;

    // Check if email already exists
    const [existingUser] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Insert user
    const [result] = await db.execute(
      `INSERT INTO users (
        nama_lengkap, email, nomor_hp, asal_universitas, jurusan,
        tempat_lahir, tanggal_lahir, alamat, agama, ue2, ue3,
        password, role, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nama_lengkap, email, nomor_hp, asal_universitas, jurusan,
        tempat_lahir, tanggal_lahir, alamat, agama, ue2, ue3,
        hashedPassword, role
      ]
    );

    res.status(201).json({ 
      message: 'Registrasi berhasil',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = rows[0];

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        nama_lengkap: user.nama_lengkap
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from response
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login berhasil',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  // eslint-disable-next-line no-unused-vars
  const { password, ...userWithoutPassword } = req.user;
  res.json(userWithoutPassword);
});

// ATTENDANCE ROUTES

// Clock In
app.post('/api/attendance/clock-in', authenticateToken, requireRole(['mahasiswa']), async (req, res) => {
  try {
    const { latitude, longitude, keterangan } = req.body;
    const userId = req.user.id;
    const currentTime = getCurrentTime();
    const today = new Date().toISOString().split('T')[0];

    // Check if user already clocked in today
    const [existing] = await db.execute(
      'SELECT id FROM absensi_clock_in WHERE user_id = ? AND tanggal = ?',
      [userId, today]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Anda sudah clock in hari ini' });
    }

    // Validate time
    if (!isTimeInRange(currentTime, '07:30', '08:00')) {
      return res.status(400).json({ message: 'Clock in hanya dapat dilakukan antara pukul 07:30 - 08:00' });
    }

    // Get office location from database
    const officeLocation = await getOfficeLocation();

    // Calculate distance
    const distance = calculateDistance(
      latitude,
      longitude,
      officeLocation.latitude,
      officeLocation.longitude
    );

    if (distance > officeLocation.maxDistance) {
      return res.status(400).json({ 
        message: `Jarak terlalu jauh dari kantor: ${Math.round(distance)} meter. Maksimal ${officeLocation.maxDistance} meter.` 
      });
    }

    // Insert clock in record
    await db.execute(
      `INSERT INTO absensi_clock_in (
        user_id, tanggal, jam, latitude, longitude, 
        distance, keterangan, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'WFO', NOW())`,
      [userId, today, currentTime, latitude, longitude, Math.round(distance), keterangan || 'WFO']
    );

    res.json({ 
      message: 'Clock in berhasil',
      time: currentTime,
      distance: Math.round(distance)
    });
  } catch (error) {
    console.error('Clock in error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Clock Out
app.post('/api/attendance/clock-out', authenticateToken, requireRole(['mahasiswa']), async (req, res) => {
  try {
    const { latitude, longitude, keterangan } = req.body;
    const userId = req.user.id;
    const currentTime = getCurrentTime();
    const today = new Date().toISOString().split('T')[0];

    // Check if user already clocked out today
    const [existing] = await db.execute(
      'SELECT id FROM absensi_clock_out WHERE user_id = ? AND tanggal = ?',
      [userId, today]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Anda sudah clock out hari ini' });
    }

    // Check if user has clocked in today
    const [clockIn] = await db.execute(
      'SELECT id FROM absensi_clock_in WHERE user_id = ? AND tanggal = ?',
      [userId, today]
    );

    if (clockIn.length === 0) {
      return res.status(400).json({ message: 'Anda belum clock in hari ini' });
    }

    // Validate time
    if (!isTimeInRange(currentTime, '17:00', '17:30')) {
      return res.status(400).json({ message: 'Clock out hanya dapat dilakukan antara pukul 17:00 - 17:30' });
    }

    // Get office location from database
    const officeLocation = await getOfficeLocation();

    // Calculate distance
    const distance = calculateDistance(
      latitude,
      longitude,
      officeLocation.latitude,
      officeLocation.longitude
    );

    if (distance > officeLocation.maxDistance) {
      return res.status(400).json({ 
        message: `Jarak terlalu jauh dari kantor: ${Math.round(distance)} meter. Maksimal ${officeLocation.maxDistance} meter.` 
      });
    }

    // Insert clock out record
    await db.execute(
      `INSERT INTO absensi_clock_out (
        user_id, tanggal, jam, latitude, longitude, 
        distance, keterangan, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'WFO', NOW())`,
      [userId, today, currentTime, latitude, longitude, Math.round(distance), keterangan || 'WFO']
    );

    res.json({ 
      message: 'Clock out berhasil',
      time: currentTime,
      distance: Math.round(distance)
    });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Get Attendance History
app.get('/api/attendance/history', authenticateToken, requireRole(['mahasiswa']), async (req, res) => {
  try {
    const { type, month, year } = req.query;
    const userId = req.user.id;

    let query = '';
    let params = [userId];

    if (type === 'clock_in') {
      query = 'SELECT *, "clock_in" as type FROM absensi_clock_in WHERE user_id = ?';
    } else if (type === 'clock_out') {
      query = 'SELECT *, "clock_out" as type FROM absensi_clock_out WHERE user_id = ?';
    } else {
      // Get both clock in and clock out
      query = `
        (SELECT *, "clock_in" as type FROM absensi_clock_in WHERE user_id = ?)
        UNION ALL
        (SELECT *, "clock_out" as type FROM absensi_clock_out WHERE user_id = ?)
        ORDER BY tanggal DESC, jam DESC
      `;
      params = [userId, userId];
    }

    if (month && year) {
      if (type === 'clock_in') {
        query += ' AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?';
        params.push(month, year);
      } else if (type === 'clock_out') {
        query += ' AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?';
        params.push(month, year);
      } else {
        // For union query, we need to add conditions to both selects
        query = `
          (SELECT *, "clock_in" as type FROM absensi_clock_in 
           WHERE user_id = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?)
          UNION ALL
          (SELECT *, "clock_out" as type FROM absensi_clock_out 
           WHERE user_id = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?)
          ORDER BY tanggal DESC, jam DESC
        `;
        params = [userId, month, year, userId, month, year];
      }
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get attendance history error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// LOGBOOK ROUTES

// Create Logbook
app.post('/api/logbook', authenticateToken, requireRole(['mahasiswa']), async (req, res) => {
  try {
    const { kegiatan, durasi, tanggal } = req.body;
    const userId = req.user.id;
    const currentTime = getCurrentTime();

    // Validate logbook time
    if (!isTimeInRange(currentTime, '07:30', '17:30')) {
      return res.status(400).json({ message: 'Logbook hanya dapat diisi antara pukul 07:30 - 17:30' });
    }

    // Check daily limit
    const [existing] = await db.execute(
      'SELECT COUNT(*) as count FROM logbook WHERE user_id = ? AND tanggal = ?',
      [userId, tanggal]
    );

    if (existing[0].count >= 4) {
      return res.status(400).json({ message: 'Maksimal 4 kegiatan per hari' });
    }

    // Insert logbook
    const [result] = await db.execute(
      'INSERT INTO logbook (user_id, tanggal, kegiatan, durasi, created_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, tanggal, kegiatan, durasi]
    );

    res.status(201).json({
      message: 'Logbook berhasil ditambahkan',
      id: result.insertId,
      kegiatan,
      durasi,
      tanggal
    });
  } catch (error) {
    console.error('Create logbook error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Get Logbooks
app.get('/api/logbook', authenticateToken, requireRole(['mahasiswa']), async (req, res) => {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;

    let query = 'SELECT * FROM logbook WHERE user_id = ?';
    let params = [userId];

    if (month && year) {
      query += ' AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?';
      params.push(month, year);
    }

    query += ' ORDER BY tanggal DESC, created_at DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get logbooks error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Update Logbook
app.put('/api/logbook/:id', authenticateToken, requireRole(['mahasiswa']), async (req, res) => {
  try {
    const { id } = req.params;
    const { kegiatan, durasi } = req.body;
    const userId = req.user.id;
    const currentTime = getCurrentTime();

    // Validate logbook time
    if (!isTimeInRange(currentTime, '07:30', '17:30')) {
      return res.status(400).json({ message: 'Logbook hanya dapat diupdate antara pukul 07:30 - 17:30' });
    }

    // Check if logbook exists and belongs to user
    const [existing] = await db.execute(
      'SELECT id FROM logbook WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Logbook tidak ditemukan' });
    }

    // Update logbook
    await db.execute(
      'UPDATE logbook SET kegiatan = ?, durasi = ?, updated_at = NOW() WHERE id = ?',
      [kegiatan, durasi, id]
    );

    res.json({ message: 'Logbook berhasil diupdate' });
  } catch (error) {
    console.error('Update logbook error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Delete Logbook
app.delete('/api/logbook/:id', authenticateToken, requireRole(['mahasiswa']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const currentTime = getCurrentTime();

    // Validate logbook time
    if (!isTimeInRange(currentTime, '07:30', '17:30')) {
      return res.status(400).json({ message: 'Logbook hanya dapat dihapus antara pukul 07:30 - 17:30' });
    }

    // Check if logbook exists and belongs to user
    const [existing] = await db.execute(
      'SELECT id FROM logbook WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Logbook tidak ditemukan' });
    }

    // Delete logbook
    await db.execute('DELETE FROM logbook WHERE id = ?', [id]);

    res.json({ message: 'Logbook berhasil dihapus' });
  } catch (error) {
    console.error('Delete logbook error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// MENTOR ROUTES

// Get Students (for mentors)
app.get('/api/mentor/students', authenticateToken, requireRole(['mentor', 'pengurus']), async (req, res) => {
  try {
    let query = '';
    let params = [];

    // If user is pengurus, get all students
    if (req.user.role === 'pengurus') {
      query = `
        SELECT 
          u.id, u.nama_lengkap, u.email, u.asal_universitas, u.jurusan, 
          u.ue2, u.ue3, u.created_at,
          msr.mentor_id,
          m.nama_lengkap as mentor_name
        FROM users u
        LEFT JOIN mentor_student_relation msr ON u.id = msr.student_id AND msr.is_active = TRUE
        LEFT JOIN users m ON msr.mentor_id = m.id
        WHERE u.role = "mahasiswa" AND u.is_active = TRUE
        ORDER BY u.nama_lengkap
      `;
    } else {
      // If user is mentor, get students assigned to them OR by UE2/UE3 (fallback)
      query = `
        SELECT DISTINCT
          u.id, u.nama_lengkap, u.email, u.asal_universitas, u.jurusan, 
          u.ue2, u.ue3, u.created_at,
          msr.mentor_id,
          m.nama_lengkap as mentor_name
        FROM users u
        LEFT JOIN mentor_student_relation msr ON u.id = msr.student_id AND msr.is_active = TRUE
        LEFT JOIN users m ON msr.mentor_id = m.id
        WHERE u.role = "mahasiswa" 
          AND u.is_active = TRUE
          AND (
            msr.mentor_id = ?
            OR (msr.mentor_id IS NULL AND u.ue2 = ? AND u.ue3 = ?)
          )
        ORDER BY u.nama_lengkap
      `;
      params = [req.user.id, req.user.ue2, req.user.ue3];
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Approve/Reject Attendance
app.post('/api/mentor/attendance/approve', authenticateToken, requireRole(['mentor', 'pengurus']), async (req, res) => {
  try {
    const { attendanceId, approved, type = 'clock_in' } = req.body;

    const table = type === 'clock_in' ? 'absensi_clock_in' : 'absensi_clock_out';
    
    // Get attendance record to verify access
    const [attendance] = await db.execute(
      `SELECT user_id FROM ${table} WHERE id = ?`,
      [attendanceId]
    );

    if (attendance.length === 0) {
      return res.status(404).json({ message: 'Absensi tidak ditemukan' });
    }

    // If user is mentor (not pengurus), verify student access by eselon
    if (req.user.role === 'mentor') {
      const [student] = await db.execute(
        'SELECT id, ue2, ue3 FROM users WHERE id = ? AND role = "mahasiswa"',
        [attendance[0].user_id]
      );

      if (student.length === 0) {
        return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      }

      // Check if mentor has access to this student (same eselon)
      if (student[0].ue2 !== req.user.ue2 || student[0].ue3 !== req.user.ue3) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }
    
    await db.execute(
      `UPDATE ${table} SET approved = ?, approved_by = ?, approved_at = NOW() WHERE id = ?`,
      [approved, req.user.id, attendanceId]
    );

    res.json({ message: 'Status approval berhasil diupdate' });
  } catch (error) {
    console.error('Approve attendance error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Manual Attendance (for late/early students)
app.post('/api/mentor/attendance/manual', authenticateToken, requireRole(['mentor', 'pengurus']), async (req, res) => {
  try {
    const { userId, type, tanggal, jam, keterangan, status = 'MANUAL' } = req.body;

    // Verify student access (mentor can only access students in same eselon)
    if (req.user.role === 'mentor') {
      const [student] = await db.execute(
        'SELECT id, ue2, ue3 FROM users WHERE id = ? AND role = "mahasiswa"',
        [userId]
      );

      if (student.length === 0) {
        return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
      }

      // Check if mentor has access to this student (same eselon)
      if (student[0].ue2 !== req.user.ue2 || student[0].ue3 !== req.user.ue3) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }

    const table = type === 'clock_in' ? 'absensi_clock_in' : 'absensi_clock_out';
    
    // Check if student already has attendance for this date
    const [existing] = await db.execute(
      `SELECT id FROM ${table} WHERE user_id = ? AND tanggal = ?`,
      [userId, tanggal]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Mahasiswa sudah memiliki absensi untuk tanggal ini' });
    }

    // For manual attendance, we don't require location
    await db.execute(
      `INSERT INTO ${table} (user_id, tanggal, jam, keterangan, status, approved, approved_by, latitude, longitude, distance, created_at) 
       VALUES (?, ?, ?, ?, ?, 1, ?, 0, 0, 0, NOW())`,
      [userId, tanggal, jam, keterangan, status, req.user.id]
    );

    res.json({ message: 'Absensi manual berhasil ditambahkan' });
  } catch (error) {
    console.error('Manual attendance error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Get Student Attendance (for mentors)
app.get('/api/mentor/attendance/student/:studentId', authenticateToken, requireRole(['mentor', 'pengurus']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { type, month, year } = req.query;

    // Verify student access (mentor can only see their own students)
    const [student] = await db.execute(
      'SELECT id, ue2, ue3 FROM users WHERE id = ? AND role = "mahasiswa"',
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
    }

    // Check if mentor has access to this student
    if (req.user.role === 'mentor') {
      if (student[0].ue2 !== req.user.ue2 || student[0].ue3 !== req.user.ue3) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }

    let query = '';
    let params = [studentId];

    if (type === 'clock_in') {
      query = 'SELECT *, "clock_in" as type FROM absensi_clock_in WHERE user_id = ?';
    } else if (type === 'clock_out') {
      query = 'SELECT *, "clock_out" as type FROM absensi_clock_out WHERE user_id = ?';
    } else {
      query = `
        (SELECT *, "clock_in" as type FROM absensi_clock_in WHERE user_id = ?)
        UNION ALL
        (SELECT *, "clock_out" as type FROM absensi_clock_out WHERE user_id = ?)
        ORDER BY tanggal DESC, jam DESC
      `;
      params = [studentId, studentId];
    }

    if (month && year) {
      if (type === 'clock_in' || type === 'clock_out') {
        query += ' AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?';
        params.push(month, year);
      } else {
        query = `
          (SELECT *, "clock_in" as type FROM absensi_clock_in 
           WHERE user_id = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?)
          UNION ALL
          (SELECT *, "clock_out" as type FROM absensi_clock_out 
           WHERE user_id = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?)
          ORDER BY tanggal DESC, jam DESC
        `;
        params = [studentId, month, year, studentId, month, year];
      }
    }

    const [rows] = await db.execute(query, params);
    
    // Join with user data to get nama_lengkap
    const attendanceWithNames = await Promise.all(rows.map(async (row) => {
      const [userRows] = await db.execute('SELECT nama_lengkap FROM users WHERE id = ?', [row.user_id]);
      return {
        ...row,
        nama_lengkap: userRows[0]?.nama_lengkap || null
      };
    }));

    res.json(attendanceWithNames);
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Get Pending Attendances
app.get('/api/mentor/attendance/pending', authenticateToken, requireRole(['mentor', 'pengurus']), async (req, res) => {
  try {
    const { type = 'clock_in' } = req.query;
    const table = type === 'clock_in' ? 'absensi_clock_in' : 'absensi_clock_out';

    let query = `
      SELECT a.*, u.nama_lengkap 
      FROM ${table} a
      JOIN users u ON a.user_id = u.id
      WHERE a.approved IS NULL
    `;
    let params = [];

    // If user is mentor (not pengurus), filter by UE2 and UE3
    if (req.user.role === 'mentor') {
      query += ' AND u.ue2 = ? AND u.ue3 = ?';
      params = [req.user.ue2, req.user.ue3];
    }

    query += ' ORDER BY a.tanggal DESC, a.jam DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get pending attendances error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Get Attendance Schedule
app.get('/api/mentor/schedule', authenticateToken, requireRole(['mentor', 'pengurus']), async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = 'SELECT * FROM jadwal_absensi WHERE is_active = 1';
    let params = [];

    if (month && year) {
      query += ' AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?';
      params = [month, year];
    }

    query += ' ORDER BY tanggal DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Create Attendance Schedule
app.post('/api/mentor/schedule', authenticateToken, requireRole(['mentor', 'pengurus']), async (req, res) => {
  try {
    const { tanggal, jam_masuk, jam_keluar, batas_masuk, batas_keluar, keterangan } = req.body;

    await db.execute(
      `INSERT INTO jadwal_absensi (
        created_by, tanggal, jam_masuk, jam_keluar, 
        batas_masuk, batas_keluar, keterangan, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [req.user.id, tanggal, jam_masuk, jam_keluar, batas_masuk, batas_keluar, keterangan]
    );

    res.json({ message: 'Jadwal berhasil dibuat' });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Update Attendance Schedule
app.put('/api/mentor/schedule/:id', authenticateToken, requireRole(['mentor', 'pengurus']), async (req, res) => {
  try {
    const { id } = req.params;
    const { tanggal, jam_masuk, jam_keluar, batas_masuk, batas_keluar, keterangan, is_active } = req.body;

    await db.execute(
      `UPDATE jadwal_absensi SET 
        tanggal = ?, jam_masuk = ?, jam_keluar = ?, 
        batas_masuk = ?, batas_keluar = ?, keterangan = ?, 
        is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [tanggal, jam_masuk, jam_keluar, batas_masuk, batas_keluar, keterangan, is_active, id]
    );

    res.json({ message: 'Jadwal berhasil diupdate' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Get Student Logbooks (for mentors)
app.get('/api/mentor/logbook/student/:studentId', authenticateToken, requireRole(['mentor', 'pengurus']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { month, year } = req.query;

    // Verify student access
    const [student] = await db.execute(
      'SELECT id, ue2, ue3 FROM users WHERE id = ? AND role = "mahasiswa"',
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
    }

    // Check if mentor has access to this student
    if (req.user.role === 'mentor') {
      if (student[0].ue2 !== req.user.ue2 || student[0].ue3 !== req.user.ue3) {
        return res.status(403).json({ message: 'Akses ditolak' });
      }
    }

    let query = 'SELECT * FROM logbook WHERE user_id = ?';
    let params = [studentId];

    if (month && year) {
      query += ' AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?';
      params.push(month, year);
    }

    query += ' ORDER BY tanggal DESC, created_at DESC';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get student logbooks error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// OFFICE LOCATION ROUTES (Pengurus only)

// Get Office Location
app.get('/api/office/location', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM office_location WHERE is_active = TRUE ORDER BY updated_at DESC LIMIT 1'
    );

    if (rows.length === 0) {
      // Return default if no location set
      return res.json({
        latitude: parseFloat(process.env.OFFICE_LATITUDE || '-6.1751'),
        longitude: parseFloat(process.env.OFFICE_LONGITUDE || '106.8650'),
        nama_lokasi: 'Kantor Utama',
        alamat: null,
        max_distance_meters: 500
      });
    }

    const location = rows[0];
    res.json({
      id: location.id,
      latitude: parseFloat(location.latitude),
      longitude: parseFloat(location.longitude),
      nama_lokasi: location.nama_lokasi,
      alamat: location.alamat,
      max_distance_meters: location.max_distance_meters,
      created_at: location.created_at,
      updated_at: location.updated_at
    });
  } catch (error) {
    console.error('Get office location error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Update Office Location (Pengurus only)
app.put('/api/office/location', authenticateToken, requireRole(['pengurus']), async (req, res) => {
  try {
    const { latitude, longitude, nama_lokasi, alamat, max_distance_meters } = req.body;

    // Validate required fields
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude dan longitude harus diisi' });
    }

    // Validate latitude range
    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({ message: 'Latitude harus antara -90 dan 90' });
    }

    // Validate longitude range
    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'Longitude harus antara -180 dan 180' });
    }

    // Deactivate all existing locations
    await db.execute(
      'UPDATE office_location SET is_active = FALSE WHERE is_active = TRUE'
    );

    // Create new active location
    const [result] = await db.execute(
      `INSERT INTO office_location (
        latitude, longitude, nama_lokasi, alamat, 
        max_distance_meters, is_active, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, TRUE, ?, NOW())`,
      [
        latitude,
        longitude,
        nama_lokasi || 'Kantor Utama',
        alamat || null,
        max_distance_meters || 500,
        req.user.id
      ]
    );

    res.json({
      message: 'Lokasi kantor berhasil diupdate',
      id: result.insertId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      nama_lokasi: nama_lokasi || 'Kantor Utama',
      alamat: alamat || null,
      max_distance_meters: max_distance_meters || 500
    });
  } catch (error) {
    console.error('Update office location error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// USER MANAGEMENT ROUTES (Pengurus only)

// Get All Users
app.get('/api/pengurus/users', authenticateToken, requireRole(['pengurus']), async (req, res) => {
  try {
    const { role, search } = req.query;
    
    let query = `
      SELECT 
        id, nama_lengkap, email, nomor_hp, asal_universitas, jurusan,
        tempat_lahir, tanggal_lahir, alamat, agama, ue2, ue3, role,
        is_active, created_at, updated_at
      FROM users 
      WHERE 1=1
    `;
    let params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (nama_lengkap LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY role, nama_lengkap';

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Get Single User
app.get('/api/pengurus/users/:id', authenticateToken, requireRole(['pengurus']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await db.execute(
      `SELECT 
        id, nama_lengkap, email, nomor_hp, asal_universitas, jurusan,
        tempat_lahir, tanggal_lahir, alamat, agama, ue2, ue3, role,
        is_active, created_at, updated_at
      FROM users WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Get mentor assignment if user is a student
    if (rows[0].role === 'mahasiswa') {
      const [mentorRelation] = await db.execute(
        `SELECT msr.*, u.nama_lengkap as mentor_name, u.email as mentor_email
         FROM mentor_student_relation msr
         JOIN users u ON msr.mentor_id = u.id
         WHERE msr.student_id = ? AND msr.is_active = TRUE
         LIMIT 1`,
        [id]
      );
      
      if (mentorRelation.length > 0) {
        rows[0].mentor = {
          id: mentorRelation[0].mentor_id,
          nama_lengkap: mentorRelation[0].mentor_name,
          email: mentorRelation[0].mentor_email
        };
      }
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Create User
app.post('/api/pengurus/users', authenticateToken, requireRole(['pengurus']), async (req, res) => {
  try {
    const {
      nama_lengkap,
      email,
      nomor_hp,
      asal_universitas,
      jurusan,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      agama,
      ue2,
      ue3,
      password,
      role = 'mahasiswa',
      mentor_id
    } = req.body;

    // Validate required fields
    if (!nama_lengkap || !email || !password) {
      return res.status(400).json({ message: 'Nama lengkap, email, dan password harus diisi' });
    }

    // Check if email already exists
    const [existingUser] = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Insert user
    const [result] = await db.execute(
      `INSERT INTO users (
        nama_lengkap, email, nomor_hp, asal_universitas, jurusan,
        tempat_lahir, tanggal_lahir, alamat, agama, ue2, ue3,
        password, role, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nama_lengkap, email, nomor_hp || '', asal_universitas || '', jurusan || '',
        tempat_lahir || '', tanggal_lahir || null, alamat || '', agama || 'Islam',
        ue2 || '', ue3 || '', hashedPassword, role
      ]
    );

    const userId = result.insertId;

    // Assign mentor if provided and user is a student
    if (role === 'mahasiswa' && mentor_id) {
      // Verify mentor exists and is actually a mentor
      const [mentor] = await db.execute(
        'SELECT id FROM users WHERE id = ? AND role IN ("mentor", "pengurus")',
        [mentor_id]
      );

      if (mentor.length > 0) {
        await db.execute(
          `INSERT INTO mentor_student_relation (mentor_id, student_id, assigned_by, is_active)
           VALUES (?, ?, ?, TRUE)`,
          [mentor_id, userId, req.user.id]
        );
      }
    }

    res.status(201).json({
      message: 'User berhasil dibuat',
      userId: userId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Update User
app.put('/api/pengurus/users/:id', authenticateToken, requireRole(['pengurus']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nama_lengkap,
      email,
      nomor_hp,
      asal_universitas,
      jurusan,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      agama,
      ue2,
      ue3,
      password,
      role,
      is_active,
      mentor_id
    } = req.body;

    // Check if user exists
    const [existing] = await db.execute('SELECT id, role FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const currentRole = existing[0].role;

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (nama_lengkap !== undefined) {
      updateFields.push('nama_lengkap = ?');
      updateValues.push(nama_lengkap);
    }
    if (email !== undefined) {
      // Check if email is already taken by another user
      const [emailCheck] = await db.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ message: 'Email sudah digunakan oleh user lain' });
      }
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (nomor_hp !== undefined) {
      updateFields.push('nomor_hp = ?');
      updateValues.push(nomor_hp);
    }
    if (asal_universitas !== undefined) {
      updateFields.push('asal_universitas = ?');
      updateValues.push(asal_universitas);
    }
    if (jurusan !== undefined) {
      updateFields.push('jurusan = ?');
      updateValues.push(jurusan);
    }
    if (tempat_lahir !== undefined) {
      updateFields.push('tempat_lahir = ?');
      updateValues.push(tempat_lahir);
    }
    if (tanggal_lahir !== undefined) {
      updateFields.push('tanggal_lahir = ?');
      updateValues.push(tanggal_lahir);
    }
    if (alamat !== undefined) {
      updateFields.push('alamat = ?');
      updateValues.push(alamat);
    }
    if (agama !== undefined) {
      updateFields.push('agama = ?');
      updateValues.push(agama);
    }
    if (ue2 !== undefined) {
      updateFields.push('ue2 = ?');
      updateValues.push(ue2);
    }
    if (ue3 !== undefined) {
      updateFields.push('ue3 = ?');
      updateValues.push(ue3);
    }
    if (password !== undefined && password !== '') {
      const hashedPassword = await bcryptjs.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'Tidak ada field yang diupdate' });
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    await db.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Handle mentor assignment for students
    if ((role === 'mahasiswa' || currentRole === 'mahasiswa') && mentor_id !== undefined) {
      // Deactivate existing mentor relations
      await db.execute(
        'UPDATE mentor_student_relation SET is_active = FALSE WHERE student_id = ?',
        [id]
      );

      if (mentor_id) {
        // Verify mentor exists
        const [mentor] = await db.execute(
          'SELECT id FROM users WHERE id = ? AND role IN ("mentor", "pengurus")',
          [mentor_id]
        );

        if (mentor.length > 0) {
          // Check if relation already exists
          const [existingRelation] = await db.execute(
            'SELECT id FROM mentor_student_relation WHERE mentor_id = ? AND student_id = ?',
            [mentor_id, id]
          );

          if (existingRelation.length > 0) {
            // Reactivate existing relation
            await db.execute(
              'UPDATE mentor_student_relation SET is_active = TRUE, assigned_by = ?, updated_at = NOW() WHERE id = ?',
              [req.user.id, existingRelation[0].id]
            );
          } else {
            // Create new relation
            await db.execute(
              `INSERT INTO mentor_student_relation (mentor_id, student_id, assigned_by, is_active)
               VALUES (?, ?, ?, TRUE)`,
              [mentor_id, id, req.user.id]
            );
          }
        }
      }
    }

    res.json({ message: 'User berhasil diupdate' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Delete User (Soft delete by setting is_active = false)
app.delete('/api/pengurus/users/:id', authenticateToken, requireRole(['pengurus']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri' });
    }

    // Soft delete
    await db.execute('UPDATE users SET is_active = FALSE, updated_at = NOW() WHERE id = ?', [id]);

    // Deactivate mentor relations
    await db.execute(
      'UPDATE mentor_student_relation SET is_active = FALSE WHERE student_id = ? OR mentor_id = ?',
      [id, id]
    );

    res.json({ message: 'User berhasil dinonaktifkan' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Assign Student to Mentor
app.post('/api/pengurus/users/:studentId/assign-mentor', authenticateToken, requireRole(['pengurus']), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { mentor_id } = req.body;

    if (!mentor_id) {
      return res.status(400).json({ message: 'Mentor ID harus diisi' });
    }

    // Verify student exists and is a student
    const [student] = await db.execute(
      'SELECT id, role FROM users WHERE id = ? AND role = "mahasiswa"',
      [studentId]
    );

    if (student.length === 0) {
      return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
    }

    // Verify mentor exists and is a mentor or pengurus
    const [mentor] = await db.execute(
      'SELECT id FROM users WHERE id = ? AND role IN ("mentor", "pengurus")',
      [mentor_id]
    );

    if (mentor.length === 0) {
      return res.status(404).json({ message: 'Mentor tidak ditemukan' });
    }

    // Deactivate existing mentor relations for this student
    await db.execute(
      'UPDATE mentor_student_relation SET is_active = FALSE WHERE student_id = ?',
      [studentId]
    );

    // Check if relation already exists
    const [existingRelation] = await db.execute(
      'SELECT id FROM mentor_student_relation WHERE mentor_id = ? AND student_id = ?',
      [mentor_id, studentId]
    );

    if (existingRelation.length > 0) {
      // Reactivate existing relation
      await db.execute(
        'UPDATE mentor_student_relation SET is_active = TRUE, assigned_by = ?, updated_at = NOW() WHERE id = ?',
        [req.user.id, existingRelation[0].id]
      );
    } else {
      // Create new relation
      await db.execute(
        `INSERT INTO mentor_student_relation (mentor_id, student_id, assigned_by, is_active)
         VALUES (?, ?, ?, TRUE)`,
        [mentor_id, studentId, req.user.id]
      );
    }

    res.json({ message: 'Mahasiswa berhasil diassign ke mentor' });
  } catch (error) {
    console.error('Assign mentor error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Unassign Student from Mentor
app.post('/api/pengurus/users/:studentId/unassign-mentor', authenticateToken, requireRole(['pengurus']), async (req, res) => {
  try {
    const { studentId } = req.params;

    // Verify student exists
    const [student] = await db.execute('SELECT id FROM users WHERE id = ?', [studentId]);
    if (student.length === 0) {
      return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
    }

    // Deactivate all mentor relations for this student
    await db.execute(
      'UPDATE mentor_student_relation SET is_active = FALSE WHERE student_id = ?',
      [studentId]
    );

    res.json({ message: 'Mahasiswa berhasil diunassign dari mentor' });
  } catch (error) {
    console.error('Unassign mentor error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Get All Mentors (for dropdown/selection)
app.get('/api/pengurus/mentors', authenticateToken, requireRole(['pengurus']), async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, nama_lengkap, email, ue2, ue3 
       FROM users 
       WHERE role IN ('mentor', 'pengurus') AND is_active = TRUE
       ORDER BY nama_lengkap`
    );
    res.json(rows);
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Get Students by Mentor
app.get('/api/pengurus/mentors/:mentorId/students', authenticateToken, requireRole(['pengurus']), async (req, res) => {
  try {
    const { mentorId } = req.params;

    const [rows] = await db.execute(
      `SELECT 
        u.id, u.nama_lengkap, u.email, u.asal_universitas, u.jurusan, u.ue2, u.ue3,
        msr.assigned_at, msr.notes
       FROM users u
       INNER JOIN mentor_student_relation msr ON u.id = msr.student_id
       WHERE msr.mentor_id = ? AND msr.is_active = TRUE AND u.is_active = TRUE
       ORDER BY u.nama_lengkap`,
      [mentorId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Get students by mentor error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Error handling middleware
app.use((err, req, res) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// Start server
async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
}

startServer().catch(console.error);