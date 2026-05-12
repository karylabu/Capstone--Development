<?php

session_start();

require_once 'includes/db.php';

$error = "";
$success = "";

/* =========================
   CREATE USERS TABLE
========================= */

mysqli_query($conn, "
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
");

/* =========================
   REGISTER
========================= */

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    if (!$name || !$email || !$password) {

        $error = "Please fill all fields.";

    } else {

        $name = mysqli_real_escape_string($conn, $name);
        $email = mysqli_real_escape_string($conn, $email);

        /* =========================
           CHECK EMAIL
        ========================= */

        $check = mysqli_query(
            $conn,
            "SELECT id FROM users WHERE email='$email' LIMIT 1"
        );

        if (mysqli_num_rows($check) > 0) {

            $error = "Email already exists.";

        } else {

            // pwede plain or hashed
            // $hashed = password_hash($password, PASSWORD_DEFAULT);

            $password = mysqli_real_escape_string(
                $conn,
                $password
            );

            $insert = mysqli_query(
                $conn,
                "
                INSERT INTO users
                (
                    name,
                    email,
                    password,
                    role
                )
                VALUES
                (
                    '$name',
                    '$email',
                    '$password',
                    'customer'
                )
                "
            );

            if ($insert) {

                $success = "Account created successfully.";

            } else {

                $error = mysqli_error($conn);
            }
        }
    }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Register</title>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:'DM Sans',sans-serif;
}

body{
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    background:
    linear-gradient(
        135deg,
        #fff8f0,
        #ffe6ef
    );
    overflow:hidden;
    position:relative;
}

.blur{
    position:absolute;
    border-radius:50%;
    filter:blur(90px);
    opacity:.35;
}

.blur1{
    width:350px;
    height:350px;
    background:#ff8eb7;
    top:-100px;
    left:-100px;
}

.blur2{
    width:300px;
    height:300px;
    background:#ffd166;
    bottom:-100px;
    right:-100px;
}

.card{
    position:relative;
    z-index:5;
    width:100%;
    max-width:450px;
    background:rgba(255,255,255,.82);
    backdrop-filter:blur(18px);
    padding:42px;
    border-radius:34px;
    border:1px solid rgba(255,255,255,.4);
    box-shadow:
    0 12px 40px rgba(0,0,0,.08);
}

.logo{
    font-size:13px;
    text-transform:uppercase;
    letter-spacing:.35em;
    color:#d4af37;
    margin-bottom:16px;
}

h1{
    font-size:42px;
    line-height:1;
    margin-bottom:12px;
    color:#111;
}

.sub{
    font-size:14px;
    color:#777;
    margin-bottom:30px;
}

.message{
    padding:14px;
    border-radius:16px;
    margin-bottom:18px;
    font-size:13px;
}

.error{
    background:#fff1f1;
    color:#ff3b30;
}

.success{
    background:#effff1;
    color:#00a32a;
}

.input-group{
    margin-bottom:18px;
}

input{
    width:100%;
    height:58px;
    border:none;
    outline:none;
    border-radius:18px;
    padding:0 18px;
    background:#f5f5f5;
    font-size:15px;
    transition:.2s;
}

input:focus{
    background:#fff;
    border:1px solid #d4af37;
    box-shadow:
    0 0 0 4px rgba(212,175,55,.15);
}

button{
    width:100%;
    height:58px;
    border:none;
    border-radius:20px;
    background:#111;
    color:#fff;
    font-size:13px;
    letter-spacing:.2em;
    text-transform:uppercase;
    cursor:pointer;
    transition:.25s;
    margin-top:8px;
}

button:hover{
    background:#d4af37;
    color:#111;
    transform:translateY(-2px);
}

.bottom{
    text-align:center;
    margin-top:24px;
    font-size:14px;
    color:#666;
}

.bottom a{
    color:#d4af37;
    text-decoration:none;
    font-weight:700;
}

.bottom a:hover{
    text-decoration:underline;
}

</style>

</head>

<body>

<div class="blur blur1"></div>
<div class="blur blur2"></div>

<div class="card">

    <div class="logo">
        Pastry Project
    </div>

    <h1>Create Account</h1>

    <p class="sub">
        Register to start ordering
    </p>

    <?php if($error): ?>
        <div class="message error">
            <?= $error ?>
        </div>
    <?php endif; ?>

    <?php if($success): ?>
        <div class="message success">
            <?= $success ?>
        </div>
    <?php endif; ?>

    <form method="POST">

        <div class="input-group">
            <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
            >
        </div>

        <div class="input-group">
            <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
            >
        </div>

        <div class="input-group">
            <input
                type="password"
                name="password"
                placeholder="Password"
                required
            >
        </div>

        <button type="submit">
            Create Account
        </button>

    </form>

    <div class="bottom">
        Already have an account?
        <a href="login.php">
            Login
        </a>
    </div>

</div>

</body>
</html>

