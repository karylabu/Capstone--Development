<?php
// Simple place order API endpoint
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    // Read JSON input
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    
    if (!$data) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'No data received']);
        exit;
    }

    // Connect to database
    $conn = mysqli_connect('localhost', 'root', '', 'pastry_db');
    if (!$conn) {
        throw new Exception('Database connection failed: ' . mysqli_connect_error());
    }

    // Extract and sanitize data
    $items = json_encode($data['items'] ?? []);
    $subtotal = floatval($data['subtotal'] ?? 0);
    $delivery_fee = floatval($data['delivery_fee'] ?? 0);
    $total = floatval($data['total'] ?? 0);
    $method = $data['method'] ?? 'Delivery';
    $payment = $data['payment'] ?? 'Cash';
    $address = $data['address'] ?? '';
    $phone = $data['phone'] ?? '';
    $latitude = floatval($data['latitude'] ?? 0);
    $longitude = floatval($data['longitude'] ?? 0);

    // Prepare statement to prevent SQL injection
    $stmt = $conn->prepare(
        'INSERT INTO orders (items, subtotal, delivery_fee, total, method, payment, address, phone, lat, lng) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $conn->error);
    }

    $stmt->bind_param(
        'sdddsssss',
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

    if (!$stmt->execute()) {
        throw new Exception('Execute failed: ' . $stmt->error);
    }

    $order_id = $conn->insert_id;
    $stmt->close();
    $conn->close();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'order_id' => $order_id,
        'message' => 'Order placed successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
