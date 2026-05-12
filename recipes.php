<?php
session_start();
require 'includes/data.php';
$db = &getDB();
$role = $_SESSION['user']['role'] ?? 'customer';

if ($role !== 'admin') {
    header('Location: dashboard.php');
    exit;
}

if ($_POST && isset($_POST['save_recipe'])) {
    $productId = (int)($_POST['product_id'] ?? 0);
    $ingredients = [];
    foreach ($_POST['ingredient_id'] as $index => $ingredientId) {
        $qty = $_POST['qty'][$index] ?? '';
        if (!$ingredientId || trim($qty) === '') {
            continue;
        }
        $ingredients[] = [
            'ingredient_id' => (int)$ingredientId,
            'qty'           => (float)$qty,
        ];
    }

    db_set_recipe($productId, $ingredients);
    $_SESSION['success'] = 'Recipe saved successfully.';
    header('Location: recipes.php');
    exit;
}

$products = $db['products'];
$ingredients = $db['ingredients'];
$recipeRows = db_get_recipes();
$recipeMap = [];
foreach ($recipeRows as $row) {
    $recipeMap[$row['product_name']][] = $row;
}

include 'includes/header.php';
?>
<div class="main">
  <div class="topbar">
    <div class="page-title">
      <h1>Recipes</h1>
      <p>Define ingredient recipes for menu items to keep inventory in sync.</p>
    </div>
    <div class="topbar-actions">
      <button class="btn btn-primary" onclick="document.getElementById('recipeModal').classList.add('open')">+ Add / Update Recipe</button>
    </div>
  </div>
  <div class="content">
    <?php if (isset($_SESSION['success'])): ?>
    <div class="alert alert-success">✅ <?= htmlspecialchars($_SESSION['success']) ?></div>
    <?php unset($_SESSION['success']); endif; ?>

    <?php if (empty($recipeMap)): ?>
      <div class="card">
        <div class="card-title">No recipes defined yet.</div>
        <p style="color:var(--muted);margin-top:10px">Create recipes so product sales deduct the correct ingredient stock automatically.</p>
      </div>
    <?php else: ?>
      <div class="grid-2" style="gap:18px;">
        <?php foreach ($recipeMap as $productName => $items): ?>
        <div class="card">
          <div class="card-header">
            <div class="card-title"><?= htmlspecialchars($productName) ?></div>
            <button class="btn btn-sm btn-outline" onclick="openRecipeForm('<?= htmlspecialchars($productName, ENT_QUOTES) ?>')">Edit</button>
          </div>
          <table>
            <thead>
              <tr><th>Ingredient</th><th>Qty</th><th>Unit</th></tr>
            </thead>
            <tbody>
              <?php foreach ($items as $item): ?>
              <tr>
                <td><?= htmlspecialchars($item['ingredient_name']) ?></td>
                <td><?= number_format($item['qty'], 3) ?></td>
                <td><?= htmlspecialchars($item['unit']) ?></td>
              </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</div>

<div class="modal-overlay" id="recipeModal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title">Add / Update Recipe</div>
      <button class="modal-close" onclick="document.getElementById('recipeModal').classList.remove('open')">✕</button>
    </div>
    <form method="POST" id="recipeForm">
      <input type="hidden" name="save_recipe" value="1">
      <div class="form-group">
        <label class="form-label">Product</label>
        <select name="product_id" class="form-select" required>
          <option value="">Select a product</option>
          <?php foreach ($products as $product): ?>
            <option value="<?= $product['id'] ?>"><?= htmlspecialchars($product['name']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div id="ingredientRows">
        <div class="form-group" data-row="0" style="display:grid;grid-template-columns:2fr 1fr auto;gap:10px;align-items:end;">
          <div>
            <label class="form-label">Ingredient</label>
            <select name="ingredient_id[]" class="form-select" required>
              <option value="">Choose ingredient</option>
              <?php foreach ($ingredients as $ingredient): ?>
              <option value="<?= $ingredient['id'] ?>"><?= htmlspecialchars($ingredient['name']) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div>
            <label class="form-label">Quantity</label>
            <input type="number" name="qty[]" class="form-input" step="0.001" placeholder="0.000" required>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" onclick="removeIngredientRow(this)" style="height:38px;">−</button>
        </div>
      </div>
      <div style="margin-bottom:16px">
        <button type="button" class="btn btn-outline btn-sm" onclick="addIngredientRow()">+ Add ingredient</button>
      </div>
      <div style="display:flex;gap:10px;margin-top:8px">
        <button type="submit" class="btn btn-primary" style="flex:1;justify-content:center">Save Recipe</button>
        <button type="button" class="btn btn-ghost" onclick="document.getElementById('recipeModal').classList.remove('open')">Cancel</button>
      </div>
    </form>
  </div>
</div>

<script>
function addIngredientRow() {
  const container = document.getElementById('ingredientRows');
  const rowCount = container.querySelectorAll('[data-row]').length;
  const row = document.createElement('div');
  row.className = 'form-group';
  row.dataset.row = rowCount;
  row.style = 'display:grid;grid-template-columns:2fr 1fr auto;gap:10px;align-items:end;';
  row.innerHTML = `
    <div>
      <label class="form-label">Ingredient</label>
      <select name="ingredient_id[]" class="form-select" required>
        <option value="">Choose ingredient</option>
        <?php foreach ($ingredients as $ingredient): ?>
        <option value="<?= $ingredient['id'] ?>"><?= htmlspecialchars($ingredient['name']) ?></option>
        <?php endforeach; ?>
      </select>
    </div>
    <div>
      <label class="form-label">Quantity</label>
      <input type="number" name="qty[]" class="form-input" step="0.001" placeholder="0.000" required>
    </div>
    <button type="button" class="btn btn-ghost btn-sm" onclick="removeIngredientRow(this)" style="height:38px;">−</button>
  `;
  container.appendChild(row);
}

function removeIngredientRow(button) {
  const row = button.closest('[data-row]');
  if (row) {
    row.remove();
  }
}

function openRecipeForm(productName) {
  const select = document.querySelector('#recipeForm select[name="product_id"]');
  const option = Array.from(select.options).find(o => o.text === productName);
  if (option) {
    option.selected = true;
    document.getElementById('recipeModal').classList.add('open');
  }
}
</script>
</body></html>
