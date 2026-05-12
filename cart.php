<?php
session_start();
require 'includes/data.php';

$role = $_SESSION['user']['role'] ?? 'customer';
if ($role !== 'customer') {
    header('Location: products.php');
    exit;
}

/* ================= ACTIONS ================= */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    if (isset($_POST['add_to_cart'])) {
        $productId = (int)$_POST['product_id'];
        $size = strtolower(trim($_POST['size'] ?? 'slice'));
        $quantity = (int)($_POST['quantity'] ?? 1);

        add_to_cart($productId, $size, $quantity);

        header('Location: cart.php?added=1');
        exit;
    }

    elseif (isset($_POST['remove_item'])) {
        $key = $_POST['item_key'];
        remove_from_cart($key);

        header('Location: cart.php?removed=1');
        exit;
    }

    elseif (isset($_POST['clear_cart'])) {
        clear_cart();

        header('Location: cart.php?cleared=1');
        exit;
    }
}

/* ================= LOAD CART ================= */
$cartItems = array_reverse(get_cart_items());
$cartCount = get_cart_count();

/* ✅ FIX: SYNC SESSION COUNT */
$_SESSION['cart_count'] = $cartCount;

/* ================= GROUP ITEMS ================= */
$groupedCart = [];

foreach ($cartItems as $item) {
    $pid = $item['product']['id'];

    if (!isset($groupedCart[$pid])) {
        $groupedCart[$pid] = [
            'product' => $item['product'],
            'items' => []
        ];
    }

    $groupedCart[$pid]['items'][] = $item;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Cart</title>

<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">

<style>
/* SAME CSS — unchanged */
body{margin:0;font-family:'DM Sans',sans-serif;background:#f4f4f4;color:#000;}
.top-nav{display:flex;justify-content:space-between;align-items:center;padding:18px 30px;background:#fff;border-bottom:1px solid #eee;}
.left-nav{display:flex;align-items:center;gap:30px}
.brand{display:flex;align-items:center;gap:10px}
.logo{width:40px;height:40px;border-radius:10px}
.brand-name{font-family:'Playfair Display';font-size:22px;font-weight:700}
.brand-name span{color:#e7c46a}
.nav-links{display:flex;gap:20px}
.nav-links a{text-decoration:none;font-size:11px;font-weight:700;letter-spacing:1px;color:#000;}
.nav-links a.active{border-bottom:2px solid #e7c46a}
.nav-right{display:flex;align-items:center;gap:10px}
.cart-btn{position:relative;background:#111;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none}
.cart-badge{position:absolute;top:-6px;right:-6px;background:red;color:#fff;font-size:10px;padding:3px 6px;border-radius:50%}
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
.main{padding:25px}
.card{background:#fff;border-radius:14px;padding:20px;border:1px solid #eee;}
.btn{padding:8px 12px;border:none;border-radius:8px;cursor:pointer}
.btn-primary{background:#111;color:#fff}
.btn-ghost{background:#eee}
.btn-sm{font-size:12px;padding:6px 10px}

.item-row{display:flex;gap:15px;margin-top:10px;align-items:center}
.item-img{width:60px;height:60px;border-radius:10px;object-fit:cover;border:1px solid #ddd}
.size-badge{background:#ffecef;color:#000;padding:4px 10px;border-radius:20px;font-size:12px;display:inline-block;margin-bottom:5px}
.row-total{font-weight:700;color:#000}

.summary-item{display:flex;gap:10px;margin-bottom:10px;align-items:center}
.summary-img{width:40px;height:40px;border-radius:8px;object-fit:cover;border:1px solid #ddd}
</style>
</head>

<body>

<!-- NAV SAME -->
<div class="top-nav">
  <div class="left-nav">
    <div class="brand">
      <img src="logo.jpg" class="logo">
      <div class="brand-name">Pastry <span>Project</span></div>
    </div>

    <div class="nav-links">
      <a href="dashboard.php">DASHBOARD</a>
      <a href="products.php">PRODUCTS</a>
      <a href="orders.php">ORDERS</a>
      <a href="notifications.php">NOTIFICATIONS</a>
    </div>
  </div>

  <div class="nav-right">
    <?php $name = $_SESSION['user']['name'] ?? ''; ?>

    <a href="cart.php" class="cart-btn">
      🛒
      <span class="cart-badge"><?= $_SESSION['cart_count'] ?? 0 ?></span>
    </a>

    <!-- ACCOUNT -->
<a href="account.php" class="account-btn">
  👤 <?= $_SESSION['user']['name'] ?? 'Account' ?>
</a>

  </div>
</div>

<div class="main">

<?php if (empty($cartItems)): ?>

<div class="card" style="text-align:center;padding:60px">
  <h3>Your cart is empty</h3>
  <a href="index.php" class="btn btn-primary">Browse Products</a>
</div>

<?php else: ?>

<form method="POST" action="checkout.php" id="checkoutForm">
<div style="display:grid;grid-template-columns:2fr 1fr;gap:20px">

<div class="card">

<div style="display:flex;justify-content:space-between;margin-bottom:15px">
<strong>🛒 Cart Items (<?= $cartCount ?>)</strong>

<div style="display:flex;gap:8px">
<button type="button" id="selectAllBtn" class="btn btn-ghost btn-sm">☑️ Select All</button>

<button type="submit" name="clear_cart" formaction="cart.php"
class="btn btn-ghost btn-sm"
onclick="return confirm('Clear entire cart?')">
🗑️ Clear All
</button>
</div>
</div>

<?php foreach ($groupedCart as $group): ?>
<div style="padding:15px 0;border-bottom:1px solid #eee">
<strong><?= htmlspecialchars($group['product']['name']) ?></strong>

<?php foreach ($group['items'] as $item): ?>
<div class="item-row">

<input type="checkbox" class="select-item" data-key="<?= htmlspecialchars($item['key']) ?>">

<img src="uploads/<?= $item['product']['image'] ?>" class="item-img">

<div style="flex:1">

<?php if ($item['size_label']): ?>
<div class="size-badge"><?= $item['size_label'] ?></div>
<?php endif; ?>

<div>
Qty:
<input type="number"
class="qty-input"
data-key="<?= htmlspecialchars($item['key']) ?>"
data-price="<?= $item['price'] ?>"
value="<?= $item['quantity'] ?>"
min="1"
style="width:60px;padding:5px;border:1px solid #ddd;border-radius:6px">
</div>

</div>

<div class="row-total" data-key="<?= htmlspecialchars($item['key']) ?>">
₱<?= number_format($item['subtotal']) ?>
</div>

</div>
<?php endforeach; ?>
</div>
<?php endforeach; ?>

</div>

<!-- ✅ ORDER SUMMARY RESTORED -->
<div class="card" id="summaryCard" style="display:none;">
<h3>Order Summary</h3>
<div id="summaryList"></div>
<hr>
<div style="display:flex;justify-content:space-between">
<span>Subtotal</span>
<span id="subtotalValue">₱0</span>
</div>
<div style="display:flex;justify-content:space-between;margin:10px 0">
<span>Delivery</span>
<span>₱50</span>
</div>
<hr>
<div style="display:flex;justify-content:space-between;font-weight:700">
<span>Total</span>
<span id="grandTotal">₱0</span>
</div>

<div id="selectedInputs"></div>

<button type="submit" id="checkoutBtn"
class="btn btn-primary"
style="width:100%;margin-top:15px;opacity:.5;pointer-events:none">
Proceed to Checkout
</button>
</div>

</div>
</form>

<?php endif; ?>

</div>

<script>

/* ✅ FULL ORIGINAL JS BACK */
document.getElementById('selectAllBtn')?.addEventListener('click',()=>{
  const checkboxes = document.querySelectorAll('.select-item');
  const allChecked = [...checkboxes].every(cb => cb.checked);
  checkboxes.forEach(cb => cb.checked = !allChecked);
  updateTotals();
});

function updateTotals() {
  let subtotal = 0;
  let selectedCount = 0;

  const container = document.getElementById('selectedInputs');
  const summaryList = document.getElementById('summaryList');

  container.innerHTML = '';
  summaryList.innerHTML = '';

  document.querySelectorAll('.qty-input').forEach(input => {
    const key = input.dataset.key;
    const checkbox = document.querySelector(`.select-item[data-key="${key}"]`);

    if (!checkbox || !checkbox.checked) return;

    const qty = parseInt(input.value) || 0;
    const price = parseFloat(input.dataset.price);
    const rowTotal = price * qty;

    document.querySelector(`.row-total[data-key="${key}"]`)
      .textContent = '₱' + rowTotal.toLocaleString();

    subtotal += rowTotal;
    selectedCount++;

    const img = input.closest('.item-row').querySelector('img');
    const name = input.closest('.item-row')
                     .parentElement
                     .querySelector('strong')
                     .innerText;

    const div = document.createElement('div');
    div.className = 'summary-item';
    div.innerHTML = `
      ${img ? `<img src="${img.src}" class="summary-img">` : '🍰'}
      <div style="flex:1">${name}</div>
      <div>₱${rowTotal.toLocaleString()}</div>
    `;
    summaryList.appendChild(div);

    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'selected_items[]';
    hidden.value = key;
    container.appendChild(hidden);
  });

  document.getElementById('subtotalValue').textContent =
    '₱' + subtotal.toLocaleString();

  document.getElementById('grandTotal').textContent =
    '₱' + (subtotal + 50).toLocaleString();

  document.getElementById('summaryCard').style.display =
    selectedCount > 0 ? 'block' : 'none';

  const btn = document.getElementById('checkoutBtn');
  btn.style.pointerEvents = selectedCount > 0 ? 'auto' : 'none';
  btn.style.opacity = selectedCount > 0 ? '1' : '0.5';
}

document.querySelectorAll('.qty-input').forEach(i => {
  i.addEventListener('input', updateTotals);
});

document.querySelectorAll('.select-item').forEach(cb => {
  cb.addEventListener('change', updateTotals);
});

updateTotals();

</script>

</body>
</html>