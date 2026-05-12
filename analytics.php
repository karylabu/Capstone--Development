<?php
session_start();
require 'includes/data.php';
$db = &getDB();
$role = $_SESSION['user']['role'] ?? 'customer';
if ($role !== 'admin') { header('Location: dashboard.php'); exit; }

$topProds = $db['analytics']['top_products'];
$dailySales = $db['analytics']['daily_sales'];
$totalRevenue = array_sum(array_column($db['orders'], 'total'));
$avgOrder = $totalRevenue / count($db['orders']);
$maxDay = max($dailySales);
$maxSold = max(array_column($topProds, 'sold'));

// Simulate monthly data
$months = ['Jan','Feb','Mar','Apr','May'];
$monthSales = [12500, 18200, 15800, 22400, 16300];
$maxMonth = max($monthSales);

include 'includes/header.php';
?>
<div class="main">
  <div class="topbar">
    <div class="page-title">
      <h1>Business Analytics</h1>
      <p>Data-driven insights to optimize your pastry operations</p>
    </div>
    <div class="topbar-actions">
      <a href="reports.php" class="btn btn-outline">📄 Generate Report</a>
    </div>
  </div>
  <div class="content">
    <!-- KPI Row -->
    <div class="stats-grid" style="margin-bottom:24px">
      <div class="stat-card rose">
        <div class="stat-icon">💰</div>
        <div class="stat-value">₱<?= number_format($totalRevenue) ?></div>
        <div class="stat-label">Total Revenue</div>
        <div class="stat-change up">↑ 15.3% vs last month</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">🛒</div>
        <div class="stat-value">₱<?= number_format($avgOrder) ?></div>
        <div class="stat-label">Avg. Order Value</div>
        <div class="stat-change up">↑ 8% this week</div>
      </div>
      <div class="stat-card caramel">
        <div class="stat-icon">🔄</div>
        <div class="stat-value"><?= count($db['orders']) ?></div>
        <div class="stat-label">Total Transactions</div>
        <div class="stat-change up">↑ 12% this week</div>
      </div>
      <div class="stat-card blue">
        <div class="stat-icon">📦</div>
        <div class="stat-value"><?= array_sum(array_column($topProds, 'sold')) ?></div>
        <div class="stat-label">Units Sold</div>
        <div class="stat-change up">↑ 9% this month</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:20px">
      <!-- Monthly Sales Chart -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📊 Monthly Revenue (2025)</div>
        </div>
        <div class="chart-bar-wrap" style="height:140px">
          <?php foreach ($months as $i => $m): 
            $pct = ($monthSales[$i] / $maxMonth) * 100;
          ?>
          <div class="chart-bar-item">
            <div class="chart-bar-val">₱<?= number_format($monthSales[$i]/1000,1) ?>k</div>
            <div class="chart-bar" style="height:<?= $pct ?>%"></div>
            <div class="chart-bar-label"><?= $m ?></div>
          </div>
          <?php endforeach; ?>
        </div>
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)">
            <span>Peak Month: <strong style="color:var(--rose-dark)">April (₱22,400)</strong></span>
            <span>Total 2025: <strong style="color:var(--text)">₱<?= number_format(array_sum($monthSales)) ?></strong></span>
          </div>
        </div>
      </div>

      <!-- Daily Sales Trend -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">📈 Daily Sales (This Week)</div>
        </div>
        <div class="chart-bar-wrap" style="height:140px">
          <?php foreach ($dailySales as $date => $val): 
            $pct = ($val / $maxDay) * 100;
            $day = date('D d', strtotime($date));
          ?>
          <div class="chart-bar-item">
            <div class="chart-bar-val">₱<?= number_format($val/1000,1) ?>k</div>
            <div class="chart-bar" style="height:<?= $pct ?>%;background:linear-gradient(to top,var(--caramel),var(--blush))"></div>
            <div class="chart-bar-label"><?= $day ?></div>
          </div>
          <?php endforeach; ?>
        </div>
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)">
            <span>Best Day: <strong style="color:var(--rose-dark)">Apr 28 (₱1,050)</strong></span>
            <span>Weekly Total: <strong>₱<?= number_format(array_sum($dailySales)) ?></strong></span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:20px">
      <!-- Top Products -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">🏆 Product Performance</div>
          <span style="font-size:12px;color:var(--muted)">Units sold & revenue</span>
        </div>
        <?php foreach ($topProds as $name => $data): ?>
        <div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
            <span style="font-size:13px;font-weight:500"><?= htmlspecialchars($name) ?></span>
            <div style="text-align:right">
              <span style="font-weight:600;color:var(--rose);font-size:13px"><?= $data['sold'] ?> sold</span>
              <div style="font-size:11px;color:var(--muted)">₱<?= number_format($data['revenue']) ?></div>
            </div>
          </div>
          <div class="progress">
            <div class="progress-fill" style="width:<?= ($data['sold']/$maxSold)*100 ?>%;background:linear-gradient(to right,var(--rose),var(--blush))"></div>
          </div>
        </div>
        <?php endforeach; ?>
      </div>

      <!-- Insights & Recommendations -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">💡 Prescriptive Recommendations</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="background:linear-gradient(135deg,#E8F5E9,#F1F8E9);border-radius:12px;padding:14px;border-left:3px solid var(--success)">
            <div style="font-weight:600;font-size:13px;color:#2E7D32;margin-bottom:4px">📈 Increase Production</div>
            <div style="font-size:12px;color:#388E3C">Ube Pandesal & Croissant have highest sales volume. Consider increasing daily batch by 20%.</div>
          </div>
          <div style="background:linear-gradient(135deg,#FFF8E1,#FFFDE7);border-radius:12px;padding:14px;border-left:3px solid var(--warning)">
            <div style="font-weight:600;font-size:13px;color:#F57F17;margin-bottom:4px">⚠️ Restock Urgently</div>
            <div style="font-size:12px;color:#F9A825">Strawberries (2kg), Blueberries (1.5kg) and Fresh Cream (6L) are approaching minimum threshold.</div>
          </div>
          <div style="background:linear-gradient(135deg,#E3F2FD,#E8EAF6);border-radius:12px;padding:14px;border-left:3px solid var(--info)">
            <div style="font-weight:600;font-size:13px;color:#1565C0;margin-bottom:4px">📦 Procurement Tip</div>
            <div style="font-size:12px;color:#1976D2">Based on May trends, order 30kg flour, 10kg butter, 200 eggs for next week's production.</div>
          </div>
          <div style="background:linear-gradient(135deg,#FCE4EC,#F8BBD9);border-radius:12px;padding:14px;border-left:3px solid var(--rose)">
            <div style="font-weight:600;font-size:13px;color:var(--rose-dark);margin-bottom:4px">📅 Demand Forecast</div>
            <div style="font-size:12px;color:var(--warm)">Weekend sales typically 35% higher. Prepare extra Chocolate Lava Cake and Macarons for Saturday.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order type breakdown -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">📋 Order Type Analysis</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        <?php
        $types = ['Standard'=>0,'Pre-order'=>0,'Rush'=>0];
        foreach ($db['orders'] as $o) $types[$o['type']]++;
        $total = array_sum($types);
        $colors = ['Standard'=>'#4CAF50','Pre-order'=>'#2196F3','Rush'=>'#F44336'];
        $icons = ['Standard'=>'📋','Pre-order'=>'📅','Rush'=>'⚡'];
        ?>
        <?php foreach ($types as $type => $count): ?>
        <div style="background:var(--cream);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:28px;margin-bottom:8px"><?= $icons[$type] ?></div>
          <div style="font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:var(--text)"><?= $count ?></div>
          <div style="font-size:12px;color:var(--muted);margin-bottom:8px"><?= $type ?> Orders</div>
          <div style="background:var(--border);border-radius:20px;height:6px;overflow:hidden">
            <div style="width:<?= ($count/$total)*100 ?>%;height:100%;background:<?= $colors[$type] ?>;border-radius:20px"></div>
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px"><?= round(($count/$total)*100) ?>% of total</div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>
</div>
</body></html>
