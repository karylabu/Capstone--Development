<?php
session_start();
require 'includes/data.php';
$db = &getDB();
$role = $_SESSION['user']['role'] ?? 'customer';
if ($role !== 'admin') { header('Location: dashboard.php'); exit; }

$totalRevenue = array_sum(array_column($db['orders'], 'total'));
$completedRev = array_sum(array_column(array_filter($db['orders'], fn($o) => $o['status'] === 'Completed'), 'total'));

include 'includes/header.php';
?>
<div class="main">
  <div class="topbar">
    <div class="page-title">
      <h1>Reports</h1>
      <p>Generate sales, inventory and business performance reports</p>
    </div>
    <div class="topbar-actions">
      <button class="btn btn-primary" onclick="window.print()">🖨️ Print Report</button>
    </div>
  </div>
  <div class="content">
    <div class="grid-3" style="margin-bottom:20px">
      <div class="card" style="text-align:center;padding:28px;cursor:pointer;transition:transform .2s;border:2px dashed var(--border)" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''"  onclick="showReport('sales')">
        <div style="font-size:40px;margin-bottom:12px">📊</div>
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:600;margin-bottom:6px">Sales Report</div>
        <div style="font-size:12px;color:var(--muted)">Daily, weekly & monthly revenue breakdown</div>
      </div>
      <div class="card" style="text-align:center;padding:28px;cursor:pointer;transition:transform .2s;border:2px dashed var(--border)" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''" onclick="showReport('inventory')">
        <div style="font-size:40px;margin-bottom:12px">📦</div>
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:600;margin-bottom:6px">Inventory Report</div>
        <div style="font-size:12px;color:var(--muted)">Stock levels, usage & waste summary</div>
      </div>
      <div class="card" style="text-align:center;padding:28px;cursor:pointer;transition:transform .2s;border:2px dashed var(--border)" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''" onclick="showReport('orders')">
        <div style="font-size:40px;margin-bottom:12px">📋</div>
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:600;margin-bottom:6px">Order Report</div>
        <div style="font-size:12px;color:var(--muted)">All orders, types & customer details</div>
      </div>
    </div>

    <!-- Sales Report -->
    <div id="report-sales" class="card" style="display:none;margin-bottom:20px">
      <div class="card-header">
        <div class="card-title">📊 Sales Report — May 2025</div>
        <span style="font-size:12px;color:var(--muted)">Generated: <?= date('Y-m-d H:i') ?></span>
      </div>
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card rose"><div class="stat-icon">💰</div><div class="stat-value">₱<?= number_format($totalRevenue) ?></div><div class="stat-label">Gross Revenue</div></div>
        <div class="stat-card green"><div class="stat-icon">✅</div><div class="stat-value">₱<?= number_format($completedRev) ?></div><div class="stat-label">Collected Revenue</div></div>
        <div class="stat-card caramel"><div class="stat-icon">📈</div><div class="stat-value">₱<?= number_format($totalRevenue/count($db['orders'])) ?></div><div class="stat-label">Avg Order Value</div></div>
        <div class="stat-card blue"><div class="stat-icon">🛒</div><div class="stat-value"><?= count($db['orders']) ?></div><div class="stat-label">Total Orders</div></div>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Revenue</th><th>Trend</th></tr></thead>
        <tbody>
          <?php $prev = 0; foreach ($db['analytics']['daily_sales'] as $date => $val): ?>
          <tr>
            <td><?= $date ?></td>
            <td><strong>₱<?= number_format($val) ?></strong></td>
            <td><?= $prev > 0 ? ($val > $prev ? '<span style="color:green">↑ +'.round(($val-$prev)/$prev*100).'%</span>' : '<span style="color:red">↓ '.round(($val-$prev)/$prev*100).'%</span>') : '—' ?></td>
          </tr>
          <?php $prev = $val; endforeach; ?>
        </tbody>
      </table>
    </div>

    <!-- Inventory Report -->
    <div id="report-inventory" class="card" style="display:none;margin-bottom:20px">
      <div class="card-header">
        <div class="card-title">📦 Inventory Report</div>
        <span style="font-size:12px;color:var(--muted)">Generated: <?= date('Y-m-d H:i') ?></span>
      </div>
      <table>
        <thead><tr><th>Ingredient</th><th>Current Stock</th><th>Threshold</th><th>Status</th><th>Expiry</th><th>Action Required</th></tr></thead>
        <tbody>
          <?php foreach ($db['ingredients'] as $ing): 
            $isLow = $ing['stock'] <= $ing['threshold'];
          ?>
          <tr>
            <td><strong><?= htmlspecialchars($ing['name']) ?></strong></td>
            <td><?= $ing['stock'] ?> <?= $ing['unit'] ?></td>
            <td><?= $ing['threshold'] ?> <?= $ing['unit'] ?></td>
            <td><?= $isLow ? '<span class="status" style="background:#FFEBEE;color:var(--danger)">● Low Stock</span>' : '<span class="status" style="background:#E8F5E9;color:#2E7D32">● OK</span>' ?></td>
            <td><?= $ing['expiry'] ?></td>
            <td style="font-size:12px;color:var(--muted)"><?= $isLow ? "⚠️ Order ".($ing['threshold']*3 - $ing['stock'])." {$ing['unit']} more" : '—' ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>

    <!-- Orders Report -->
    <div id="report-orders" class="card" style="display:none">
      <div class="card-header">
        <div class="card-title">📋 Orders Report</div>
        <span style="font-size:12px;color:var(--muted)">Generated: <?= date('Y-m-d H:i') ?></span>
      </div>
      <table>
        <thead><tr><th>#</th><th>Customer</th><th>Type</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>
          <?php foreach (array_reverse($db['orders']) as $o): ?>
          <tr>
            <td><strong>#<?= $o['id'] ?></strong></td>
            <td><?= htmlspecialchars($o['customer']) ?></td>
            <td><span class="tag <?= $o['type']==='Rush'?'tag-rush':($o['type']==='Pre-order'?'tag-pre':'tag-standard') ?>"><?= $o['type'] ?></span></td>
            <td><strong>₱<?= number_format($o['total']) ?></strong></td>
            <td><?= $o['payment'] ?></td>
            <td><span class="status status-<?= strtolower($o['status']) ?>"><?= $o['status'] ?></span></td>
            <td><?= $o['date'] ?></td>
          </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </div>
</div>
<script>
function showReport(type) {
  ['sales','inventory','orders'].forEach(t => {
    document.getElementById('report-'+t).style.display = t === type ? 'block' : 'none';
  });
  document.getElementById('report-'+type).scrollIntoView({behavior:'smooth', block:'start'});
}
</script>
</body></html>
