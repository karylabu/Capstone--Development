<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

/* ================= DB ================= */

$host = 'localhost';
$db   = 'pastry_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

try {

    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "error" => "DB connection failed"
    ]);
    exit;
}

/* ================= GET PRODUCTS ================= */

$action = $_GET['action'] ?? 'list';

if ($action === 'list') {

    try {

        $sql = "SELECT * FROM products";
        $stmt = $pdo->query($sql);

        $products = [];

        while ($row = $stmt->fetch()) {

            $products[] = [
                "id" => $row["id"],
                "name" => $row["name"],
                "category" => $row["category"],
                "price" => $row["price"],
                "image" => $row["image"],

                // IMPORTANT FIX: prevent null crash
                "stock" => $row["stock"] ?? 0,

                // optional fallback
                "available" => $row["available"] ?? 1
            ];
        }

        echo json_encode($products);
        exit;

    } catch (Exception $e) {

        echo json_encode([
            "success" => false,
            "error" => "Query failed",
            "details" => $e->getMessage()
        ]);

        exit;
    }
}

/* ================= INVALID ================= */

echo json_encode([
    "success" => false,
    "error" => "Invalid action"
]);

?>