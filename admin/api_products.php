<?php
require_once "includes/db.php";

header("Content-Type: application/json");

$action = $_GET['action'] ?? "list";

/* =========================
   LIST PRODUCTS
========================= */
if ($action === "list") {

    $result = mysqli_query($conn, "SELECT * FROM products ORDER BY id DESC");

    $data = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }

    echo json_encode($data);
    exit;
}

/* =========================
   ADD PRODUCT
========================= */
if ($action === "add") {

    $name = $_POST['name'];
    $category = $_POST['category'];
    $price = $_POST['price'] ?? 0;
    $solo_price = $_POST['solo_price'] ?? 0;
    $sharing_price = $_POST['sharing_price'] ?? 0;
    $stock = $_POST['stock'] ?? 0;
    $description = $_POST['description'] ?? '';
    $available = $_POST['available'] ?? 1;
    $slice_price = $_POST['slice_price'] ?? 0;
    $small_price = $_POST['small_price'] ?? 0;
    $big_price = $_POST['big_price'] ?? 0;
    $meal_price = $_POST['meal_price'] ?? 0;
    $combo_price = $_POST['combo_price'] ?? 0;
    $tag = $_POST['tag'] ?? '';
    $is_custom = $_POST['is_custom'] ?? 0;
    $reorder_level = $_POST['reorder_level'] ?? 0;

    $image = "";

    if (!empty($_FILES['image']['name'])) {
        $image = time() . "_" . $_FILES['image']['name'];
        move_uploaded_file($_FILES['image']['tmp_name'], "../uploads/" . $image);
    }

    $sql = "INSERT INTO products (
        name, category, price,
        solo_price, sharing_price,
        stock, image, description,
        available, slice_price,
        small_price, big_price,
        meal_price, combo_price,
        tag, is_custom, reorder_level
    ) VALUES (
        '$name', '$category', '$price',
        '$solo_price', '$sharing_price',
        '$stock', '$image', '$description',
        '$available', '$slice_price',
        '$small_price', '$big_price',
        '$meal_price', '$combo_price',
        '$tag', '$is_custom', '$reorder_level'
    )";

    mysqli_query($conn, $sql);

    echo json_encode(["message" => "Product added"]);
    exit;
}

/* =========================
   UPDATE PRODUCT
========================= */
if ($action === "update") {

    $id = $_POST['id'];

    $sql = "UPDATE products SET
        name='$_POST[name]',
        category='$_POST[category]',
        price='$_POST[price]',
        solo_price='$_POST[solo_price]',
        sharing_price='$_POST[sharing_price]',
        stock='$_POST[stock]',
        description='$_POST[description]',
        available='$_POST[available]',
        slice_price='$_POST[slice_price]',
        small_price='$_POST[small_price]',
        big_price='$_POST[big_price]',
        meal_price='$_POST[meal_price]',
        combo_price='$_POST[combo_price]',
        tag='$_POST[tag]',
        is_custom='$_POST[is_custom]',
        reorder_level='$_POST[reorder_level]'
        WHERE id=$id
    ";

    mysqli_query($conn, $sql);

    echo json_encode(["message" => "Updated"]);
    exit;
}

/* =========================
   DELETE PRODUCT
========================= */
if ($action === "delete") {

    $id = $_POST['id'];

    mysqli_query($conn, "DELETE FROM products WHERE id=$id");

    echo json_encode(["message" => "Deleted"]);
    exit;
}
?>