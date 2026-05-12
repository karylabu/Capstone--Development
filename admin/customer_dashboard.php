<?php
session_start();
require_once __DIR__ . '/includes/db.php';

$products = db_all("SELECT * FROM products WHERE available = 1");
$categories = array_unique(array_column($products, 'category'));
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Dashboard</title>

<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">

<style>
body{margin:0;font-family:'DM Sans',sans-serif;background:#f4f4f4}

/* NAV */
.top-nav{display:flex;justify-content:space-between;align-items:center;padding:18px 30px;background:#fff;border-bottom:1px solid #eee;}
.left-nav{display:flex;align-items:center;gap:30px}
.brand{display:flex;align-items:center;gap:10px}
.logo{width:40px;height:40px;border-radius:10px}
.brand-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:700}
.brand-name span{color:#e7c46a}
.nav-links{display:flex;gap:20px}
.nav-links a{text-decoration:none;font-size:11px;font-weight:700;letter-spacing:1px;color:#888;}
.nav-links a.active{color:#000;border-bottom:2px solid #e7c46a}

/* RIGHT */
.nav-right{display:flex;align-items:center;gap:12px}

/* SEARCH */
.search-box{position:relative;}
.search-box input{
  padding:8px 12px 8px 30px;
  border-radius:20px;
  border:1px solid #ddd;
  width:180px;
  outline:none;
}

/* NOTIF */
.notif-btn{
  position:relative;
  background:#fff;
  color:#111;
  padding:10px 12px;
  border-radius:10px;
  text-decoration:none;
  border:1px solid #ddd;
  font-size:16px;
}

.notif-badge{
  position:absolute;
  top:-6px;
  right:-6px;
  background:red;
  color:#fff;
  font-size:10px;
  padding:3px 6px;
  border-radius:50%;
}

/* CART */
.cart-btn{position:relative;background:#111;color:#fff;padding:10px 14px;border-radius:10px;text-decoration:none}
.cart-badge{position:absolute;top:-6px;right:-6px;background:red;color:#fff;font-size:10px;padding:3px 6px;border-radius:50%}

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
/* HERO */
.hero-banner{
  background: radial-gradient(circle at 20% 30%, #3b3f45, #1b1e22 70%);
  color:#fff;
  padding:120px 20px 100px;
  text-align:center;
  opacity:0;
  transform:translateY(40px);
  animation:heroFadeUp 1s ease forwards;
}

.hero-sub{font-size:12px;letter-spacing:3px;color:#aaa;margin-bottom:10px;opacity:0;transform:translateY(20px);animation:fadeUp 0.6s ease forwards 0.2s;}
.hero-chef{font-size:11px;letter-spacing:2px;color:#e7c46a;margin-bottom:25px;opacity:0;transform:translateY(20px);animation:fadeUp 0.6s ease forwards 0.4s;}
.hero-title{font-family:'Playfair Display', serif;font-size:60px;line-height:1.2;margin-bottom:20px;opacity:0;transform:translateY(20px);animation:fadeUp 0.6s ease forwards 0.6s;}
.hero-title span{color:#e7c46a;font-style:italic;display:block;}
.hero-desc{max-width:600px;margin:0 auto 30px;font-size:14px;color:#ccc;line-height:1.6;opacity:0;transform:translateY(20px);animation:fadeUp 0.6s ease forwards 0.8s;}
.hero-options{display:flex;justify-content:center;gap:12px;margin-bottom:25px;opacity:0;transform:translateY(20px);animation:fadeUp 0.6s ease forwards 1s;}
.hero-options div{border:1px solid #e7c46a;padding:8px 18px;font-size:12px;border-radius:4px;}
.hero-btn{background:#e7c46a;color:#000;padding:12px 30px;border:none;font-weight:600;cursor:pointer;border-radius:4px;opacity:0;transform:translateY(20px);animation:fadeUp 0.6s ease forwards 1.2s;}

@keyframes heroFadeUp{to{opacity:1;transform:translateY(0);}}
@keyframes fadeUp{to{opacity:1;transform:translateY(0);}}

/* CATEGORY */
.category-tabs{display:flex;gap:10px;overflow-x:auto;padding:20px}
.category-tab{padding:8px 16px;background:#eee;border-radius:20px;cursor:pointer}
.category-tab.active{background:#111;color:#fff}

/* PRODUCTS */
.products{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;padding:20px}
.product-card{background:#fff;padding:15px;border-radius:12px;text-align:center;border:1px solid #ddd}
.product-img{width:100px;height:100px;object-fit:contain}

/* SIZE */
.size-btn{padding:5px 10px;border:1px solid #ccc;background:#fff;border-radius:8px;font-size:11px;cursor:pointer}
.size-btn.active{background:#111;color:#fff}

/* QTY */
.qty-box{display:flex;justify-content:center;align-items:center;gap:10px;margin-top:10px}
.qty-btn{width:28px;height:28px;border:none;background:#111;color:#fff;border-radius:6px;cursor:pointer}
.qty-num{min-width:20px;text-align:center}

/* BUTTON */
.btn{margin-top:10px;padding:10px;background:#111;color:#fff;border:none;border-radius:8px;width:100%;cursor:pointer}
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
      <a href="dashboard.php" class="active">DASHBOARD</a>
      <a href="products.php">PRODUCTS</a>
      <a href="orders.php">ORDERS</a>
    </div>
  </div>

  <div class="nav-right">
    <div class="search-box">
      <input type="text" id="searchInput" placeholder="Search...">
    </div>

    <!-- NOTIF ICON -->
    <a href="notifications.php" class="notif-btn">
      🔔
      <span class="notif-badge" id="notifBadge">0</span>
    </a>


    <!-- CART -->
    <a href="cart.php" class="cart-btn">
      🛒
      <span id="cartCountBadge" class="cart-badge">
        <?= $_SESSION['cart_count'] ?? 0 ?>
      </span>
    </a>

<!-- ACCOUNT -->
<a href="account.php" class="account-btn">
  👤 <?= $_SESSION['user']['name'] ?? 'Account' ?>
</a>
  </div>
</div>

<!-- HERO -->
<div class="hero-banner">
  <div class="hero-sub">PASTRY PROJECT</div>
  <div class="hero-chef">BY CHEF LAWRENCE GOGUANCO</div>

  <div class="hero-title">
    Baked Fresh,<br>
    <span>Made with Love.</span>
  </div>

  <div class="hero-desc">
    What started as a small online shop in 2016 has grown into a full bakeshop and café.
    Today, Pastry Project serves a wide selection of artisan pastries, hearty meals,
    and quality coffee — crafted with passion in every bite.
  </div>

  <div class="hero-options">
    <div>• DINE IN</div>
    <div>• TAKEOUT</div>
    <div>• DELIVERY</div>
  </div>

  <button class="hero-btn">ORDER NOW</button>
</div>

<!-- CATEGORY -->
<div class="category-tabs">
<?php foreach ($categories as $i => $cat): ?>
  <div class="category-tab <?= $i===0?'active':'' ?>" data-cat="<?= $cat ?>">
    <?= $cat ?>
  </div>
<?php endforeach; ?>
</div>

<!-- PRODUCTS -->
<?php foreach ($categories as $i => $cat): ?>
<div class="products category-group" data-cat="<?= $cat ?>" style="<?= $i!==0?'display:none':'' ?>">

<?php foreach ($products as $p):
if ($p['category'] !== $cat) continue;

$imagePath = "uploads/" . $p['image'];
$isMeal = stripos($p['category'], 'meal') !== false;
?>

<div class="product-card"
     data-name="<?= strtolower($p['name']) ?>"
     data-slice="<?= $p['slice_price'] ?>"
     data-small="<?= $p['small_price'] ?>"
     data-big="<?= $p['big_price'] ?>">

<?php if (!empty($p['image']) && file_exists($imagePath)): ?>
<img src="<?= $imagePath ?>" class="product-img">
<?php else: ?>
<div style="font-size:40px">🍰</div>
<?php endif; ?>

<div><?= $p['name'] ?></div>

<div style="display:flex;gap:5px;justify-content:center;margin-top:8px">
  <button type="button" class="size-btn active" data-type="slice">
    <?= $isMeal ? 'Regular' : 'Slice' ?>
  </button>
  <button type="button" class="size-btn" data-type="small">
    <?= $isMeal ? 'Meal' : 'Small' ?>
  </button>
  <button type="button" class="size-btn" data-type="big">
    <?= $isMeal ? 'Combo Meal' : 'Big' ?>
  </button>
</div>

<div class="price">₱<?= number_format($p['slice_price'],2) ?></div>

<div class="qty-box">
  <button type="button" class="qty-btn minus">-</button>
  <div class="qty-num">1</div>
  <button type="button" class="qty-btn plus">+</button>
</div>

<form class="cart-form">
<input type="hidden" name="product_id" value="<?= $p['id'] ?>">
<input type="hidden" name="size" value="slice">
<input type="hidden" name="quantity" value="1">
<button type="submit" class="btn">Add to Cart</button>
</form>

</div>
<?php endforeach; ?>
</div>
<?php endforeach; ?>

<script>
// SEARCH
document.getElementById('searchInput').addEventListener('input', function(){
  const value = this.value.toLowerCase();
  document.querySelectorAll('.product-card').forEach(card=>{
    const name = card.dataset.name;
    card.style.display = name.includes(value) ? 'block' : 'none';
  });
});

// CATEGORY
document.querySelectorAll('.category-tab').forEach(tab=>{
  tab.onclick=()=>{
    document.querySelectorAll('.category-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');

    const cat=tab.dataset.cat;
    document.querySelectorAll('.category-group').forEach(g=>{
      g.style.display = g.dataset.cat===cat?'grid':'none';
    });
  };
});

// SIZE
document.querySelectorAll('.product-card').forEach(card=>{
  const buttons = card.querySelectorAll('.size-btn');
  const priceEl = card.querySelector('.price');
  const sizeInput = card.querySelector('[name=size]');

  buttons.forEach(btn=>{
    btn.onclick=()=>{
      buttons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.dataset.type;
      sizeInput.value = type;

      const val = card.dataset[type] || 0;
      priceEl.innerText = "₱"+Number(val).toFixed(2);
    };
  });
});

// QTY
document.querySelectorAll('.product-card').forEach(card=>{
  const minus=card.querySelector('.minus');
  const plus=card.querySelector('.plus');
  const num=card.querySelector('.qty-num');
  const input=card.querySelector('[name=quantity]');

  minus.onclick=()=>{let v=parseInt(num.innerText); if(v>1){v--; num.innerText=v; input.value=v;}};
  plus.onclick=()=>{let v=parseInt(num.innerText); v++; num.innerText=v; input.value=v;};
});

// CART COUNT
function loadCartCount(){
  fetch('cart_api.php?action=count')
    .then(res=>res.json())
    .then(data=>{
      document.getElementById('cartCountBadge').innerText = data.count || 0;
    });
}
loadCartCount();

// OPTIONAL NOTIF COUNT
function loadNotifCount(){
  fetch('notifications_api.php?action=count')
    .then(res=>res.json())
    .then(data=>{
      document.getElementById('notifBadge').innerText = data.count || 0;
    });
}
loadNotifCount();

// FLY ANIMATION
function flyToCart(img){
  const cart = document.querySelector('.cart-btn');
  if(!img || !cart) return;

  const clone = img.cloneNode(true);
  const rect = img.getBoundingClientRect();
  const cartRect = cart.getBoundingClientRect();

  clone.style.position='fixed';
  clone.style.left=rect.left+'px';
  clone.style.top=rect.top+'px';
  clone.style.width='60px';
  clone.style.height='60px';
  clone.style.transition='all 0.7s ease';
  clone.style.zIndex='9999';

  document.body.appendChild(clone);

  setTimeout(()=>{
    clone.style.left=cartRect.left+'px';
    clone.style.top=cartRect.top+'px';
    clone.style.opacity='0';
  },10);

  setTimeout(()=>clone.remove(),700);
}

// ADD TO CART
document.querySelectorAll('.cart-form').forEach(form=>{
  form.addEventListener('submit', function(e){
    e.preventDefault();

    const card = form.closest('.product-card');
    const img = card.querySelector('img');

    const product_id = form.querySelector('[name=product_id]').value;
    const size = form.querySelector('[name=size]').value;
    const quantity = form.querySelector('[name=quantity]').value;

    fetch('cart_api.php?action=add', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({product_id, size, quantity})
    })
    .then(res=>res.json())
    .then(data=>{
      if(data.success){
        loadCartCount();
        if(img) flyToCart(img);
      }
    });
  });
});
</script>

</body>
</html>