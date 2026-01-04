<?php
/**
 * Email Templates
 * 
 * Template HTML untuk email clock in dan clock out
 */

class EmailTemplates {
    
    /**
     * Get clock in email template
     */
    public static function getClockInTemplate($data) {
        $tanggal = date('d F Y', strtotime($data['tanggal']));
        $jam = $data['jam'];
        $nama = $data['nama_lengkap'];
        $status = $data['status'];
        $keterangan = $data['keterangan'] ?? '-';
        $distance = $data['distance'] ?? 0;
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Clock In Notification</title>
        </head>
        <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f4f4f4; padding: 20px;'>
                <tr>
                    <td align='center'>
                        <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                            <!-- Header -->
                            <tr>
                                <td style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;'>
                                    <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Clock In Berhasil</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style='padding: 30px;'>
                                    <p style='color: #333333; font-size: 16px; margin: 0 0 20px 0;'>Halo <strong>{$nama}</strong>,</p>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;'>
                                        Clock in Anda telah tercatat dengan detail sebagai berikut:
                                    </p>
                                    
                                    <table width='100%' cellpadding='10' cellspacing='0' style='background-color: #f9f9f9; border-radius: 4px; margin: 20px 0;'>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Tanggal</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$tanggal}</td>
                                        </tr>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Jam</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$jam}</td>
                                        </tr>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Status</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$status}</td>
                                        </tr>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Jarak dari Kantor</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$distance} meter</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 10px;'><strong>Keterangan</strong></td>
                                            <td style='padding: 10px;'>{$keterangan}</td>
                                        </tr>
                                    </table>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;'>
                                        Terima kasih telah melakukan clock in tepat waktu. Semoga hari Anda produktif!
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style='background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;'>
                                    <p style='color: #999999; font-size: 12px; margin: 0;'>
                                        Email ini dikirim secara otomatis oleh Sistem Absensi Magang.<br>
                                        Jangan membalas email ini.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";
    }
    
    /**
     * Get clock out email template
     */
    public static function getClockOutTemplate($data) {
        $tanggal = date('d F Y', strtotime($data['tanggal']));
        $jam = $data['jam'];
        $nama = $data['nama_lengkap'];
        $status = $data['status'];
        $keterangan = $data['keterangan'] ?? '-';
        $distance = $data['distance'] ?? 0;
        
        // Calculate work duration if clock in data is available
        $workDuration = '';
        if (isset($data['clock_in_time'])) {
            $clockIn = strtotime($data['clock_in_time']);
            $clockOut = strtotime($jam);
            $duration = $clockOut - $clockIn;
            $hours = floor($duration / 3600);
            $minutes = floor(($duration % 3600) / 60);
            $workDuration = "{$hours} jam {$minutes} menit";
        }
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Clock Out Notification</title>
        </head>
        <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f4f4f4; padding: 20px;'>
                <tr>
                    <td align='center'>
                        <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                            <!-- Header -->
                            <tr>
                                <td style='background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;'>
                                    <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Clock Out Berhasil</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style='padding: 30px;'>
                                    <p style='color: #333333; font-size: 16px; margin: 0 0 20px 0;'>Halo <strong>{$nama}</strong>,</p>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;'>
                                        Clock out Anda telah tercatat dengan detail sebagai berikut:
                                    </p>
                                    
                                    <table width='100%' cellpadding='10' cellspacing='0' style='background-color: #f9f9f9; border-radius: 4px; margin: 20px 0;'>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Tanggal</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$tanggal}</td>
                                        </tr>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Jam</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$jam}</td>
                                        </tr>
                                        " . ($workDuration ? "
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Durasi Kerja</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$workDuration}</td>
                                        </tr>
                                        " : "") . "
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Status</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$status}</td>
                                        </tr>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Jarak dari Kantor</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$distance} meter</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 10px;'><strong>Keterangan</strong></td>
                                            <td style='padding: 10px;'>{$keterangan}</td>
                                        </tr>
                                    </table>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;'>
                                        Terima kasih telah bekerja dengan baik hari ini. Istirahat yang cukup dan sampai jumpa besok!
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style='background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;'>
                                    <p style='color: #999999; font-size: 12px; margin: 0;'>
                                        Email ini dikirim secara otomatis oleh Sistem Absensi Magang.<br>
                                        Jangan membalas email ini.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";
    }
    
    /**
     * Get mentor notification template
     */
    public static function getMentorNotificationTemplate($data, $type = 'clock_in') {
        $tanggal = date('d F Y', strtotime($data['tanggal']));
        $jam = $data['jam'];
        $nama = $data['nama_lengkap'];
        $status = $data['status'];
        $typeText = $type === 'clock_in' ? 'Clock In' : 'Clock Out';
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Notifikasi Absensi Mahasiswa</title>
        </head>
        <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f4f4f4; padding: 20px;'>
                <tr>
                    <td align='center'>
                        <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                            <!-- Header -->
                            <tr>
                                <td style='background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;'>
                                    <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>Notifikasi {$typeText}</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style='padding: 30px;'>
                                    <p style='color: #333333; font-size: 16px; margin: 0 0 20px 0;'>Halo Mentor,</p>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;'>
                                        Mahasiswa bimbingan Anda telah melakukan {$typeText}:
                                    </p>
                                    
                                    <table width='100%' cellpadding='10' cellspacing='0' style='background-color: #f9f9f9; border-radius: 4px; margin: 20px 0;'>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Nama Mahasiswa</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$nama}</td>
                                        </tr>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Tanggal</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$tanggal}</td>
                                        </tr>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Jam</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$jam}</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 10px;'><strong>Status</strong></td>
                                            <td style='padding: 10px;'>{$status}</td>
                                        </tr>
                                    </table>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;'>
                                        Silakan login ke sistem untuk melihat detail lengkap dan melakukan approval jika diperlukan.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style='background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;'>
                                    <p style='color: #999999; font-size: 12px; margin: 0;'>
                                        Email ini dikirim secara otomatis oleh Sistem Absensi Magang.<br>
                                        Jangan membalas email ini.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";
    }
    
    /**
     * Get clock in reminder template
     */
    public static function getClockInReminderTemplate($data) {
        $nama = $data['nama_lengkap'];
        $tanggal = date('d F Y');
        $currentTime = date('H:i');
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Reminder Clock In</title>
        </head>
        <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f4f4f4; padding: 20px;'>
                <tr>
                    <td align='center'>
                        <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                            <!-- Header -->
                            <tr>
                                <td style='background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;'>
                                    <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>⏰ Reminder Clock In</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style='padding: 30px;'>
                                    <p style='color: #333333; font-size: 16px; margin: 0 0 20px 0;'>Halo <strong>{$nama}</strong>,</p>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;'>
                                        Ini adalah pengingat bahwa Anda belum melakukan <strong>Clock In</strong> hari ini ({$tanggal}).
                                    </p>
                                    
                                    <div style='background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;'>
                                        <p style='color: #856404; font-size: 14px; margin: 0; font-weight: bold;'>
                                            ⏱️ Waktu Clock In: <strong>07:30 - 08:00</strong>
                                        </p>
                                        <p style='color: #856404; font-size: 12px; margin: 10px 0 0 0;'>
                                            Pastikan Anda melakukan clock in sebelum batas waktu berakhir!
                                        </p>
                                    </div>
                                    
                                    <table width='100%' cellpadding='10' cellspacing='0' style='background-color: #f9f9f9; border-radius: 4px; margin: 20px 0;'>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Tanggal</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$tanggal}</td>
                                        </tr>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Waktu Saat Ini</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$currentTime} WIB</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 10px;'><strong>Status</strong></td>
                                            <td style='padding: 10px; color: #dc3545;'><strong>Belum Clock In</strong></td>
                                        </tr>
                                    </table>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;'>
                                        Segera lakukan clock in melalui aplikasi atau website sistem absensi. Pastikan Anda berada di dalam radius kantor saat melakukan clock in.
                                    </p>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;'>
                                        Jangan lupa untuk mengaktifkan lokasi GPS di perangkat Anda.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style='background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;'>
                                    <p style='color: #999999; font-size: 12px; margin: 0;'>
                                        Email ini dikirim secara otomatis oleh Sistem Absensi Magang.<br>
                                        Jangan membalas email ini.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";
    }
    
    /**
     * Get clock out reminder template
     */
    public static function getClockOutReminderTemplate($data) {
        $nama = $data['nama_lengkap'];
        $tanggal = date('d F Y');
        $currentTime = date('H:i');
        $clockInTime = isset($data['clock_in_time']) ? $data['clock_in_time'] : '-';
        
        // Calculate work duration if clock in time is available
        $workDuration = '';
        if ($clockInTime !== '-' && !empty($clockInTime)) {
            $clockIn = strtotime($clockInTime);
            $now = time();
            $duration = $now - $clockIn;
            $hours = floor($duration / 3600);
            $minutes = floor(($duration % 3600) / 60);
            $workDuration = "{$hours} jam {$minutes} menit";
        }
        
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Reminder Clock Out</title>
        </head>
        <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
            <table width='100%' cellpadding='0' cellspacing='0' style='background-color: #f4f4f4; padding: 20px;'>
                <tr>
                    <td align='center'>
                        <table width='600' cellpadding='0' cellspacing='0' style='background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);'>
                            <!-- Header -->
                            <tr>
                                <td style='background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;'>
                                    <h1 style='color: #ffffff; margin: 0; font-size: 24px;'>⏰ Reminder Clock Out</h1>
                                </td>
                            </tr>
                            
                            <!-- Content -->
                            <tr>
                                <td style='padding: 30px;'>
                                    <p style='color: #333333; font-size: 16px; margin: 0 0 20px 0;'>Halo <strong>{$nama}</strong>,</p>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;'>
                                        Ini adalah pengingat bahwa Anda sudah melakukan <strong>Clock In</strong> hari ini, namun belum melakukan <strong>Clock Out</strong>.
                                    </p>
                                    
                                    <div style='background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; border-radius: 4px;'>
                                        <p style='color: #0c5460; font-size: 14px; margin: 0; font-weight: bold;'>
                                            ⏱️ Waktu Clock Out: <strong>17:00 - 17:30</strong>
                                        </p>
                                        <p style='color: #0c5460; font-size: 12px; margin: 10px 0 0 0;'>
                                            Pastikan Anda melakukan clock out sebelum batas waktu berakhir!
                                        </p>
                                    </div>
                                    
                                    <table width='100%' cellpadding='10' cellspacing='0' style='background-color: #f9f9f9; border-radius: 4px; margin: 20px 0;'>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Tanggal</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$tanggal}</td>
                                        </tr>
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Waktu Clock In</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$clockInTime}</td>
                                        </tr>
                                        " . ($workDuration ? "
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Durasi Kerja</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$workDuration}</td>
                                        </tr>
                                        " : "") . "
                                        <tr>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'><strong>Waktu Saat Ini</strong></td>
                                            <td style='border-bottom: 1px solid #e0e0e0; padding: 10px;'>{$currentTime} WIB</td>
                                        </tr>
                                        <tr>
                                            <td style='padding: 10px;'><strong>Status</strong></td>
                                            <td style='padding: 10px; color: #dc3545;'><strong>Belum Clock Out</strong></td>
                                        </tr>
                                    </table>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;'>
                                        Segera lakukan clock out melalui aplikasi atau website sistem absensi sebelum waktu berakhir. Pastikan Anda berada di dalam radius kantor saat melakukan clock out.
                                    </p>
                                    
                                    <p style='color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;'>
                                        Terima kasih telah bekerja dengan baik hari ini. Jangan lupa untuk mengaktifkan lokasi GPS di perangkat Anda.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style='background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;'>
                                    <p style='color: #999999; font-size: 12px; margin: 0;'>
                                        Email ini dikirim secara otomatis oleh Sistem Absensi Magang.<br>
                                        Jangan membalas email ini.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        ";
    }
}


