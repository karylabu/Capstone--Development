<?php
// pastry_system/customer/api_login.php

error_reporting(0);
ini_set('display_errors', 0);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $conn = mysqli_connect("localhost", "root", "", "pastry_db");
    if (!$conn) throw new Exception("Database connection failed.");

    $data     = json_decode(file_get_contents("php://input"), true);
    $email    = trim($data['email']    ?? '');
    $password = trim($data['password'] ?? '');

    if (!$email || !$password) {
        echo json_encode(["success" => false, "message" => "Please fill all fields."]);
        exit;
    }

    $escaped = mysqli_real_escape_string($conn, $email);
    $result  = mysqli_query($conn, "SELECT * FROM users WHERE email='$escaped' LIMIT 1");

    if (!$result || mysqli_num_rows($result) === 0) {
        echo json_encode(["success" => false, "message" => "User not found."]);
        exit;
    }

    $user = mysqli_fetch_assoc($result);

    // Support both plain-text (old) and hashed passwords
    $passwordValid = ($password === $user['password'])
                  || password_verify($password, $user['password']);

    if (!$passwordValid) {
        echo json_encode(["success" => false, "message" => "Incorrect password."]);
        exit;
    }

    // Return user info — store this in localStorage on the React side
    echo json_encode([
        "success" => true,
        "user" => [
            "id"    => $user['id'],
            "name"  => $user['name'],
            "email" => $user['email'],
            "role"  => $user['role'],
        ]
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>