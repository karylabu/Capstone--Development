<?php
session_start();

require_once 'includes/db.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $email = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if (!$email || !$password) {

        $error = "Please fill all fields.";

    } else {

        $email = mysqli_real_escape_string($conn, $email);

        $query = mysqli_query(
            $conn,
            "SELECT * FROM users 
             WHERE email='$email' 
             AND role='admin'
             LIMIT 1"
        );

        if ($query && mysqli_num_rows($query) > 0) {

            $user = mysqli_fetch_assoc($query);

            if (
                $password === $user['password'] ||
                password_verify($password, $user['password'])
            ) {

                $_SESSION['user'] = [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ];

                // Redirect Admin
                header("Location: http://localhost:3000/pastry_system/admin");
                exit;

            } else {

                $error = "Incorrect password.";
            }

        } else {

            $error = "Admin account not found.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Login</title>

<style>
body{
    font-family:Arial;
    background:#f5f5f5;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
}

.card{
    background:#fff;
    padding:40px;
    width:350px;
    border-radius:10px;
    box-shadow:0 0 20px rgba(0,0,0,0.1);
}

input{
    width:100%;
    height:45px;
    margin-bottom:15px;
    padding:10px;
}

button{
    width:100%;
    height:45px;
    background:black;
    color:white;
    border:none;
    cursor:pointer;
}

.error{
    color:red;
    margin-bottom:10px;
}
</style>
</head>
<body>

<div class="card">

    <h2>Admin Login</h2>

    <?php if($error): ?>
        <div class="error"><?php echo $error; ?></div>
    <?php endif; ?>

    <form method="POST">

        <input
            type="email"
            name="email"
            placeholder="Admin Email"
            required
        >

        <input
            type="password"
            name="password"
            placeholder="Password"
            required
        >

        <button type="submit">
            Login
        </button>

    </form>

</div>

</body>
</html>