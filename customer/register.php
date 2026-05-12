<?php
session_start();
if (isset($_SESSION['user'])) {
    header('Location: dashboard.php');
    exit;
}
$error = '';
$success = '';
if ($_POST) {
    require_once 'includes/db.php';

    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $pass = $_POST['password'] ?? '';
    $pass_confirm = $_POST['password_confirm'] ?? '';

    if (empty($name) || empty($email) || empty($pass)) {
        $error = 'All fields required.';
    } elseif ($pass !== $pass_confirm) {
        $error = 'Passwords do not match.';
    } elseif (strlen($pass) < 6) {
        $error = 'Password must be 6+ characters.';
    } elseif (db_one('SELECT id FROM users WHERE email = ?', [$email])) {
        $error = 'Email already registered.';
    } else {
        $hashed = password_hash($pass, PASSWORD_DEFAULT);
        db_run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
               [$name, $email, $hashed, 'customer']);
        $success = 'Account created! You can now log in.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pastry Project — Register</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --cream:#F5F5F5;--blush:#E8E8E8;--rose:#111111;--rose-dark:#000000;
  --caramel:#333333;--warm:#444444;--text:#111111;--muted:#666666;
  --white:#FFFFFF;--card:#FFFFFF;--bg:#F4F4F4;--border:#DADADA;
}
body{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;position:relative;overflow:hidden}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 20% 50%,rgba(255,255,255,0.85) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(0,0,0,0.06) 0%,transparent 50%),radial-gradient(ellipse at 60% 80%,rgba(0,0,0,0.03) 0%,transparent 50%);pointer-events:none}
.deco{position:fixed;font-size:120px;opacity:0.04;font-family:'Playfair Display',serif;pointer-events:none;color:var(--muted)}
.deco-1{top:-20px;left:-30px;transform:rotate(-15deg)}
.deco-2{bottom:-20px;right:-30px;transform:rotate(20deg)}
.container{width:100%;max-width:440px;padding:20px;position:relative;z-index:1}
.brand{text-align:center;margin-bottom:40px}
.brand-icon{width:72px;height:72px;background:#111111;border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;box-shadow:0 8px 20px rgba(0,0,0,0.08)}
.brand h1{font-family:'Playfair Display',serif;font-size:28px;color:var(--text);font-weight:700}
.brand p{color:var(--muted);font-size:14px;margin-top:4px;font-weight:300}
.card{background:var(--white);border-radius:24px;padding:36px;box-shadow:0 10px 24px rgba(0,0,0,0.08);border:1px solid var(--border)}
.field{margin-bottom:18px}
label{display:block;font-size:13px;font-weight:500;color:var(--text);margin-bottom:6px}
input{width:100%;padding:12px 16px;border:1.5px solid #D8D8D8;border-radius:12px;font-size:14px;font-family:'DM Sans',sans-serif;background:var(--white);color:var(--text);transition:all .2s;outline:none}
input:focus{border-color:var(--text);background:var(--white);box-shadow:0 0 0 3px rgba(0,0,0,0.08)}
.btn{width:100%;padding:14px;background:#111111;color:white;border:none;border-radius:12px;font-size:15px;font-weight:500;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;box-shadow:none}
.btn:hover{background:#222222}
.error{background:#F5F5F5;border:1px solid #D8D8D8;color:#333333;padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:16px}
.success{background:#F5F5F5;border:1px solid #D8D8D8;color:#333333;padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.link-btn, .secondary-btn{display:inline-flex;align-items:center;justify-content:center;width:100%;padding:12px 16px;background:#111111;color:#fff;border-radius:12px;text-decoration:none;font-size:14px;transition:background .2s;margin-bottom:16px}
.link-btn:hover, .secondary-btn:hover{background:#222222}
a{color:var(--text);text-decoration:none;font-weight:600}
</style>
</head>
<body>
<div class="deco deco-1">🥐</div>
<div class="deco deco-2">🎂</div>
<div class="container">
  <div class="brand">
    <div class="brand-icon">🥐</div>
    <h1>Create Account</h1>
    <p>Register to manage orders and inventory.</p>
  </div>
  <div class="card">
    <?php if ($error): ?><div class="error"><?= htmlspecialchars($error) ?></div><?php endif; ?>
    <?php if ($success): ?><div class="success"><?= htmlspecialchars($success) ?> <a class="link-btn" href="index.php">Go to Login</a></div><?php endif; ?>
    <div style="display:flex;justify-content:flex-end;margin-bottom:18px;">
      <a class="secondary-btn" href="index.php">Already have an account?</a>
    </div>
    <form method="POST">
      <div class="field">
        <label>Full Name</label>
        <input type="text" name="name" placeholder="Your full name" value="<?= htmlspecialchars($name ?? '') ?>" required>
      </div>
      <div class="field">
        <label>Email Address</label>
        <input type="email" name="email" placeholder="your@email.com" value="<?= htmlspecialchars($email ?? '') ?>" required>
      </div>
      <div class="field">
        <label>Password</label>
        <input type="password" name="password" placeholder="6+ characters" required>
      </div>
      <div class="field">
        <label>Confirm Password</label>
        <input type="password" name="password_confirm" placeholder="Repeat password" required>
      </div>
      <button type="submit" class="btn">Create Account →</button>
    </form>
  </div>
</div>
</body>
</html>
