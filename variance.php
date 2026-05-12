<?php
session_start();
require 'includes/data.php';
$db = &getDB();
$role = $_SESSION['user']['role'] ?? 'customer';
$userId = $_SESSION['user']['id'] ?? 0;

if ($role !== 'admin' && $role !== 'staff') {
    header('Location: dashboard.php');
    exit;
}

// Handle variance log submission
if ($_POST && isset($_POST['log_variance'])) {
    $ingredientId = (int)($_POST['ingredient_id'] ?? 0) ?: null;
    $productId = (int)($_POST['product_id'] ?? 0) ?: null;
    $type = $_POST['variance_type'] ?? 'Waste';
    $qtyLost = (float)($_POST['qty_lost'] ?? 0);
    $reason = $_POST['reason'] ?? '';
    $notes = $_POST['notes'] ?? '';

    if ($ingredientId || $productId) {
        if ($ingredientId) {
            db_deduct_ingredient_stock($ingredientId, $qtyLost);
        }
        
        db_log_variance($userId, $ingredientId, $productId, $type, $qtyLost, $reason, $notes);
        
        // Create notification for admins
        $allAdmins = db_all('SELECT id FROM users WHERE role = "admin"');
        $itemName = $ingredientId 
            ? db_one('SELECT name FROM ingredients WHERE id = ?', [$ingredientId])['name'] ?? 'Item'
            : db_one('SELECT name FROM products WHERE id = ?', [$productId])['name'] ?? 'Item';
        
        foreach ($allAdmins as $admin) {
            if ($admin['id'] != $userId) {
                db_create_notification(
                    $admin['id'],
                    '📋 Variance Logged',
                    "{$_SESSION['user']['name']} logged {$qtyLost} units of {$itemName} as {$type}.",
                    'Info',
                    'variance.php'
                );
            }
        }
        
        $_SESSION['success'] = 'Variance logged successfully.';
        header('Location: variance.php');
        exit;
    }
}

$ingredients = $db['ingredients'];
$products = $db['products'];
$varianceLog = db_get_variance();
$startDate = $_GET['start'] ?? date('Y-m-01', strtotime('-30 days'));
$endDate = $_GET['end'] ?? date('Y-m-d');
$filteredVariance = array_filter($varianceLog, fn($v) => $v['recorded_date'] >= $startDate && $v['recorded_date'] <= $endDate);
$varianceSummary = db_get_variance_summary($startDate, $endDate);

include 'includes/header.php';
?>
<div class="main">
  <div class="topbar">
    <div class="page-title">
      <h1>Variance Management</h1>
      <p>Track waste, spoilage, and inventory discrepancies</p>
    </div>
    <div class="topbar-actions">
      <button class="btn btn-primary" onclick="document.getElementById('varianceModal').classList.add('open')">+ Log Variance</button>
    </div>
  </div>
  <div class="content">
    <?php if (isset($_SESSION['success'])): ?>
    <div class="alert alert-success">✅ <?= htmlspecialchars($_SESSION['success']) ?></div>
    <?php unset($_SESSION['success']); endif; ?>

    <!-- Summary Cards -->
    <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
      <?php 
        $totalLoss = array_sum($varianceSummary);
        $wasteCount = count(array_filter($filteredVariance, fn($v) => $v['variance_type'] === 'Waste'));
        $spoilageCount = count(array_filter($filteredVariance, fn($v) => $v['variance_type'] === 'Spoilage'));
        $damageCount = count(array_filter($filteredVariance, fn($v) => $v['variance_type'] === 'Damage'));
      ?>
      <div class="stat-card rose">
        <div class="stat-icon">⚠️</div>
        <div class="stat-value"><?= count($filteredVariance) ?></div>
        <div class="stat-label">Total Records</div>
        <div class="stat-change up">Period: <?= $startDate ?> to <?= $endDate ?></div>
      </div>
      <div class="stat-card caramel">
        <div class="stat-icon">🗑️</div>
        <div class="stat-value"><?= $wasteCount ?></div>
        <div class="stat-label">Waste</div>
        <div class="stat-change up"><?= number_format($varianceSummary['Waste'] ?? 0, 1) ?> units</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">🍞</div>
        <div class="stat-value"><?= $spoilageCount ?></div>
        <div class="stat-label">Spoilage</div>
        <div class="stat-change up"><?= number_format($varianceSummary['Spoilage'] ?? 0, 1) ?> units</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon">💔</div>
        <div class="stat-value"><?= $damageCount ?></div>
        <div class="stat-label">Damage</div>
        <div class="stat-change up"><?= number_format($varianceSummary['Damage'] ?? 0, 1) ?> units</div>
      </div>
    </div>

    <!-- Filter -->
    <div class="card" style="margin-bottom:20px;">
      <form method="GET" style="display:grid; grid-template-columns: 1fr 1fr 1fr auto; gap:12px; align-items:end;">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">From</label>
          <input type="date" name="start" class="form-input" value="<?= $startDate ?>">
        </div>
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">To</label>
          <input type="date" name="end" class="form-input" value="<?= $endDate ?>">
        </div>
        <div class="form-group" style="margin-bottom:0;"></div>
        <button type="submit" class="btn btn-outline" style="height:38px;">Filter</button>
      </form>
    </div>

    <!-- Variance Log Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">📋 Variance Log</div>
        <span style="font-size:12px;color:var(--muted)"><?= count($filteredVariance) ?> records</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Item</th>
            <th>Qty Lost</th>
            <th>Reason</th>
            <th>Logged By</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <?php if (empty($filteredVariance)): ?>
            <tr><td colspan="7" style="text-align:center;color:var(--muted);padding:20px;">No variance records for this period.</td></tr>
          <?php else: ?>
            <?php foreach ($filteredVariance as $v): ?>
            <tr>
              <td><?= $v['recorded_date'] ?></td>
              <td><span class="tag tag-rush"><?= htmlspecialchars($v['variance_type']) ?></span></td>
              <td>
                <?php if ($v['ingredient_name']): ?>
                  <?= htmlspecialchars($v['ingredient_name']) ?> (Ingredient)
                <?php elseif ($v['product_name']): ?>
                  <?= htmlspecialchars($v['product_name']) ?> (Product)
                <?php else: ?>
                  —
                <?php endif; ?>
              </td>
              <td><strong><?= number_format($v['qty_lost'], 3) ?></strong></td>
              <td><?= htmlspecialchars($v['reason'] ?? '—') ?></td>
              <td><small><?= htmlspecialchars($v['recorded_by_name'] ?? '—') ?></small></td>
              <td><small style="color:var(--muted)"><?= htmlspecialchars(substr($v['notes'] ?? '', 0, 40)) ?></small></td>
            </tr>
            <?php endforeach; ?>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Log Variance Modal -->
<div class="modal-overlay" id="varianceModal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">+ Log Variance</div>
      <button class="modal-close" onclick="document.getElementById('varianceModal').classList.remove('open')">✕</button>
    </div>
    <form method="POST">
      <input type="hidden" name="log_variance" value="1">
      
      <div class="form-group">
        <label class="form-label">Variance Type</label>
        <select name="variance_type" class="form-select">
          <option value="Waste">🗑️ Waste</option>
          <option value="Spoilage">🍞 Spoilage</option>
          <option value="Damage">💔 Damage</option>
          <option value="Unaccounted">❓ Unaccounted</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Item Type</label>
        <select name="item_type" class="form-select" id="itemType" onchange="updateItemSelect()">
          <option value="ingredient">Ingredient</option>
          <option value="product">Product</option>
        </select>
      </div>

      <div class="form-group" id="ingredientGroup">
        <label class="form-label">Ingredient</label>
        <select name="ingredient_id" class="form-select" id="ingredientSelect">
          <option value="">Choose an ingredient</option>
          <?php foreach ($ingredients as $ing): ?>
            <option value="<?= $ing['id'] ?>"><?= htmlspecialchars($ing['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="form-group" id="productGroup" style="display:none;">
        <label class="form-label">Product</label>
        <select name="product_id" class="form-select" id="productSelect">
          <option value="">Choose a product</option>
          <?php foreach ($products as $p): ?>
            <option value="<?= $p['id'] ?>"><?= htmlspecialchars($p['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Quantity Lost</label>
        <input type="number" name="qty_lost" class="form-input" step="0.001" placeholder="0.000" required>
      </div>

      <div class="form-group">
        <label class="form-label">Reason</label>
        <input type="text" name="reason" class="form-input" placeholder="e.g., Expired, Broke during transport">
      </div>

      <div class="form-group">
        <label class="form-label">Additional Notes</label>
        <textarea name="notes" class="form-textarea" placeholder="Any other details..."></textarea>
      </div>

      <div style="display:flex;gap:10px;margin-top:8px">
        <button type="submit" class="btn btn-primary" style="flex:1;justify-content:center">Log Variance</button>
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('varianceModal').classList.remove('open')">Cancel</button>
      </div>
    </form>
  </div>
</div>

<script>
function updateItemSelect() {
  const type = document.getElementById('itemType').value;
  const ingredientGroup = document.getElementById('ingredientGroup');
  const productGroup = document.getElementById('productGroup');
  const ingredientSelect = document.getElementById('ingredientSelect');
  const productSelect = document.getElementById('productSelect');

  if (type === 'ingredient') {
    ingredientGroup.style.display = 'block';
    productGroup.style.display = 'none';
    ingredientSelect.required = true;
    productSelect.required = false;
  } else {
    ingredientGroup.style.display = 'none';
    productGroup.style.display = 'block';
    ingredientSelect.required = false;
    productSelect.required = true;
  }
}
</script>
</body></html>
