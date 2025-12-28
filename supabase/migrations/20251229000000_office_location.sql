-- Office Location table for storing office coordinates
-- This allows dynamic office location management by pengurus

USE absensi_magang;

CREATE TABLE IF NOT EXISTS office_location (
  id INT AUTO_INCREMENT PRIMARY KEY,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  nama_lokasi VARCHAR(255) DEFAULT 'Kantor Utama',
  alamat TEXT DEFAULT NULL,
  max_distance_meters INT DEFAULT 500,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_active (is_active)
);

-- Insert default office location (using Jakarta coordinates as default)
INSERT INTO office_location (latitude, longitude, nama_lokasi, alamat, max_distance_meters, is_active, created_by)
SELECT 
  -6.1751,
  106.8650,
  'Kantor Utama',
  'Jakarta, Indonesia',
  500,
  TRUE,
  (SELECT id FROM users WHERE role = 'pengurus' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM office_location WHERE is_active = TRUE);

