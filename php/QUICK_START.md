# Quick Start Guide - Email Absensi

## Langkah Cepat Setup

### 1. Konfigurasi Database & Email

Edit file `config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'username_db');
define('DB_PASS', 'password_db');
define('DB_NAME', 'absensi_magang');

define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'email@gmail.com');
define('SMTP_PASS', 'app-password');
define('SMTP_FROM_EMAIL', 'email@gmail.com');
define('SMTP_FROM_NAME', 'Sistem Absensi Magang');
```

### 2. Install PHPMailer (Opsional)

```bash
cd php
composer install
```

**Atau** gunakan native `mail()` PHP (tanpa install apapun).

### 3. Test Script

```bash
php send_attendance_emails.php
```

### 4. Setup Cronjob di cPanel

1. Login cPanel → **Cron Jobs**
2. Tambahkan cronjob:

**Setiap 5 menit:**
```
*/5 * * * * /usr/bin/php /home/username/public_html/absensi/php/send_attendance_emails.php >> /home/username/public_html/absensi/php/logs/cron.log 2>&1
```

**Ganti:**
- `/usr/bin/php` → path PHP Anda (cek dengan `which php`)
- `/home/username/public_html/absensi` → path absolut ke folder project

### 5. Cek Logs

```bash
tail -f php/logs/email_log.txt
```

## Troubleshooting

**Email tidak terkirim?**
- Cek SMTP credentials di `config.php`
- Untuk Gmail: gunakan App Password (bukan password biasa)

**Database error?**
- Cek kredensial database di `config.php`
- Pastikan user database punya akses

**Cronjob tidak jalan?**
- Cek path PHP: `which php`
- Cek log: `tail -f php/logs/cron.log`

## File Structure

```
php/
├── config.php              # Konfigurasi database & email
├── database.php            # Database connection helper
├── email_sender.php        # Email sender class
├── email_templates.php    # Template email HTML
├── send_attendance_emails.php  # Script utama
├── composer.json           # Dependencies (PHPMailer)
├── README_CRONJOB.md      # Dokumentasi lengkap
└── logs/                  # Folder untuk log files
```

## Fitur

✅ Email ke mahasiswa saat clock in/out  
✅ Notifikasi ke mentor  
✅ Template email HTML menarik  
✅ Logging lengkap  
✅ Error handling  

## Support

Lihat `README_CRONJOB.md` untuk dokumentasi lengkap.


