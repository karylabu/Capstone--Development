<?php
session_start();
require 'includes/data.php';

if (!isset($_SESSION['user'])) {
    header("Location: login.php");
    exit;
}

$selectedKeys = $_POST['selected_items'] ?? $_SESSION['selected_items'] ?? [];

if (empty($selectedKeys)) {
    header("Location: cart.php");
    exit;
}

$_SESSION['selected_items'] = $selectedKeys;

$cartItems = get_cart_items();

$filteredItems = [];
foreach ($cartItems as $item) {
    if (in_array($item['key'], $selectedKeys)) {
        $filteredItems[] = $item;
    }
}

if (empty($filteredItems)) {
    header("Location: cart.php");
    exit;
}

$cartTotal = 0;
foreach ($filteredItems as $item) {
    $cartTotal += $item['subtotal'];
}

$userName  = $_SESSION['user']['name'] ?? '';
$userEmail = $_SESSION['user']['email'] ?? '';
?>

<?php include 'includes/header.php'; ?>

<style>
body{
  background:#f6f6f6;
}

/* CONTAINER */
.checkout-container{
  max-width:1150px;
  margin:30px auto;
  padding:0 20px;
}

/* TITLE */
.page-title{
  font-family:'Playfair Display', serif;
  font-size:30px;
  margin-bottom:25px;
}

/* GRID */
.checkout-grid{
  display:grid;
  grid-template-columns:2fr 1fr;
  gap:28px;
}

/* CARD */
.card{
  background:#fff;
  border-radius:16px;
  padding:32px; /* ✅ FIXED spacing */
  box-shadow:0 6px 18px rgba(0,0,0,0.06);
}

/* TITLE */
.card-title{
  font-size:18px;
  font-weight:600;
  margin-bottom:20px;
}

/* FORM */
.shipping-form{
  display:grid;
  gap:20px;
  padding:8px; /* ✅ prevents overlap */
}

/* FORM ROW */
.form-row{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:18px;
}

/* LABEL */
.shipping-form label{
  font-size:13px;
  font-weight:600;
  margin-bottom:6px;
  display:block;
}

/* INPUTS */
.shipping-form input,
.shipping-form textarea,
.shipping-form select{
  width:100%;
  padding:14px 16px;
  border-radius:12px;
  border:1.5px solid #e3e3e3;
  background:#fafafa;
  font-size:14px;
  box-sizing:border-box; /* ✅ prevents overflow */
}

/* TEXTAREA */
.shipping-form textarea{
  min-height:120px;
}

/* FOCUS */
.shipping-form input:focus,
.shipping-form textarea:focus,
.shipping-form select:focus{
  border-color:#111;
  background:#fff;
  box-shadow:0 0 0 2px rgba(0,0,0,0.05);
}

/* SUMMARY LIST */
.summary-list{
  display:flex;
  flex-direction:column;
  gap:16px;
  margin-bottom:20px;
}

/* ITEM */
.summary-item{
  display:flex;
  align-items:center;
  gap:14px;
}

/* IMAGE */
.summary-img{
  width:55px;
  height:55px;
  border-radius:10px;
  object-fit:cover;
  border:1px solid #eee;
}

/* TEXT */
.summary-name{
  font-weight:600;
  font-size:14px;
}

.summary-meta{
  font-size:12px;
  color:#777;
}

.summary-price{
  font-weight:600;
  font-size:14px;
}

/* TOTAL */
.summary-totals{
  border-top:1px solid #eee;
  padding-top:15px;
  margin-top:10px;
}

.total-row{
  display:flex;
  justify-content:space-between;
  margin-bottom:8px;
  font-size:14px;
}

.total-final{
  font-size:18px;
  font-weight:700;
  margin-top:10px;
}

/* BUTTON */
.checkout-btn{
  margin-top:18px;
  width:100%;
  padding:14px;
  background:#111;
  color:#fff;
  border:none;
  border-radius:10px;
  font-weight:600;
  cursor:pointer;
}

.checkout-btn:hover{
  background:#333;
}

/* RESPONSIVE */
@media(max-width:900px){
  .checkout-grid{
    grid-template-columns:1fr;
  }
}
</style>

<div class="checkout-container">

<h1 class="page-title">Checkout</h1>

<form method="POST" action="place_order.php">

<div class="checkout-grid">

<!-- LEFT -->
<div class="card">

<h3 class="card-title">Shipping Details</h3>

<div class="shipping-form">

<div class="form-row">
  <div>
    <label>Name</label>
    <input type="text" value="<?= htmlspecialchars($userName) ?>" readonly>
  </div>

  <div>
    <label>Email</label>
    <input type="text" value="<?= htmlspecialchars($userEmail) ?>" readonly>
  </div>
</div>

<div>
  <label>Address</label>
  <textarea name="address" required></textarea>
</div>

<div>
  <label>Payment Method</label>
  <select name="payment">
    <option value="COD">Cash on Delivery</option>
    <option value="GCash">GCash</option>
    <option value="PayMaya">PayMaya</option>
  </select>
</div>

</div>
</div>

<!-- RIGHT -->
<div class="card">

<h3 class="card-title">🧾 Order Summary</h3>

<div class="summary-list">

<?php foreach ($filteredItems as $item): ?>

<div class="summary-item">

<?php 
$img = $item['product']['image'] ?? '';
$path = "uploads/" . $img;
?>

<?php if (!empty($img) && file_exists($path)): ?>
  <img src="<?= $path ?>" class="summary-img">
<?php else: ?>
  <div style="font-size:32px">🍰</div>
<?php endif; ?>

<div style="flex:1">
  <div class="summary-name">
    <?= htmlspecialchars($item['product']['name']) ?>
  </div>
  <div class="summary-meta">
    <?= $item['size_label'] ?> • Qty: <?= $item['quantity'] ?>
  </div>
</div>

<div class="summary-price">
  ₱<?= number_format($item['subtotal'], 2) ?>
</div>

</div>

<?php endforeach; ?>

</div>

<div class="summary-totals">

<div class="total-row">
  <span>Subtotal</span>
  <span>₱<?= number_format($cartTotal, 2) ?></span>
</div>

<div class="total-row" style="color:#777">
  <span>Delivery Fee</span>
  <span>₱50.00</span>
</div>

<div class="total-row total-final">
  <span>Total</span>
  <span>₱<?= number_format($cartTotal + 50, 2) ?></span>
</div>

</div>

<?php foreach ($selectedKeys as $key): ?>
  <input type="hidden" name="selected_items[]" value="<?= htmlspecialchars($key) ?>">
<?php endforeach; ?>

<button type="submit" name="place_order" class="checkout-btn">
  Place Order
</button>

</div>

</div>
</form>
</div>