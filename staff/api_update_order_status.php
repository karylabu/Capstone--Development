<?php
ini_set('display_errors', 0);
error_reporting(0);

while (ob_get_level()) {
    ob_end_clean();
}

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["success" => true]);
    exit();
}

/* =========================
   DATABASE
========================= */
$conn = new mysqli("localhost", "root", "", "pastry_db");

if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "DB connect failed"
    ]);
    exit();
}

/* =========================
   INPUT
========================= */
$raw  = file_get_contents("php://input");
$data = json_decode($raw, true);

$id     = isset($data['id']) ? intval($data['id']) : 0;
$status = isset($data['status']) ? trim($data['status']) : "";

if (!$id || !$status) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid input",
        "raw" => $raw
    ]);
    exit();
}

/* =========================
   UPDATE ORDER
========================= */
$stmt = $conn->prepare("UPDATE orders SET status=? WHERE id=?");

if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Prepare failed"]);
    exit();
}

$stmt->bind_param("si", $status, $id);

if (!$stmt->execute()) {
    echo json_encode(["success" => false, "message" => "Update failed"]);
    exit();
}

$stmt->close();

/* =========================
   SMS LOGIC
========================= */
$smsSent  = false;
$smsError = null;

if ($status === "To Receive") {

    $ps = $conn->prepare("SELECT phone FROM orders WHERE id=?");

    if ($ps) {

        $ps->bind_param("i", $id);
        $ps->execute();
        $row = $ps->get_result()->fetch_assoc();
        $ps->close();

        $phone = $row['phone'] ?? null;

        if ($phone) {

            /* Normalize to 639XXXXXXXXX — no + prefix */
            $phone = preg_replace('/\D/', '', $phone);

            if (substr($phone, 0, 2) === '63') {
                $phone = substr($phone, 2);
            }
            if (substr($phone, 0, 1) === '0') {
                $phone = substr($phone, 1);
            }

            $phone = '63' . $phone; // always 639XXXXXXXXX


            /* Message */
            $message = "Good day! Pastry Project. Your order #$id is ready for pickup/delivery.";

            /* Payload */
            $payload = json_encode([
                "api_token"    => "3e0c021fc064ea07bb524064e62125caf19f511e",
                "phone_number" => $phone,
                "message"      => $message
            ]);

            /* CURL */
            $ch = curl_init("https://www.iprogsms.com/api/v1/sms_messages");

            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Content-Type: application/json"
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);

            $response  = curl_exec($ch);
            $curlError = curl_error($ch);
            $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);

            curl_close($ch);

            /* DEBUG LOG */
            file_put_contents(
                __DIR__ . "/sms_log.txt",
                date("Y-m-d H:i:s") . " | ORDER:$id | PHONE:$phone | HTTP:$httpCode | RESPONSE:$response | ERROR:$curlError\n",
                FILE_APPEND
            );

            /* RESULT CHECK */
            if ($curlError) {
                $smsError = $curlError;
            } elseif ($httpCode >= 200 && $httpCode < 300) {
                $smsSent = true;
            } else {
                $smsError = $response;
            }

        } else {
            $smsError = "No phone number found";
        }

    } else {
        $smsError = "Phone query failed";
    }
}

/* =========================
   RESPONSE
========================= */
$conn->close();

echo json_encode([
    "success"   => true,
    "message"   => "Order updated",
    "id"        => $id,
    "status"    => $status,
    "sms_sent"  => $smsSent,
    "sms_error" => $smsError
]);

exit();
?>