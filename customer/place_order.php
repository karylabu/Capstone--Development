<?php
session_start();

require '../includes/data.php';

if (!isset($_SESSION['user'])) {

    header("Location: ../login.php");
    exit;
}

$user = $_SESSION['user'];

/* =========================
   ROLE CHECK
========================= */

$role = $user['role'] ?? 'customer';

if ($role !== 'customer') {

    header("Location: products.php");
    exit;
}

/* ================
   JSON BODY (API) PARSING
   ================ */

$rawBody = file_get_contents('php://input');
$jsonBody = null;
if (!empty($rawBody)) {
    $tmp = json_decode($rawBody, true);
    if (is_array($tmp)) {
        $jsonBody = $tmp;
    }
}

/* =========================
   SELECTED ITEMS
========================= */

// accept selected items from POST, JSON body, or session
$selectedKeys =
    $_POST['selected_items']
    ?? ($jsonBody['selected_items'] ?? null)
    ?? $_SESSION['selected_items']
    ?? [];

// normalize
if (!is_array($selectedKeys)) {
    if (is_string($selectedKeys) && trim($selectedKeys) !== '') {
        $selectedKeys = array_values(array_filter(array_map('trim', explode(',', $selectedKeys))));
    } else {
        $selectedKeys = [];
    }
}

if (empty($selectedKeys)) {

    header("Location: cart.php");
    exit;
}

/* SAVE SELECTED */
$_SESSION['selected_items'] =
    $selectedKeys;

/* =========================
   LOAD CART
========================= */

$cartItems =
    $_SESSION['cart'] ?? [];

$filteredItems = [];

foreach ($cartItems as $item) {

    if (
        isset($item['key']) &&
        in_array($item['key'], $selectedKeys)
    ) {

        $item['quantity'] =
            (int)($item['quantity'] ?? 1);

        $item['price'] =
            (float)($item['price'] ?? 0);

        $item['subtotal'] =
            $item['quantity'] *
            $item['price'];

        /* SIZE LABEL */
        $size =
            strtolower($item['size'] ?? '');

        $category =
            strtolower(
                $item['product']['category']
                ?? ''
            );

        if ($category === 'meals') {

            $item['size_label'] = match($size){

                'regular' => 'Regular',
                'meal'    => 'Meal',
                'combo'   => 'Combo Meal',

                default   => 'Regular'
            };

        } else {

            $item['size_label'] = match($size){

                'slice' => 'Slice',
                'small' => 'Small',
                'big'   => 'Big',

                default => ''
            };
        }

        $filteredItems[] = $item;
    }
}

/* =========================
   EMPTY CHECK
========================= */

if (empty($filteredItems)) {

    header("Location: cart.php");
    exit;
}

/* =========================
   PLACE ORDER
========================= */

if (
    $_SERVER['REQUEST_METHOD'] === 'POST'
    && isset($_POST['place_order'])
) {

    $address =
        trim($_POST['address'] ?? '');

    $payment =
        trim($_POST['payment'] ?? 'COD');

    if ($address === '') {

        $_SESSION['error'] =
            'Delivery address is required';

        header("Location: checkout.php");
        exit;
    }

    /* BUILD ITEMS */

    $items = [];

    foreach ($filteredItems as $item) {

        $items[] = [

            'product' =>
                $item['name']
                ?? 'Product',

            'qty' =>
                (int)$item['quantity'],

            'price' =>
                (float)$item['price']
        ];
    }

    /* SAVE TO DATABASE */

    $orderId = db_place_order([

        'customer' =>
            $user['name'] ?? 'Customer',

        'email' =>
            $user['email'] ?? '',

        'type' =>
            'Delivery',

        'payment' =>
            $payment,

        'address' =>
            $address,

        'items' =>
            $items

    ]);

    /* =========================
       REMOVE ORDERED ITEMS
    ========================= */

    foreach ($selectedKeys as $key) {

        if (isset($_SESSION['cart'][$key])) {

            unset($_SESSION['cart'][$key]);
        }
    }

    /* UPDATE CART COUNT */

    $_SESSION['cart_count'] =
        get_cart_count();

    /* CLEAR */

    unset($_SESSION['selected_items']);

    $_SESSION['success'] =
        'Order placed successfully';

    /* =========================
       SUCCESS REDIRECT
    ========================= */

    header("Location: orders.php");
    exit;
}

// JSON API variant: accepts { address, payment, items, selected_items }
if ($jsonBody && isset($jsonBody['items'])) {

    $address = trim($jsonBody['address'] ?? '');
    $payment = trim($jsonBody['payment'] ?? 'COD');

    if ($address === '') {
        header('Content-Type: application/json', true, 400);
        echo json_encode(['status' => 'error', 'message' => 'Delivery address is required']);
        exit;
    }

    // Build items either from provided JSON items or from filtered session cart
    $items = [];

    if (!empty($jsonBody['items']) && is_array($jsonBody['items'])) {
        foreach ($jsonBody['items'] as $it) {
            $items[] = [
                'product' => $it['product'] ?? 'Product',
                'qty' => (int)($it['qty'] ?? $it['quantity'] ?? 1),
                'price' => (float)($it['price'] ?? 0),
            ];
        }
    } else {
        foreach ($filteredItems as $item) {
            $items[] = [
                'product' => $item['name'] ?? 'Product',
                'qty' => (int)$item['quantity'],
                'price' => (float)$item['price']
            ];
        }
    }

    try {
        $orderId = db_place_order([
            'customer' => $user['name'] ?? 'Customer',
            'email' => $user['email'] ?? '',
            'type' => 'Delivery',
            'payment' => $payment,
            'address' => $address,
            'items' => $items
        ]);

        // remove ordered items from session cart when keys provided
        if (!empty($selectedKeys) && is_array($selectedKeys)) {
            foreach ($selectedKeys as $key) {
                if (isset($_SESSION['cart'][$key])) {
                    unset($_SESSION['cart'][$key]);
                }
            }
        }

        $_SESSION['cart_count'] = get_cart_count();
        unset($_SESSION['selected_items']);

        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'order_id' => $orderId]);
        exit;

    } catch (Throwable $e) {
        header('Content-Type: application/json', true, 500);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        exit;
    }
}

/* =========================
   INVALID ACCESS
========================= */

header("Location: cart.php");
exit;
?>