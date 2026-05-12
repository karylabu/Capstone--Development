<?php
// Prevent any HTML error reporting from breaking the JSON output
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/* =========================
   DATABASE CONNECTION
========================= */
$conn = new mysqli("localhost", "root", "", "pastry_db");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Ensure table exists
$sql = "CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    items LONGTEXT,
    subtotal DECIMAL(10,2),
    delivery_fee DECIMAL(10,2),
    total DECIMAL(10,2),
    method VARCHAR(50),
    payment VARCHAR(50),
    address TEXT,
    phone VARCHAR(50),
    latitude VARCHAR(100),
    longitude VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";
$conn->query($sql);

/* =========================
   PROCESS INPUT
========================= */
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "Invalid or empty JSON received"]);
    exit;
}

// Mapping data from React
$items = json_encode($data['items'] ?? []);
$subtotal = floatval($data['subtotal'] ?? 0);
$delivery_fee = floatval($data['delivery_fee'] ?? 0);
$total = floatval($data['total'] ?? 0);
$method = $data['method'] ?? 'Delivery';
$payment = $data['payment'] ?? 'Cash';
$address = $data['address'] ?? '';
$phone = $data['phone'] ?? '';
$latitude = $data['latitude'] ?? '';
$longitude = $data['longitude'] ?? '';

/* =========================
   SECURE INSERT (PREPARED STATEMENT)
========================= */
$stmt = $conn->prepare("INSERT INTO orders (items, subtotal, delivery_fee, total, method, payment, address, phone, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

// "sdddssssss" means: string, double, double, double, string, string, string, string, string, string
$stmt->bind_param("sdddssssss", 
    $items, 
    $subtotal, 
    $delivery_fee, 
    $total, 
    $method, 
    $payment, 
    $address, 
    $phone, 
    $latitude, 
    $longitude
);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "order_id" => $stmt->insert_id
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Execute failed: " . $stmt->error
    ]);
}

$stmt->close();
$conn->close();
?>