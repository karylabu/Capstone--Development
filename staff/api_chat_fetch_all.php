<?php
ini_set('display_errors', 0);
error_reporting(0);
while (ob_get_level()) ob_end_clean();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["success" => true]);
    exit();
}

$conn = new mysqli("localhost", "root", "", "pastry_db");
if ($conn->connect_error) {
    echo json_encode(["success" => false, "conversations" => []]);
    exit();
}

/* =====================================================
   Fetch all orders that have messages, with:
   - latest message preview
   - unread count (customer messages not yet read)
   - order status
   Sorted by latest message DESC
===================================================== */
$sql = "
    SELECT
        o.id         AS order_id,
        o.status     AS order_status,
        o.phone      AS phone,
        o.created_at AS order_created_at,
        m.message    AS last_message,
        m.sender     AS last_sender,
        m.created_at AS last_message_at,
        (
            SELECT COUNT(*) FROM messages
            WHERE order_id = o.id AND sender = 'customer' AND is_read = 0
        ) AS unread_count
    FROM orders o
    INNER JOIN messages m ON m.id = (
        SELECT id FROM messages
        WHERE order_id = o.id
        ORDER BY created_at DESC
        LIMIT 1
    )
    ORDER BY m.created_at DESC
";

$result = $conn->query($sql);
$conversations = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $conversations[] = $row;
    }
}

$conn->close();

echo json_encode([
    "success"       => true,
    "conversations" => $conversations
]);
exit();
