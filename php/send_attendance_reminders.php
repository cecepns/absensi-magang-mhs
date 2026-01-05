<?php
/**
 * Script untuk Mengirim Reminder Clock In dan Clock Out
 * 
 * Script ini akan:
 * 1. Mengirim reminder clock in pada pukul 07:15 untuk mahasiswa yang belum clock in
 * 2. Mengirim reminder clock out pada pukul 16:45 untuk mahasiswa yang sudah clock in tapi belum clock out
 * 
 * Cara menjalankan:
 * - Via cronjob: php /path/to/send_attendance_reminders.php
 * - Manual: php send_attendance_reminders.php
 * 
 * Konfigurasi Cronjob:
 * - Clock in reminder: 15 7 * * * (setiap hari pukul 07:15)
 * - Clock out reminder: 45 16 * * * (setiap hari pukul 16:45)
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/email_sender.php';
require_once __DIR__ . '/email_templates.php';

// Set execution time limit
set_time_limit(MAX_EXECUTION_TIME);

// Enable output buffering for web access to show progress in real-time
if (php_sapi_name() !== 'cli') {
    // For web access, enable output buffering and flush immediately
    ob_start();
    // Set headers for text output
    header('Content-Type: text/plain; charset=utf-8');
    // Disable output compression for real-time display
    if (function_exists('apache_setenv')) {
        @apache_setenv('no-gzip', 1);
    }
    @ini_set('zlib.output_compression', 0);
}

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
    
    // Flush output immediately for web access to show progress
    if (php_sapi_name() !== 'cli') {
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
    }
}

/**
 * Get active students who haven't clocked in today
 */
function getStudentsWithoutClockIn($db, $today) {
    $query = "
        SELECT 
            u.id,
            u.nama_lengkap,
            u.email
        FROM users u
        LEFT JOIN absensi_clock_in aci ON u.id = aci.user_id AND aci.tanggal = ?
        WHERE u.role = 'mahasiswa'
        AND u.is_active = 1
        AND aci.id IS NULL
        ORDER BY u.nama_lengkap
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bind_param("s", $today);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $students = [];
    while ($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
    
    $stmt->close();
    return $students;
}

/**
 * Get students who have clocked in but haven't clocked out today
 */
function getStudentsWithoutClockOut($db, $today) {
    $query = "
        SELECT 
            u.id,
            u.nama_lengkap,
            u.email,
            aci.jam as clock_in_time
        FROM users u
        INNER JOIN absensi_clock_in aci ON u.id = aci.user_id AND aci.tanggal = ?
        LEFT JOIN absensi_clock_out aco ON u.id = aco.user_id AND aco.tanggal = ?
        WHERE u.role = 'mahasiswa'
        AND u.is_active = 1
        AND aco.id IS NULL
        ORDER BY u.nama_lengkap
    ";
    
    $stmt = $db->prepare($query);
    $stmt->bind_param("ss", $today, $today);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $students = [];
    while ($row = $result->fetch_assoc()) {
        $students[] = $row;
    }
    
    $stmt->close();
    return $students;
}

/**
 * Send clock in reminders
 */
function sendClockInReminders($db, $emailSender, $limit = null) {
    $today = date('Y-m-d');
    $students = getStudentsWithoutClockIn($db, $today);
    
    // If limit is specified (e.g. for web testing), reduce the list
    if ($limit !== null) {
        $students = array_slice($students, 0, (int)$limit);
    }
    
    $sentCount = 0;
    $errorCount = 0;
    
    logMessage("Found " . count($students) . " students without clock in today");
    
    $totalStudents = count($students);
    $currentIndex = 0;
    
    foreach ($students as $student) {
        $currentIndex++;
        logMessage("Processing student {$currentIndex}/{$totalStudents}: {$student['email']} ({$student['nama_lengkap']})");
        
        try {
            logMessage("  - Preparing email template...");
            $template = EmailTemplates::getClockInReminderTemplate($student);
            $subject = "Reminder: Clock In Hari Ini - " . date('d F Y');
            
            logMessage("  - Sending email to {$student['email']}...");
            $result = $emailSender->send(
                $student['email'],
                $subject,
                $template,
                true
            );
            
            if ($result['success']) {
                logMessage("  - ✓ Clock in reminder sent successfully to: {$student['email']} ({$student['nama_lengkap']})");
                $sentCount++;
            } else {
                logMessage("  - ✗ Failed to send clock in reminder to {$student['email']}: {$result['message']}", 'ERROR');
                $errorCount++;
            }
            
        } catch (Exception $e) {
            logMessage("  - ✗ Exception while sending clock in reminder to {$student['email']}: " . $e->getMessage(), 'ERROR');
            $errorCount++;
        } catch (Error $e) {
            logMessage("  - ✗ Fatal error while sending clock in reminder to {$student['email']}: " . $e->getMessage(), 'ERROR');
            $errorCount++;
        }
        
        logMessage("  - Completed processing for {$student['email']}");
    }
    
    return ['sent' => $sentCount, 'errors' => $errorCount];
}

/**
 * Send clock out reminders
 */
function sendClockOutReminders($db, $emailSender, $limit = null) {
    $today = date('Y-m-d');
    $students = getStudentsWithoutClockOut($db, $today);
    
    // If limit is specified (e.g. for web testing), reduce the list
    if ($limit !== null) {
        $students = array_slice($students, 0, (int)$limit);
    }
    
    $sentCount = 0;
    $errorCount = 0;
    
    logMessage("Found " . count($students) . " students without clock out today");
    
    $totalStudents = count($students);
    $currentIndex = 0;
    
    foreach ($students as $student) {
        $currentIndex++;
        logMessage("Processing student {$currentIndex}/{$totalStudents}: {$student['email']} ({$student['nama_lengkap']})");
        
        try {
            logMessage("  - Preparing email template...");
            $template = EmailTemplates::getClockOutReminderTemplate($student);
            $subject = "Reminder: Clock Out Hari Ini - " . date('d F Y');
            
            logMessage("  - Sending email to {$student['email']}...");
            $result = $emailSender->send(
                $student['email'],
                $subject,
                $template,
                true
            );
            
            if ($result['success']) {
                logMessage("  - ✓ Clock out reminder sent successfully to: {$student['email']} ({$student['nama_lengkap']})");
                $sentCount++;
            } else {
                logMessage("  - ✗ Failed to send clock out reminder to {$student['email']}: {$result['message']}", 'ERROR');
                $errorCount++;
            }
            
        } catch (Exception $e) {
            logMessage("  - ✗ Exception while sending clock out reminder to {$student['email']}: " . $e->getMessage(), 'ERROR');
            $errorCount++;
        } catch (Error $e) {
            logMessage("  - ✗ Fatal error while sending clock out reminder to {$student['email']}: " . $e->getMessage(), 'ERROR');
            $errorCount++;
        }
        
        logMessage("  - Completed processing for {$student['email']}");
    }
    
    return ['sent' => $sentCount, 'errors' => $errorCount];
}

/**
 * Determine which reminders to send based on current time
 */
function getReminderType() {
    // Check for manual override (command line argument or GET parameter)
    $manualType = null;
    
    // Check command line arguments (for CLI usage)
    if (php_sapi_name() === 'cli' && isset($_SERVER['argv'][1])) {
        $arg = $_SERVER['argv'][1];
        // Support format: type=clock_in or just clock_in
        if (strpos($arg, '=') !== false) {
            parse_str($arg, $params);
            $manualType = isset($params['type']) ? $params['type'] : null;
        } else {
            $manualType = $arg;
        }
    }
    
    // Check GET parameter (for web access)
    if ($manualType === null && isset($_GET['type'])) {
        $manualType = $_GET['type'];
    }
    
    // If manual type is specified, use it (if valid)
    if ($manualType === 'clock_in' || $manualType === 'clock_out') {
        return $manualType;
    }
    
    // Auto-detect based on current time
    $currentHour = (int)date('H');
    $currentMinute = (int)date('i');
    $currentTime = $currentHour * 60 + $currentMinute; // Convert to minutes from midnight
    
    // Behavior differs between CLI (cronjob/manual via terminal) and web:
    // - CLI: always send reminder based on broad time-of-day range so
    //        reminders tetap terkirim meskipun cron dijalankan di luar jam persis.
    //        * 00:00 - 11:59  -> clock_in
    //        * 12:00 - 23:59  -> clock_out
    // - Web: tetap gunakan jendela waktu sempit agar tidak mudah salah kirim.
    
    if (php_sapi_name() === 'cli') {
        if ($currentHour < 12) {
            return 'clock_in';
        } else {
            return 'clock_out';
        }
    }
    
    // Web access: keep strict 5-minute windows around 07:15 and 16:45
    $clockInReminderTime = 7 * 60 + 15; // 07:15
    $clockOutReminderTime = 16 * 60 + 45; // 16:45
    $window = 5; // 5 minutes window
    
    if ($currentTime >= ($clockInReminderTime - $window) && $currentTime <= ($clockInReminderTime + $window)) {
        return 'clock_in';
    } elseif ($currentTime >= ($clockOutReminderTime - $window) && $currentTime <= ($clockOutReminderTime + $window)) {
        return 'clock_out';
    } else {
        return null;
    }
}

/**
 * Main execution
 */
function main() {
    logMessage("=== Starting attendance reminder process ===");
    
    try {
        $db = Database::getConnection();
        $emailSender = new EmailSender();
        
        $isCli = php_sapi_name() === 'cli';
        
        // Optional limit, mainly for web testing: ?type=clock_in&limit=1
        $limit = null;
        if (!$isCli && isset($_GET['limit'])) {
            $limitVal = (int)$_GET['limit'];
            if ($limitVal > 0) {
                $limit = $limitVal;
                logMessage("Limit applied for web request: {$limit} student(s)");
            }
        }
        
        $reminderType = getReminderType();
        
        if ($reminderType === 'clock_in') {
            logMessage("Processing clock in reminders...");
            $results = sendClockInReminders($db, $emailSender, $limit);
            logMessage("Clock in reminders - Sent: {$results['sent']}, Errors: {$results['errors']}");
        } elseif ($reminderType === 'clock_out') {
            logMessage("Processing clock out reminders...");
            $results = sendClockOutReminders($db, $emailSender, $limit);
            logMessage("Clock out reminders - Sent: {$results['sent']}, Errors: {$results['errors']}");
        } else {
            $currentTime = date('H:i');
            logMessage("Current time is {$currentTime}. Reminders are only sent at 07:15 (clock in) or 16:45 (clock out).", 'INFO');
            logMessage("To manually trigger reminders:");
            logMessage("  - Command line: php send_attendance_reminders.php clock_in");
            logMessage("  - Command line: php send_attendance_reminders.php clock_out");
            logMessage("  - Web access: ?type=clock_in or ?type=clock_out");
            
            // If manual trigger not specified, still show status
            $today = date('Y-m-d');
            $studentsWithoutClockIn = getStudentsWithoutClockIn($db, $today);
            $studentsWithoutClockOut = getStudentsWithoutClockOut($db, $today);
            
            logMessage("Status check:");
            logMessage("  - Students without clock in today: " . count($studentsWithoutClockIn));
            logMessage("  - Students without clock out today: " . count($studentsWithoutClockOut));
        }
        
        logMessage("=== Process completed ===");
        
        Database::closeConnection();
        
    } catch (Exception $e) {
        logMessage("Fatal error: " . $e->getMessage(), 'ERROR');
        logMessage("Stack trace: " . $e->getTraceAsString(), 'ERROR');
        exit(1);
    } catch (Error $e) {
        logMessage("Fatal PHP error: " . $e->getMessage(), 'ERROR');
        logMessage("Stack trace: " . $e->getTraceAsString(), 'ERROR');
        exit(1);
    }
}

// Run the script
main();

// Flush any remaining output for web access
if (php_sapi_name() !== 'cli') {
    if (ob_get_level() > 0) {
        ob_end_flush();
    }
}

