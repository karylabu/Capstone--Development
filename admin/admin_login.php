<?php
session_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once 'includes/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if (!$email || !$password) {

    echo json_encode([
        "success" => false,
        "message" => "Please fill all fields."
    ]);

    exit;
}

$email = mysqli_real_escape_string($conn, $email);

$query = mysqli_query(
    $conn,
    "SELECT * FROM users WHERE email='$email' LIMIT 1"
);

if ($query && mysqli_num_rows($query) > 0) {

    $user = mysqli_fetch_assoc($query);

    if (
        $password === $user['password'] ||
        password_verify($password, $user['password'])
    ) {

        if ($user['role'] !== 'admin') {

            echo json_encode([
                "success" => false,
                "message" => "Access denied."
            ]);

            exit;
        }

        $_SESSION['user'] = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ];

        echo json_encode([
            "success" => true,
            "user" => $_SESSION['user']
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Incorrect password."
        ]);
    }

} else {

    echo json_encode([
        "success" => false,
        "message" => "User not found."
    ]);
}
?>