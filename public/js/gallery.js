// gallery.js: enable shelf arrow navigation and mousewheel horizontal scroll
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.category-shelf').forEach(section => {
    const row = section.querySelector('.shelf-row');
    const left = section.querySelector('.shelf-nav.left');
    const right = section.querySelector('.shelf-nav.right');
    if (!row) return;
    // position nav vertically centered
    [left, right].forEach(btn => {
      if (!btn) return;
      btn.style.top = '50%';
      btn.style.transform = 'translateY(-50%)';
    });

    left && left.addEventListener('click', () => {
      row.scrollBy({ left: -400, behavior: 'smooth' });
    });
    right && right.addEventListener('click', () => {
      row.scrollBy({ left: 400, behavior: 'smooth' });
    });

    // map vertical wheel to horizontal scroll
    row.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        row.scrollBy({ left: e.deltaY, behavior: 'auto' });
      }
    }, { passive: false });
  });

  // simple search, category, brand and promo filters
  const search = document.getElementById('catalogSearch');
  const select = document.getElementById('catalogCategory');
  const brandSelect = document.getElementById('catalogBrand');
  const dealsOnly = document.getElementById('filterDeals');
  const expiringOnly = document.getElementById('filterExpiring');
  function applyFilters(){
    const q = (search && search.value || '').trim().toLowerCase();
    const cat = select ? select.value : 'all';
    const brand = brandSelect ? brandSelect.value : 'all';
    const deals = dealsOnly ? dealsOnly.checked : false;
    const expiring = expiringOnly ? expiringOnly.checked : false;
    document.querySelectorAll('.category-shelf').forEach(section => {
      const title = section.querySelector('h3').textContent;
      if (cat !== 'all' && title !== cat) {
        section.style.display = 'none';
        return;
      }
      // show/hide items by search and additional filters
      let any = false;
      section.querySelectorAll('.shelf-item').forEach(item => {
        const nameEl = item.querySelector('.card-title');
        const name = nameEl ? nameEl.textContent.toLowerCase() : '';
        const matchesQuery = !q || name.indexOf(q) !== -1;
        const itemBrand = (item.dataset.brand || '').toString();
        const matchesBrand = (brand === 'all') || (itemBrand === brand);
        const isDeal = item.dataset.deal === '1';
        const isExpiring = item.dataset.expiring === '1';
        const matchesDeals = !deals || isDeal;
        const matchesExpiring = !expiring || isExpiring;
        const match = matchesQuery && matchesBrand && matchesDeals && matchesExpiring;
        item.style.display = match ? '' : 'none';
        if (match) any = true;
      });
      section.style.display = any ? '' : 'none';
    });
  }
  [search, select, brandSelect, dealsOnly, expiringOnly].forEach(el => { if (el) el.addEventListener('change', applyFilters); if (el && el.tagName === 'INPUT') el.addEventListener('input', applyFilters); });
});
