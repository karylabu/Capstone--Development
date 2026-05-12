<?php
session_start();
require_once __DIR__ . '/../includes/db.php';

// BLOCK NON ADMIN
if(($_SESSION['user']['role'] ?? '') !== 'admin'){
    header("Location: ../products.php");
    exit;
}

/* =========================
   ADD PRODUCT
========================= */
if(isset($_POST['add_product'])){

    $image = '';

    if(!empty($_FILES['image']['name'])){

        $uploadDir = __DIR__ . '/../uploads/';

        if(!is_dir($uploadDir)){
            mkdir($uploadDir, 0777, true);
        }

        $filename = time() . '_' . basename($_FILES['image']['name']);

        if(move_uploaded_file(
            $_FILES['image']['tmp_name'],
            $uploadDir . $filename
        )){
            $image = $filename;
        }
    }

    db_run(
        "INSERT INTO products
        (name, category, slice_price, small_price, big_price, available, image)
        VALUES(?,?,?,?,?,?,?)",
        [
            $_POST['name'],
            $_POST['category'],
            $_POST['slice_price'],
            $_POST['small_price'],
            $_POST['big_price'],
            $_POST['available'],
            $image
        ]
    );

    header("Location: admin_products.php");
    exit;
}

/* =========================
   UPDATE PRODUCT
========================= */
if(isset($_POST['update_product'])){

    $id = (int)($_POST['id'] ?? 0);

    $name         = trim($_POST['name'] ?? '');
    $category     = trim($_POST['category'] ?? '');
    $slice_price  = (float)($_POST['slice_price'] ?? 0);
    $small_price  = (float)($_POST['small_price'] ?? 0);
    $big_price    = (float)($_POST['big_price'] ?? 0);
    $available    = (int)($_POST['available'] ?? 0);

    $image = $_POST['old_image'] ?? '';

    if(!empty($_FILES['image']['name'])){

        $uploadDir = __DIR__ . '/../uploads/';

        if(!is_dir($uploadDir)){
            mkdir($uploadDir, 0777, true);
        }

        $filename = time() . '_' . basename($_FILES['image']['name']);

        if(move_uploaded_file(
            $_FILES['image']['tmp_name'],
            $uploadDir . $filename
        )){
            $image = $filename;
        }
    }

    db_run(
        "UPDATE products SET
            name=?,
            category=?,
            slice_price=?,
            small_price=?,
            big_price=?,
            available=?,
            image=?
        WHERE id=?",
        [
            $name,
            $category,
            $slice_price,
            $small_price,
            $big_price,
            $available,
            $image,
            $id
        ]
    );

    header("Location: admin_products.php");
    exit;
}

/* =========================
   DELETE PRODUCT
========================= */
if(isset($_POST['delete_product'])){

    db_run(
        "DELETE FROM products WHERE id=?",
        [(int)$_POST['id']]
    );

    header("Location: admin_products.php");
    exit;
}

/* =========================
   FILTER
========================= */
$filterCat = $_GET['cat'] ?? 'all';

if($filterCat === 'all'){

    $products = db_all("SELECT * FROM products ORDER BY id DESC");

}else{

    $products = db_all(
        "SELECT * FROM products WHERE category=? ORDER BY id DESC",
        [$filterCat]
    );
}

$categories = array_column(
    db_all("SELECT DISTINCT category FROM products"),
    'category'
);
?>

<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Admin Products</title>

<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

body{
    font-family:'DM Sans',sans-serif;
    background:#f5f5f5;
    color:#111;
}

.top-nav{
    position:sticky;
    top:0;
    z-index:999;
    background:#fff;
    border-bottom:1px solid #eee;
    padding:16px 28px;
    display:flex;
    justify-content:space-between;
    align-items:center;
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
    color:#d8aa45;
}

.nav-links{
    display:flex;
    gap:18px;
}

.nav-links a{
    text-decoration:none;
    color:#777;
    font-size:11px;
    font-weight:700;
    letter-spacing:.5px;
}

.nav-links a.active{
    color:#000;
}

.container{
    padding:30px;
}

.page-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:20px;
}

.page-title{
    font-family:'Playfair Display',serif;
    font-size:30px;
    font-weight:700;
}

.add-btn{
    background:#111;
    color:#fff;
    border:none;
    border-radius:10px;
    padding:11px 18px;
    cursor:pointer;
    font-size:13px;
    font-weight:600;
}

.filters{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    margin-bottom:24px;
}

.filters a{
    padding:8px 14px;
    background:#ececec;
    border-radius:20px;
    text-decoration:none;
    color:#666;
    font-size:12px;
}

.filters a.active{
    background:#111;
    color:#fff;
}

.products{
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(250px,1fr));
    gap:18px;
}

.card{
    background:#fff;
    border-radius:18px;
    border:1px solid #eee;
    padding:18px;
}

.card.unavailable{
    opacity:.6;
    filter:grayscale(100%);
    background:#ddd;
}

.card img{
    width:100%;
    height:170px;
    object-fit:contain;
}

.product-title{
    font-family:'Playfair Display',serif;
    font-size:19px;
    margin-top:10px;
    margin-bottom:12px;
}

.size-wrap{
    display:flex;
    gap:6px;
    margin-bottom:14px;
}

.size-btn{
    padding:6px 10px;
    border:1px solid #ddd;
    background:#fff;
    border-radius:8px;
    font-size:11px;
    cursor:pointer;
}

.size-btn.active{
    background:#111;
    color:#fff;
}

.price{
    font-size:28px;
    font-weight:700;
    margin-bottom:14px;
}

.btn{
    width:100%;
    border:none;
    border-radius:10px;
    padding:11px;
    cursor:pointer;
    font-size:13px;
    font-weight:600;
}

.edit-btn{
    background:#111;
    color:#fff;
    margin-bottom:8px;
}

.delete-btn{
    background:#fee2e2;
    color:#dc2626;
}

.modal{
    display:none;
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.5);
    z-index:9999;
    justify-content:center;
    align-items:center;
    padding:20px;
}

.modal.open{
    display:flex;
}

.modal-box{
    background:#fff;
    width:100%;
    max-width:520px;
    border-radius:18px;
    padding:24px;
    max-height:90vh;
    overflow-y:auto;
}

.modal-title{
    font-family:'Playfair Display',serif;
    font-size:24px;
    margin-bottom:20px;
}

.modal-box label{
    display:block;
    font-size:12px;
    font-weight:700;
    margin-bottom:6px;
    color:#555;
}

.modal-box input,
.modal-box select{
    width:100%;
    padding:12px;
    border:1px solid #ddd;
    border-radius:10px;
    margin-bottom:15px;
}

.modal-actions{
    display:flex;
    justify-content:flex-end;
    gap:10px;
}

.cancel-btn{
    background:#eee;
}

.save-btn{
    background:#111;
    color:#fff;
}

.unavailable-label{
    background:#dc2626;
    color:#fff;
    padding:6px 10px;
    border-radius:8px;
    font-size:11px;
    display:inline-block;
    margin-bottom:10px;
}

</style>
</head>
<body>

<div class="top-nav">

    <div class="left-nav">

        <div class="brand">

            <img src="../uploads/logo.jpg" class="logo">

            <div class="brand-name">
                Pastry <span>Project</span>
            </div>

        </div>

        <div class="nav-links">
            <a href="admin_dashboard.php">DASHBOARD</a>
            <a href="admin_products.php" class="active">PRODUCTS</a>
            <a href="admin_orders.php">ORDERS</a>
        </div>

    </div>

</div>

<div class="container">

    <div class="page-header">

        <div class="page-title">
            Admin Products
        </div>

        <button class="add-btn"
                onclick="openModal('addModal')">
            + Add Product
        </button>

    </div>

    <div class="filters">

        <a href="?cat=all"
           class="<?= $filterCat === 'all' ? 'active' : '' ?>">
           All
        </a>

        <?php foreach($categories as $cat): ?>

            <a href="?cat=<?= urlencode($cat) ?>"
               class="<?= $filterCat === $cat ? 'active' : '' ?>">
                <?= htmlspecialchars($cat) ?>
            </a>

        <?php endforeach; ?>

    </div>

    <div class="products">

        <?php foreach($products as $p): ?>

        <div class="card <?= !$p['available'] ? 'unavailable' : '' ?>"
             data-slice="<?= $p['slice_price'] ?>"
             data-small="<?= $p['small_price'] ?>"
             data-big="<?= $p['big_price'] ?>">

            <?php
            $imagePath = __DIR__ . '/../uploads/' . $p['image'];
            ?>

            <?php if(!empty($p['image']) && file_exists($imagePath)): ?>

                <img src="../uploads/<?= htmlspecialchars($p['image']) ?>">

            <?php else: ?>

                <img src="https://via.placeholder.com/250x170?text=No+Image">

            <?php endif; ?>

            <?php if(!$p['available']): ?>
                <div class="unavailable-label">
                    UNAVAILABLE
                </div>
            <?php endif; ?>

            <div class="product-title">
                <?= htmlspecialchars($p['name']) ?>
            </div>

            <div class="size-wrap">
                <button class="size-btn active" type="button">Slice</button>
                <button class="size-btn" type="button">Small</button>
                <button class="size-btn" type="button">Big</button>
            </div>

            <div class="price">
                ₱<?= number_format($p['slice_price'],2) ?>
            </div>

            <button type="button"
                    class="btn edit-btn"
                    onclick="openModal('edit<?= $p['id'] ?>')">
                Edit Product
            </button>

            <form method="POST"
                  onsubmit="return confirm('Delete this product? This cannot be undone.')">

                <input type="hidden" name="id" value="<?= $p['id'] ?>">
                <input type="hidden" name="delete_product" value="1">

                <button type="submit" class="btn delete-btn">
                    Delete Product
                </button>

            </form>

        </div>

        <!-- EDIT MODAL -->
        <div class="modal" id="edit<?= $p['id'] ?>">

            <div class="modal-box">

                <div class="modal-title">
                    Edit Product
                </div>

                <form method="POST" enctype="multipart/form-data">

                    <input type="hidden" name="id" value="<?= $p['id'] ?>">
                    <input type="hidden" name="old_image" value="<?= htmlspecialchars($p['image']) ?>">
                    <input type="hidden" name="update_product" value="1">

                    <label>Product Name</label>
                    <input type="text"
                           name="name"
                           value="<?= htmlspecialchars($p['name']) ?>"
                           required>

                    <label>Category</label>
                    <input type="text"
                           name="category"
                           value="<?= htmlspecialchars($p['category']) ?>"
                           required>

                    <label>Slice Price</label>
                    <input type="number"
                           step="0.01"
                           min="0"
                           name="slice_price"
                           value="<?= $p['slice_price'] ?>">

                    <label>Small Price</label>
                    <input type="number"
                           step="0.01"
                           min="0"
                           name="small_price"
                           value="<?= $p['small_price'] ?>">

                    <label>Big Price</label>
                    <input type="number"
                           step="0.01"
                           min="0"
                           name="big_price"
                           value="<?= $p['big_price'] ?>">

                    <label>Status</label>
                    <select name="available">
                        <option value="1" <?= $p['available'] ? 'selected' : '' ?>>
                            Available
                        </option>

                        <option value="0" <?= !$p['available'] ? 'selected' : '' ?>>
                            Unavailable
                        </option>
                    </select>

                    <label>Image</label>
                    <input type="file" name="image" accept="image/*">

                    <div class="modal-actions">

                        <button type="button"
                                class="btn cancel-btn"
                                onclick="closeModal('edit<?= $p['id'] ?>')">
                            Cancel
                        </button>

                        <button type="submit"
                                class="btn save-btn">
                            Save Product
                        </button>

                    </div>

                </form>

            </div>

        </div>

        <?php endforeach; ?>

    </div>

</div>

<!-- ADD MODAL -->
<div class="modal" id="addModal">

    <div class="modal-box">

        <div class="modal-title">
            Add Product
        </div>

        <form method="POST" enctype="multipart/form-data">

            <input type="hidden" name="add_product" value="1">

            <label>Product Name</label>
            <input type="text" name="name" required>

            <label>Category</label>
            <input type="text" name="category" required>

            <label>Slice Price</label>
            <input type="number" step="0.01" min="0" name="slice_price" value="0">

            <label>Small Price</label>
            <input type="number" step="0.01" min="0" name="small_price" value="0">

            <label>Big Price</label>
            <input type="number" step="0.01" min="0" name="big_price" value="0">

            <label>Status</label>
            <select name="available">
                <option value="1">Available</option>
                <option value="0">Unavailable</option>
            </select>

            <label>Image</label>
            <input type="file" name="image" accept="image/*">

            <div class="modal-actions">

                <button type="button"
                        class="btn cancel-btn"
                        onclick="closeModal('addModal')">
                    Cancel
                </button>

                <button type="submit"
                        class="btn save-btn">
                    Add Product
                </button>

            </div>

        </form>

    </div>

</div>

<script>

function openModal(id){
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(id){
    document.getElementById(id).classList.remove('open');
    document.body.style.overflow = '';
}

document.querySelectorAll('.modal').forEach(function(modal){

    modal.addEventListener('click', function(e){

        if(e.target === modal){
            modal.classList.remove('open');
            document.body.style.overflow = '';
        }

    });

});

document.addEventListener('keydown', function(e){

    if(e.key === 'Escape'){

        document.querySelectorAll('.modal.open').forEach(function(modal){
            modal.classList.remove('open');
        });

        document.body.style.overflow = '';
    }

});

document.querySelectorAll('.card').forEach(function(card){

    var sizeBtns = card.querySelectorAll('.size-btn');
    var priceBox = card.querySelector('.price');

    var prices = {
        slice: parseFloat(card.dataset.slice) || 0,
        small: parseFloat(card.dataset.small) || 0,
        big: parseFloat(card.dataset.big) || 0
    };

    var types = ['slice', 'small', 'big'];

    sizeBtns.forEach(function(btn, index){

        btn.addEventListener('click', function(){

            sizeBtns.forEach(function(b){
                b.classList.remove('active');
            });

            btn.classList.add('active');

            priceBox.textContent =
                '₱' + prices[types[index]].toFixed(2);

        });

    });

});

</script>

</body>
</html>