<?php

error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

try {
    // Connect to database
    $conn = mysqli_connect("localhost", "root", "", "pastry_db");
    if (!$conn) {
        throw new Exception("Database Connection Failed: " . mysqli_connect_error());
    }

    // Fetch all orders
    $sql = "SELECT * FROM orders ORDER BY created_at DESC";
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