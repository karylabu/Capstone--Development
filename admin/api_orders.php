<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$conn = new mysqli("localhost", "root", "", "pastry_db");

// CHECK DB CONNECTION
if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "DB connection failed: " . $conn->connect_error
    ]);
    exit;
}

// FORCE SHOW ERRORS (IMPORTANT FOR DEBUG)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// FETCH ORDERS
$sql = "SELECT * FROM orders ORDER BY id DESC";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode([
        "success" => false,
        "message" => "Query failed: " . $conn->error
    ]);
    exit;
}

$orders = [];

while ($row = $result->fetch_assoc()) {

    // SAFE JSON DECODE
    $row['items'] = json_decode($row['items'] ?? "[]", true);

    if (!is_array($row['items'])) {
        $row['items'] = [];
    }

    $orders[] = $row;
}

// IF EMPTY
if (count($orders) === 0) {
    echo json_encode([
        "success" => true,
        "message" => "No orders found",
        "data" => []
    ]);
    exit;
}

// SUCCESS
echo json_encode($orders);
exit;
?>