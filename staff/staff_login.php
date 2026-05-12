<?php
session_start();

if (isset($_SESSION['user']) && $_SESSION['user']['role'] === 'staff') {
    header('Location: /GitHub/pastry_system/staff/dashboard.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    require_once __DIR__ . '/../includes/db.php';

    $email = trim($_POST['email'] ?? '');
    $pass  = $_POST['password'] ?? '';

    $user = db_one("SELECT * FROM users WHERE email = ?", [$email]);

    if ($user && password_verify($pass, $user['password'])) {

        // CHECK ROLE
        if ($user['role'] !== 'staff') {
            $error = "Access denied. Staff only.";
        } else {

            $_SESSION['user'] = [
                'id'    => $user['id'],
                'name'  => $user['name'],
                'email' => $user['email'],
                'role'  => $user['role'],
            ];

            header('Location: /GitHub/pastry_system/staff/dashboard.php');
            exit;
        }

    } else {
        $error = "Invalid email or password.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Staff Login — Pastry Project</title>

<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">

<style>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

body{
  background:#f4f4f4;
  font-family:'DM Sans',sans-serif;
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:100vh;
}

.container{
  width:100%;
  max-width:420px;
}

.card{
  background:#fff;
  padding:30px;
  border-radius:20px;
  box-shadow:0 10px 30px rgba(0,0,0,0.08);
}

h1{
  font-family:'Playfair Display',serif;
  text-align:center;
  margin-bottom:10px;
}

p.sub{
  text-align:center;
  font-size:13px;
  color:#777;
  margin-bottom:20px;
}

.field{
  margin-bottom:15px;
}

label{
  font-size:13px;
  font-weight:500;
}

input{
  width:100%;
  padding:12px;
  border-radius:10px;
  border:1px solid #ddd;
  margin-top:5px;
  outline:none;
}

.btn{
  width:100%;
  padding:12px;
  border:none;
  background:#111;
  color:#fff;
  border-radius:10px;
  cursor:pointer;
  margin-top:10px;
  font-size:14px;
}

.error{
  background:#ffe5e5;
  padding:10px;
  border-radius:8px;
  font-size:13px;
  margin-bottom:15px;
  color:#c00;
  text-align:center;
}
</style>
</head>

<body>

<div class="container">
  <div class="card">

    <h1>Staff Sign In</h1>
    <p class="sub">Login to access staff dashboard</p>

    <?php if ($error): ?>
      <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <form method="POST">

      <div class="field">
        <label>Email address</label>
        <input type="email" name="email" placeholder="Enter email" required>
      </div>

      <div class="field">
        <label>Password</label>
        <input type="password" name="password" placeholder="Enter password" required>
      </div>

      <button class="btn">Login as Staff</button>

    </form>

  </div>
</div>

</body>
</html>