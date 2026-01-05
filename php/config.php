<?php
/**
 * Konfigurasi Database dan Email
 * 
 * File ini berisi konfigurasi untuk koneksi database dan pengaturan email.
 * Sesuaikan dengan konfigurasi server Anda.
 */

// Konfigurasi Database MySQL
define('DB_HOST', 'localhost');
define('DB_USER', 'isad8273_absensi_magang_mhs');
define('DB_PASS', 'isad8273_absensi_magang_mhs');
define('DB_NAME', 'isad8273_absensi_magang_mhs');

// Konfigurasi Email (SMTP)
define('SMTP_HOST', 'mail.isavralabel.com'); // Ganti dengan SMTP server Anda
define('SMTP_PORT', 465);
define('SMTP_USER', 'absensi@isavralabel.com'); // Email pengirim
define('SMTP_PASS', '@absensi123'); // App password untuk Gmail
define('SMTP_FROM_EMAIL', 'no-reply@gmail.com');
define('SMTP_FROM_NAME', 'Sistem Absensi Magang');


// Konfigurasi lainnya
define('TIMEZONE', 'Asia/Jakarta');
define('LOG_FILE', __DIR__ . '/logs/email_log.txt');
define('MAX_EXECUTION_TIME', 300); // 5 menit

// Set timezone
date_default_timezone_set(TIMEZONE);

// Error reporting configuration
// Untuk PHP 7.4, kita perlu menekan deprecation warnings dari third-party libraries
// seperti Roundcube yang ada di cPanel
if (PHP_VERSION_ID >= 70400) {
    // PHP 7.4+: Tampilkan semua error kecuali deprecation warnings
    // Deprecation warnings dari third-party libraries tidak akan mengganggu eksekusi
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
} else {
    // PHP versi lama
    error_reporting(E_ALL);
}

// Konfigurasi error handling
ini_set('display_errors', 0); // Jangan tampilkan error di output
ini_set('log_errors', 1); // Log semua error
ini_set('error_log', __DIR__ . '/logs/error.log');

// Set custom error handler untuk filter deprecation warnings dari third-party libraries
// Ini akan mencegah deprecation warnings dari Roundcube/cPanel muncul di log
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    // Skip deprecation warnings dari third-party libraries
    if ($errno === E_DEPRECATED) {
        $thirdPartyPaths = [
            '/roundcube/',
            '/cpanel/',
            '/carddav/',
            '/libkolab/',
            '/3rdparty/'
        ];
        
        foreach ($thirdPartyPaths as $path) {
            if (strpos($errfile, $path) !== false) {
                // Jangan log deprecation warnings dari third-party
                return true; // Return true untuk menekan error
            }
        }
    }
    
    // Untuk error lainnya, gunakan default error handler
    return false;
}, E_DEPRECATED);


