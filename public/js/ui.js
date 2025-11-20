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

  const cartIcon = document.querySelector('.fa-shopping-cart') || document.querySelector('#nav-cart-icon');

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
