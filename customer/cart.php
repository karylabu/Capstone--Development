<?php
session_start();

require_once '../includes/data.php';
require_once '../includes/db.php';

/* ================= AUTH ================= */

if (!isset($_SESSION['user'])) {
    header("Location: ../login.php");
    exit;
}

$role = $_SESSION['user']['role'] ?? 'customer';

if ($role !== 'customer') {
    header("Location: products.php");
    exit;
}

/* ================= INIT CART ================= */

if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

if (!isset($_SESSION['cart_count'])) {
    $_SESSION['cart_count'] = 0;
}

/* ================= ADD TO CART ================= */

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_to_cart'])) {

    $productId = (int)($_POST['product_id'] ?? 0);

    $size = strtolower(trim($_POST['size'] ?? 'regular'));

    $quantity = 1; // FIXED QTY TO 1 ONLY

    $product = db_one(
        "SELECT * FROM products WHERE id = ?",
        [$productId]
    );

    if ($product) {

        $category = strtolower($product['category'] ?? '');

        /* ================= PRICE LOGIC ================= */

        if ($category === 'meals') {

            switch ($size) {

                case 'regular':
                    $price = 209;
                    $sizeLabel = 'Regular Meal';
                    $size = 'regular';
                break;

                case 'combo':
                case 'combo meal':
                    $price = 309;
                    $sizeLabel = 'Combo Meal';
                    $size = 'combo';
                break;

                default:
                    $price = 199;
                    $sizeLabel = 'Meal';
                    $size = 'meal';
                break;
            }

        } else {

            $basePrice = (float)$product['price'];

            switch ($size) {

                case 'slice':
                    $price = $basePrice;
                    $sizeLabel = 'Slice';
                break;

                case 'small':
                    $price = $basePrice;
                    $sizeLabel = 'Small';
                break;

                case 'big':
                    $price = $basePrice + 100;
                    $sizeLabel = 'Big';
                break;

                default:
                    $price = $basePrice;
                    $sizeLabel = 'Regular';
                    $size = 'regular';
                break;
            }
        }

        $_SESSION['cart'][] = [

            'key' => uniqid(),

            'product_id' => $product['id'],

            'name' => $product['name'],

            'image' => $product['image'],

            'price' => $price,

            'size' => $size,

            'size_label' => $sizeLabel,

            'quantity' => $quantity
        ];

        $count = 0;

        foreach ($_SESSION['cart'] as $c) {
            $count += (int)$c['quantity'];
        }

        $_SESSION['cart_count'] = $count;

        echo 'added';
        exit;
    }

    echo 'failed';
    exit;
}

/* ================= RESET ================= */

if (isset($_GET['reset'])) {

    $_SESSION['cart'] = [];
    $_SESSION['cart_count'] = 0;

    header("Location: cart.php");
    exit;
}

/* ================= POST ACTIONS ================= */

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    /* ================= UPDATE QTY ================= */

    if (isset($_POST['update_qty'])) {

        $keys = explode(',', $_POST['cart_keys']);

        $action = $_POST['update_qty'];

        foreach ($_SESSION['cart'] as &$cartItem) {

            if (
                in_array(
                    $cartItem['key'] ?? '',
                    $keys
                )
            ) {

                // FIXED QTY = 1 ONLY
                $cartItem['quantity'] = 1;
            }
        }

        unset($cartItem);

        $_SESSION['cart_count'] = count($_SESSION['cart']);

        echo 'updated';
        exit;
    }

    /* ================= REMOVE ================= */

    if (isset($_POST['remove_item'])) {

        $removeKeys =
            explode(',', $_POST['remove_item']);

        $_SESSION['cart'] = array_values(array_filter(
            $_SESSION['cart'],
            function ($item) use ($removeKeys) {

                return !in_array(
                    $item['key'] ?? '',
                    $removeKeys
                );
            }
        ));

        $_SESSION['cart_count'] = count($_SESSION['cart']);

        header('Location: cart.php');
        exit;
    }

    /* ================= CLEAR ================= */

    if (isset($_POST['clear_cart'])) {

        $_SESSION['cart'] = [];

        $_SESSION['cart_count'] = 0;

        header('Location: cart.php');

        exit;
    }
}

/* ================= LOAD CART ================= */

$cartItems = array_reverse($_SESSION['cart'] ?? []);

$groupedCart = [];

$cartCount = 0;

foreach ($cartItems as $item) {

    if (
        !isset($item['product_id']) ||
        !isset($item['name']) ||
        !isset($item['image']) ||
        !isset($item['price']) ||
        !isset($item['quantity'])
    ) {
        continue;
    }

    $item['quantity'] = 1;

    $item['subtotal'] =
        $item['price'] * $item['quantity'];

    $item['size_label'] =
        $item['size_label'] ?? ucfirst($item['size']);

    $cartCount += $item['quantity'];

    $pid = $item['product_id'];

    if (!isset($groupedCart[$pid])) {

        $groupedCart[$pid] = [

            'product' => [
                'id' => $item['product_id'],
                'name' => $item['name'],
                'image' => $item['image']
            ],

            'items' => []

        ];
    }

    $groupKey =
        $item['product_id'] . '_' .
        ($item['size'] ?? 'regular');

    if (
        !isset(
            $groupedCart[$pid]['items'][$groupKey]
        )
    ) {

        $item['merged_keys'] = [
            $item['key']
        ];

        $groupedCart[$pid]['items'][$groupKey] =
            $item;

    } else {

        $groupedCart[$pid]['items'][$groupKey]['quantity'] = 1;

        $groupedCart[$pid]['items'][$groupKey]['subtotal'] =

            $groupedCart[$pid]['items'][$groupKey]['price'];

        $groupedCart[$pid]['items'][$groupKey]['merged_keys'][] =
            $item['key'];
    }
}

$_SESSION['cart_count'] = $cartCount;
?>

<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">

<meta name="viewport"
content="width=device-width, initial-scale=1.0">

<title>Cart</title>

<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap"
rel="stylesheet">

<style>

*{
    box-sizing:border-box;
}

body{
    margin:0;
    font-family:'DM Sans',sans-serif;
    background:#f4f4f4;
    color:#111;
}

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
    width:42px;
    height:42px;
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

.nav-right{
    display:flex;
    align-items:center;
    gap:10px;
}

.cart-btn{
    position:relative;
    background:#111;
    color:#fff;
    padding:10px 14px;
    border-radius:10px;
    text-decoration:none;
}

.cart-badge{
    position:absolute;
    top:-6px;
    right:-6px;
    background:red;
    color:#fff;
    font-size:10px;
    padding:3px 6px;
    border-radius:50%;
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

.main{
    padding:25px;
}

.main-grid{
    display:grid;
    grid-template-columns:2fr 1fr;
    gap:20px;
}

.card{
    background:#fff;
    border-radius:16px;
    padding:20px;
    border:1px solid #eee;
}

.btn{
    padding:10px 14px;
    border:none;
    border-radius:10px;
    cursor:pointer;
}

.btn-primary{
    background:#111;
    color:#fff;
}

.btn-ghost{
    background:#eee;
}

.btn-sm{
    font-size:12px;
    padding:6px 10px;
}

.item-row{
    display:flex;
    gap:15px;
    margin-top:15px;
    align-items:center;
}

.item-img{
    width:70px;
    height:70px;
    border-radius:12px;
    object-fit:cover;
    border:1px solid #ddd;
}

.size-badge{
    background:#ffecef;
    padding:4px 10px;
    border-radius:20px;
    font-size:12px;
    display:inline-block;
    margin-bottom:5px;
}

.qty-box{
    display:flex;
    align-items:center;
    gap:8px;
    margin-top:5px;
}

.qty-form{
    display:flex;
    align-items:center;
    gap:6px;
}

.qty-input{
    width:42px;
    height:28px;
    border:1px solid #ddd;
    border-radius:8px;
    text-align:center;
    font-size:12px;
    background:#fff;
}

.qty-arrow{
    width:26px;
    height:26px;
    border-radius:7px;
    border:1px solid #ddd;
    background:#fff;
    cursor:pointer;
    font-size:15px;
    font-weight:700;
    display:flex;
    align-items:center;
    justify-content:center;
}

.qty-arrow:hover{
    background:#f3f3f3;
}

.row-total{
    min-width:90px;
    text-align:right;
    font-weight:700;
}

.summary-item{
    display:flex;
    gap:10px;
    margin-bottom:10px;
    align-items:center;
}

.summary-img{
    width:45px;
    height:45px;
    border-radius:8px;
    object-fit:cover;
    border:1px solid #ddd;
}

@media(max-width:900px){

    .top-nav,
    .left-nav{
        flex-direction:column;
        gap:15px;
    }

    .main-grid{
        grid-template-columns:1fr;
    }

}

</style>
</head>

<body>

<div class="top-nav">

    <div class="left-nav">

        <div class="brand">

            <img src="../logo.jpg"
            class="logo">

            <div class="brand-name">
                Pastry <span>Project</span>
            </div>

        </div>

        <div class="nav-links">

            <a href="dashboard.php">DASHBOARD</a>

            <a href="products.php">PRODUCTS</a>

            <a href="orders.php">ORDERS</a>

            <a href="notifications.php">NOTIFICATIONS</a>

        </div>

    </div>

    <div class="nav-right">

        <a href="cart.php"
        class="cart-btn">

            🛒

            <span class="cart-badge">
                <?= $_SESSION['cart_count'] ?? 0 ?>
            </span>

        </a>

        <a href="account.php"
        class="account-btn">

            👤 <?= $_SESSION['user']['name'] ?? 'Account' ?>

        </a>

    </div>

</div>

<div class="main">

<?php if(empty($groupedCart)): ?>

<div class="card"
style="text-align:center;padding:70px;">

    <h2>Your cart is empty</h2>

    <p style="color:#777;">
        Add products from dashboard.
    </p>

    <a href="dashboard.php"
    class="btn btn-primary"
    style="display:inline-block;text-decoration:none;margin-top:10px;">

        Browse Products

    </a>

</div>

<?php else: ?>

<form method="POST"
action="checkout.php"
id="checkoutForm">

<div class="main-grid">

<div class="card">

<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">

<strong>
🛒 Cart Items (<?= $cartCount ?>)
</strong>

<div style="display:flex;gap:10px;">

<button type="button"
id="selectAllBtn"
class="btn btn-ghost btn-sm">

☑️ Select All

</button>

<button type="submit"
name="clear_cart"
formaction="cart.php"
class="btn btn-ghost btn-sm"
onclick="return confirm('Clear cart?')">

🗑️ Clear All

</button>

</div>

</div>

<?php foreach($groupedCart as $group): ?>

<div class="product-group"
style="padding:15px 0;border-bottom:1px solid #eee;">

<strong style="font-size:18px;">
<?= htmlspecialchars($group['product']['name']) ?>
</strong>

<?php foreach($group['items'] as $item): ?>

<div class="item-row">

<input type="checkbox"
class="select-item"
name="selected_group[]"
value="<?= htmlspecialchars(
implode(',', $item['merged_keys'])
) ?>"
data-price="<?= $item['price'] ?>"
data-qty="<?= $item['quantity'] ?>">

<img src="../uploads/<?= htmlspecialchars($item['image']) ?>"
class="item-img">

<div style="flex:1;">

<div class="size-badge">
<?= htmlspecialchars($item['size_label']) ?>
</div>

<div class="qty-box">

<span style="font-size:12px;">
Qty:
</span>

<div class="qty-form">

<button
type="button"
class="qty-arrow qty-down"
data-keys="<?= htmlspecialchars(
implode(',', $item['merged_keys'])
) ?>">

−

</button>

<input type="text"
class="qty-input"
value="<?= $item['quantity'] ?>"
readonly>

<button
type="button"
class="qty-arrow qty-up"
data-keys="<?= htmlspecialchars(
implode(',', $item['merged_keys'])
) ?>">

+

</button>

</div>

</div>

</div>

<div class="row-total">

₱<?= number_format($item['subtotal'],2) ?>

</div>

<button
type="submit"
formaction="cart.php"
formmethod="POST"
name="remove_item"
value="<?= htmlspecialchars(
implode(',', $item['merged_keys'])
) ?>"
class="btn btn-ghost btn-sm">

❌

</button>

</div>

<?php endforeach; ?>

</div>

<?php endforeach; ?>

</div>

<div class="card"
id="summaryCard"
style="display:none;height:fit-content;">

<h3>Order Summary</h3>

<div id="summaryList"></div>

<hr>

<div style="display:flex;justify-content:space-between;">
<span>Subtotal</span>
<span id="subtotalValue">₱0</span>
</div>

<div style="display:flex;justify-content:space-between;margin:10px 0;">
<span>Delivery</span>
<span id="deliveryValue">₱0</span>
</div>

<hr>

<div style="display:flex;justify-content:space-between;font-weight:700;">
<span>Total</span>
<span id="grandTotal">₱0</span>
</div>

<button type="submit"
id="checkoutBtn"
name="checkout"
value="1"
class="btn btn-primary"
style="width:100%;margin-top:15px;opacity:.5;pointer-events:none;">

Proceed to Checkout

</button>

</div>

</div>

</form>

<?php endif; ?>

</div>

<script>

document.getElementById('selectAllBtn')
?.addEventListener('click',()=>{

    const checkboxes =
        document.querySelectorAll('.select-item');

    const allChecked =
        [...checkboxes].every(cb => cb.checked);

    checkboxes.forEach(cb => cb.checked = !allChecked);

    updateTotals();
});

function updateTotals(){

    let subtotal = 0;

    let selectedCount = 0;

    const summary =
        document.getElementById('summaryList');

    summary.innerHTML = '';

    document.querySelectorAll('.select-item')
    .forEach(cb => {

        if(!cb.checked) return;

        const row =
            cb.closest('.item-row');

        const qty =
            parseInt(cb.dataset.qty);

        const price =
            parseFloat(cb.dataset.price);

        const total =
            qty * price;

        subtotal += total;

        selectedCount++;

        const img =
            row.querySelector('img').src;

        const name =
            row.closest('.product-group')
            .querySelector('strong')
            .innerText;

        summary.innerHTML += `

            <div class="summary-item">

                <img src="${img}"
                class="summary-img">

                <div style="flex:1;">
                    <div>${name}</div>
                    <small>Qty: ${qty}</small>
                </div>

                <div>
                    ₱${total.toLocaleString()}
                </div>

            </div>

        `;
    });

    const delivery =
        selectedCount > 0 ? 50 : 0;

    document.getElementById('subtotalValue')
    .innerText =
        '₱' + subtotal.toLocaleString();

    document.getElementById('deliveryValue')
    .innerText =
        '₱' + delivery.toLocaleString();

    document.getElementById('grandTotal')
    .innerText =
        '₱' + (subtotal + delivery).toLocaleString();

    document.getElementById('summaryCard')
    .style.display =
        selectedCount > 0
        ? 'block'
        : 'none';

    const btn =
        document.getElementById('checkoutBtn');

    btn.style.pointerEvents =
        selectedCount > 0
        ? 'auto'
        : 'none';

    btn.style.opacity =
        selectedCount > 0
        ? '1'
        : '.5';
}

/* ================= CHECKBOX ================= */

document.querySelectorAll('.select-item')
.forEach(cb => {

    cb.addEventListener(
        'change',
        updateTotals
    );

});

/* ================= QTY ================= */

document.querySelectorAll('.qty-up, .qty-down')
.forEach(btn => {

    btn.addEventListener('click', async function(){

        const keys =
            this.dataset.keys;

        const action =
            this.classList.contains('qty-up')
            ? 'up'
            : 'down';

        const formData = new FormData();

        formData.append('update_qty', action);

        formData.append('cart_keys', keys);

        await fetch('cart.php', {
            method:'POST',
            body:formData
        });

        location.reload();
    });

});

/* ================= SUBMIT ================= */

document.getElementById('checkoutForm')
.addEventListener('submit', function(e){

    const submitter =
        e.submitter;

    if(
        submitter &&
        (
            submitter.name === 'remove_item' ||
            submitter.name === 'clear_cart'
        )
    ){
        return;
    }

    const checked =
        document.querySelectorAll(
            '.select-item:checked'
        );

    if(checked.length === 0){

        e.preventDefault();

        alert('Select at least 1 item');

        return;
    }

    document.querySelectorAll('.generated-selected')
    .forEach(el => el.remove());

    checked.forEach(cb => {

        const keys =
            cb.value.split(',');

        keys.forEach(k => {

            const hidden =
                document.createElement('input');

            hidden.type = 'hidden';

            hidden.name = 'selected_items[]';

            hidden.value = k;

            hidden.classList.add(
                'generated-selected'
            );

            document.getElementById('checkoutForm')
            .appendChild(hidden);

        });

    });

});

updateTotals();

</script>

</body>
</html>