<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class CustomerApiController extends Controller
{
    public function __construct()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        require_once base_path('../includes/data.php');
        require_once base_path('../includes/db.php');
    }

    protected function corsResponse($payload, int $status = 200)
    {
        return response()->json($payload, $status)
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type');
    }

    protected function parseJson(Request $request): array
    {
        $data = $request->json()->all();
        if (empty($data)) {
            $data = json_decode($request->getContent(), true) ?? [];
        }
        return is_array($data) ? $data : [];
    }

    public function products(Request $request)
    {
        if ($request->isMethod('options')) {
            return $this->corsResponse(['success' => true]);
        }

        $action = $request->query('action', 'list');

        if ($action === 'customize' && $request->isMethod('post')) {
            $form = array_merge($request->all(), $this->parseJson($request));
            $flavor = trim($form['flavor'] ?? '');
            $tiers = trim($form['tiers'] ?? '');
            $dedication = trim($form['dedication'] ?? '');
            $method = trim($form['method'] ?? '');
            $date = trim($form['date'] ?? '');
            $time = trim($form['time'] ?? '');
            $notes = trim($form['notes'] ?? '');

            $uploadedImages = [];
            if ($request->hasFile('inspo_images')) {
                foreach ($request->file('inspo_images') as $index => $file) {
                    if ($file->isValid()) {
                        $name = 'inspo_' . time() . '_' . $index . '.' . $file->extension();
                        $destination = public_path('uploads/inspo');
                        if (!is_dir($destination)) {
                            mkdir($destination, 0777, true);
                        }
                        $file->move($destination, $name);
                        $uploadedImages[] = $name;
                    }
                }
            }

            $orderId = DB::table('orders')->insertGetId([
                'customer' => $form['customer'] ?? 'Guest Customer',
                'email' => $form['email'] ?? 'guest@email.com',
                'type' => 'Custom',
                'status' => 'Pending',
                'total' => 0,
                'payment' => $form['payment'] ?? 'COD',
                'address' => $form['address'] ?? '',
                'notes' => $notes,
                'order_date' => now()->toDateString(),
                'is_customized' => 1,
            ]);

            DB::table('custom_cake_orders')->insert([
                'order_id' => $orderId,
                'flavor' => $flavor,
                'tiers' => $tiers,
                'dedication' => $dedication,
                'delivery_method' => $method,
                'delivery_date' => $date,
                'delivery_time' => $time,
                'notes' => $notes,
                'inspo_images' => json_encode($uploadedImages),
            ]);

            return $this->corsResponse([
                'success' => true,
                'message' => 'Custom cake request submitted successfully!',
                'order_id' => $orderId,
            ]);
        }

        $db = getDB();
        $products = array_values(array_filter($db['products'] ?? [], fn($item) => isset($item['available']) && $item['available']));

        return $this->corsResponse($products);
    }

    public function login(Request $request)
    {
        if ($request->isMethod('options')) {
            return $this->corsResponse(['success' => true]);
        }

        $data = $this->parseJson($request);
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (!$email || !$password) {
            return $this->corsResponse(['success' => false, 'message' => 'Please fill all fields.']);
        }

        $user = DB::table('users')->where('email', $email)->first();
        if (!$user) {
            return $this->corsResponse(['success' => false, 'message' => 'User not found.']);
        }

        $passwordValid = ($password === $user->password) || password_verify($password, $user->password);
        if (!$passwordValid) {
            return $this->corsResponse(['success' => false, 'message' => 'Incorrect password.']);
        }

        return $this->corsResponse([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    public function forgotPassword(Request $request)
    {
        if ($request->isMethod('options')) {
            return $this->corsResponse(['success' => true]);
        }

        $data = $this->parseJson($request);
        $email = trim($data['email'] ?? '');

        if (!$email) {
            return $this->corsResponse(['success' => false, 'message' => 'Email is required.']);
        }

        DB::statement("CREATE TABLE IF NOT EXISTS password_resets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(6) NOT NULL,
            expires_at DATETIME NOT NULL,
            used TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        $userExists = DB::table('users')->where('email', $email)->exists();
        if (!$userExists) {
            return $this->corsResponse(['success' => true]);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        DB::table('password_resets')->where('email', $email)->update(['used' => 1]);
        DB::table('password_resets')->insert([
            'email' => $email,
            'token' => $code,
            'expires_at' => now()->addMinutes(15),
        ]);

        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = env('MAIL_HOST', 'smtp.gmail.com');
            $mail->SMTPAuth = true;
            $mail->Username = env('MAIL_USERNAME');
            $mail->Password = env('MAIL_PASSWORD');
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = env('MAIL_PORT', 587);

            $mail->setFrom(env('MAIL_FROM_ADDRESS', 'no-reply@example.com'), env('MAIL_FROM_NAME', 'Pastry Project'));
            $mail->addAddress($email);
            $mail->isHTML(true);
            $mail->Subject = 'Your Password Reset Code';
            $mail->Body = "<div style='font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border-radius:24px;border:1px solid #f0f0f0;'>
                <p style='font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#d4af37;margin-bottom:8px;'>Pastry Project</p>
                <h2 style='font-size:28px;color:#111;margin-bottom:16px;'>Password Reset</h2>
                <p style='color:#666;font-size:14px;margin-bottom:24px;'>Use the code below to reset your password. It expires in <strong>15 minutes</strong>.</p>
                <div style='font-size:42px;font-weight:900;letter-spacing:0.2em;color:#111;background:#f5f6fa;border-radius:16px;padding:20px;text-align:center;margin-bottom:24px;'>
                    {$code}
                </div>
                <p style='color:#aaa;font-size:12px;'>If you didn't request this, you can safely ignore this email.</p>
            </div>";
            $mail->AltBody = "Your password reset code is: {$code}. It expires in 15 minutes.";
            $mail->send();
        } catch (Exception $e) {
            // We still respond success to avoid email enumeration.
            return $this->corsResponse(['success' => true]);
        }

        return $this->corsResponse(['success' => true]);
    }

    public function verifyResetCode(Request $request)
    {
        if ($request->isMethod('options')) {
            return $this->corsResponse(['success' => true]);
        }

        $data = $this->parseJson($request);
        $email = trim($data['email'] ?? '');
        $code = trim($data['code'] ?? '');

        if (!$email || !$code) {
            return $this->corsResponse(['success' => false, 'message' => 'Email and code are required.']);
        }

        $valid = DB::table('password_resets')
            ->where('email', $email)
            ->where('token', $code)
            ->where('used', 0)
            ->where('expires_at', '>', now())
            ->orderByDesc('created_at')
            ->exists();

        return $this->corsResponse(['success' => $valid, 'message' => $valid ? null : 'Invalid or expired code.']);
    }

    public function resetPassword(Request $request)
    {
        if ($request->isMethod('options')) {
            return $this->corsResponse(['success' => true]);
        }

        $data = $this->parseJson($request);
        $email = trim($data['email'] ?? '');
        $code = trim($data['code'] ?? '');
        $newPassword = trim($data['new_password'] ?? '');

        if (!$email || !$code || !$newPassword) {
            return $this->corsResponse(['success' => false, 'message' => 'All fields are required.']);
        }

        if (strlen($newPassword) < 6) {
            return $this->corsResponse(['success' => false, 'message' => 'Password must be at least 6 characters.']);
        }

        $valid = DB::table('password_resets')
            ->where('email', $email)
            ->where('token', $code)
            ->where('used', 0)
            ->where('expires_at', '>', now())
            ->exists();

        if (!$valid) {
            return $this->corsResponse(['success' => false, 'message' => 'Code expired. Please request a new one.']);
        }

        DB::table('users')->where('email', $email)->update(['password' => bcrypt($newPassword)]);
        DB::table('password_resets')->where('email', $email)->update(['used' => 1]);

        return $this->corsResponse(['success' => true]);
    }

    public function createOrder(Request $request)
    {
        $data = $this->parseJson($request);

        $items = $data['items'] ?? [];
        $subtotal = floatval($data['subtotal'] ?? 0);
        $delivery = floatval($data['delivery_fee'] ?? 0);
        $total = floatval($data['total'] ?? 0);
        $method = trim($data['method'] ?? '');
        $payment = trim($data['payment'] ?? '');
        $address = trim($data['address'] ?? '');
        $phone = trim($data['phone'] ?? '');
        $latitude = floatval($data['latitude'] ?? 0);
        $longitude = floatval($data['longitude'] ?? 0);

        $orderId = DB::table('orders')->insertGetId([
            'items' => json_encode($items),
            'subtotal' => $subtotal,
            'delivery_fee' => $delivery,
            'total' => $total,
            'method' => $method,
            'payment' => $payment,
            'address' => $address,
            'phone' => $phone,
            'lat' => $latitude,
            'lng' => $longitude,
            'status' => 'Pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->corsResponse(['status' => 'success', 'order_id' => $orderId]);
    }

    public function getOrders(Request $request)
    {
        $orders = DB::table('orders')->orderByDesc('created_at')->get()->map(function ($row) {
            return [
                'id' => $row->id,
                'items' => json_decode($row->items ?? '[]', true) ?: [],
                'subtotal' => floatval($row->subtotal ?? 0),
                'delivery_fee' => floatval($row->delivery_fee ?? 0),
                'total' => floatval($row->total ?? 0),
                'method' => $row->method,
                'payment' => $row->payment,
                'address' => $row->address,
                'phone' => $row->phone,
                'lat' => floatval($row->lat ?? 0),
                'lng' => floatval($row->lng ?? 0),
                'status' => $row->status ?? 'Pending',
                'created_at' => $row->created_at,
            ];
        });

        return $this->corsResponse($orders);
    }

    public function cancelOrder(Request $request)
    {
        if ($request->isMethod('options')) {
            return $this->corsResponse(['success' => true]);
        }

        $data = $this->parseJson($request);
        $orderId = intval($data['order_id'] ?? 0);

        if (!$orderId) {
            return $this->corsResponse(['success' => false, 'message' => 'Invalid order ID.']);
        }

        $status = DB::table('orders')->where('id', $orderId)->value('status');
        if (!$status) {
            return $this->corsResponse(['success' => false, 'message' => 'Order not found.']);
        }

        if ($status !== 'Pending') {
            return $this->corsResponse(['success' => false, 'message' => 'Only pending orders can be cancelled.']);
        }

        DB::table('orders')->where('id', $orderId)->update(['status' => 'Cancelled']);
        return $this->corsResponse(['success' => true]);
    }

    public function confirmReceived(Request $request)
    {
        if ($request->isMethod('options')) {
            return $this->corsResponse(['success' => true]);
        }

        $data = $this->parseJson($request);
        $orderId = intval($data['order_id'] ?? 0);

        if (!$orderId) {
            return $this->corsResponse(['success' => false, 'message' => 'Invalid order ID.']);
        }

        $status = DB::table('orders')->where('id', $orderId)->value('status');
        if (!$status) {
            return $this->corsResponse(['success' => false, 'message' => 'Order not found.']);
        }

        if ($status !== 'To Receive') {
            return $this->corsResponse(['success' => false, 'message' => 'Order is not ready to be confirmed.']);
        }

        DB::table('orders')->where('id', $orderId)->update(['status' => 'Completed']);
        return $this->corsResponse(['success' => true]);
    }

    public function users(Request $request)
    {
        if ($request->isMethod('options')) {
            return $this->corsResponse(['success' => true]);
        }

        if ($request->isMethod('get')) {
            $users = DB::table('users')->select('id', 'name', 'email', 'role', 'created_at')->orderByDesc('created_at')->get();
            return $this->corsResponse($users);
        }

        $data = $this->parseJson($request);
        $action = $data['action'] ?? '';
        $userId = intval($data['user_id'] ?? 0);

        if ($action === 'delete' && $userId) {
            DB::table('users')->where('id', $userId)->delete();
            return $this->corsResponse(['status' => 'success', 'message' => 'User deleted']);
        }

        return $this->corsResponse(['status' => 'error', 'message' => 'Invalid action']);
    }

    public function chatFetch(Request $request)
    {
        if ($request->isMethod('options')) {
            return $this->corsResponse(['success' => true, 'messages' => []]);
        }

        $orderId = intval($request->query('order_id', 0));
        if (!$orderId) {
            return $this->corsResponse(['success' => false, 'messages' => []]);
        }

        DB::table('messages')->where('order_id', $orderId)->where('sender', 'customer')->update(['is_read' => 1]);
        $messages = DB::table('messages')->select('id', 'sender', 'message', 'is_read', 'created_at')->where('order_id', $orderId)->orderBy('created_at')->get();

        return $this->corsResponse(['success' => true, 'messages' => $messages]);
    }

    public function chatSend(Request $request)
    {
        if ($request->isMethod('options')) {
            return $this->corsResponse(['success' => true, 'ai_reply' => null]);
        }

        $data = $this->parseJson($request);
        $orderId = intval($data['order_id'] ?? 0);
        $message = trim($data['message'] ?? '');
        $sender = $data['sender'] ?? 'customer';

        if (!$orderId || !$message) {
            return $this->corsResponse(['success' => false, 'message' => 'Invalid input']);
        }

        if (!in_array($sender, ['customer', 'staff'])) {
            $sender = 'customer';
        }

        DB::table('messages')->insert(['order_id' => $orderId, 'sender' => $sender, 'message' => $message, 'created_at' => now(), 'updated_at' => now()]);

        $aiReply = null;
        if ($sender === 'customer') {
            $order = DB::table('orders')->select('id', 'items', 'status', 'total', 'method', 'address', 'created_at')->where('id', $orderId)->first();
            if ($order) {
                $orderContext = "Order #{$order->id} | Status: {$order->status} | Total: ₱{$order->total} | Method: {$order->method} | Address: {$order->address} | Placed: {$order->created_at}";
                $systemPrompt = "You are a friendly customer support assistant for Pastry Project, a Filipino pastry and food business. You help customers with their order inquiries. Be warm, concise, and helpful. The customer's order details: {$orderContext}. If asked about delivery time, say it usually takes 30-60 minutes. If asked about payment, refer to the method on file. Keep replies short (2-3 sentences max). Reply in the same language the customer uses.";
                $apiKey = env('ANTHROPIC_API_KEY');
                if ($apiKey) {
                    $response = Http::withHeaders([
                        'Content-Type' => 'application/json',
                        'x-api-key' => $apiKey,
                        'anthropic-version' => '2023-06-01',
                    ])->post('https://api.anthropic.com/v1/messages', [
                        'model' => 'claude-sonnet-4-20250514',
                        'max_tokens' => 300,
                        'system' => $systemPrompt,
                        'messages' => [
                            ['role' => 'user', 'content' => $message],
                        ],
                    ]);

                    if ($response->successful()) {
                        $parsed = $response->json();
                        $aiReply = $parsed['content'][0]['text'] ?? null;
                        if ($aiReply) {
                            DB::table('messages')->insert(['order_id' => $orderId, 'sender' => 'ai', 'message' => $aiReply, 'created_at' => now(), 'updated_at' => now()]);
                        }
                    }
                }
            }
        }

        return $this->corsResponse(['success' => true, 'ai_reply' => $aiReply]);
    }

    public function createPayment(Request $request)
    {
        if ($request->isMethod('options')) {
            return response('', 204)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type');
        }

        $data = $this->parseJson($request);
        $orderId = trim($data['order_id'] ?? '');
        $amount = floatval($data['amount'] ?? 0);

        if (!$orderId || $amount <= 0) {
            return $this->corsResponse(['error' => 'Missing order_id or invalid amount'], 400);
        }

        $secretKey = env('PAYMONGO_SECRET');
        if (!$secretKey) {
            return $this->corsResponse(['error' => 'Payment gateway secret is not configured. Please set PAYMONGO_SECRET.'], 500);
        }

        $amountCents = (int) round($amount * 100);
        if ($amountCents < 2000) {
            return $this->corsResponse(['error' => 'Amount must be at least ₱20.00'], 400);
        }

        $payload = [
            'data' => [
                'attributes' => [
                    'amount' => $amountCents,
                    'currency' => 'PHP',
                    'description' => 'Pastry Order #' . $orderId,
                    'remarks' => 'Pastry Shop Order',
                ],
            ],
        ];

        $response = Http::withBasicAuth($secretKey, '')->withHeaders([
            'accept' => 'application/json',
            'content-type' => 'application/json',
        ])->post('https://api.paymongo.com/v1/links', $payload);

        return response()->json($response->json(), $response->status())
            ->header('Access-Control-Allow-Origin', '*');
    }

    public function cartApi(Request $request)
    {
        $action = $request->query('action', '');

        if ($action === 'get') {
            return $this->corsResponse(get_cart_items());
        }

        if ($action === 'add') {
            add_to_cart(
                (int)$request->input('product_id', 0),
                $request->input('size', 'slice'),
                (int)$request->input('quantity', 1)
            );

            return $this->corsResponse(['success' => true, 'cart_count' => get_cart_count()]);
        }

        if ($action === 'update') {
            $key = $request->input('key', '');
            $qty = (int)$request->input('quantity', 1);
            update_cart_item($key, max(0, $qty));

            return $this->corsResponse(['success' => true, 'cart_count' => get_cart_count()]);
        }

        if ($action === 'remove') {
            remove_from_cart($request->input('key', ''));
            return $this->corsResponse(['success' => true, 'cart_count' => get_cart_count()]);
        }

        if ($action === 'clear') {
            clear_cart();
            return $this->corsResponse(['success' => true, 'cart_count' => 0]);
        }

        return $this->corsResponse(['success' => false, 'message' => 'Invalid action']);
    }

    public function user(Request $request)
    {
        return $this->corsResponse($_SESSION['user'] ?? null);
    }
}
