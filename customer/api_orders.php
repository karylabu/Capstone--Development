<?php

error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

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

    // Insert into orders table
    $sql = "INSERT INTO orders 
        (items, subtotal, delivery_fee, total, method, payment, address, phone, lat, lng) 
        VALUES 
        ('$items', '$subtotal', '$delivery', '$total', '$method', '$payment', '$address', '$phone', '$latitude', '$longitude')";

    if (mysqli_query($conn, $sql)) {
        echo json_encode([
            "status" => "success",
            "order_id" => mysqli_insert_id($conn)
        ]);
    } else {
        throw new Exception("SQL Error: " . mysqli_error($conn));
    }

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>