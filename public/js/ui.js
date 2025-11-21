// ui.js - simple flying-dot animation and add-to-cart UX
document.addEventListener('DOMContentLoaded', () => {
  function createDot(x, y) {
    const dot = document.createElement('div');
    dot.className = 'fly-dot';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';
    document.body.appendChild(dot);
    return dot;
  }

  function animateToCart(dot, targetRect, cb) {
    const destX = targetRect.left + (targetRect.width / 2);
    const destY = targetRect.top + (targetRect.height / 2);
    dot.style.transform = `translate(${destX - parseFloat(dot.style.left)}px, ${destY - parseFloat(dot.style.top)}px) scale(0.2)`;
    dot.style.opacity = '0.8';
    setTimeout(() => {
      dot.remove();
      if (cb) cb();
    }, 500);
  }

  // prefer the navbar cart anchor if present
  const cartIcon = document.querySelector('#nav-cart-icon') || document.querySelector('.fa-shopping-cart');

  // Intercept Add-to-Cart forms and POST via fetch so we can animate only on success
  document.querySelectorAll('.add-to-cart-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-add');
      const hidden = form.querySelector('input[type=hidden][name=quantity]');
      if (hidden) {
        const id = hidden.id.replace('hidden-qty-','');
        const input = document.getElementById('qty-' + id);
        if (input) hidden.value = input.value;
      }

      try {
        if (btn) btn.disabled = true;
        const action = form.action;
        const body = new FormData(form);
        const resp = await fetch(action, { method: 'POST', body, headers: { 'Accept': 'application/json' } });
        if (!resp.ok) throw new Error('Network response was not ok');
        const data = await resp.json();
        if (data && data.success) {
          // flying-dot animation from button to cart badge
          if (btn) {
            const rect = btn.getBoundingClientRect();
            const dot = createDot(rect.left + rect.width/2, rect.top + rect.height/2);
            const cartRect = cartIcon ? (cartIcon.getBoundingClientRect()) : {left: window.innerWidth - 40, top: 10, width: 24, height: 24};
            animateToCart(dot, cartRect);
          }

          // Update badge to server-provided count
          const badge = document.querySelector('.navbar .badge') || document.querySelector('.badge.bg-danger');
          if (badge && typeof data.cartCount !== 'undefined') {
            badge.textContent = data.cartCount;
          }

          // show top banner success message
          showTopBanner(`Added ${data.qty} × ${data.productName} to cart` , 'success');
        } else {
          const msg = (data && data.error) ? data.error : 'Failed to add to cart';
          showTopBanner(msg, 'danger');
        }
      } catch (err) {
        console.error('Add to cart (AJAX) failed', err);
        showTopBanner('Failed to add to cart', 'danger');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  });
  
  // quantity increment/decrement and input clamp handlers (works on product detail and catalog)
  document.querySelectorAll('.btn-increment, .btn-decrement').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const max = parseInt(input.getAttribute('data-max'), 10) || 9999;
      let val = parseInt(input.value, 10) || 1;
      if (btn.classList.contains('btn-increment')) val += 1;
      else val -= 1;
      if (val < 1) val = 1;
      if (val > max) val = max;
      input.value = val;
      // update hidden field in the same form (if present)
      const hidden = document.getElementById('hidden-qty-' + targetId.replace('qty-',''));
      if (hidden) hidden.value = val;
    });
  });

  // ensure when numeric input changes manually we clamp and update hidden field
  document.querySelectorAll('.qty-input').forEach(input => {
    input.addEventListener('input', () => {
      const max = parseInt(input.getAttribute('data-max'), 10) || 9999;
      let val = parseInt(input.value, 10) || 1;
      if (val < 1) val = 1;
      if (val > max) val = max;
      input.value = val;
      const id = input.id.replace('qty-','');
      const hidden = document.getElementById('hidden-qty-' + id);
      if (hidden) hidden.value = val;
    });
  });
  // Auto-dismiss bootstrap alerts after 5 seconds
  try {
    document.querySelectorAll('.alert-dismissible').forEach(alertEl => {
      setTimeout(() => {
        try {
          const bsAlert = new bootstrap.Alert(alertEl);
          bsAlert.close();
        } catch (e) {
          alertEl.remove();
        }
      }, 5000);
    });
  } catch (e) {
    // ignore if bootstrap isn't available
  }
  
  // intercept guest sign-in links (open modal) -- links with class `open-login`
  document.querySelectorAll('a.open-login').forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      try {
        const modalEl = document.getElementById('loginModal');
        if (modalEl) {
          const bs = new bootstrap.Modal(modalEl);
          bs.show();
        } else {
          // fallback to navigating to landing
          window.location.href = '/?mode=login';
        }
      } catch (e) { window.location.href = '/?mode=login'; }
    });
  });

  // intercept guest sign-up links (open register modal)
  document.querySelectorAll('a.open-register').forEach(a => {
    a.addEventListener('click', (ev) => {
      ev.preventDefault();
      try {
        const modalEl = document.getElementById('registerModal');
        if (modalEl) {
          const bs = new bootstrap.Modal(modalEl);
          bs.show();
        } else {
          window.location.href = '/?mode=register';
        }
      } catch (e) { window.location.href = '/?mode=register'; }
    });
  });

  // Open product modal when clicking view on a product card
  document.querySelectorAll('.open-product').forEach(btn => {
    btn.addEventListener('click', async (ev) => {
      ev.preventDefault();
      const id = btn.dataset.id;
      if (!id) return;
      try {
        const resp = await fetch('/product/' + id + '?format=json', { headers: { 'Accept': 'application/json' } });
        if (!resp.ok) throw new Error('Failed to load product');
        const data = await resp.json();
        if (!data || !data.product) throw new Error('No product data');
        const p = data.product;
        // populate modal
        document.getElementById('pm-image').src = '/images/' + (p.image ? p.image : 'misc/no-image.svg');
        document.getElementById('pm-title').textContent = p.productName || '';
        document.getElementById('pm-meta').textContent = (p.brand ? 'Brand: ' + p.brand + ' — ' : '') + (p.category ? 'Category: ' + p.category : '');
        document.getElementById('pm-price').textContent = '$' + (Number(p.price || 0).toFixed(2));
        document.getElementById('pm-availability').innerHTML = 'Available: <strong>' + (p.available || p.quantity || 0) + '</strong>';
        // set qty max
        const pmQty = document.getElementById('pm-qty');
        pmQty.setAttribute('data-max', (p.available || p.quantity || 0));
        pmQty.value = 1;
        document.getElementById('pm-hidden-qty').value = 1;
        // wire form action
        const form = document.getElementById('pm-add-form');
        form.action = '/add-to-cart/' + p.id;
        // show/hide add button depending on availability and auth
        const addBtn = document.getElementById('pm-add-btn');
        if ((p.available || p.quantity || 0) <= 0) {
          addBtn.disabled = true;
          addBtn.textContent = 'Out of stock';
        } else {
          addBtn.disabled = false;
          addBtn.textContent = 'Add to cart';
        }
        // show modal
        const modalEl = document.getElementById('productModal');
        const bs = new bootstrap.Modal(modalEl);
        bs.show();
      } catch (e) {
        console.error('Failed to open product modal', e);
        showTopBanner('Failed to load product', 'danger');
      }
    });
  });
  
  // top banner element helper
  function showTopBanner(message, type='success') {
    let banner = document.getElementById('top-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'top-banner';
      banner.className = 'top-banner';
      banner.innerHTML = '<div class="container"><div class="alert d-flex align-items-center justify-content-between mb-0" role="alert"><div id="top-banner-msg"></div><button type="button" class="btn-close ms-3" aria-label="Close" id="top-banner-close"></button></div></div>';
      document.body.appendChild(banner);
      document.getElementById('top-banner-close').addEventListener('click', () => hideTopBanner());
    }
    const msg = document.getElementById('top-banner-msg');
    msg.textContent = message;
    const alertDiv = banner.querySelector('.alert');
    alertDiv.className = `alert alert-${type} d-flex align-items-center justify-content-between mb-0`;
    // show
    requestAnimationFrame(() => banner.classList.add('show'));
    // auto-hide after 3s
    clearTimeout(banner._hideTimeout);
    banner._hideTimeout = setTimeout(() => hideTopBanner(), 3000);
  }

  function hideTopBanner() {
    const banner = document.getElementById('top-banner');
    if (!banner) return;
    banner.classList.remove('show');
    clearTimeout(banner._hideTimeout);
  }
});
