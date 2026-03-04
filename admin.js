import { db, state, CONFIG } from './config.js';
import { doc, setDoc, updateDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { applyServerStatus, updateLinks, renderGames } from './ui.js';

// ── Timer ──
export function durationToMs(dur) {
  const map = { '1 Hari':86400000, '3 Hari':3*86400000, '7 Hari':7*86400000, '30 Hari':30*86400000 };
  return map[dur] || 86400000;
}

export function formatCountdown(ms) {
  if (ms <= 0) return 'Waktu Habis!';
  const d = Math.floor(ms/86400000);
  const h = Math.floor((ms%86400000)/3600000);
  const m = Math.floor((ms%3600000)/60000);
  const s = Math.floor((ms%60000)/1000);
  return `${d}h ${h}j ${m}m ${s}d`;
}

export function startOrderTimer(order, elId) {
  if (state.timerIntervals[elId]) clearInterval(state.timerIntervals[elId]);
  const totalMs = durationToMs(order.duration);
  const tick = () => {
    const el = document.getElementById(elId);
    if (!el) { clearInterval(state.timerIntervals[elId]); return; }
    const elapsed = Date.now() - order.startedAt;
    const remaining = totalMs - elapsed;
    if (remaining <= 0) {
      el.textContent = 'Waktu Habis!';
      el.classList.add('expired');
      clearInterval(state.timerIntervals[elId]);
    } else {
      el.textContent = formatCountdown(remaining);
    }
  };
  tick();
  state.timerIntervals[elId] = setInterval(tick, 1000);
}

// ── Paket ──
export function setPaket(paketName) {
  const el = document.getElementById('f_package');
  if (el) { el.value = paketName; document.getElementById('order').scrollIntoView({behavior:'smooth'}); }
}

export function applyPaketStatus() {
  const map = { 'Starter':'starter','Basic':'basic','Professional':'pro','VIP':'vip','Elite':'elite','Ultra':'ultra' };
  Object.entries(map).forEach(([label, key]) => {
    const overlay = document.getElementById('pco-' + key);
    if (overlay) overlay.style.display = state.paketStatus[key] === false ? 'flex' : 'none';
  });
}

export function renderAdminPaketList() {
  const wrap = document.getElementById('adminPaketList');
  if (!wrap) return;
  const pakets = [
    { key:'starter', label:'Starter', price:'Rp 8K' }, { key:'basic', label:'Basic', price:'Rp 15K' },
    { key:'pro', label:'Professional', price:'Rp 45K' }, { key:'vip', label:'VIP', price:'Rp 80K' },
    { key:'elite', label:'Elite', price:'Rp 120K' }, { key:'ultra', label:'Ultra', price:'Rp 200K' }
  ];
  wrap.innerHTML = pakets.map(p => {
    const isOpen = state.paketStatus[p.key] !== false;
    return `<div class="admin-game-row">
      <div class="admin-game-name">${p.label} <span style="font-family:var(--font-mono);font-size:.7rem;color:var(--text-muted)">${p.price}</span></div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-family:var(--font-mono);font-size:.75rem;color:${isOpen?'var(--neon-green)':'var(--neon-red)'};">${isOpen?'BUKA':'TUTUP'}</span>
        <label class="toggle-switch" style="width:50px;height:26px;">
          <input type="checkbox" id="pt_${p.key}" ${isOpen?'checked':''} onchange="togglePaket('${p.key}',this.checked)" />
          <span class="toggle-slider" style="border-radius:13px;"></span>
        </label>
      </div>
    </div>`;
  }).join('');
}

export function togglePaket(key, open) {
  state.paketStatus[key] = open;
  applyPaketStatus();
  renderAdminPaketList();
}

export async function savePaketStatus() {
  try { await setDoc(doc(db, 'afk_config', 'paketStatus'), state.paketStatus); } catch(e) { console.error(e); }
  const b = document.getElementById('savePaketBanner');
  if (b) { b.style.display = 'block'; setTimeout(() => b.style.display = 'none', 2000); }
}

// ── Admin panel ──
export function openAdmin() {
  document.getElementById('adminModal').classList.add('show');
}

export function checkAdmin() {
  const pass = document.getElementById('adminPass').value;
  if (pass === state.settings.adminPass || pass === CONFIG.adminPass) {
    state.adminLoggedIn = true;
    document.getElementById('adminLoginSection').style.display = 'none';
    document.getElementById('adminDashSection').style.display = 'block';
    renderAdminDash();
  } else {
    document.getElementById('adminError').style.display = 'block';
  }
}

export function logoutAdmin() {
  state.adminLoggedIn = false;
  document.getElementById('adminLoginSection').style.display = 'block';
  document.getElementById('adminDashSection').style.display = 'none';
}

export function switchTab(tab, btn) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('show'));
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('show');
  btn.classList.add('active');
}

export function toggleServer(checked) {
  state.serverOnline = checked;
  setDoc(doc(db, 'afk_config', 'server'), { online: state.serverOnline }).catch(()=>{});
  applyServerStatus();
}

export function changeSlot(id, delta) {
  state.slotData[id] = Math.max(0, Math.min(99, (state.slotData[id]||0) + delta));
  const el = document.getElementById('sc_'+id);
  if (el) {
    el.textContent = state.slotData[id];
    el.className = 'slot-count ' + (state.slotData[id]===0?'red':state.slotData[id]<=2?'orange':'green');
  }
  renderGames();
}

export async function saveSlots() {
  const b = document.getElementById('saveBanner');
  try {
    await setDoc(doc(db, 'afk_config', 'slots'), state.slotData);
    if (b) { b.textContent = 'Tersimpan!'; b.style.color = 'var(--neon-green)'; }
  } catch(e) {
    if (b) { b.textContent = 'Edit via Firebase Console'; b.style.color = 'var(--neon-orange)'; }
  }
  if (b) { b.style.display = 'block'; setTimeout(() => b.style.display = 'none', 2500); }
}

export async function updateOrderStatus(idx, val) {
  const order = state.orders[idx];
  if (!order) return;
  const prev = order.status;
  order.status = val;
  if (val === 'berjalan' && prev !== 'berjalan') order.startedAt = Date.now();
  try {
    if (order._id) await updateDoc(doc(db, 'afk_orders', order._id), { status: val, startedAt: order.startedAt || null });
  } catch(e) { console.error(e); }
  renderOrdersTable();
}

export async function saveSettings() {
  state.settings.whatsapp = document.getElementById('set_wa').value.trim();
  state.settings.discord  = document.getElementById('set_dc').value.trim();
  const newPass = document.getElementById('set_pass').value.trim();
  if (newPass) state.settings.adminPass = newPass;
  const b = document.getElementById('saveSettBanner');
  try {
    await setDoc(doc(db, 'afk_config', 'settings'), state.settings);
    if (b) { b.textContent = 'Tersimpan!'; b.style.color = 'var(--neon-green)'; }
  } catch(e) {
    if (b) { b.textContent = 'Edit via Firebase Console'; b.style.color = 'var(--neon-orange)'; }
  }
  updateLinks();
  if (b) { b.style.display = 'block'; setTimeout(() => b.style.display = 'none', 2500); }
}

export function setOrderFilter(filter, btn) {
  state.orderFilter = filter;
  document.querySelectorAll('.order-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOrdersTable();
}

export function renderOrdersTable() {
  const search = (document.getElementById('orderSearch')?.value || '').toLowerCase();
  const statusOrder = { menunggu:0, diproses:1, berjalan:2, selesai:3 };
  let filtered = [...state.orders];
  if (state.orderFilter !== 'semua') filtered = filtered.filter(o => o.status === state.orderFilter);
  if (search) filtered = filtered.filter(o =>
    (o.name||'').toLowerCase().includes(search) || (o.date||'').toLowerCase().includes(search) ||
    (o.code||'').toLowerCase().includes(search) || (o.game||'').toLowerCase().includes(search)
  );
  filtered.sort((a,b) => (statusOrder[a.status]??0) - (statusOrder[b.status]??0));

  if (filtered.length === 0) {
    document.getElementById('noOrders').style.display = 'block';
    document.getElementById('adminOrdersTable').style.display = 'none';
    document.getElementById('noOrders').textContent = state.orders.length === 0 ? 'Belum ada order masuk.' : 'Tidak ada order yang cocok.';
    return;
  }
  document.getElementById('noOrders').style.display = 'none';
  document.getElementById('adminOrdersTable').style.display = 'table';
  const statusColors = { menunggu:'var(--neon-orange)', diproses:'var(--neon-cyan)', berjalan:'var(--neon-green)', selesai:'var(--text-muted)' };
  document.getElementById('adminOrdersBody').innerHTML = filtered.map(o => {
    const i = state.orders.indexOf(o);
    const timerId = `atimer_${o.code}`;
    const timerHtml = o.status==='berjalan'&&o.startedAt
      ? `<div id="${timerId}" style="font-family:var(--font-mono);font-size:.65rem;color:var(--neon-green);">loading...</div>`
      : (o.status==='selesai' ? `<span style="color:var(--text-muted);font-size:.65rem;">Selesai</span>` : '—');
    return `<tr style="${o.status==='selesai'?'opacity:.55;':''}">
      <td style="color:${statusColors[o.status]||'var(--neon-cyan)'}">${o.code}</td>
      <td style="color:var(--text-main);font-weight:600">${o.name}</td>
      <td>${o.wa}</td><td>${o.game}</td><td>${o.package}</td><td>${o.duration}</td>
      <td style="font-size:.7rem">${o.account}</td>
      <td style="font-size:.75rem">${o.server||'—'}</td>
      <td style="max-width:80px;word-break:break-word;font-size:.75rem">${o.note||'—'}</td>
      <td style="font-size:.72rem">${o.date}</td>
      <td>${timerHtml}</td>
      <td><select class="status-select" onchange="updateOrderStatus(${i},this.value)">
        <option value="menunggu" ${o.status==='menunggu'?'selected':''}>Menunggu</option>
        <option value="diproses" ${o.status==='diproses'?'selected':''}>Diproses</option>
        <option value="berjalan" ${o.status==='berjalan'?'selected':''}>Berjalan</option>
        <option value="selesai"  ${o.status==='selesai'?'selected':''}>Selesai</option>
      </select></td>
    </tr>`;
  }).join('');
  Object.keys(state.timerIntervals).forEach(k => {
    if (k.startsWith('atimer_')) { clearInterval(state.timerIntervals[k]); delete state.timerIntervals[k]; }
  });
  filtered.forEach(o => {
    if (o.status==='berjalan'&&o.startedAt) startOrderTimer(o, `atimer_${o.code}`);
  });
}

export function renderAdminDash() {
  const totalSlots = Object.values(state.slotData).reduce((a,b)=>a+b,0);
  const unreadSaran = state.suggestions.filter(s=>!s.read).length;
  document.getElementById('adminStatsGrid').innerHTML = `
    <div class="stat-box"><div class="stat-box-num">${state.orders.length}</div><div class="stat-box-label">Total Order</div></div>
    <div class="stat-box"><div class="stat-box-num">${state.orders.filter(o=>o.status==='berjalan').length}</div><div class="stat-box-label">Aktif Berjalan</div></div>
    <div class="stat-box"><div class="stat-box-num">${totalSlots}</div><div class="stat-box-label">Slot Tersedia</div></div>
    <div class="stat-box"><div class="stat-box-num" style="color:${unreadSaran?'var(--neon-orange)':'var(--neon-cyan)'}">${unreadSaran}</div><div class="stat-box-label">Saran Baru</div></div>`;
  document.getElementById('serverToggle').checked = state.serverOnline;
  document.getElementById('adminGameSlots').innerHTML = CONFIG.games.map(g => {
    const slots = state.slotData[g.id] ?? 5;
    const colorCls = slots===0?'red':slots<=2?'orange':'green';
    return `<div class="admin-game-row">
      <div class="admin-game-name">${g.name}</div>
      <div class="slot-controls">
        <button class="slot-ctrl-btn" onclick="changeSlot('${g.id}',-1)">-</button>
        <div class="slot-count ${colorCls}" id="sc_${g.id}">${slots}</div>
        <button class="slot-ctrl-btn" onclick="changeSlot('${g.id}',1)">+</button>
      </div>
    </div>`;
  }).join('');
  renderOrdersTable();
  renderAdminPaketList();
  renderKodeList();
  renderSaranList();
  document.getElementById('set_wa').value = state.settings.whatsapp;
  document.getElementById('set_dc').value = state.settings.discord;
}

export function copyCode(code, tipId) {
  navigator.clipboard.writeText(code).then(() => {
    const tip = document.getElementById(tipId);
    if (tip) { tip.style.display = 'inline'; setTimeout(() => tip.style.display = 'none', 1500); }
  });
}

export async function regenCode(orderIdx) {
  const { genCode } = await import('./orders.js');
  const order = state.orders[orderIdx];
  if (!order) return;
  const newCode = genCode('LC', 6);
  if (order.loginCode) delete state.loginCodes[order.loginCode];
  order.loginCode = newCode;
  state.loginCodes[newCode] = order.code;
  try {
    if (order._id) await updateDoc(doc(db, 'afk_orders', order._id), { loginCode: newCode });
    await setDoc(doc(db, 'afk_config', 'loginCodes'), state.loginCodes);
  } catch(e) { console.error(e); }
  renderKodeList();
}

export function renderKodeList() {
  const wrap = document.getElementById('kodeListWrap');
  if (!wrap) return;
  const orderWithCodes = state.orders.filter(o => o.loginCode);
  if (!orderWithCodes.length) { wrap.innerHTML = '<div style="color:var(--text-muted);font-family:var(--font-mono);font-size:.8rem;padding:10px 0;">Belum ada kode login dibuat.</div>'; return; }
  wrap.innerHTML = orderWithCodes.map((o, i) => {
    const idx = state.orders.indexOf(o);
    return `<div class="admin-game-row" style="flex-wrap:wrap;gap:8px;">
      <div style="flex:1;min-width:120px;">
        <div style="font-size:.8rem;color:var(--text-main);font-weight:600">${o.name}</div>
        <div style="font-family:var(--font-mono);font-size:.65rem;color:var(--text-muted)">${o.code} — ${o.game}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="font-family:var(--font-mono);font-size:.9rem;color:var(--neon-cyan);letter-spacing:3px;">${o.loginCode}</div>
        <button class="btn btn-outline" style="padding:4px 10px;font-size:.7rem;" onclick="copyCode('${o.loginCode}','tip_${i}')">Salin</button>
        <span id="tip_${i}" style="display:none;font-family:var(--font-mono);font-size:.65rem;color:var(--neon-green);">Disalin!</span>
        <button class="btn btn-outline" style="padding:4px 10px;font-size:.7rem;border-color:var(--neon-orange);color:var(--neon-orange);" onclick="regenCode(${idx})">Baru</button>
      </div>
    </div>`;
  }).join('');
}

export function renderSaranList() {
  const wrap = document.getElementById('saranListWrap');
  if (!wrap) return;
  if (!state.suggestions.length) { wrap.innerHTML = '<div style="color:var(--text-muted);font-family:var(--font-mono);font-size:.8rem;padding:10px 0;">Belum ada saran masuk.</div>'; return; }
  wrap.innerHTML = state.suggestions.map((s, i) => `
    <div class="saran-item ${s.read?'read':''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div style="font-weight:600;color:var(--text-main)">${s.name} <span style="font-family:var(--font-mono);font-size:.65rem;color:var(--text-muted);">[${s.category||'Umum'}]</span></div>
        ${!s.read ? `<button class="btn btn-outline" style="padding:3px 10px;font-size:.65rem;" onclick="markSaranRead(${i})">Tandai Dibaca</button>` : '<span style="font-family:var(--font-mono);font-size:.65rem;color:var(--text-muted);">Dibaca</span>'}
      </div>
      <div style="font-size:.85rem;color:var(--text-muted);line-height:1.6">${s.message}</div>
    </div>`).join('');
}

export async function markSaranRead(i) {
  state.suggestions[i].read = true;
  try {
    if (state.suggestions[i]._id) await updateDoc(doc(db, 'afk_suggestions', state.suggestions[i]._id), { read: true });
  } catch(e) { console.error(e); }
  renderSaranList();
  renderAdminDash();
}

// Window exports
window.openAdmin = openAdmin;
window.checkAdmin = checkAdmin;
window.logoutAdmin = logoutAdmin;
window.switchTab = switchTab;
window.toggleServer = toggleServer;
window.changeSlot = changeSlot;
window.saveSlots = saveSlots;
window.updateOrderStatus = updateOrderStatus;
window.saveSettings = saveSettings;
window.copyCode = copyCode;
window.regenCode = regenCode;
window.markSaranRead = markSaranRead;
window.setOrderFilter = setOrderFilter;
window.renderOrdersTable = renderOrdersTable;
window.togglePaket = togglePaket;
window.savePaketStatus = savePaketStatus;
window.setPaket = setPaket;
