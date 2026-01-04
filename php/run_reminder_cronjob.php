<?php
/**
 * Wrapper Script untuk Cronjob Reminder
 * 
 * Script ini menekan deprecation warnings dari third-party libraries
 * (seperti Roundcube) sebelum menjalankan script reminder utama.
 * 
 * Gunakan script ini di cronjob untuk menghindari deprecation warnings
 * yang tidak relevan dari library pihak ketiga.
 */

// Menekan deprecation warnings sebelum include file lain
// Ini akan mencegah deprecation warnings dari Roundcube/cPanel muncul
if (PHP_VERSION_ID >= 70400) {
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
} else {
    error_reporting(E_ALL);
}

// Set error handler untuk filter deprecation warnings dari third-party
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
                // Jangan tampilkan atau log deprecation warnings dari third-party
                return true;
            }
        }
    }
    
    // Untuk error lainnya, gunakan default error handler
    return false;
}, E_DEPRECATED);

// Set timezone
date_default_timezone_set('Asia/Jakarta');

// Include dan jalankan script reminder utama
require_once __DIR__ . '/send_attendance_reminders.php';

