<?php
session_start();
require_once __DIR__ . '/../includes/db.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header("Location: ../login.php");
    exit;
}

/* STATS */
$productData = db_all("SELECT COUNT(*) as total FROM products");
$orderData   = db_all("SELECT COUNT(*) as total FROM orders");
$userData    = db_all("SELECT COUNT(*) as total FROM users");
$salesData   = db_all("SELECT SUM(total) as total FROM orders");

$totalProducts = $productData[0]['total'] ?? 0;
$totalOrders   = $orderData[0]['total'] ?? 0;
$totalUsers    = $userData[0]['total'] ?? 0;
$totalSales    = $salesData[0]['total'] ?? 0;

$products = db_all("SELECT * FROM products ORDER BY id DESC LIMIT 8");
$recentOrders = db_all("SELECT * FROM orders ORDER BY id DESC LIMIT 5");
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Admin Dashboard</title>

<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap" rel="stylesheet">

<style>

*{
    box-sizing:border-box;
}

body{
    margin:0;
    font-family:'Playfair Display', serif;
    background:#f5f5f5;
    color:#111;
}

/* NAVBAR */
.top-nav{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:18px 35px;
    background:#fff;
    border-bottom:1px solid #ececec;
    position:sticky;
    top:0;
    z-index:999;
}

.left-nav{
    display:flex;
    align-items:center;
    gap:35px;
}

.brand{
    display:flex;
    align-items:center;
    gap:10px;
}

.logo{
    width:42px;
    height:42px;
    border-radius:10px;
    object-fit:cover;
}

.brand-name{
    font-size:24px;
    font-weight:700;
}

.brand-name span{
    color:#d4a437;
}

.nav-links{
    display:flex;
    gap:22px;
}

.nav-links a{
    text-decoration:none;
    color:#777;
    font-size:12px;
    letter-spacing:1px;
    font-weight:700;
    transition:.3s;
}

.nav-links a:hover{
    color:#000;
}

.nav-links a.active{
    color:#000;
    border-bottom:2px solid #d4a437;
    padding-bottom:4px;
}

/* RIGHT */
.nav-right{
    display:flex;
    align-items:center;
    gap:12px;
}

.account-btn{
    background:#fff;
    border:1px solid #ddd;
    padding:10px 14px;
    border-radius:10px;
    text-decoration:none;
    color:#111;
    font-size:13px;
    font-weight:600;
}

/* HERO */
.hero-banner{
    background:
    radial-gradient(circle at top left,#40454d,#1a1d21 70%);
    color:#fff;
    text-align:center;
    padding:100px 20px;
}

.hero-sub{
    letter-spacing:3px;
    font-size:12px;
    color:#aaa;
    margin-bottom:10px;
}

.hero-title{
    font-size:62px;
    line-height:1.2;
    margin-bottom:20px;
    font-weight:700;
}

.hero-title span{
    color:#d4a437;
    font-style:italic;
}

.hero-desc{
    max-width:700px;
    margin:auto;
    font-size:15px;
    line-height:1.8;
    color:#ddd;
}

/* STATS */
.stats{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(230px,1fr));
    gap:20px;
    padding:30px;
}

.stat-card{
    background:#fff;
    border-radius:18px;
    padding:25px;
    border:1px solid #ececec;
    transition:.3s;
}

.stat-card:hover{
    transform:translateY(-4px);
}

.stat-top{
    display:flex;
    justify-content:space-between;
    align-items:center;
}

.stat-title{
    font-size:14px;
    color:#777;
}

.stat-icon{
    font-size:28px;
}

.stat-value{
    margin-top:12px;
    font-size:34px;
    font-weight:700;
}

/* SECTIONS */
.section{
    padding:0 30px 30px;
}

.section-title{
    font-size:28px;
    margin-bottom:18px;
    font-weight:700;
}

/* PRODUCTS */
.products{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
    gap:18px;
}

.product-card{
    background:#fff;
    border:1px solid #ececec;
    border-radius:16px;
    padding:18px;
    text-align:center;
    transition:.3s;
}

.product-card:hover{
    transform:translateY(-5px);
}

.product-img{
    width:110px;
    height:110px;
    object-fit:contain;
}

.product-name{
    margin-top:12px;
    font-size:18px;
    font-weight:700;
}

.product-price{
    margin-top:6px;
    color:#d4a437;
    font-size:18px;
    font-weight:700;
}

.btn{
    display:block;
    margin-top:14px;
    width:100%;
    text-decoration:none;
    background:#111;
    color:#fff;
    padding:11px;
    border-radius:10px;
    font-size:14px;
    transition:.3s;
}

.btn:hover{
    background:#d4a437;
    color:#111;
}

/* TABLE */
.table-wrap{
    background:#fff;
    border-radius:18px;
    overflow:hidden;
    border:1px solid #ececec;
}

table{
    width:100%;
    border-collapse:collapse;
}

th{
    background:#fafafa;
    padding:16px;
    text-align:left;
    font-size:14px;
    border-bottom:1px solid #ececec;
}

td{
    padding:16px;
    border-bottom:1px solid #f1f1f1;
    font-size:14px;
}

.status{
    padding:6px 12px;
    border-radius:30px;
    font-size:12px;
    font-weight:700;
}

.pending{
    background:#fff1c7;
    color:#8a6500;
}

.completed{
    background:#dcfce7;
    color:#166534;
}

.processing{
    background:#dbeafe;
    color:#1d4ed8;
}

/* MOBILE */
@media(max-width:768px){

.top-nav{
    flex-direction:column;
    gap:20px;
}

.left-nav{
    flex-direction:column;
}

.hero-title{
    font-size:42px;
}

.stats{
    padding:20px;
}

.section{
    padding:0 20px 20px;
}

}

</style>
</head>

<body>

<!-- NAVBAR -->
<div class="top-nav">

    <div class="left-nav">

        <div class="brand">
            <img src="../logo.jpg" class="logo">

            <div class="brand-name">
                Pastry <span>Project</span>
            </div>
        </div>

        <div class="nav-links">
            <a href="admin_dashboard.php" class="active">DASHBOARD</a>
            <a href="admin_products.php">PRODUCTS</a>
            <a href="orders.php">ORDERS</a>
           
        </div>

    </div>

    <div class="nav-right">

        <a href="../account.php" class="account-btn">
            👤 <?= htmlspecialchars($_SESSION['user']['name']) ?>
        </a>

    </div>

</div>

<!-- HERO -->
<div class="hero-banner">

    <div class="hero-sub">
        ADMIN PANEL
    </div>

    <div class="hero-title">
        Pastry <span>Management</span>
    </div>

    <div class="hero-desc">
        Monitor products, orders, customers, and total sales
        in one elegant admin dashboard built for Pastry Project.
    </div>

</div>

<!-- STATS -->
<div class="stats">

    <div class="stat-card">

        <div class="stat-top">
            <div class="stat-title">Total Products</div>
            <div class="stat-icon">🍰</div>
        </div>

        <div class="stat-value">
            <?= $totalProducts ?>
        </div>

    </div>

    <div class="stat-card">

        <div class="stat-top">
            <div class="stat-title">Total Orders</div>
            <div class="stat-icon">📦</div>
        </div>

        <div class="stat-value">
            <?= $totalOrders ?>
        </div>

    </div>

    <div class="stat-card">

        <div class="stat-top">
            <div class="stat-title">Users</div>
            <div class="stat-icon">👥</div>
        </div>

        <div class="stat-value">
            <?= $totalUsers ?>
        </div>

    </div>

    <div class="stat-card">

        <div class="stat-top">
            <div class="stat-title">Total Sales</div>
            <div class="stat-icon">💰</div>
        </div>

        <div class="stat-value">
            ₱<?= number_format($totalSales,2) ?>
        </div>

    </div>

</div>

<!-- PRODUCTS -->
<div class="section">

    <div class="section-title">
        Latest Products
    </div>

    <div class="products">

        <?php foreach($products as $p): ?>

        <?php
        $imagePath = "../uploads/" . $p['image'];
        ?>

        <div class="product-card">

            <?php if(!empty($p['image']) && file_exists($imagePath)): ?>

                <img src="<?= $imagePath ?>" class="product-img">

            <?php else: ?>

                <div style="font-size:55px">🍰</div>

            <?php endif; ?>

            <div class="product-name">
                <?= htmlspecialchars($p['name']) ?>
            </div>

            <div class="product-price">
                ₱<?= number_format($p['slice_price'],2) ?>
            </div>

            <a href="edit_product.php?id=<?= $p['id'] ?>" class="btn">
                Edit Product
            </a>

        </div>

        <?php endforeach; ?>

    </div>

</div>

<!-- RECENT ORDERS -->
<div class="section">

    <div class="section-title">
        Recent Orders
    </div>

    <div class="table-wrap">

        <table>

            <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
            </thead>

            <tbody>

            <?php foreach($recentOrders as $o): ?>

            <tr>

                <td>
                    #<?= $o['id'] ?>
                </td>

                <td>
                    <?= htmlspecialchars($o['customer_name'] ?? 'Customer') ?>
                </td>

                <td>
                    ₱<?= number_format($o['total'],2) ?>
                </td>

                <td>
                    <span class="status <?= strtolower($o['status']) ?>">
                        <?= $o['status'] ?>
                    </span>
                </td>

            </tr>

            <?php endforeach; ?>

            </tbody>

        </table>

    </div>

</div>

</body>
</html>