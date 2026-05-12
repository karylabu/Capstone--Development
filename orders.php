<?php
session_start();
require 'includes/data.php';
$db = &getDB();

if (!isset($_SESSION['user'])) {
    header("Location: login.php");
    exit;
}

$user = $_SESSION['user'];
$role = $user['role'] ?? 'customer';
$userEmail = $user['email'] ?? '';

// UPDATE STATUS
if ($_POST && isset($_POST['update_status']) && $role !== 'customer') {
    $oid = (int)$_POST['order_id'];
    $newStatus = $_POST['new_status'];
    db_update_order_status($oid, $newStatus);
    $_SESSION['success'] = "Order #$oid updated.";
    header('Location: orders.php'); 
    exit;
}

// FILTER
$orders = $db['orders'];

if ($role === 'customer') {
    $orders = array_filter($orders, fn($o) => $o['email'] === $userEmail);
}

$filter = $_GET['filter'] ?? 'all';
if ($filter !== 'all') {
    $orders = array_filter($orders, fn($o) => strtolower($o['status']) === strtolower($filter));
}

$orders = array_reverse($orders);
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Orders</title>

<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">

<style>
body{
  margin:0;
  font-family:'DM Sans',sans-serif;
  background:#f4f4f4;
}

/* NAV */
.top-nav{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:18px 30px;
  background:#fff;
  border-bottom:1px solid #eee;
}

.left-nav{
  display:flex;
  align-items:center;
  gap:30px;
}

.brand{
  display:flex;
  align-items:center;
  gap:10px;
}

.logo{
  width:40px;
  height:40px;
  border-radius:10px;
}

.brand-name{
  font-family:'Playfair Display',serif;
  font-size:22px;
  font-weight:700;
}

.brand-name span{
  color:#e7c46a;
}

.nav-links{
  display:flex;
  gap:20px;
}

.nav-links a{
  text-decoration:none;
  font-size:11px;
  font-weight:700;
  letter-spacing:1px;
  color:#888;
}

.nav-links a.active{
  color:#000;
  border-bottom:2px solid #e7c46a;
}

/* RIGHT SIDE */
.nav-right{
  display:flex;
  align-items:center;
  gap:12px;
}

/* SEARCH */
.search-box{
  padding:10px 16px;
  border-radius:20px;
  border:1px solid #ddd;
  outline:none;
  width:200px;
  font-size:13px;
}

/* ICON BUTTON */
.icon-btn{
  position:relative;
  background:#f3f3f3;
  padding:10px 12px;
  border-radius:12px;
  font-size:16px;
  display:flex;
  align-items:center;
  justify-content:center;
  cursor:pointer;
}

/* CART DARK */
.cart-dark{
  background:#111;
  color:#fff;
  text-decoration:none;
}

/* ACCOUNT */
.account-btn{
  display:flex;
  align-items:center;
  gap:6px;
  background:#fff;
  color:#111;
  padding:10px 12px;
  border-radius:10px;
  text-decoration:none;
  border:1px solid #ddd;
  font-size:13px;
  font-weight:500;
}

/* BADGE */
.icon-badge{
  position:absolute;
  top:-5px;
  right:-5px;
  background:red;
  color:#fff;
  font-size:10px;
  padding:3px 6px;
  border-radius:50%;
}

/* PAGE */
.container{
  padding:30px;
}

h2{
  font-family:'Playfair Display';
}

/* FILTER */
.order-tabs{
  display:flex;
  gap:10px;
  margin-bottom:20px;
  flex-wrap:wrap;
}

.order-tab{
  text-decoration:none;
  padding:8px 16px;
  border-radius:20px;
  font-size:13px;
  color:#666;
  background:#eee;
}

.order-tab.active{
  background:#111;
  color:#fff;
}

/* TABLE */
table{
  width:100%;
  border-collapse:collapse;
  background:#fff;
  border-radius:12px;
  overflow:hidden;
}

th,td{
  padding:12px;
  border-bottom:1px solid #eee;
  font-size:14px;
}

th{
  background:#fafafa;
  text-align:left;
}

tr:hover{
  background:#f9f9f9;
}

/* STATUS */
.status{
  padding:5px 10px;
  border-radius:20px;
  background:#eee;
  font-size:12px;
}

/* BUTTON */
.btn{
  padding:6px 10px;
  border:none;
  border-radius:6px;
  background:#111;
  color:#fff;
  cursor:pointer;
}
</style>
</head>

<body>

<!-- NAV -->
<div class="top-nav">
  <div class="left-nav">

    <div class="brand">
      <img src="logo.jpg" class="logo">
      <div class="brand-name">Pastry <span>Project</span></div>
    </div>

    <div class="nav-links">
      <a href="dashboard.php">DASHBOARD</a>
      <a href="products.php">PRODUCTS</a>
      <a href="orders.php" class="active">ORDERS</a>
    </div>

  </div>

  <div class="nav-right">

    <!-- SEARCH -->
    <input type="text" placeholder="Search..." class="search-box">

    <!-- NOTIF -->
    <a href="notifications.php" class="icon-btn">
  🔔
  <span class="icon-badge">0</span>
</a>

    <!-- CART -->
    <a href="cart.php" class="icon-btn cart-dark">
      🛒
      <span class="icon-badge">
        <?= $_SESSION['cart_count'] ?? 0 ?>
      </span>
    </a>

    <!-- ACCOUNT -->
<a href="account.php" class="account-btn">
  👤 <?= $_SESSION['user']['name'] ?? 'Account' ?>
</a>

  </div>
</div>

<div class="container">

<h2>Orders</h2>

<?php if (isset($_SESSION['success'])): ?>
<div style="background:#d4edda;padding:10px;margin-bottom:15px;border-radius:6px">
<?= $_SESSION['success']; unset($_SESSION['success']); ?>
</div>
<?php endif; ?>

<!-- FILTER -->
<div class="order-tabs">
<?php foreach(['all','pending','confirmed','preparing','completed'] as $f): ?>
<a href="?filter=<?= $f ?>" class="order-tab <?= $filter==$f?'active':'' ?>">
<?= ucfirst($f) ?>
</a>
<?php endforeach; ?>
</div>

<table>
<thead>
<tr>
<th>ID</th>
<th>Customer</th>
<th>Items</th>
<th>Total</th>
<th>Status</th>
<th>Date</th>
<?php if ($role !== 'customer'): ?><th>Update</th><?php endif; ?>
</tr>
</thead>

<tbody>

<?php foreach ($orders as $o): ?>
<tr>

<td>
<strong>#<?= $o['id'] ?></strong><br>
<small><?= $o['address'] ?></small>
</td>

<td>
<?= $o['customer'] ?><br>
<small><?= $o['email'] ?></small>
</td>

<td>
<?php foreach ($o['items'] as $item): ?>
<div><?= $item['qty'] ?>x <?= $item['product'] ?></div>
<?php endforeach; ?>
</td>

<td>₱<?= number_format($o['total']) ?></td>

<td><span class="status"><?= $o['status'] ?></span></td>

<td><?= $o['date'] ?></td>

<?php if ($role !== 'customer'): ?>
<td>
<form method="POST">
<input type="hidden" name="order_id" value="<?= $o['id'] ?>">

<select name="new_status">
<?php foreach(['Pending','Confirmed','Preparing','Completed'] as $s): ?>
<option <?= $o['status']==$s?'selected':'' ?>><?= $s ?></option>
<?php endforeach; ?>
</select>

<button name="update_status" class="btn">✓</button>
</form>
</td>
<?php endif; ?>

</tr>
<?php endforeach; ?>

</tbody>
</table>

</div>

</body>
</html>