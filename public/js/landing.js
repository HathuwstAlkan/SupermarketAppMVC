// landing.js
// Focus and highlight login/register inputs when URL includes ?focus=login or ?focus=register
(function(){
  function qs(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function highlight(el) {
    if (!el) return;
    el.classList.add('focus-highlight');
    setTimeout(() => el.classList.remove('focus-highlight'), 2200);
    el.focus();
  }

  document.addEventListener('DOMContentLoaded', function(){
    const focus = qs('focus');
    const mode = qs('mode');
    // If mode is provided, toggle forms accordingly (landing already does this on load)
    if (focus === 'login' || (mode === 'login' && !focus)) {
      const email = document.querySelector('#email');
      highlight(email);
    }
    if (focus === 'register' || mode === 'register') {
      const uname = document.querySelector('#username');
      highlight(uname);
    }

    // If there are quick-links in footer that should scroll to auth module, handle anchor
    const hash = window.location.hash;
    if (hash === '#auth') {
      const card = document.querySelector('.auth-card');
      if (card) card.scrollIntoView({behavior:'smooth', block:'center'});
    }
  });
})();
