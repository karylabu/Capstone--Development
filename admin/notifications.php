<?php
session_start();
require 'includes/data.php';
$db = &getDB();
$userId = $_SESSION['user']['id'] ?? 0;

// Handle mark as read
if ($_POST && isset($_POST['mark_read'])) {
    $notifId = (int)($_POST['notification_id'] ?? 0);
    db_mark_notification_read($notifId);
    header('Location: notifications.php');
    exit;
}

// Handle delete
if ($_POST && isset($_POST['delete'])) {
    $notifId = (int)($_POST['notification_id'] ?? 0);
    db_delete_notification($notifId);
    header('Location: notifications.php');
    exit;
}

// Handle mark all as read
if ($_POST && isset($_POST['mark_all_read'])) {
    db_mark_all_notifications_read($userId);
    header('Location: notifications.php');
    exit;
}

$notifications = db_get_notifications($userId, 50);
$unreadCount = count(db_get_unread_notifications($userId));

include 'includes/header.php';
?>
<div class="main">
  <div class="topbar">
    <div class="page-title">
      <h1>Notifications</h1>
      <p><?= $unreadCount ?> unread messages</p>
    </div>
    <div class="topbar-actions">
      <?php if ($unreadCount > 0): ?>
      <form method="POST" style="display:inline;">
        <input type="hidden" name="mark_all_read" value="1">
        <button type="submit" class="btn btn-outline btn-sm">Mark all as read</button>
      </form>
      <?php endif; ?>
    </div>
  </div>
  <div class="content">
    <?php if (empty($notifications)): ?>
      <div class="card">
        <div style="text-align:center;padding:40px;">
          <div style="font-size:48px;margin-bottom:12px;">🔔</div>
          <div class="card-title">No notifications yet</div>
          <p style="color:var(--muted);margin-top:10px">When important events occur, they'll show up here.</p>
        </div>
      </div>
    <?php else: ?>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <?php foreach ($notifications as $notif): ?>
        <div class="card" style="padding:16px;border-left:4px solid <?= 
          $notif['type'] === 'Alert' ? '#888888' :
          ($notif['type'] === 'Warning' ? '#666666' :
          ($notif['type'] === 'Success' ? '#444444' : '#777777'))
        ?>;opacity:<?= $notif['is_read'] ? '0.6' : '1' ?>;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
            <div style="flex:1;">
              <div style="font-weight:600;color:var(--text);margin-bottom:4px;">
                <?php 
                  $icon = $notif['type'] === 'Alert' ? '⚠️' : 
                          ($notif['type'] === 'Warning' ? '⚠️' : 
                          ($notif['type'] === 'Success' ? '✅' : 'ℹ️'));
                ?>
                <?= $icon ?> <?= htmlspecialchars($notif['title']) ?>
              </div>
              <p style="color:var(--muted);font-size:13px;line-height:1.5;margin-bottom:8px;">
                <?= htmlspecialchars($notif['message']) ?>
              </p>
              <div style="font-size:11px;color:var(--muted);">
                <?= date('M d, Y H:i', strtotime($notif['created_at'])) ?>
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;">
              <?php if ($notif['action_url']): ?>
              <a href="<?= htmlspecialchars($notif['action_url']) ?>" class="btn btn-primary btn-sm" style="white-space:nowrap;">View</a>
              <?php endif; ?>
              <?php if (!$notif['is_read']): ?>
              <form method="POST" style="display:inline;">
                <input type="hidden" name="notification_id" value="<?= $notif['id'] ?>">
                <button type="submit" name="mark_read" class="btn btn-ghost btn-sm">✓</button>
              </form>
              <?php endif; ?>
              <form method="POST" style="display:inline;">
                <input type="hidden" name="notification_id" value="<?= $notif['id'] ?>">
                <button type="submit" name="delete" class="btn btn-ghost btn-sm" onclick="return confirm('Delete this notification?');">✕</button>
              </form>
            </div>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</div>

</body></html>
