<?php
$conn = mysqli_connect('localhost', 'root', '', 'pastry_db');
echo "=== Orders Table Schema ===\n";
$result = mysqli_query($conn, 'DESCRIBE orders');
while ($row = mysqli_fetch_assoc($result)) {
  echo $row['Field'] . ': ' . $row['Type'] . ' (Null: ' . $row['Null'] . ')' . PHP_EOL;
}

echo "\n=== Test Order with user_id ===\n";
$testResult = mysqli_query($conn, "SELECT id, user_id, customer, email FROM orders ORDER BY id DESC LIMIT 5");
while ($row = mysqli_fetch_assoc($testResult)) {
  echo "ID: {$row['id']}, user_id: {$row['user_id']}, customer: {$row['customer']}, email: {$row['email']}" . PHP_EOL;
}
mysqli_close($conn);
?>
