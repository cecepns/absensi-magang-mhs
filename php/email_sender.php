<?php
/**
 * Email Sender Class
 * 
 * Menggunakan PHPMailer untuk mengirim email
 * Pastikan PHPMailer sudah terinstall atau gunakan mail() native PHP
 */

require_once __DIR__ . '/config.php';

class EmailSender {
    private $smtpHost;
    private $smtpPort;
    private $smtpUser;
    private $smtpPass;
    private $fromEmail;
    private $fromName;
    
    public function __construct() {
        $this->smtpHost = SMTP_HOST;
        $this->smtpPort = SMTP_PORT;
        $this->smtpUser = SMTP_USER;
        $this->smtpPass = SMTP_PASS;
        $this->fromEmail = SMTP_FROM_EMAIL;
        $this->fromName = SMTP_FROM_NAME;
    }
    
    /**
     * Send email using PHPMailer (recommended)
     * Install PHPMailer: composer require phpmailer/phpmailer
     */
    public function sendWithPHPMailer($to, $subject, $body, $isHTML = true) {
        // Check if PHPMailer is available
        $phpmailerClass = 'PHPMailer\PHPMailer\PHPMailer';
        if (class_exists($phpmailerClass)) {
            // Load autoloader if exists
            $autoloader = __DIR__ . '/vendor/autoload.php';
            if (file_exists($autoloader)) {
                require_once $autoloader;
            }
            
            try {
                $mail = new $phpmailerClass(true);
                
                // Server settings
                $mail->isSMTP();
                $mail->Host = $this->smtpHost;
                $mail->SMTPAuth = true;
                $mail->Username = $this->smtpUser;
                $mail->Password = $this->smtpPass;
                $mail->SMTPSecure = $phpmailerClass::ENCRYPTION_STARTTLS;
                $mail->Port = $this->smtpPort;
                $mail->CharSet = 'UTF-8';
                
                // Recipients
                $mail->setFrom($this->fromEmail, $this->fromName);
                $mail->addAddress($to);
                
                // Content
                $mail->isHTML($isHTML);
                $mail->Subject = $subject;
                $mail->Body = $body;
                
                $mail->send();
                return ['success' => true, 'message' => 'Email sent successfully'];
            } catch (Exception $e) {
                return ['success' => false, 'message' => "Email could not be sent. Error: " . $e->getMessage()];
            }
        } else {
            // Fallback to native mail() function
            return $this->sendWithNativeMail($to, $subject, $body, $isHTML);
        }
    }
    
    /**
     * Send email using native PHP mail() function
     */
    public function sendWithNativeMail($to, $subject, $body, $isHTML = true) {
        $headers = [];
        $headers[] = "MIME-Version: 1.0";
        $headers[] = "Content-Type: text/html; charset=UTF-8";
        $headers[] = "From: {$this->fromName} <{$this->fromEmail}>";
        $headers[] = "Reply-To: {$this->fromEmail}";
        $headers[] = "X-Mailer: PHP/" . phpversion();
        
        $headersString = implode("\r\n", $headers);
        
        if (mail($to, $subject, $body, $headersString)) {
            return ['success' => true, 'message' => 'Email sent successfully'];
        } else {
            return ['success' => false, 'message' => 'Failed to send email'];
        }
    }
    
    /**
     * Send email (auto-detect method)
     */
    public function send($to, $subject, $body, $isHTML = true) {
        // Try PHPMailer first, fallback to native mail()
        $phpmailerClass = 'PHPMailer\PHPMailer\PHPMailer';
        if (class_exists($phpmailerClass)) {
            return $this->sendWithPHPMailer($to, $subject, $body, $isHTML);
        } else {
            return $this->sendWithNativeMail($to, $subject, $body, $isHTML);
        }
    }
}

