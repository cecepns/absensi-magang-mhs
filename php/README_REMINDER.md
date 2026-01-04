# Sistem Reminder Clock In dan Clock Out

Script PHP untuk mengirim reminder email kepada mahasiswa yang belum melakukan clock in atau clock out.

## Fitur

- ✅ **Reminder Clock In**: Mengirim email reminder pada pukul 07:15 kepada mahasiswa yang belum clock in
- ✅ **Reminder Clock Out**: Mengirim email reminder pada pukul 16:45 kepada mahasiswa yang sudah clock in tapi belum clock out
- ✅ **Deteksi Otomatis**: Script otomatis mendeteksi waktu dan mengirim reminder yang sesuai
- ✅ **Manual Testing**: Dapat dijalankan manual dengan parameter untuk testing
- ✅ **Logging**: Semua aktivitas dicatat dalam log file

## Perbedaan dengan Email Konfirmasi

| Fitur | Email Konfirmasi | Email Reminder |
|-------|------------------|----------------|
| **Waktu Pengiriman** | Setelah clock in/out dilakukan | Sebelum waktu window berakhir |
| **Trigger** | Setiap ada clock in/out baru | Berdasarkan waktu (07:15 & 16:45) |
| **Tujuan** | Konfirmasi transaksi | Mengingatkan untuk melakukan absensi |
| **Penerima** | Yang sudah clock in/out | Yang belum clock in/out |

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

4. **Konfigurasi email** yang sama dengan sistem email konfirmasi (file `config.php`)

## Konfigurasi

### 1. Pastikan Konfigurasi Email

File `config.php` harus sudah dikonfigurasi dengan benar. Lihat `README_CRONJOB.md` untuk detail konfigurasi.

### 2. Set Permission

Pastikan folder logs dapat ditulis:

```bash
chmod 755 php/logs/
```

### 3. Test Manual

Sebelum setup cronjob, test manual terlebih dahulu:

```bash
# Test reminder clock in
php send_attendance_reminders.php clock_in

# Test reminder clock out
php send_attendance_reminders.php clock_out
```

Atau jika mengakses via web browser (untuk testing):

```bash
# Test reminder clock in
# Akses: http://your-domain.com/php/send_attendance_reminders.php?type=clock_in

# Test reminder clock out
# Akses: http://your-domain.com/php/send_attendance_reminders.php?type=clock_out
```

## Setup Cronjob

### Format Waktu Reminder

- **Clock In Reminder**: Setiap hari pukul **07:15** (15 menit sebelum window 07:30-08:00)
- **Clock Out Reminder**: Setiap hari pukul **16:45** (15 menit sebelum window 17:00-17:30)

### Contoh Cronjob Command

**Dengan Wrapper Script (Recommended - untuk menghindari deprecation warnings):**

```bash
# Reminder Clock In (setiap hari pukul 07:15)
15 7 * * * /usr/bin/php /path/to/php/run_reminder_cronjob.php >> /path/to/php/logs/reminder.log 2>&1

# Reminder Clock Out (setiap hari pukul 16:45)
45 16 * * * /usr/bin/php /path/to/php/run_reminder_cronjob.php >> /path/to/php/logs/reminder.log 2>&1
```

**Tanpa Wrapper Script:**

```bash
# Reminder Clock In (setiap hari pukul 07:15)
15 7 * * * /usr/bin/php /path/to/php/send_attendance_reminders.php >> /path/to/php/logs/reminder.log 2>&1

# Reminder Clock Out (setiap hari pukul 16:45)
45 16 * * * /usr/bin/php /path/to/php/send_attendance_reminders.php >> /path/to/php/logs/reminder.log 2>&1
```

**Catatan:** Wrapper script (`run_reminder_cronjob.php`) direkomendasikan jika Anda mengalami deprecation warnings dari third-party libraries (seperti Roundcube di cPanel).

### Setup di cPanel

1. Login ke cPanel
2. Buka **Cron Jobs**
3. Tambahkan dua cronjob baru dengan command di atas
4. Pastikan path PHP dan path file sudah benar
5. Simpan

### Setup via SSH

Edit crontab:

```bash
crontab -e
```

Tambahkan kedua baris di atas, lalu simpan.

Lihat file `CRONJOB_COMMAND.txt` untuk contoh lengkap dengan berbagai opsi path.

## Cara Kerja

### 1. Deteksi Waktu

Script akan otomatis mendeteksi waktu saat ini:
- Jika dijalankan sekitar **07:10 - 07:20** → Mengirim reminder clock in
- Jika dijalankan sekitar **16:40 - 16:50** → Mengirim reminder clock out
- Jika dijalankan di waktu lain → Menampilkan status saja (tidak mengirim email)

### 2. Query Mahasiswa

**Reminder Clock In:**
- Mengambil semua mahasiswa aktif yang **belum** melakukan clock in hari ini

**Reminder Clock Out:**
- Mengambil semua mahasiswa aktif yang **sudah** clock in tapi **belum** clock out hari ini

### 3. Pengiriman Email

- Email dikirim ke setiap mahasiswa yang memenuhi kriteria
- Template email menggunakan HTML yang responsif
- Logging semua aktivitas pengiriman

## Template Email

### Reminder Clock In

- **Judul**: ⏰ Reminder Clock In
- **Warna Header**: Pink/Red gradient
- **Informasi**:
  - Tanggal hari ini
  - Waktu saat ini
  - Waktu window clock in (07:30 - 08:00)
  - Status: Belum Clock In

### Reminder Clock Out

- **Judul**: ⏰ Reminder Clock Out
- **Warna Header**: Blue/Cyan gradient
- **Informasi**:
  - Tanggal hari ini
  - Waktu clock in yang sudah dilakukan
  - Durasi kerja (jika tersedia)
  - Waktu saat ini
  - Waktu window clock out (17:00 - 17:30)
  - Status: Belum Clock Out

## Logging

Semua aktivitas dicatat dalam file log:

```
php/logs/reminder.log
```

Contoh log:

```
[2024-01-15 07:15:01] [INFO] === Starting attendance reminder process ===
[2024-01-15 07:15:01] [INFO] Processing clock in reminders...
[2024-01-15 07:15:01] [INFO] Found 5 students without clock in today
[2024-01-15 07:15:02] [INFO] Clock in reminder sent to: student1@example.com (Ahmad Fauzi)
[2024-01-15 07:15:02] [INFO] Clock in reminder sent to: student2@example.com (Budi Santoso)
...
[2024-01-15 07:15:05] [INFO] Clock in reminders - Sent: 5, Errors: 0
[2024-01-15 07:15:05] [INFO] === Process completed ===
```

## Troubleshooting

### Reminder Tidak Terkirim

1. **Cek Log File**
   ```bash
   tail -f php/logs/reminder.log
   ```

2. **Cek Konfigurasi Email**
   - Pastikan SMTP credentials benar di `config.php`
   - Test dengan script email konfirmasi terlebih dahulu

3. **Cek Database Connection**
   - Pastikan database credentials benar
   - Pastikan tabel `users`, `absensi_clock_in`, `absensi_clock_out` ada

4. **Cek Waktu Cronjob**
   - Pastikan cronjob dijalankan pada waktu yang tepat
   - Script hanya mengirim email pada window waktu tertentu

### Manual Testing

Untuk testing tanpa menunggu cronjob:

```bash
# Test clock in reminder
php send_attendance_reminders.php clock_in

# Test clock out reminder
php send_attendance_reminders.php clock_out
```

Atau via web browser:
```bash
# Test clock in reminder
http://your-domain.com/php/send_attendance_reminders.php?type=clock_in

# Test clock out reminder
http://your-domain.com/php/send_attendance_reminders.php?type=clock_out
```

### Status Check

Jalankan script tanpa parameter untuk melihat status:

```bash
php send_attendance_reminders.php
```

Output akan menampilkan:
- Jumlah mahasiswa yang belum clock in hari ini
- Jumlah mahasiswa yang belum clock out hari ini

## Keamanan

- Script hanya mengirim reminder kepada user dengan role `mahasiswa` yang aktif (`is_active = 1`)
- Tidak mengirim email kepada mentor atau pengurus
- Log file tidak mengandung informasi sensitif

## Kustomisasi

### Mengubah Waktu Reminder

Edit file `send_attendance_reminders.php`, ubah konstanta:

```php
$clockInReminderTime = 7 * 60 + 15; // 07:15 (ubah sesuai kebutuhan)
$clockOutReminderTime = 16 * 60 + 45; // 16:45 (ubah sesuai kebutuhan)
```

Dan update cronjob schedule sesuai waktu baru.

### Mengubah Template Email

Edit file `email_templates.php`:
- Method `getClockInReminderTemplate()` untuk reminder clock in
- Method `getClockOutReminderTemplate()` untuk reminder clock out

## Integrasi dengan Sistem Lain

Sistem reminder ini independen dan dapat diintegrasikan dengan:
- Sistem notifikasi push (untuk aplikasi mobile)
- Sistem SMS gateway
- Sistem WhatsApp Business API

Hanya perlu memodifikasi method pengiriman di `send_attendance_reminders.php`.

## Support

Jika mengalami masalah:
1. Cek log file di `php/logs/reminder.log`
2. Pastikan konfigurasi email dan database sudah benar
3. Test manual terlebih dahulu sebelum setup cronjob

## Changelog

### v1.0.0 (2024-01-15)
- Initial release
- Reminder clock in dan clock out
- Template email HTML responsif
- Logging system
- Auto-detection waktu reminder

