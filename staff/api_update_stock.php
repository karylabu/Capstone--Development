<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$conn = new mysqli("localhost", "root", "", "pastry_db");

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed"
    ]);
    exit;
}

/* ================= INPUT ================= */

$data = json_decode(file_get_contents("php://input"), true);

$id   = intval($data['id'] ?? 0);
$qty  = intval($data['qty'] ?? 0);
$type = $data['type'] ?? '';

if ($id <= 0 || $qty <= 0 || !in_array($type, ['in', 'out'])) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid input data"
    ]);
    exit;
}

/* ================= GET CURRENT STOCK ================= */

$stmt = $conn->prepare("SELECT stock FROM products WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Product not found"
    ]);
    exit;
}

$row = $result->fetch_assoc();
$current = intval($row['stock'] ?? 0);

/* ================= CALCULATE ================= */

if ($type === "in") {
    $newStock = $current + $qty;
} else {
    $newStock = $current - $qty;

    if ($newStock < 0) {
        $newStock = 0; // prevent negative stock
    }
}

/* ================= UPDATE ================= */

$update = $conn->prepare("UPDATE products SET stock = ? WHERE id = ?");
$update->bind_param("ii", $newStock, $id);

if ($update->execute()) {

    echo json_encode([
        "status" => "success",
        "message" => "Stock updated successfully",
        "new_stock" => $newStock
    ]);

} else {

    echo json_encode([
        "status" => "error",
        "message" => "Update failed"
    ]);

}

?>