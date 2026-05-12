<?php
session_start();
require '../includes/data.php';

$db = &getDB();

if (!isset($_SESSION['user'])) {
    header("Location: ../login.php");
    exit;
}

/* ADMIN ONLY */
if (($_SESSION['user']['role'] ?? '') !== 'admin') {
    header("Location: ../dashboard.php");
    exit;
}

$user = $_SESSION['user'];

/* UPDATE STATUS */
if ($_POST && isset($_POST['update_status'])) {

    $oid = (int)$_POST['order_id'];
    $newStatus = $_POST['new_status'];

    db_update_order_status($oid, $newStatus);

    $_SESSION['success'] = "Order #$oid updated successfully.";

    header("Location: admin_orders.php");
    exit;
}

/* GET ORDERS */
$orders = $db['orders'];

/* FILTER */
$filter = $_GET['filter'] ?? 'all';

if ($filter !== 'all') {

    $orders = array_filter($orders, function($o) use ($filter){
        return strtolower($o['status']) === strtolower($filter);
    });
}

$orders = array_reverse($orders);
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Admin Orders</title>

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
    object-fit:cover;
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

/* RIGHT */
.nav-right{
    display:flex;
    align-items:center;
    gap:12px;
}

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
    text-decoration:none;
    color:#111;
}

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
    margin-bottom:20px;
}

/* ALERT */
.alert{
    background:#d4edda;
    color:#155724;
    padding:12px;
    border-radius:10px;
    margin-bottom:20px;
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
    padding:14px;
    border-bottom:1px solid #eee;
    font-size:14px;
}

th{
    background:#fafafa;
    text-align:left;
}

tr:hover{
    background:#fafafa;
}

/* STATUS */
.status{
    padding:6px 12px;
    border-radius:20px;
    font-size:12px;
    font-weight:600;
}

.pending{
    background:#fff3cd;
    color:#856404;
}

.confirmed{
    background:#d4edda;
    color:#155724;
}

.preparing{
    background:#d1ecf1;
    color:#0c5460;
}

.completed{
    background:#d6d8ff;
    color:#3d3db3;
}

/* FORM */
select{
    padding:8px;
    border-radius:8px;
    border:1px solid #ddd;
}

.btn{
    padding:8px 12px;
    border:none;
    background:#111;
    color:#fff;
    border-radius:8px;
    cursor:pointer;
}

.empty{
    background:#fff;
    padding:40px;
    border-radius:12px;
    text-align:center;
    color:#777;
}
</style>
</head>

<body>

<!-- NAV -->
<div class="top-nav">

    <div class="left-nav">

        <div class="brand">
            <img src="../logo.jpg" class="logo">

            <div class="brand-name">
                Pastry <span>Project</span>
            </div>
        </div>

        <div class="nav-links">
            <a href="admin_dashboard.php">DASHBOARD</a>
            <a href="admin_products.php">PRODUCTS</a>
            <a href="admin_orders.php" class="active">ORDERS</a>
        </div>

    </div>

    <div class="nav-right">

        <!-- NOTIFICATIONS -->
        <a href="../notifications.php" class="icon-btn">
            🔔
            <span class="icon-badge">0</span>
        </a>

        <!-- ACCOUNT -->
        <a href="../account.php" class="account-btn">
            👤 <?= $_SESSION['user']['name'] ?? 'Admin' ?>
        </a>

    </div>

</div>

<div class="container">

<h2>Admin Orders</h2>

<?php if(isset($_SESSION['success'])): ?>

<div class="alert">
    <?= $_SESSION['success']; unset($_SESSION['success']); ?>
</div>

<?php endif; ?>

<!-- FILTER -->
<div class="order-tabs">

<?php foreach(['all','pending','confirmed','preparing','completed'] as $f): ?>

<a href="?filter=<?= $f ?>"
class="order-tab <?= $filter==$f?'active':'' ?>">

<?= ucfirst($f) ?>

</a>

<?php endforeach; ?>

</div>

<?php if(empty($orders)): ?>

<div class="empty">
    No orders found.
</div>

<?php else: ?>

<table>

<thead>
<tr>
    <th>ID</th>
    <th>Customer</th>
    <th>Items</th>
    <th>Total</th>
    <th>Status</th>
    <th>Date</th>
    <th>Update</th>
</tr>
</thead>

<tbody>

<?php foreach($orders as $o): ?>

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

<?php foreach($o['items'] as $item): ?>

<div>
    <?= $item['qty'] ?>x <?= $item['product'] ?>
</div>

<?php endforeach; ?>

</td>

<td>
    ₱<?= number_format($o['total']) ?>
</td>

<td>

<?php
$statusClass = strtolower($o['status']);
?>

<span class="status <?= $statusClass ?>">
    <?= $o['status'] ?>
</span>

</td>

<td>
    <?= $o['date'] ?>
</td>

<td>

<form method="POST">

<input type="hidden"
name="order_id"
value="<?= $o['id'] ?>">

<select name="new_status">

<?php foreach(['Pending','Confirmed','Preparing','Completed'] as $s): ?>

<option
<?= $o['status']==$s?'selected':'' ?>>

<?= $s ?>

</option>

<?php endforeach; ?>

</select>

<button
type="submit"
name="update_status"
class="btn">

Update

</button>

</form>

</td>

</tr>

<?php endforeach; ?>

</tbody>

</table>

<?php endif; ?>

</div>

</body>
</html>