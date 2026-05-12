<?php
require_once 'includes/db.php';

echo "Updating categories...\n";

db_run("UPDATE products SET category = 'Meals' WHERE LOWER(TRIM(category)) = 'meals'");
db_run("UPDATE products SET category = 'Cakes' WHERE LOWER(TRIM(category)) = 'cakes'");

$categories = array_column(db_all("SELECT DISTINCT category FROM products ORDER BY category"), 'category');
echo "Categories now: " . implode(', ', $categories) . "\n";

echo "Done! Delete this file after running.\n";
?>
