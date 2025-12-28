/*
  # Database Schema for Absensi Mahasiswa Magang

  ## Database Structure
  
  This SQL file creates a complete database schema for the internship attendance and logbook system.

  ### 1. Tables Created
  - `users` - Store user information for students, mentors, and administrators
  - `roles` - Define user roles in the system
  - `absensi_clock_in` - Record clock-in attendance data
  - `absensi_clock_out` - Record clock-out attendance data  
  - `logbook` - Store daily activity logs
  - `jadwal_absensi` - Manage attendance schedules
  - `approval_absensi` - Track attendance approval workflows

  ### 2. Key Features
  - Complete user management with role-based access
  - Location-based attendance tracking
  - Activity logging with duration tracking
  - Approval workflow for mentors
  - Comprehensive indexing for performance

  ### 3. Security & Relationships
  - Foreign key constraints for data integrity
  - Proper indexing for query performance
  - Role-based access control structure
  - Audit trail with timestamps
*/

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS absensi_magang;
USE absensi_magang;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  nomor_hp VARCHAR(20) NOT NULL,
  asal_universitas VARCHAR(255) NOT NULL,
  jurusan VARCHAR(255) NOT NULL,
  tempat_lahir VARCHAR(255) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  alamat TEXT NOT NULL,
  agama ENUM('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya') NOT NULL,
  ue2 VARCHAR(255) NOT NULL,
  ue3 VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('mahasiswa', 'mentor', 'pengurus') DEFAULT 'mahasiswa',
  profile_photo VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_ue2_ue3 (ue2, ue3),
  INDEX idx_active (is_active)
);

-- Roles table (reference table for role definitions)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_role_name (role_name)
);

-- Insert default roles
INSERT IGNORE INTO roles (role_name, description, permissions) VALUES
('mahasiswa', 'Mahasiswa Magang', '["clock_in", "clock_out", "logbook_create", "logbook_read", "logbook_update", "logbook_delete"]'),
('mentor', 'Mentor/Pembimbing', '["attendance_approve", "attendance_manual", "logbook_view", "students_view"]'),
('pengurus', 'Pengurus Magang', '["attendance_approve", "attendance_manual", "logbook_view", "students_view", "schedule_manage", "reports_view"]');

-- Clock In attendance table
CREATE TABLE IF NOT EXISTS absensi_clock_in (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tanggal DATE NOT NULL,
  jam TIME NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  distance INT NOT NULL COMMENT 'Distance from office in meters',
  keterangan TEXT DEFAULT NULL,
  status ENUM('WFO', 'WFH', 'MANUAL', 'IZIN') DEFAULT 'WFO',
  approved BOOLEAN DEFAULT NULL COMMENT 'NULL=pending, 1=approved, 0=rejected',
  approved_by INT DEFAULT NULL,
  approved_at TIMESTAMP NULL DEFAULT NULL,
  photo_selfie VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_date (user_id, tanggal),
  INDEX idx_user_date (user_id, tanggal),
  INDEX idx_tanggal (tanggal),
  INDEX idx_status (status),
  INDEX idx_approved (approved)
);

-- Clock Out attendance table
CREATE TABLE IF NOT EXISTS absensi_clock_out (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tanggal DATE NOT NULL,
  jam TIME NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  distance INT NOT NULL COMMENT 'Distance from office in meters',
  keterangan TEXT DEFAULT NULL,
  status ENUM('WFO', 'WFH', 'MANUAL', 'IZIN') DEFAULT 'WFO',
  approved BOOLEAN DEFAULT NULL COMMENT 'NULL=pending, 1=approved, 0=rejected',
  approved_by INT DEFAULT NULL,
  approved_at TIMESTAMP NULL DEFAULT NULL,
  photo_selfie VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_date (user_id, tanggal),
  INDEX idx_user_date (user_id, tanggal),
  INDEX idx_tanggal (tanggal),
  INDEX idx_status (status),
  INDEX idx_approved (approved)
);

-- Logbook table
CREATE TABLE IF NOT EXISTS logbook (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tanggal DATE NOT NULL,
  kegiatan TEXT NOT NULL,
  durasi VARCHAR(100) NOT NULL COMMENT 'Duration in hours/minutes format',
  kategori VARCHAR(100) DEFAULT NULL,
  output TEXT DEFAULT NULL,
  kendala TEXT DEFAULT NULL,
  approved BOOLEAN DEFAULT NULL COMMENT 'NULL=pending, 1=approved, 0=rejected',
  approved_by INT DEFAULT NULL,
  approved_at TIMESTAMP NULL DEFAULT NULL,
  feedback TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_date (user_id, tanggal),
  INDEX idx_tanggal (tanggal),
  INDEX idx_approved (approved)
);

-- Attendance schedule table (for mentors to manage schedule)
CREATE TABLE IF NOT EXISTS jadwal_absensi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_by INT NOT NULL,
  tanggal DATE NOT NULL,
  jam_masuk TIME DEFAULT '07:30:00',
  jam_keluar TIME DEFAULT '17:00:00',
  batas_masuk TIME DEFAULT '08:00:00',
  batas_keluar TIME DEFAULT '17:30:00',
  keterangan TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_tanggal (tanggal),
  INDEX idx_active (is_active)
);

-- Attendance approval workflow table
CREATE TABLE IF NOT EXISTS approval_absensi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  attendance_type ENUM('clock_in', 'clock_out') NOT NULL,
  attendance_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  reason TEXT DEFAULT NULL,
  approved_by INT DEFAULT NULL,
  approved_at TIMESTAMP NULL DEFAULT NULL,
  comments TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_type (user_id, attendance_type),
  INDEX idx_status (status),
  INDEX idx_attendance (attendance_type, attendance_id)
);

-- Insert sample data for testing

-- Sample users
INSERT IGNORE INTO users (
  nama_lengkap, email, nomor_hp, asal_universitas, jurusan,
  tempat_lahir, tanggal_lahir, alamat, agama, ue2, ue3,
  password, role
) VALUES 
-- Sample student
(
  'Ahmad Fauzi', 'ahmad.fauzi@student.ac.id', '08123456789',
  'Universitas Indonesia', 'Teknik Informatika',
  'Jakarta', '2001-03-15', 'Jl. Kebon Jeruk No. 123, Jakarta Barat',
  'Islam', 'Sekretariat Daerah', 'Bagian Umum',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mahasiswa'
),
-- Sample mentor
(
  'Sari Wijayanti', 'sari.wijayanti@mentor.gov.id', '08198765432',
  'Universitas Gadjah Mada', 'Administrasi Publik',
  'Yogyakarta', '1985-08-20', 'Jl. Malioboro No. 456, Yogyakarta',
  'Islam', 'Sekretariat Daerah', 'Bagian Umum',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mentor'
),
-- Sample pengurus
(
  'Dr. Budi Santoso', 'budi.santoso@admin.gov.id', '08111222333',
  'Universitas Airlangga', 'Manajemen',
  'Surabaya', '1975-12-10', 'Jl. Gubeng No. 789, Surabaya',
  'Kristen', 'Sekretariat Daerah', 'Bagian Kepegawaian',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pengurus'
);

-- Sample attendance schedule
INSERT IGNORE INTO jadwal_absensi (
  created_by, tanggal, jam_masuk, jam_keluar, batas_masuk, batas_keluar, keterangan
) VALUES 
(2, CURDATE(), '07:30:00', '17:00:00', '08:00:00', '17:30:00', 'Jadwal kerja normal'),
(2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '07:30:00', '17:00:00', '08:00:00', '17:30:00', 'Jadwal kerja normal');

-- Create views for reporting

-- View for daily attendance summary
CREATE OR REPLACE VIEW view_daily_attendance AS
SELECT 
  u.id as user_id,
  u.nama_lengkap,
  u.ue2,
  u.ue3,
  ci.tanggal,
  ci.jam as clock_in_time,
  ci.status as clock_in_status,
  ci.approved as clock_in_approved,
  co.jam as clock_out_time,
  co.status as clock_out_status,
  co.approved as clock_out_approved,
  CASE 
    WHEN ci.jam IS NOT NULL AND co.jam IS NOT NULL THEN 'HADIR'
    WHEN ci.jam IS NOT NULL AND co.jam IS NULL THEN 'BELUM_PULANG'
    ELSE 'TIDAK_HADIR'
  END as attendance_status
FROM users u
LEFT JOIN absensi_clock_in ci ON u.id = ci.user_id
LEFT JOIN absensi_clock_out co ON u.id = co.user_id AND ci.tanggal = co.tanggal
WHERE u.role = 'mahasiswa'
ORDER BY ci.tanggal DESC, u.nama_lengkap;

-- View for logbook summary
CREATE OR REPLACE VIEW view_logbook_summary AS
SELECT 
  u.id as user_id,
  u.nama_lengkap,
  l.tanggal,
  COUNT(l.id) as total_activities,
  GROUP_CONCAT(l.kegiatan SEPARATOR '; ') as activities_summary,
  GROUP_CONCAT(l.durasi SEPARATOR '; ') as durations
FROM users u
LEFT JOIN logbook l ON u.id = l.user_id
WHERE u.role = 'mahasiswa'
GROUP BY u.id, u.nama_lengkap, l.tanggal
ORDER BY l.tanggal DESC, u.nama_lengkap;

-- View for mentor supervision
CREATE OR REPLACE VIEW view_mentor_supervision AS
SELECT 
  m.id as mentor_id,
  m.nama_lengkap as mentor_name,
  m.ue2,
  m.ue3,
  COUNT(DISTINCT s.id) as total_students,
  COUNT(DISTINCT ci.tanggal) as total_attendance_days,
  COUNT(DISTINCT l.tanggal) as total_logbook_days
FROM users m
LEFT JOIN users s ON m.ue2 = s.ue2 AND m.ue3 = s.ue3 AND s.role = 'mahasiswa'
LEFT JOIN absensi_clock_in ci ON s.id = ci.user_id
LEFT JOIN logbook l ON s.id = l.user_id
WHERE m.role IN ('mentor', 'pengurus')
GROUP BY m.id, m.nama_lengkap, m.ue2, m.ue3
ORDER BY m.nama_lengkap;

-- Create stored procedures for common operations

DELIMITER //

-- Procedure to check if student can clock in
CREATE PROCEDURE CheckClockInEligibility(
  IN p_user_id INT,
  IN p_date DATE,
  OUT p_can_clock_in BOOLEAN,
  OUT p_message VARCHAR(255)
)
BEGIN
  DECLARE existing_count INT DEFAULT 0;
  DECLARE v_current_time TIME;
  
  SET v_current_time = CURTIME();
  
  -- Check if already clocked in today
  SELECT COUNT(*) INTO existing_count
  FROM absensi_clock_in 
  WHERE user_id = p_user_id AND tanggal = p_date;
  
  IF existing_count > 0 THEN
    SET p_can_clock_in = FALSE;
    SET p_message = 'Sudah melakukan clock in hari ini';
  ELSEIF v_current_time < '07:30:00' OR v_current_time > '08:00:00' THEN
    SET p_can_clock_in = FALSE;
    SET p_message = 'Clock in hanya dapat dilakukan antara 07:30 - 08:00';
  ELSE
    SET p_can_clock_in = TRUE;
    SET p_message = 'Dapat melakukan clock in';
  END IF;
END //

-- Procedure to check if student can clock out
CREATE PROCEDURE CheckClockOutEligibility(
  IN p_user_id INT,
  IN p_date DATE,
  OUT p_can_clock_out BOOLEAN,
  OUT p_message VARCHAR(255)
)
BEGIN
  DECLARE existing_count INT DEFAULT 0;
  DECLARE clock_in_count INT DEFAULT 0;
  DECLARE v_current_time TIME;
  
  SET v_current_time = CURTIME();
  
  -- Check if already clocked out today
  SELECT COUNT(*) INTO existing_count
  FROM absensi_clock_out 
  WHERE user_id = p_user_id AND tanggal = p_date;
  
  -- Check if clocked in today
  SELECT COUNT(*) INTO clock_in_count
  FROM absensi_clock_in 
  WHERE user_id = p_user_id AND tanggal = p_date;
  
  IF existing_count > 0 THEN
    SET p_can_clock_out = FALSE;
    SET p_message = 'Sudah melakukan clock out hari ini';
  ELSEIF clock_in_count = 0 THEN
    SET p_can_clock_out = FALSE;
    SET p_message = 'Belum melakukan clock in hari ini';
  ELSEIF v_current_time < '17:00:00' OR v_current_time > '17:30:00' THEN
    SET p_can_clock_out = FALSE;
    SET p_message = 'Clock out hanya dapat dilakukan antara 17:00 - 17:30';
  ELSE
    SET p_can_clock_out = TRUE;
    SET p_message = 'Dapat melakukan clock out';
  END IF;
END //

-- Procedure to check daily logbook limit
CREATE PROCEDURE CheckLogbookLimit(
  IN p_user_id INT,
  IN p_date DATE,
  OUT p_can_add BOOLEAN,
  OUT p_current_count INT,
  OUT p_message VARCHAR(255)
)
BEGIN
  DECLARE v_current_time TIME;
  
  SET v_current_time = CURTIME();
  
  SELECT COUNT(*) INTO p_current_count
  FROM logbook 
  WHERE user_id = p_user_id AND tanggal = p_date;
  
  IF p_current_count >= 4 THEN
    SET p_can_add = FALSE;
    SET p_message = 'Maksimal 4 kegiatan per hari';
  ELSEIF v_current_time < '07:30:00' OR v_current_time > '17:30:00' THEN
    SET p_can_add = FALSE;
    SET p_message = 'Logbook hanya dapat diisi antara 07:30 - 17:30';
  ELSE
    SET p_can_add = TRUE;
    SET p_message = 'Dapat menambah kegiatan';
  END IF;
END //

DELIMITER ;

-- Create triggers for audit trail

-- Trigger for attendance approval
DELIMITER //

CREATE TRIGGER after_attendance_approval 
AFTER UPDATE ON absensi_clock_in
FOR EACH ROW
BEGIN
  IF OLD.approved IS NULL AND NEW.approved IS NOT NULL THEN
    INSERT INTO approval_absensi (
      user_id, attendance_type, attendance_id, 
      status, approved_by, approved_at
    ) VALUES (
      NEW.user_id, 'clock_in', NEW.id,
      CASE WHEN NEW.approved = 1 THEN 'approved' ELSE 'rejected' END,
      NEW.approved_by, NEW.approved_at
    );
  END IF;
END //

CREATE TRIGGER after_clock_out_approval 
AFTER UPDATE ON absensi_clock_out
FOR EACH ROW
BEGIN
  IF OLD.approved IS NULL AND NEW.approved IS NOT NULL THEN
    INSERT INTO approval_absensi (
      user_id, attendance_type, attendance_id, 
      status, approved_by, approved_at
    ) VALUES (
      NEW.user_id, 'clock_out', NEW.id,
      CASE WHEN NEW.approved = 1 THEN 'approved' ELSE 'rejected' END,
      NEW.approved_by, NEW.approved_at
    );
  END IF;
END //

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_users_composite ON users(role, is_active, ue2, ue3);
CREATE INDEX idx_clock_in_composite ON absensi_clock_in(user_id, tanggal, approved);
CREATE INDEX idx_clock_out_composite ON absensi_clock_out(user_id, tanggal, approved);
CREATE INDEX idx_logbook_composite ON logbook(user_id, tanggal);

-- Display success message
SELECT 'Database schema created successfully!' as Status;
SELECT 'Default roles inserted successfully!' as Status;
SELECT 'Sample data inserted successfully!' as Status;
SELECT 'Views, procedures, and triggers created successfully!' as Status;