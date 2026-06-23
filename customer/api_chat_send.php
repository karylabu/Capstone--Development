<?php
ini_set('display_errors', 0);
error_reporting(0);
while (ob_get_level()) ob_end_clean();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["success" => true]);
    exit();
}

$conn = new mysqli("localhost", "root", "", "pastry_db");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB error"]);
    exit();
}

$data    = json_decode(file_get_contents("php://input"), true);
$orderId = intval($data['order_id'] ?? 0);
$message = trim($data['message'] ?? "");
$sender  = $data['sender'] ?? "customer"; // customer | staff

if (!$orderId || !$message) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit();
}

if (!in_array($sender, ['customer', 'staff'])) {
    $sender = 'customer';
}

/* =========================
   SAVE CUSTOMER MESSAGE
========================= */
$stmt = $conn->prepare("INSERT INTO messages (order_id, sender, message) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $orderId, $sender, $message);
$stmt->execute();
$stmt->close();

/* =========================
   AI AUTO-REPLY (only if customer sent)
========================= */
$aiReply = null;

if ($sender === 'customer') {

    // Fetch order context for AI
    $oStmt = $conn->prepare("SELECT id, items, status, total, method, address, created_at FROM orders WHERE id=?");
    $oStmt->bind_param("i", $orderId);
    $oStmt->execute();
    $order = $oStmt->get_result()->fetch_assoc();
    $oStmt->close();

    if ($order) {
        $orderContext = "Order #" . $order['id']
            . " | Status: " . $order['status']
            . " | Total: ₱" . $order['total']
            . " | Method: " . $order['method']
            . " | Address: " . $order['address']
            . " | Placed: " . $order['created_at'];

        $systemPrompt = "You are a friendly customer support assistant for Pastry Project, a Filipino pastry and food business. "
            . "You help customers with their order inquiries. Be warm, concise, and helpful. "
            . "The customer's order details: $orderContext. "
            . "If asked about delivery time, say it usually takes 30-60 minutes. "
            . "If asked about payment, refer to the method on file. "
            . "Keep replies short (2-3 sentences max). Reply in the same language the customer uses.";

        $aiPayload = json_encode([
            "model"      => "claude-sonnet-4-20250514",
            "max_tokens" => 300,
            "system"     => $systemPrompt,
            "messages"   => [
                ["role" => "user", "content" => $message]
            ]
        ]);

        $ch = curl_init("https://api.anthropic.com/v1/messages");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "x-api-key: YOUR_ANTHROPIC_API_KEY_HERE",
            "anthropic-version: 2023-06-01"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $aiPayload);
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);

        $aiResponse = curl_exec($ch);
        $curlErr    = curl_error($ch);
        $httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if (!$curlErr && $httpCode === 200) {
            $parsed  = json_decode($aiResponse, true);
            $aiReply = $parsed['content'][0]['text'] ?? null;

            if ($aiReply) {
                $aiSender = 'ai';
                $ins = $conn->prepare("INSERT INTO messages (order_id, sender, message) VALUES (?, ?, ?)");
                $ins->bind_param("iss", $orderId, $aiSender, $aiReply);
                $ins->execute();
                $ins->close();
            }
        }
    }
}

$conn->close();

echo json_encode([
    "success"  => true,
    "ai_reply" => $aiReply
]);
exit();
