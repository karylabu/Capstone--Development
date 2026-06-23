@echo off
REM Test order placement with user_id

setlocal enabledelayedexpansion

echo.
echo === Test 1: Place order with user_id=2 (customer@pastry.com) ===
echo.

curl -X POST "http://localhost/Capstone--Development/customer/api_orders.php" ^
  -H "Content-Type: application/json" ^
  -H "Origin: http://localhost:3002" ^
  -d "{\"items\":[{\"name\":\"Test Cake\",\"qty\":1,\"price\":150}],\"subtotal\":150,\"delivery_fee\":50,\"total\":200,\"method\":\"Deliver\",\"payment\":\"COD\",\"address\":\"123 Test St\",\"phone\":\"09123456789\",\"latitude\":13.7,\"longitude\":121.0,\"user_id\":2,\"customer\":\"Customer\",\"email\":\"customer@pastry.com\"}"

echo.
echo.
echo === Test 2: Fetch orders for user_id=2 ===
echo.

curl -X GET "http://localhost/Capstone--Development/customer/api_get_orders.php?user_id=2" ^
  -H "Origin: http://localhost:3002"

echo.
echo.
echo === Test 3: Fetch orders for user_id=3 (different user - should return nothing) ===
echo.

curl -X GET "http://localhost/Capstone--Development/customer/api_get_orders.php?user_id=3" ^
  -H "Origin: http://localhost:3002"

echo.
echo === End Test ===
