<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

/* ================= DATABASE CONNECTION ================= */

$conn = new mysqli("localhost", "root", "", "pastry_db");

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]);
    exit;
}

/* ================= GET ORDERS ================= */

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    $sql = "SELECT * FROM orders ORDER BY id DESC";
    $result = $conn->query($sql);

    if (!$result) {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
        exit;
    }

    $orders = [];

    while ($row = $result->fetch_assoc()) {

        // SAFE JSON PARSE FOR ITEMS
        if (!empty($row['items'])) {
            $decoded = json_decode($row['items'], true);
            $row['items'] = is_array($decoded) ? $decoded : [];
        } else {
            $row['items'] = [];
        }

        $orders[] = $row;
    }

    echo json_encode($orders);
    exit;
}

/* ================= UPDATE STATUS ================= */

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents("php://input"), true);

    $id = intval($data['id'] ?? 0);
    $status = $conn->real_escape_string($data['status'] ?? '');

    if (!$id || !$status) {
        echo json_encode([
            "status" => "error",
            "message" => "Missing data"
        ]);
        exit;
    }

    $sql = "UPDATE orders SET status='$status' WHERE id=$id";

    if ($conn->query($sql)) {
        echo json_encode([
            "status" => "success"
        ]);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => $conn->error
        ]);
    }

    exit;
}

?>