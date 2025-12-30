-- Migration: Add mentor-student relationship table
-- This allows pengurus to assign students to specific mentors

-- Create mentor_student_relation table
CREATE TABLE IF NOT EXISTS mentor_student_relation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mentor_id INT NOT NULL,
  student_id INT NOT NULL,
  assigned_by INT NOT NULL COMMENT 'Pengurus who assigned this relation',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_mentor_student (mentor_id, student_id),
  INDEX idx_mentor (mentor_id, is_active),
  INDEX idx_student (student_id, is_active),
  INDEX idx_active (is_active)
);

-- Add index for better query performance
CREATE INDEX idx_users_role_active ON users(role, is_active);

