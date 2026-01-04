# Instruksi Setup Cronjob untuk Email Absensi

Script PHP ini akan mengirim email otomatis setiap kali ada clock in atau clock out yang baru.

## Prerequisites

1. **PHP 7.4 atau lebih tinggi** dengan ekstensi:
   - `mysqli` (untuk koneksi database)
   - `mail()` function (atau PHPMailer untuk SMTP)

2. **PHPMailer (Opsional, direkomendasikan)**
   ```bash
   cd php
   composer require phpmailer/phpmailer
   ```

3. **Akses ke database MySQL** yang sama dengan aplikasi

## Konfigurasi

### 1. Edit File `config.php`

Buka file `php/config.php` dan sesuaikan dengan konfigurasi Anda:

```php
// Database
define('DB_HOST', 'localhost');
define('DB_USER', 'username_database');
define('DB_PASS', 'password_database');
define('DB_NAME', 'absensi_magang');

// Email SMTP
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-email@gmail.com');
define('SMTP_PASS', 'your-app-password');
define('SMTP_FROM_EMAIL', 'your-email@gmail.com');
define('SMTP_FROM_NAME', 'Sistem Absensi Magang');
```

**Catatan untuk Gmail:**
- Gunakan App Password, bukan password biasa
- Aktifkan 2-Step Verification terlebih dahulu
- Buat App Password di: https://myaccount.google.com/apppasswords

### 2. Set Permission

Pastikan file PHP dapat dijalankan dan folder logs dapat ditulis:

```bash
chmod +x php/send_attendance_emails.php
chmod 755 php/logs
```

## Setup Cronjob di cPanel

### Metode 1: Via cPanel Cron Jobs

1. Login ke cPanel
2. Buka **Cron Jobs**
3. Pilih **Standard (cPanel v54.0.23)**
4. Tambahkan cronjob baru dengan konfigurasi:

**Setiap 5 menit (RECOMMENDED - dengan wrapper untuk menekan deprecation warnings):**
```
*/5 * * * * /usr/bin/php /home/username/public_html/absensi/php/run_cronjob.php >> /home/username/public_html/absensi/php/logs/cron.log 2>&1
```

**Setiap 10 menit:**
```
*/10 * * * * /usr/bin/php /home/username/public_html/absensi/php/run_cronjob.php >> /home/username/public_html/absensi/php/logs/cron.log 2>&1
```

**Setiap 15 menit:**
```
*/15 * * * * /usr/bin/php /home/username/public_html/absensi/php/run_cronjob.php >> /home/username/public_html/absensi/php/logs/cron.log 2>&1
```

**Setiap jam:**
```
0 * * * * /usr/bin/php /home/username/public_html/absensi/php/run_cronjob.php >> /home/username/public_html/absensi/php/logs/cron.log 2>&1
```

**Catatan tentang Deprecation Warnings:**
- Jika Anda menggunakan PHP 7.4+ dan melihat deprecation warnings dari Roundcube/cPanel di log, gunakan `run_cronjob.php` (wrapper script)
- Wrapper script akan menekan deprecation warnings dari third-party libraries tanpa mempengaruhi eksekusi script
- Error yang relevan untuk aplikasi Anda tetap akan ditampilkan dan di-log

**Catatan:**
- Ganti `/home/username/public_html/absensi` dengan path absolut ke folder project Anda
- Ganti `/usr/bin/php` dengan path PHP di server Anda (cek dengan `which php`)

### Metode 2: Via SSH (jika memiliki akses)

Edit crontab:
```bash
crontab -e
```

Tambahkan baris:
```
*/5 * * * * /usr/bin/php /path/to/absensi/php/run_cronjob.php >> /path/to/absensi/php/logs/cron.log 2>&1
```

## Testing

### Test Manual

Jalankan script secara manual untuk testing:

```bash
cd /path/to/absensi/php
php run_cronjob.php
```

Atau langsung:
```bash
php send_attendance_emails.php
```

### Cek Logs

Cek file log untuk melihat hasil:
```bash
tail -f php/logs/email_log.txt
```

## Troubleshooting

### 1. Email tidak terkirim

**Cek konfigurasi SMTP:**
- Pastikan SMTP_HOST, SMTP_USER, dan SMTP_PASS benar
- Untuk Gmail, pastikan menggunakan App Password

**Cek log error:**
```bash
tail -f php/logs/error.log
```

### 2. Database connection error

**Cek kredensial database:**
- Pastikan DB_HOST, DB_USER, DB_PASS, dan DB_NAME benar
- Pastikan user database memiliki akses ke database

### 3. Permission denied

**Set permission:**
```bash
chmod 755 php/
chmod 644 php/*.php
chmod 755 php/logs/
```

### 4. Cronjob tidak jalan

**Cek path PHP:**
```bash
which php
```

**Cek cronjob log:**
```bash
tail -f php/logs/cron.log
```

**Test cronjob dengan command sederhana:**
```
*/5 * * * * echo "Test" >> /path/to/test.log
```

### 5. Deprecation Warnings dari Roundcube/cPanel

**Masalah:**
Jika Anda melihat banyak deprecation warnings di log seperti:
```
PHP Deprecated: session_set_save_handler()...
PHP Deprecated: MStilkerich\CardDavClient\Config::init()...
```

**Solusi:**
- Gunakan `run_cronjob.php` sebagai wrapper script di cronjob (sudah disetel di contoh di atas)
- Wrapper script akan menekan deprecation warnings dari third-party libraries (Roundcube, cPanel, dll)
- Error yang relevan untuk aplikasi Anda tetap akan ditampilkan
- Konfigurasi error handling sudah diatur di `config.php` untuk menekan warnings tersebut

## Frekuensi Cronjob yang Direkomendasikan

- **Setiap 5 menit**: Untuk notifikasi real-time (disarankan)
- **Setiap 10 menit**: Balance antara real-time dan resource usage
- **Setiap 15 menit**: Untuk mengurangi load server
- **Setiap jam**: Jika tidak perlu notifikasi real-time

## Fitur Script

1. ✅ Mengambil data clock in/out dalam 1 jam terakhir
2. ✅ Mengirim email ke mahasiswa yang melakukan clock in/out
3. ✅ Mengirim notifikasi ke mentor terkait
4. ✅ Logging lengkap untuk monitoring
5. ✅ Error handling yang baik
6. ✅ Template email HTML yang menarik

## Catatan Penting

- Script akan memproses semua clock in/out yang dibuat dalam **1 jam terakhir**
- Email akan dikirim ke:
  - Mahasiswa yang melakukan clock in/out
  - Mentor yang terhubung dengan mahasiswa tersebut (jika ada)
- Pastikan folder `logs/` dapat ditulis oleh PHP
- Monitor log file secara berkala untuk memastikan script berjalan dengan baik

## Support

Jika ada masalah, cek:
1. File log: `php/logs/email_log.txt`
2. Error log: `php/logs/error.log`
3. Cron log: `php/logs/cron.log` (jika menggunakan cron)


