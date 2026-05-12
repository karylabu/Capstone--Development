<?php
session_start();

require_once __DIR__ . '/../includes/db.php';

// block admin
if(($_SESSION['user']['role'] ?? '') === 'admin'){
    header("Location: admin_products.php");
    exit;
}

/* FILTER */
$filterCat = $_GET['cat'] ?? 'all';

$products = $filterCat === 'all'
    ? db_all("SELECT * FROM products")
    : db_all("SELECT * FROM products WHERE category=?", [$filterCat]);

$categories = array_column(
    db_all("SELECT DISTINCT category FROM products"),
    'category'
);
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Products</title>

<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">

<style>
body{
    margin:0;
    font-family:'DM Sans',sans-serif;
    background:#f4f4f4
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
    gap:30px
}

.brand{
    display:flex;
    align-items:center;
    gap:10px
}

.logo{
    width:40px;
    height:40px;
    border-radius:10px
}

.brand-name{
    font-family:'Playfair Display', serif;
    font-size:22px;
    font-weight:700
}

.brand-name span{
    color:#e7c46a
}

.nav-links{
    display:flex;
    gap:20px
}

.nav-links a{
    text-decoration:none;
    font-size:11px;
    font-weight:700;
    color:#888
}

.nav-links a.active{
    color:#000;
    border-bottom:2px solid #e7c46a
}

/* RIGHT */
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

/* PAGE */
.container{
    padding:30px
}

/* CATEGORY */
.category-tabs{
    display:flex;
    gap:10px;
    overflow-x:auto;
    padding:20px 0;
}

.category-tab{
    display:inline-block;
    padding:8px 18px;
    background:#eee;
    border-radius:25px;
    text-decoration:none;
    color:#000;
    white-space:nowrap;
}

.category-tab.active{
    background:#111;
    color:#fff;
}

/* PRODUCTS */
.products{
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
    gap:16px
}

.card{
    background:#fff;
    border-radius:14px;
    padding:16px;
    border:1px solid #eee;
    text-align:center;
    position:relative
}

.card img{
    width:100%;
    height:140px;
    object-fit:contain
}

/* SIZE */
.size-btn{
    padding:5px 10px;
    border:1px solid #ddd;
    background:#fff;
    border-radius:8px;
    font-size:11px;
    cursor:pointer
}

.size-btn.active{
    background:#111;
    color:#fff
}

/* QTY */
.qty-box{
    display:flex;
    justify-content:center;
    gap:10px;
    margin:10px 0
}

.qty-btn{
    width:28px;
    height:28px;
    border:none;
    background:#111;
    color:#fff;
    border-radius:6px;
    cursor:pointer
}

/* BUTTON */
.btn{
    padding:10px;
    background:#111;
    color:#fff;
    border:none;
    border-radius:10px;
    width:100%;
    cursor:pointer
}

/* DISABLED */
.card.disabled{
    opacity:0.5;
    filter:grayscale(100%);
    pointer-events:none;
}

.card.disabled::after{
    content:"NOT AVAILABLE";
    position:absolute;
    top:10px;
    left:10px;
    background:red;
    color:#fff;
    font-size:10px;
    padding:4px 6px;
    border-radius:6px;
}
</style>
</head>

<body>

<!-- NAV -->
<div class="top-nav">

<div class="left-nav">

<div class="brand">
<img src="logo.jpg" class="logo">

<div class="brand-name">
Pastry <span>Project</span>
</div>

</div>

<div class="nav-links">
<a href="dashboard.php">DASHBOARD</a>
<a href="products.php" class="active">PRODUCTS</a>
<a href="orders.php">ORDERS</a>
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
<a href="cart.php" id="cartBtn" class="icon-btn cart-dark">
🛒
<span class="icon-badge cart-badge">
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

<h2>Products</h2>

<!-- CATEGORY -->
<div class="category-tabs">

<a href="products.php?cat=all"
class="category-tab <?= $filterCat=='all'?'active':'' ?>">
All
</a>

<a href="products.php?cat=cakes"
class="category-tab <?= $filterCat=='cakes'?'active':'' ?>">
Cakes
</a>

<a href="products.php?cat=meals"
class="category-tab <?= $filterCat=='meals'?'active':'' ?>">
Meals
</a>

</div>

<div class="products">

<?php foreach ($products as $p):

$isMeals =
    strtolower($p['category']) === 'meals';

/* FIXED MEALS PRICES */
if($isMeals){

    $slice = 199; // REGULAR
    $small = 209; // MEAL
    $big   = 309; // COMBO

}else{

    $slice = (float)$p['slice_price'];
    $small = (float)$p['small_price'];
    $big   = (float)$p['big_price'];
}

$imagePath = "uploads/" . $p['image'];
?>

<div class="card <?= !$p['available'] ? 'disabled' : '' ?>"

data-slice="<?= $slice ?>"
data-small="<?= $small ?>"
data-big="<?= $big ?>"
data-meals="<?= $isMeals ? 1 : 0 ?>">

<?php if (!empty($p['image']) && file_exists($imagePath)): ?>

<img src="<?= $imagePath ?>">

<?php else: ?>

🍰

<?php endif; ?>

<h4><?= htmlspecialchars($p['name']) ?></h4>

<div style="display:flex;gap:5px;justify-content:center;margin:10px 0">

<button
type="button"
class="size-btn active"
data-type="slice">

<?= $isMeals ? 'Regular' : 'Slice' ?>

</button>

<button
type="button"
class="size-btn"
data-type="small">

<?= $isMeals ? 'Meal' : 'Small' ?>

</button>

<button
type="button"
class="size-btn"
data-type="big">

<?= $isMeals ? 'Combo' : 'Big' ?>

</button>

</div>

<div class="price">
₱<?= number_format($slice,2) ?>
</div>

<div class="qty-box">

<button type="button" class="qty-btn minus">
-
</button>

<span class="qty">1</span>

<button type="button" class="qty-btn plus">
+
</button>

</div>

<form class="cart-form">

<input
type="hidden"
name="product_id"
value="<?= $p['id'] ?>">

<input
type="hidden"
name="size"
value="<?= $isMeals ? 'regular' : 'slice' ?>">

<input
type="hidden"
name="quantity"
value="1">

<input
type="hidden"
name="add_to_cart"
value="1">

<?php if(strtolower($p['name']) === 'cake customization'): ?>

<a href="customize.php"
class="btn"
style="text-decoration:none;display:block;text-align:center;">

Customize

</a>

<?php else: ?>

<button class="btn">
Add to Cart
</button>

<?php endif; ?>

</form>

</div>

<?php endforeach; ?>

</div>
</div>

<script>

/* SIZE + QTY */
document.querySelectorAll('.card')
.forEach(card=>{

    const sizeBtns =
        card.querySelectorAll('.size-btn');

    const priceBox =
        card.querySelector('.price');

    const form =
        card.querySelector('.cart-form');

    sizeBtns.forEach(btn=>{

        btn.addEventListener('click', ()=>{

            sizeBtns.forEach(b=>
                b.classList.remove('active')
            );

            btn.classList.add('active');

            const type =
                btn.dataset.type;

            const price =
                card.dataset[type];

            priceBox.textContent =
                "₱" +
                parseFloat(price).toFixed(2);

            const isMeals =
                card.dataset.meals == "1";

            /* FIX SIZE VALUE */
            if(isMeals){

                if(type === 'slice'){

                    form.querySelector('[name=size]')
                    .value = 'regular';

                }else if(type === 'small'){

                    form.querySelector('[name=size]')
                    .value = 'meal';

                }else{

                    form.querySelector('[name=size]')
                    .value = 'combo';
                }

            }else{

                form.querySelector('[name=size]')
                .value = type;
            }

        });

    });

    const minus =
        card.querySelector('.minus');

    const plus =
        card.querySelector('.plus');

    const qty =
        card.querySelector('.qty');

    minus.onclick = ()=>{

        let v =
            parseInt(qty.textContent);

        if(v > 1){

            v--;

            qty.textContent = v;

            form.quantity.value = v;
        }
    };

    plus.onclick = ()=>{

        let v =
            parseInt(qty.textContent);

        v++;

        qty.textContent = v;

        form.quantity.value = v;
    };

});

/* AJAX ADD TO CART */
document.querySelectorAll('.cart-form')
.forEach(form=>{

    form.addEventListener(
        'submit',
        function(e){

        e.preventDefault();

        const card =
            form.closest('.card');

        const img =
            card.querySelector('img');

        const cart =
            document.getElementById('cartBtn');

        if(!img){

            sendAjax(form);
            return;
        }

        const clone =
            img.cloneNode(true);

        const r =
            img.getBoundingClientRect();

        const c =
            cart.getBoundingClientRect();

        clone.style.position='fixed';
        clone.style.left=r.left+'px';
        clone.style.top=r.top+'px';
        clone.style.width=r.width+'px';
        clone.style.transition='0.7s';
        clone.style.zIndex=9999;

        document.body.appendChild(clone);

        setTimeout(()=>{

            clone.style.left=c.left+'px';
            clone.style.top=c.top+'px';
            clone.style.width='20px';
            clone.style.opacity='0.5';

        },10);

        setTimeout(()=>{

            clone.remove();

            sendAjax(form);

        },700);

    });

});

/* SEND AJAX */
function sendAjax(form){

    const formData =
        new FormData(form);

    fetch('cart.php', {

        method: 'POST',
        body: formData

    })
    .then(res => res.text())
    .then(()=>{

        let badge =
            document.querySelector('.cart-badge');

        if(badge){

            let count =
                parseInt(badge.textContent) || 0;

            count++;

            badge.textContent = count;
        }

    });

}

</script>

</body>
</html>