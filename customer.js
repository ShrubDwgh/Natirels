import { state } from './config.js';
import { startOrderTimer } from './admin.js';

export function customerLogin() {
  const code = document.getElementById('cl_code').value.trim().toUpperCase();
  if (!code) return;
  const orderCode = state.loginCodes[code];
  if (!orderCode) {
    document.getElementById('cl_error').style.display = 'block'; return;
  }
  document.getElementById('cl_error').style.display = 'none';
  const myOrders = state.orders.filter(o => o.loginCode === code || o.code === orderCode);
  renderCustomerOrders(myOrders, code);
}

function renderCustomerOrders(myOrders, code) {
  document.getElementById('customerLoginForm').style.display = 'none';
  const portal = document.getElementById('customerPortal');
  portal.style.display = 'block';
  const statusMap = { menunggu:'Menunggu', diproses:'Diproses', berjalan:'Berjalan', selesai:'Selesai' };
  const statusColor = { menunggu:'var(--neon-orange)', diproses:'var(--neon-cyan)', berjalan:'var(--neon-green)', selesai:'var(--text-muted)' };
  portal.querySelector('#customerOrdersList').innerHTML = myOrders.length === 0
    ? '<div style="color:var(--text-muted);font-family:var(--font-mono);font-size:.82rem;padding:20px 0;text-align:center;">Tidak ada order ditemukan.</div>'
    : myOrders.map((o, i) => `
      <div class="customer-order-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <div style="font-family:var(--font-mono);font-size:.75rem;color:var(--neon-cyan);letter-spacing:2px;">${o.code}</div>
          <div style="font-family:var(--font-mono);font-size:.72rem;color:${statusColor[o.status]||'var(--neon-cyan)'};">${statusMap[o.status]||o.status}</div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.8rem;">
          <div><span style="color:var(--text-muted)">Game:</span> ${o.game}</div>
          <div><span style="color:var(--text-muted)">Paket:</span> ${o.package}</div>
          <div><span style="color:var(--text-muted)">Durasi:</span> ${o.duration}</div>
          <div><span style="color:var(--text-muted)">Tanggal:</span> ${o.date}</div>
        </div>
        ${o.status==='berjalan'&&o.startedAt ? `<div style="margin-top:10px;font-family:var(--font-mono);font-size:.72rem;color:var(--text-muted);">Sisa waktu: <span id="ctimer_${o.code}" style="color:var(--neon-green);">loading...</span></div>` : ''}
        ${o.status==='selesai' ? '<div style="margin-top:10px;font-family:var(--font-mono);font-size:.72rem;color:var(--text-muted);">Layanan selesai</div>' : ''}
      </div>`).join('');

  myOrders.forEach(o => {
    if (o.status === 'berjalan' && o.startedAt) startOrderTimer(o, `ctimer_${o.code}`);
  });
}

export function logoutCustomer() {
  document.getElementById('customerLoginForm').style.display = 'block';
  document.getElementById('customerPortal').style.display = 'none';
  document.getElementById('cl_code').value = '';
}

export function scrollToLogin() {
  document.getElementById('customerLogin').scrollIntoView({behavior:'smooth'});
}

window.customerLogin = customerLogin;
window.logoutCustomer = logoutCustomer;
window.scrollToLogin = scrollToLogin;
