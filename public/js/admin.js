// admin.js - small SPA for admin dashboard
(function(){
  async function fetchJSON(url){
    const res = await fetch(url, { credentials: 'same-origin' });
    return res.json();
  }

  function el(html){ const div = document.createElement('div'); div.innerHTML = html; return div.firstElementChild; }

  function numberFmt(n){ return (Number(n) || 0).toLocaleString(); }

  async function renderDashboard(container){
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="kpi my-3 d-flex gap-3">
        <div class="card p-3 text-center"><h6>Total Users</h6><h3 id="k-users">—</h3></div>
        <div class="card p-3 text-center"><h6>Total Products</h6><h3 id="k-products">—</h3></div>
        <div class="card p-3 text-center"><h6>Total Orders</h6><h3 id="k-orders">—</h3></div>
        <div class="card p-3 text-center"><h6>Total Revenue</h6><h3 id="k-revenue">—</h3></div>
      </div>
      <div class="chart-wrap my-3">
        <div class="card p-3"><h6>Revenue (last 30 days)</h6><canvas id="revenueChart" height="160"></canvas></div>
        <div class="card p-3"><h6>Orders (last 30 days)</h6><canvas id="ordersChart" height="160"></canvas></div>
      </div>
      <div class="mt-3"><h5>Low Stock Alerts</h5><div id="lowStock" class="text-muted">Loading...</div></div>
      <div class="mt-4"><h5>Recent Signups</h5><div id="recentUsers">Loading...</div></div>
    `;

    container.innerHTML = '';
    container.appendChild(wrap);

    // load stats
    const stats = await fetchJSON('/admin/stats');
    if (stats && stats.success){
      const s = stats.data;
      document.getElementById('k-users').textContent = numberFmt(s.totalUsers);
      document.getElementById('k-products').textContent = numberFmt(s.totalProducts);
      document.getElementById('k-orders').textContent = numberFmt(s.totalOrders);
      document.getElementById('k-revenue').textContent = '$' + (Number(s.totalRevenue)||0).toFixed(2);
      document.getElementById('lowStock').textContent = (s.lowStockCount || 0) + ' products below stock threshold';

      // Render charts (Chart.js expected on page via CDN in head)
      const labels = s.recentOrders.length ? s.recentOrders.map(r=>r.date) : [];
      const revenueData = s.recentOrders.length ? s.recentOrders.map(r=>r.total) : [];
      const ordersData = s.recentOrders.length ? s.recentOrders.map(r=>r.count) : [];
      if (window.Chart) {
        const ctxR = document.getElementById('revenueChart').getContext('2d');
        new Chart(ctxR, { type:'bar', data:{ labels, datasets:[{ label:'Revenue', data: revenueData, backgroundColor:'rgba(201,166,107,0.9)' }] }, options:{ responsive:true } });

        const ctxO = document.getElementById('ordersChart').getContext('2d');
        new Chart(ctxO, { type:'line', data:{ labels, datasets:[{ label:'Orders', data: ordersData, borderColor:'rgba(15,76,92,0.9)', fill:false }] }, options:{ responsive:true } });
      }
    }

    // recent users
    const users = await fetchJSON('/admin/users?limit=10&page=1');
    const usersWrap = document.getElementById('recentUsers');
    if (users && users.success) {
      const list = document.createElement('div');
      list.className = 'list-group';
      users.data.rows.forEach(u=>{
        const it = document.createElement('div');
        it.className = 'list-group-item d-flex justify-content-between align-items-center';
        it.innerHTML = `<div><strong>${u.username||u.email}</strong><div class="text-muted small">${u.email} • ${u.role} • ${new Date(u.created_at).toLocaleString()}</div></div>`;
        list.appendChild(it);
      });
      usersWrap.innerHTML = '';
      usersWrap.appendChild(list);
    }
  }

  function route(){
    const container = document.getElementById('admin-app');
    if (!container) return;
    renderDashboard(container);
  }

  document.addEventListener('DOMContentLoaded', function(){
    route();
    window.addEventListener('popstate', route);
  });
})();
