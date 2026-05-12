<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id']) || !isset($data['status'])) {
    echo json_encode([
        "success" => false,
        "message" => "Missing id or status"
    ]);
    exit;
}

$id = $data['id'];
$status = $data['status'];

$conn = new mysqli("localhost", "root", "", "pastry_db");

if ($conn->connect_error) {
    echo json_encode([
        "success" => false,
        "message" => "DB connection failed"
    ]);
    exit;
}

$stmt = $conn->prepare("UPDATE orders SET status=? WHERE id=?");
$stmt->bind_param("si", $status, $id);

if ($stmt->execute()) {

    echo json_encode([
        "success" => true,
        "message" => "Order status updated",
        "id" => $id,
        "status" => $status
    ]);

} else {

    echo json_encode([
        "success" => false,
        "message" => $stmt->error
    ]);

}

$stmt->close();
$conn->close();

?>