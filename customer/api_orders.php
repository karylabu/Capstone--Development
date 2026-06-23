<?php

require_once __DIR__ . '/cors.php';

// Debug: log incoming request headers, cookies, and session info to help diagnose 419 errors
$debugLog = __DIR__ . '/debug_api_orders.log';
$logEntry = date('c') . " | REQUEST_METHOD=" . ($_SERVER['REQUEST_METHOD'] ?? '') . " | ORIGIN=" . ($origin ?? '') . "\n";
$allHeaders = [];
foreach (getallheaders() as $k => $v) {
    $allHeaders[$k] = $v;
}
$logEntry .= "Headers: " . json_encode($allHeaders) . "\n";
$logEntry .= "Cookies: " . json_encode($_COOKIE) . "\n";
$logEntry .= "SessionID: " . session_id() . "\n";
file_put_contents($debugLog, $logEntry, FILE_APPEND);

try {
    // Connect to database
    $conn = mysqli_connect("localhost", "root", "", "pastry_db");
    if (!$conn) {
        throw new Exception("Database Connection Failed: " . mysqli_connect_error());
    }

    // Read input
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    if (!$data) {
        throw new Exception("No data received");
    }

    // Sanitize and extract
    $items     = mysqli_real_escape_string($conn, json_encode($data['items'] ?? []));
    $subtotal  = floatval($data['subtotal'] ?? 0);
    $delivery  = floatval($data['delivery_fee'] ?? 0);
    $total     = floatval($data['total'] ?? 0);
    $method    = mysqli_real_escape_string($conn, $data['method'] ?? '');
    $payment   = mysqli_real_escape_string($conn, $data['payment'] ?? '');
    $address   = mysqli_real_escape_string($conn, $data['address'] ?? '');
    $phone     = mysqli_real_escape_string($conn, $data['phone'] ?? '');
    $latitude  = floatval($data['latitude'] ?? 0);
    $longitude = floatval($data['longitude'] ?? 0);
    $customer  = mysqli_real_escape_string($conn, $data['customer'] ?? '');
    $email     = mysqli_real_escape_string($conn, $data['email'] ?? '');
    $user_id   = intval($data['user_id'] ?? 0); // Capture user_id from frontend

    $hasCustomer = false;
    $hasEmail = false;
    $columnsRes = mysqli_query($conn, "SHOW COLUMNS FROM orders");
    if ($columnsRes) {
        while ($col = mysqli_fetch_assoc($columnsRes)) {
            if ($col['Field'] === 'customer') {
                $hasCustomer = true;
            }
            if ($col['Field'] === 'email') {
                $hasEmail = true;
            }
        }
    }

    // Add missing customer/email fields if the table is still using the older schema.
    $alterStatements = [];
    if (!$hasCustomer) {
        $alterStatements[] = "ADD COLUMN customer VARCHAR(150) NOT NULL DEFAULT ''";
    }
    if (!$hasEmail) {
        $alterStatements[] = "ADD COLUMN email VARCHAR(150) NOT NULL DEFAULT ''";
    }
    if (count($alterStatements) > 0) {
        mysqli_query($conn, "ALTER TABLE orders " . implode(', ', $alterStatements));
        $hasCustomer = true;
        $hasEmail = true;
    }

    // Build insert fields dynamically so this API still works if the orders table lacks customer/email/user_id columns.
    $fields = ['items', 'subtotal', 'delivery_fee', 'total', 'method', 'payment', 'address', 'phone', 'lat', 'lng'];
    $values = ["'$items'", "'$subtotal'", "'$delivery'", "'$total'", "'$method'", "'$payment'", "'$address'", "'$phone'", "'$latitude'", "'$longitude'"];

    if ($hasCustomer && $customer !== '') {
        $fields[] = 'customer';
        $values[] = "'$customer'";
    }

    if ($hasEmail && $email !== '') {
        $fields[] = 'email';
        $values[] = "'$email'";
    }

    // Check if user_id column exists and add if provided
    $hasUserId = false;
    $userIdCheckRes = mysqli_query($conn, "SHOW COLUMNS FROM orders LIKE 'user_id'");
    if ($userIdCheckRes && mysqli_num_rows($userIdCheckRes) > 0) {
        $hasUserId = true;
    }
    
    if ($hasUserId && $user_id > 0) {
        $fields[] = 'user_id';
        $values[] = $user_id;
    }

    $sql = sprintf(
        "INSERT INTO orders (%s) VALUES (%s)",
        implode(', ', $fields),
        implode(', ', $values)
    );

    if (mysqli_query($conn, $sql)) {
        echo json_encode([
            "status" => "success",
            "order_id" => mysqli_insert_id($conn)
        ]);
    } else {
        throw new Exception("SQL Error: " . mysqli_error($conn));
    }

} catch (Exception $e) {
    // Log error to file for debugging
    @file_put_contents(__DIR__ . '/api_orders_errors.log', 
        date('c') . " - " . $e->getMessage() . "\n", 
        FILE_APPEND
    );
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>