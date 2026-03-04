import { CONFIG, state } from './config.js';

// ── Game Icons SVG ──
const GAME_ICONS = {
  minecraft: `<svg width="86" height="86" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="mcG" cx="35%" cy="30%" r="65%"><stop offset="0%" stop-color="#7fff7f"/><stop offset="100%" stop-color="#1a3a1a"/></radialGradient><filter id="mcShadow"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity=".5"/></filter></defs>
    <rect x="12" y="8" width="76" height="84" rx="5" fill="url(#mcG)" filter="url(#mcShadow)"/>
    <rect x="12" y="8" width="25" height="25" fill="#000" opacity=".12"/><rect x="63" y="8" width="25" height="25" fill="#000" opacity=".12"/>
    <rect x="37" y="33" width="26" height="25" fill="#000" opacity=".10"/><rect x="12" y="58" width="25" height="25" fill="#000" opacity=".12"/><rect x="63" y="58" width="25" height="25" fill="#000" opacity=".12"/>
    <rect x="25" y="30" width="18" height="18" rx="2" fill="#111"/><rect x="57" y="30" width="18" height="18" rx="2" fill="#111"/>
    <rect x="27" y="32" width="5" height="5" rx="1" fill="#fff" opacity=".25"/><rect x="59" y="32" width="5" height="5" rx="1" fill="#fff" opacity=".25"/>
    <rect x="37" y="52" width="26" height="9" rx="2" fill="#111"/><rect x="27" y="61" width="16" height="9" rx="2" fill="#111"/><rect x="57" y="61" width="16" height="9" rx="2" fill="#111"/>
    <rect x="12" y="8" width="76" height="30" rx="5" fill="#fff" opacity=".06"/>
  </svg>`,
  roblox: `<svg width="86" height="86" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="rbG" cx="35%" cy="25%" r="65%"><stop offset="0%" stop-color="#ff6666"/><stop offset="100%" stop-color="#660000"/></radialGradient><filter id="rbShadow"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity=".5"/></filter></defs>
    <rect x="10" y="10" width="80" height="80" rx="18" fill="url(#rbG)" filter="url(#rbShadow)"/>
    <rect x="10" y="10" width="80" height="36" rx="18" fill="#fff" opacity=".07"/>
    <rect x="26" y="22" width="13" height="56" rx="3" fill="white"/><rect x="26" y="22" width="38" height="13" rx="3" fill="white"/>
    <rect x="51" y="22" width="13" height="38" rx="3" fill="white"/><rect x="26" y="47" width="34" height="13" rx="3" fill="white"/>
    <line x1="46" y1="60" x2="66" y2="78" stroke="white" stroke-width="13" stroke-linecap="round"/>
    <rect x="10" y="60" width="80" height="30" rx="18" fill="#000" opacity=".08"/>
  </svg>`
};

export function getSlotStatus(slots) {
  if (slots === 0) return { cls: 'full', label: 'PENUH' };
  if (slots <= 2) return { cls: 'limited', label: `${slots} SLOT` };
  return { cls: 'available', label: `${slots} SLOT` };
}

export function renderGames() {
  const grid = document.getElementById('gamesGrid');
  if (!grid) return;
  const totalSlots = Object.values(state.slotData).reduce((a,b) => a+b, 0);
  document.getElementById('heroSlotNum').textContent = totalSlots;
  grid.innerHTML = CONFIG.games.map(g => {
    const slots = state.slotData[g.id] ?? 5;
    const st = getSlotStatus(slots);
    const stars = '★'.repeat(Math.floor(g.rating)) + '☆'.repeat(5 - Math.floor(g.rating));
    const iconSvg = GAME_ICONS[g.id] || '';
    return `<div class="game-card fade-up" onclick="scrollToOrder('${g.name}')">
      <div class="game-img" style="background:${g.bg};overflow:hidden;">
        <div class="game-icon-wrap">${iconSvg}</div>
        <div class="game-badges">${g.badge === 'hot' ? '<span class="badge badge-hot">HOT</span>' : ''}</div>
        <div class="slot-badge ${st.cls}">${st.label}</div>
      </div>
      <div class="game-body">
        <div class="game-category">${g.category}</div>
        <div class="game-name">${g.name}</div>
        <div class="game-desc">${g.desc}</div>
        <div class="game-price-row">
          <div class="game-price">${g.price}<small>/hari</small></div>
          <div class="rating">${stars} <span style="color:var(--text-muted)">${g.rating}</span></div>
        </div>
      </div>
    </div>`;
  }).join('');
  observeFadeUps();
}

export function renderTestimonials() {
  document.getElementById('testiGrid').innerHTML = CONFIG.testimonials.map(t => `
    <div class="testi-card fade-up">
      <div class="testi-stars">${'★'.repeat(t.stars)}</div>
      <div class="testi-text">"${t.text}"</div>
      <div class="testi-author">
        <div class="testi-avatar" style="font-size:.75rem;font-family:var(--font-head);font-weight:700;color:var(--neon-cyan);">${t.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</div>
        <div><div class="testi-name">${t.name}</div><div class="testi-game">${t.game}</div></div>
      </div>
    </div>`).join('');
  observeFadeUps();
}

export function renderFaq() {
  document.getElementById('faqList').innerHTML = CONFIG.faq.map((f, i) => `
    <div class="faq-item" id="faq${i}">
      <div class="faq-question" onclick="toggleFaq(${i})">${f.q}<div class="faq-arrow">▼</div></div>
      <div class="faq-answer"><div class="faq-answer-inner">${f.a}</div></div>
    </div>`).join('');
}

export function toggleFaq(i) {
  const item = document.getElementById('faq'+i);
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

export function updateNavUserChip() {
  const box = document.getElementById('adminGoogleUser');
  if (!box) return;
  if (state.googleUser) {
    document.getElementById('adminGoogleAvatar').src = state.googleUser.picture;
    document.getElementById('adminGoogleName').textContent = state.googleUser.name;
    document.getElementById('adminGoogleEmail').textContent = state.googleUser.email;
    box.style.display = 'flex';
  } else {
    box.style.display = 'none';
  }
}

export function applyServerStatus() {
  const banner = document.getElementById('serverBanner');
  const badge = document.getElementById('heroBadge');
  const statusRow = document.getElementById('specStatusRow');
  const statusVal = document.getElementById('specStatusVal');
  const overlay = document.getElementById('orderDisabledOverlay');
  if (state.serverOnline) {
    banner.classList.remove('show');
    document.body.classList.remove('server-down');
    badge.classList.remove('down');
    badge.textContent = 'SERVER AKTIF 24/7';
    statusRow.className = 'server-status-row online';
    statusVal.textContent = 'ONLINE';
    statusVal.style.color = 'var(--neon-green)';
    overlay?.classList.remove('show');
  } else {
    banner.classList.add('show');
    document.body.classList.add('server-down');
    badge.classList.add('down');
    badge.textContent = 'SERVER SEDANG DOWN';
    statusRow.className = 'server-status-row offline';
    statusVal.textContent = 'MAINTENANCE';
    statusVal.style.color = 'var(--neon-red)';
    overlay?.classList.add('show');
  }
}

export function updateLinks() {
  const wa = state.settings.whatsapp || CONFIG.whatsapp;
  const dc = state.settings.discord || CONFIG.discord;
  document.querySelectorAll('.wa-link').forEach(el => el.href = `https://wa.me/${wa}`);
  const dcBtn = document.getElementById('dcBtn');
  const floatDc = document.getElementById('floatDc');
  if (dcBtn) dcBtn.href = dc;
  if (floatDc) floatDc.href = dc;
}

export function closeModal(id) {
  document.getElementById(id).classList.remove('show');
}

export function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}

export function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.ceil(target / 40);
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur + (id === 'counterOrders' ? '+' : id === 'counterUsers' ? '+' : '');
    if (cur >= target) clearInterval(t);
  }, 40);
}

export function observeFadeUps() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up:not(.visible)').forEach(el => obs.observe(el));
}

export function scrollToOrder(gameName) {
  document.getElementById('f_game').value = gameName;
  document.getElementById('order').scrollIntoView({behavior:'smooth'});
}

export function openWaContact(e) {
  e.preventDefault();
  const msg = 'Halo NatirelCloud! Saya ingin bertanya tentang layanan AFK gaming kalian. Bisa dibantu?';
  const wa = state.settings.whatsapp || CONFIG.whatsapp;
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank');
}

window.toggleFaq = toggleFaq;
window.closeModal = closeModal;
window.toggleMenu = toggleMenu;
window.scrollToOrder = scrollToOrder;
window.openWaContact = openWaContact;
