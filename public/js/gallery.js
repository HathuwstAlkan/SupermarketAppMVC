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

  // simple search and category filter
  const search = document.getElementById('catalogSearch');
  const select = document.getElementById('catalogCategory');
  function applyFilters(){
    const q = search.value.trim().toLowerCase();
    const cat = select.value;
    document.querySelectorAll('.category-shelf').forEach(section => {
      const title = section.querySelector('h3').textContent;
      if (cat !== 'all' && title !== cat) {
        section.style.display = 'none';
        return;
      }
      // show/hide items by search
      let any = false;
      section.querySelectorAll('.shelf-item').forEach(item => {
        const name = item.querySelector('.card-title').textContent.toLowerCase();
        const match = !q || name.indexOf(q) !== -1;
        item.style.display = match ? '' : 'none';
        if (match) any = true;
      });
      section.style.display = any ? '' : 'none';
    });
  }
  if (search) search.addEventListener('input', applyFilters);
  if (select) select.addEventListener('change', applyFilters);
});
