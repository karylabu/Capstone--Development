<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

/* =========================
   CORS
========================= */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization");

/* =========================
   JSON
========================= */

header("Content-Type: application/json; charset=UTF-8");

/* =========================
   PRE-FLIGHT
========================= */

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {

    http_response_code(200);
    exit();

}

/* =========================
   DATABASE
========================= */

$host = "localhost";
$dbname = "pastry_db";
$user = "root";
$pass = "";

try {

    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $user,
        $pass
    );

    $pdo->setAttribute(
        PDO::ATTR_ERRMODE,
        PDO::ERRMODE_EXCEPTION
    );

} catch (PDOException $e) {

    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);

    exit();

}

/* =========================
   UPDATE PRODUCT
========================= */

try {

    $id = $_POST['id'] ?? '';

    if (!$id) {

        echo json_encode([
            "success" => false,
            "message" => "Missing ID"
        ]);

        exit();

    }

    $name = $_POST['name'] ?? '';
    $category = $_POST['category'] ?? '';

    $stock = $_POST['stock'] ?? 0;

    $available = $_POST['available'] ?? 1;

    $price = $_POST['price'] ?? 0;

    $slice_price = $_POST['slice_price'] ?? 0;
    $small_price = $_POST['small_price'] ?? 0;
    $big_price = $_POST['big_price'] ?? 0;

    $solo_price = $_POST['solo_price'] ?? 0;
    $sharing_price = $_POST['sharing_price'] ?? 0;

    $meal_price = $_POST['meal_price'] ?? 0;
    $combo_price = $_POST['combo_price'] ?? 0;

    /* =========================
       IMAGE
    ========================= */

    $imageSQL = "";
    $imageValue = null;

    if (
        isset($_FILES['image']) &&
        $_FILES['image']['error'] === 0
    ) {

        $uploadDir = "../uploads/";

        if (!file_exists($uploadDir)) {

            mkdir($uploadDir, 0777, true);

        }

        $filename =
            time() .
            "_" .
            basename($_FILES['image']['name']);

        $targetFile =
            $uploadDir . $filename;

        if (
            move_uploaded_file(
                $_FILES['image']['tmp_name'],
                $targetFile
            )
        ) {

            $imageSQL = ", image = ?";
            $imageValue = $filename;

        }

    }

    /* =========================
       SQL
    ========================= */

    $sql = "

        UPDATE products SET

        name = ?,
        category = ?,

        stock = ?,

        available = ?,

        price = ?,

        slice_price = ?,
        small_price = ?,
        big_price = ?,

        solo_price = ?,
        sharing_price = ?,

        meal_price = ?,
        combo_price = ?

        $imageSQL

        WHERE id = ?

    ";

    $params = [

        $name,
        $category,

        $stock,

        $available,

        $price,

        $slice_price,
        $small_price,
        $big_price,

        $solo_price,
        $sharing_price,

        $meal_price,
        $combo_price

    ];

    if ($imageValue) {

        $params[] = $imageValue;

    }

    $params[] = $id;

    $stmt = $pdo->prepare($sql);

    $stmt->execute($params);

    echo json_encode([

        "success" => true,
        "message" => "Product updated successfully"

    ]);

} catch (Exception $e) {

    echo json_encode([

        "success" => false,
        "message" => $e->getMessage()

    ]);

}

?>
Compose
Write to Erryca Bianca
