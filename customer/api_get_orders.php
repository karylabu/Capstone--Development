<?php

error_reporting(0);
ini_set('display_errors', 0);

// CORS: echo origin when allowed and allow credentials only for allowed origins
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://localhost',
    'http://127.0.0.1',
];
if ($origin && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}
header('Vary: Origin');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    // Connect to database
    $conn = mysqli_connect("localhost", "root", "", "pastry_db");
    if (!$conn) {
        throw new Exception("Database Connection Failed: " . mysqli_connect_error());
    }

    // Get user_id from query parameter or POST data (prefer POST for security)
    $user_id = null;
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        $user_id = intval($data['user_id'] ?? $_GET['user_id'] ?? 0);
    } elseif (!empty($_GET['user_id'])) {
        $user_id = intval($_GET['user_id']);
    }

    // Build SQL: filter by user_id if provided (for customers), otherwise return all (for admin panel)
    if ($user_id > 0) {
        $sql = "SELECT * FROM orders WHERE user_id = $user_id ORDER BY created_at DESC";
    } else {
        $sql = "SELECT * FROM orders ORDER BY created_at DESC";
    }
    
    $res = mysqli_query($conn, $sql);

    if (!$res) {
        throw new Exception("SQL Error: " . mysqli_error($conn));
    }

    $orders = [];
    while ($row = mysqli_fetch_assoc($res)) {
        // Decode items JSON
        $items = [];
        if (!empty($row['items'])) {
            $itemsDecoded = json_decode($row['items'], true);
            if (is_array($itemsDecoded)) {
                $items = $itemsDecoded;
            }
        }

        $orders[] = [
            "id" => $row['id'],
            "user_id" => intval($row['user_id'] ?? 0),
            "customer" => $row['customer'] ?? '',
            "email" => $row['email'] ?? '',
            "items" => $items,
            "subtotal" => floatval($row['subtotal']),
            "delivery_fee" => floatval($row['delivery_fee']),
            "total" => floatval($row['total']),
            "method" => $row['method'],
            "payment" => $row['payment'],
            "address" => $row['address'],
            "phone" => $row['phone'],
            "lat" => floatval($row['lat']),
            "lng" => floatval($row['lng']),
            "status" => $row['status'] ?? 'Pending', // default to Pending if status not set
            "created_at" => $row['created_at'],
        ];
    }

    echo json_encode($orders);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}

?>