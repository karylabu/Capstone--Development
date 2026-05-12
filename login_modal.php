<div id="loginModal" class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title">👋 Login to Continue</h3>
      <button class="modal-close" onclick="closeLoginModal()">&times;</button>
    </div>
    <div class="modal-body">
      <div id="loginError" class="error" style="display:none;"></div>
      <div class="field">
        <label>Email</label>
        <input type="email" id="loginEmail" placeholder="admin@pastry.com" required>
      </div>
      <div class="field">
        <label>Password</label>
        <input type="password" id="loginPassword" placeholder="password" required>
      </div>
      <div style="display:flex;gap:12px;align-items:center;justify-content:center;margin-top:20px">
        <button onclick="submitLogin()" class="btn btn-primary">Login</button>
        <button onclick="guestCheckout()" class="btn btn-outline">Continue as Guest</button>
      </div>
      <p style="text-align:center;margin-top:20px;font-size:13px;color:var(--muted)">
        Don't have account? <a href="register.php">Register</a>
      </p>
    </div>
  </div>
</div>

<style>
#loginModal .modal{max-width:420px}
#loginModal .field{margin-bottom:18px}
#loginModal label{font-size:13px;font-weight:500;margin-bottom:6px;display:block}
#loginModal input{width:100%;padding:12px 16px;border:1.5px solid var(--border);border-radius:12px;font-size:14px}
#loginModal input:focus{border-color:var(--rose);box-shadow:0 0 0 3px rgba(211,47,47,0.1)}
#loginModal .error{background:#fee;border:1px solid #fcc;padding:12px;border-radius:8px;margin-bottom:16px;display:flex;align-items:center;gap:8px}
</style>
