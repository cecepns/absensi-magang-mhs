<?php
/**
 * Script untuk Mengirim Email Clock In dan Clock Out
 * 
 * Script ini akan:
 * 1. Mengambil data clock in/out yang baru (dalam 1 jam terakhir)
 * 2. Mengirim email ke mahasiswa yang melakukan clock in/out
 * 3. Mengirim email notifikasi ke mentor terkait
 * 
 * Cara menjalankan:
 * - Via cronjob: php /path/to/send_attendance_emails.php
 * - Manual: php send_attendance_emails.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/email_sender.php';
require_once __DIR__ . '/email_templates.php';

// Set execution time limit
set_time_limit(MAX_EXECUTION_TIME);

// Create logs directory if not exists
$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

/**
 * Log function
 */
function logMessage($message, $type = 'INFO') {
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[{$timestamp}] [{$type}] {$message}" . PHP_EOL;
    file_put_contents(LOG_FILE, $logMessage, FILE_APPEND);
    echo $logMessage;
}

/**
 * Get clock in records from last hour
 */
function getRecentClockIns($db) {
    $query = "
        SELECT 
            aci.id,
            aci.user_id,
            aci.tanggal,
            aci.jam,
            aci.latitude,
            aci.longitude,
            aci.distance,
            aci.keterangan,
            aci.status,
            aci.created_at,
            u.nama_lengkap,
            u.email
        FROM absensi_clock_in aci
        INNER JOIN users u ON aci.user_id = u.id
        WHERE aci.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        AND u.is_active = 1
        ORDER BY aci.created_at DESC
    ";
    
    $result = $db->query($query);
    $records = [];
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $records[] = $row;
        }
    }
    
    return $records;
}

/**
 * Get clock out records from last hour
 */
function getRecentClockOuts($db) {
    $query = "
        SELECT 
            aco.id,
            aco.user_id,
            aco.tanggal,
            aco.jam,
            aco.latitude,
            aco.longitude,
            aco.distance,
            aco.keterangan,
            aco.status,
            aco.created_at,
            u.nama_lengkap,
            u.email,
            aci.jam as clock_in_time
        FROM absensi_clock_out aco
        INNER JOIN users u ON aco.user_id = u.id
        LEFT JOIN absensi_clock_in aci ON aco.user_id = aci.user_id AND aco.tanggal = aci.tanggal
        WHERE aco.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
        AND u.is_active = 1
        ORDER BY aco.created_at DESC
    ";
    
    $result = $db->query($query);
    $records = [];
    
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $records[] = $row;
        }
    }
    
    return $records;
}

/**
 * Get mentors for a student
 */
function getMentorsForStudent($db, $studentId) {
    $query = "
        SELECT DISTINCT
            u.id,
            u.nama_lengkap,
            u.email
        FROM users u
        INNER JOIN mentor_student_relation msr ON u.id = msr.mentor_id
        WHERE msr.student_id = ?
        AND msr.is_active = 1
        AND u.is_active = 1
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bind_param("i", $studentId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $mentors = [];
    while ($row = $result->fetch_assoc()) {
        $mentors[] = $row;
    }
    
    $stmt->close();
    return $mentors;
}

/**
 * Send clock in emails
 */
function sendClockInEmails($db, $emailSender) {
    $clockIns = getRecentClockIns($db);
    $sentCount = 0;
    $errorCount = 0;
    
    logMessage("Found " . count($clockIns) . " clock in records to process");
    
    foreach ($clockIns as $record) {
        try {
            // Send email to student
            $template = EmailTemplates::getClockInTemplate($record);
            $subject = "Clock In Berhasil - " . date('d F Y', strtotime($record['tanggal']));
            
            $result = $emailSender->send(
                $record['email'],
                $subject,
                $template,
                true
            );
            
            if ($result['success']) {
                logMessage("Clock in email sent to student: {$record['email']} (ID: {$record['id']})");
                $sentCount++;
            } else {
                logMessage("Failed to send clock in email to {$record['email']}: {$result['message']}", 'ERROR');
                $errorCount++;
            }
            
            // Send notification to mentors
            $mentors = getMentorsForStudent($db, $record['user_id']);
            foreach ($mentors as $mentor) {
                $mentorTemplate = EmailTemplates::getMentorNotificationTemplate($record, 'clock_in');
                $mentorSubject = "Notifikasi Clock In - {$record['nama_lengkap']}";
                
                $mentorResult = $emailSender->send(
                    $mentor['email'],
                    $mentorSubject,
                    $mentorTemplate,
                    true
                );
                
                if ($mentorResult['success']) {
                    logMessage("Clock in notification sent to mentor: {$mentor['email']}");
                } else {
                    logMessage("Failed to send notification to mentor {$mentor['email']}: {$mentorResult['message']}", 'ERROR');
                }
            }
            
        } catch (Exception $e) {
            logMessage("Error processing clock in ID {$record['id']}: " . $e->getMessage(), 'ERROR');
            $errorCount++;
        }
    }
    
    return ['sent' => $sentCount, 'errors' => $errorCount];
}

/**
 * Send clock out emails
 */
function sendClockOutEmails($db, $emailSender) {
    $clockOuts = getRecentClockOuts($db);
    $sentCount = 0;
    $errorCount = 0;
    
    logMessage("Found " . count($clockOuts) . " clock out records to process");
    
    foreach ($clockOuts as $record) {
        try {
            // Send email to student
            $template = EmailTemplates::getClockOutTemplate($record);
            $subject = "Clock Out Berhasil - " . date('d F Y', strtotime($record['tanggal']));
            
            $result = $emailSender->send(
                $record['email'],
                $subject,
                $template,
                true
            );
            
            if ($result['success']) {
                logMessage("Clock out email sent to student: {$record['email']} (ID: {$record['id']})");
                $sentCount++;
            } else {
                logMessage("Failed to send clock out email to {$record['email']}: {$result['message']}", 'ERROR');
                $errorCount++;
            }
            
            // Send notification to mentors
            $mentors = getMentorsForStudent($db, $record['user_id']);
            foreach ($mentors as $mentor) {
                $mentorTemplate = EmailTemplates::getMentorNotificationTemplate($record, 'clock_out');
                $mentorSubject = "Notifikasi Clock Out - {$record['nama_lengkap']}";
                
                $mentorResult = $emailSender->send(
                    $mentor['email'],
                    $mentorSubject,
                    $mentorTemplate,
                    true
                );
                
                if ($mentorResult['success']) {
                    logMessage("Clock out notification sent to mentor: {$mentor['email']}");
                } else {
                    logMessage("Failed to send notification to mentor {$mentor['email']}: {$mentorResult['message']}", 'ERROR');
                }
            }
            
        } catch (Exception $e) {
            logMessage("Error processing clock out ID {$record['id']}: " . $e->getMessage(), 'ERROR');
            $errorCount++;
        }
    }
    
    return ['sent' => $sentCount, 'errors' => $errorCount];
}

/**
 * Main execution
 */
function main() {
    logMessage("=== Starting email sending process ===");
    
    try {
        $db = Database::getConnection();
        $emailSender = new EmailSender();
        
        // Process clock ins
        logMessage("Processing clock in emails...");
        $clockInResults = sendClockInEmails($db, $emailSender);
        
        // Process clock outs
        logMessage("Processing clock out emails...");
        $clockOutResults = sendClockOutEmails($db, $emailSender);
        
        // Summary
        $totalSent = $clockInResults['sent'] + $clockOutResults['sent'];
        $totalErrors = $clockInResults['errors'] + $clockOutResults['errors'];
        
        logMessage("=== Process completed ===");
        logMessage("Total emails sent: {$totalSent}");
        logMessage("Total errors: {$totalErrors}");
        
        Database::closeConnection();
        
    } catch (Exception $e) {
        logMessage("Fatal error: " . $e->getMessage(), 'ERROR');
        exit(1);
    }
}

// Run the script
main();


