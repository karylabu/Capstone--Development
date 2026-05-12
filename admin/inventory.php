<?php
session_start();
require 'includes/data.php';
$db = &getDB();
$role = $_SESSION['user']['role'] ?? 'customer';
if ($role === 'customer') { header('Location: dashboard.php'); exit; }

// Handle stock update
if ($_POST && isset($_POST['update_stock'])) {
    $iid = (int)$_POST['ingredient_id'];
    $qty = (float)$_POST['qty'];
    // Read current stock then add delta
    $current = db_one('SELECT stock FROM ingredients WHERE id = ?', [$iid]);
    if ($current) {
        db_update_ingredient_stock($iid, $current['stock'] + $qty);
    }
    $_SESSION['success'] = "Stock updated successfully.";
    header('Location: inventory.php'); exit;
}

// Handle waste log
if ($_POST && isset($_POST['log_waste'])) {
    $iid = (int)$_POST['ingredient_id'];
    $qty = (float)$_POST['waste_qty'];
    $current = db_one('SELECT stock FROM ingredients WHERE id = ?', [$iid]);
    if ($current) {
        db_update_ingredient_stock($iid, max(0, $current['stock'] - $qty));
    }
    $_SESSION['success'] = "Waste logged. Inventory adjusted.";
    header('Location: inventory.php'); exit;
}

include 'includes/header.php';
?>
<div class="main">
  <div class="topbar">
    <div class="page-title">
      <h1>Inventory Management</h1>
      <p>Track ingredient stock levels, expiry dates and waste</p>
    </div>
    <div class="topbar-actions">
      <button class="btn btn-primary" onclick="document.getElementById('addStockModal').classList.add('open')">+ Add Stock</button>
    </div>
  </div>
  <div class="content">
    <?php if (isset($_SESSION['success'])): ?>
    <div class="alert alert-success">✅ <?= htmlspecialchars($_SESSION['success']) ?></div>
    <?php unset($_SESSION['success']); endif; ?>

    <!-- Summary stats -->
    <div class="stats-grid" style="margin-bottom:20px">
      <div class="stat-card rose">
        <div class="stat-icon">📦</div>
        <div class="stat-value"><?= count($db['ingredients']) ?></div>
        <div class="stat-label">Total Ingredients</div>
      </div>
      <div class="stat-card" style="border-left:3px solid var(--danger)">
        <div class="stat-icon">⚠️</div>
        <div class="stat-value"><?= count(array_filter($db['ingredients'], fn($i) => $i['stock'] <= $i['threshold'])) ?></div>
        <div class="stat-label">Low Stock Items</div>
        <div class="stat-change down">Needs replenishment</div>
      </div>
      <div class="stat-card" style="border-left:3px solid var(--warning)">
        <div class="stat-icon">📅</div>
        <?php $expiring = count(array_filter($db['ingredients'], fn($i) => strtotime($i['expiry']) < strtotime('+7 days'))); ?>
        <div class="stat-value"><?= $expiring ?></div>
        <div class="stat-label">Expiring Soon (7 days)</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">✅</div>
        <div class="stat-value"><?= count(array_filter($db['ingredients'], fn($i) => $i['stock'] > $i['threshold'])) ?></div>
        <div class="stat-label">Well Stocked</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">🧂 Ingredient Stock Levels</div>
      </div>
      <table>
        <thead>
          <tr><th>Ingredient</th><th>Current Stock</th><th>Threshold</th><th>Status</th><th>Expiry Date</th><th>Stock Level</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <?php foreach ($db['ingredients'] as $ing): 
            $pct = min(100, ($ing['stock'] / ($ing['threshold'] * 3)) * 100);
            $isLow = $ing['stock'] <= $ing['threshold'];
            $isExpiring = strtotime($ing['expiry']) < strtotime('+7 days');
            $isExpired = strtotime($ing['expiry']) < time();
          ?>
          <tr>
            <td>
              <strong><?= htmlspecialchars($ing['name']) ?></strong>
              <?php if ($isExpiring): ?><span class="tag" style="background:#FFF3E0;color:#E65100;margin-left:6px;font-size:10px">Expiring</span><?php endif; ?>
              <?php if ($isExpired): ?><span class="tag" style="background:#FFEBEE;color:var(--danger);margin-left:6px;font-size:10px">Expired</span><?php endif; ?>
            </td>
            <td><strong><?= $ing['stock'] ?> <?= $ing['unit'] ?></strong></td>
            <td style="color:var(--muted)"><?= $ing['threshold'] ?> <?= $ing['unit'] ?></td>
            <td>
              <?php if ($isLow): ?>
                <span class="status" style="background:#FFEBEE;color:var(--danger)">● Low Stock</span>
              <?php else: ?>
                <span class="status" style="background:#E8F5E9;color:#2E7D32">● OK</span>
              <?php endif; ?>
            </td>
            <td style="<?= $isExpiring?'color:var(--warning);font-weight:600':'' ?>">
              <?= $ing['expiry'] ?>
            </td>
            <td style="width:150px">
              <div class="progress">
                <div class="progress-fill" style="width:<?= $pct ?>%;background:<?= $pct<40?'var(--danger)':($pct<70?'var(--warning)':'var(--success)') ?>"></div>
              </div>
              <div style="font-size:10px;color:var(--muted);margin-top:3px"><?= round($pct) ?>% capacity</div>
            </td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-outline btn-sm" onclick="openStockForm(<?= $ing['id'] ?>,'<?= htmlspecialchars($ing['name']) ?>')">+ Add</button>
                <button class="btn btn-ghost btn-sm" onclick="openWasteForm(<?= $ing['id'] ?>,'<?= htmlspecialchars($ing['name']) ?>')">🗑 Waste</button>
              </div>
            </td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- Add Stock Modal -->
<div class="modal-overlay" id="addStockModal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">+ Add Stock</div>
      <button class="modal-close" onclick="document.getElementById('addStockModal').classList.remove('open')">✕</button>
    </div>
    <form method="POST">
      <div class="form-group">
        <label class="form-label">Ingredient</label>
        <select name="ingredient_id" id="stockIngId" class="form-select">
          <?php foreach ($db['ingredients'] as $ing): ?>
          <option value="<?= $ing['id'] ?>"><?= htmlspecialchars($ing['name']) ?> (<?= $ing['stock'] ?> <?= $ing['unit'] ?>)</option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Quantity to Add</label>
        <input type="number" name="qty" step="0.1" min="0.1" class="form-input" placeholder="e.g. 5" required>
      </div>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button type="submit" name="update_stock" class="btn btn-primary" style="flex:1;justify-content:center">Update Stock</button>
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('addStockModal').classList.remove('open')">Cancel</button>
      </div>
    </form>
  </div>
</div>

<!-- Log Waste Modal -->
<div class="modal-overlay" id="wasteModal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">🗑 Log Waste</div>
      <button class="modal-close" onclick="document.getElementById('wasteModal').classList.remove('open')">✕</button>
    </div>
    <div class="alert alert-warning" style="margin-bottom:16px">⚠️ This will deduct from current stock permanently.</div>
    <form method="POST">
      <div class="form-group">
        <label class="form-label">Ingredient: <span id="wasteIngName" style="color:var(--rose-dark);font-weight:600"></span></label>
        <input type="hidden" name="ingredient_id" id="wasteIngId">
      </div>
      <div class="form-group">
        <label class="form-label">Waste Quantity</label>
        <input type="number" name="waste_qty" step="0.1" min="0.1" class="form-input" placeholder="Amount wasted" required>
      </div>
      <div class="form-group">
        <label class="form-label">Reason</label>
        <select class="form-select"><option>Expired</option><option>Spoiled</option><option>Spilled</option><option>Other</option></select>
      </div>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button type="submit" name="log_waste" class="btn btn-sm" style="flex:1;justify-content:center;background:var(--danger);color:white;border:none;padding:10px">Log Waste</button>
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('wasteModal').classList.remove('open')">Cancel</button>
      </div>
    </form>
  </div>
</div>
<script>
function openStockForm(id, name) {
  document.getElementById('stockIngId').value = id;
  document.getElementById('addStockModal').classList.add('open');
}
function openWasteForm(id, name) {
  document.getElementById('wasteIngId').value = id;
  document.getElementById('wasteIngName').textContent = name;
  document.getElementById('wasteModal').classList.add('open');
}
</script>
</body></html>
