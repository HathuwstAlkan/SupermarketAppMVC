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

  document.querySelectorAll('.add-to-cart-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      const btn = form.querySelector('.btn-add');
      if (!btn) return; // no visual
      const rect = btn.getBoundingClientRect();
      const dot = createDot(rect.left + rect.width/2, rect.top + rect.height/2);
      const cartRect = cartIcon ? (cartIcon.getBoundingClientRect()) : {left: window.innerWidth - 40, top: 10, width: 24, height: 24};

      // Update badge immediately (optimistic)
      const badge = document.querySelector('.navbar .badge') || document.querySelector('.badge.bg-danger');
      if (badge) {
        const curr = parseInt(badge.textContent.trim(), 10) || 0;
        badge.textContent = curr + 1;
      }

      animateToCart(dot, cartRect);
      // allow animation to start before actual submit
      // let the form continue submitting (no preventDefault)
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
});
