@echo off
REM Test CORS preflight
echo Testing OPTIONS request to api_orders.php
curl -X OPTIONS "http://localhost/Capstone--Development/customer/api_orders.php" -H "Origin: http://localhost:3002" -i
