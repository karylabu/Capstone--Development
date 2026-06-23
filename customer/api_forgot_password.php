<?php
// customer/api_forgot_password.php

error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Adjust path to your vendor folder
require_once __DIR__ . '/../vendor/autoload.php';

try {
    $conn = mysqli_connect("localhost", "root", "", "pastry_db");
    if (!$conn) throw new Exception("DB connection failed");

    // Auto-create password_resets table if missing
    mysqli_query($conn, "
        CREATE TABLE IF NOT EXISTS password_resets (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            email      VARCHAR(255) NOT NULL,
            token      VARCHAR(6)   NOT NULL,
            expires_at DATETIME     NOT NULL,
            used       TINYINT(1)   DEFAULT 0,
            created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )
    ");

    $data  = json_decode(file_get_contents("php://input"), true);
    $email = trim($data['email'] ?? '');

    if (!$email) {
        echo json_encode(["success" => false, "message" => "Email is required."]);
        exit;
    }

    $escaped = mysqli_real_escape_string($conn, $email);
    $check   = mysqli_query($conn, "SELECT id FROM users WHERE email='$escaped' LIMIT 1");

    // Always return success to prevent email enumeration
    if (!($check && mysqli_num_rows($check) > 0)) {
        echo json_encode(["success" => true]);
        exit;
    }

    // Generate 6-digit code
    $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    // Invalidate old tokens
    mysqli_query($conn, "UPDATE password_resets SET used=1 WHERE email='$escaped'");

    // Store new token with expiration based on MySQL server time
    mysqli_query($conn, "
        INSERT INTO password_resets (email, token, expires_at)
        VALUES ('$escaped', '$code', DATE_ADD(NOW(), INTERVAL 15 MINUTE))
    ");

    // Send email via PHPMailer
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'hernandezkaryl78@gmail.com';
     $mail->Password   = 'xmds pojv zaub aseu';  
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    $mail->setFrom('your_email@gmail.com', 'Pastry Project');
    $mail->addAddress($email);
    $mail->isHTML(true);
    $mail->Subject = 'Your Password Reset Code';
    $mail->Body    = "
        <div style='font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:24px;border:1px solid #f0f0f0;'>
            <p style='font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#d4af37;margin-bottom:8px;'>Pastry Project</p>
            <h2 style='font-size:28px;color:#111;margin-bottom:16px;'>Password Reset</h2>
            <p style='color:#666;font-size:14px;margin-bottom:24px;'>Use the code below to reset your password. It expires in <strong>15 minutes</strong>.</p>
            <div style='font-size:42px;font-weight:900;letter-spacing:0.2em;color:#111;background:#f5f6fa;border-radius:16px;padding:20px;text-align:center;margin-bottom:24px;'>
                {$code}
            </div>
            <p style='color:#aaa;font-size:12px;'>If you didn't request this, you can safely ignore this email.</p>
        </div>
    ";
    $mail->AltBody = "Your password reset code is: {$code}. It expires in 15 minutes.";
    $mail->send();

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Failed to send email."]);
}
?>