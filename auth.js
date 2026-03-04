import { state, CONFIG } from './config.js';

const ADMIN_WA = CONFIG.whatsapp;
let pendingOTP = null;
let pendingWA  = null;
let authMode   = 'wa'; // 'wa' | 'google'

/* ── helpers ── */
function showErr(msg) {
  const el = document.getElementById('gateError');
  if (!el) return;
  el.textContent = msg; el.style.display = 'block';
  el.animate([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],{duration:250,fill:'forwards'});
}
function hideErr() {
  const el = document.getElementById('gateError');
  if (el) el.style.display = 'none';
}
function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function normalizeWA(raw) {
  let n = raw.replace(/\D/g,'');
  if (n.startsWith('0')) n = '62' + n.slice(1);
  else if (!n.startsWith('62')) n = '62' + n;
  return n;
}

/* ── dismiss gate ── */
export function dismissLoginGate() {
  const gate = document.getElementById('loginGate');
  if (!gate) return;
  gate.style.transition = 'opacity .5s ease';
  gate.style.opacity = '0';
  setTimeout(() => {
    gate.style.display = 'none';
    // autoplay music after user interaction
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic) bgMusic.play().catch(()=>{});
  }, 500);
}
window.dismissLoginGate = dismissLoginGate;

/* ── sign out ── */
export function signOut() {
  state.googleUser = null;
  pendingOTP = null; pendingWA = null;
  const gate = document.getElementById('loginGate');
  if (gate) { gate.style.display = 'flex'; gate.style.opacity = '1'; }
  window.resetGate && window.resetGate();
  const box = document.getElementById('adminGoogleUser');
  if (box) box.style.display = 'none';
}
window.googleSignOut = signOut;

/* ══════════════════════════════
   WA OTP FLOW
══════════════════════════════ */
window.requestOTP = function() {
  hideErr();
  const raw = document.getElementById('gateWaInput')?.value.trim();
  if (!raw || raw.replace(/\D/g,'').length < 9) { showErr('Nomor WA tidak valid.'); return; }
  const wa = normalizeWA(raw);
  pendingOTP = genOTP();
  pendingWA  = wa;

  document.getElementById('otpDisplay').textContent = pendingOTP;

  const msg = `Halo Admin NatirelCloud!\n\nSaya ingin verifikasi akses website.\nNo WA: +${wa}\nKode OTP saya: *${pendingOTP}*\n\nTolong kirimkan kode konfirmasi ke saya. Terima kasih!`;
  document.getElementById('otpWaBtn').href = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;

  // animate step transition
  const s1 = document.getElementById('gateStep1');
  const s2 = document.getElementById('gateStep2');
  s1.style.transition = 'opacity .25s, transform .25s';
  s1.style.opacity = '0'; s1.style.transform = 'translateX(-20px)';
  setTimeout(() => {
    s1.style.display = 'none';
    s2.style.display = 'block';
    s2.style.opacity = '0'; s2.style.transform = 'translateX(20px)';
    s2.style.transition = 'opacity .25s, transform .25s';
    requestAnimationFrame(() => { s2.style.opacity = '1'; s2.style.transform = 'translateX(0)'; });
  }, 250);
};

window.verifyOTP = function() {
  hideErr();
  const input = document.getElementById('gateOtpInput')?.value.trim().toUpperCase();
  if (!input) { showErr('Masukkan kode dari admin.'); return; }
  if (!pendingOTP) { showErr('Minta kode OTP dulu.'); return; }
  if (input === pendingOTP) {
    state.googleUser = { name: 'Pengguna WA', wa: pendingWA, picture: null };
    dismissLoginGate();
  } else {
    showErr('Kode salah. Periksa kembali.');
    const inp = document.getElementById('gateOtpInput');
    inp.value = '';
    inp.animate([{borderColor:'var(--neon-pink)'},{borderColor:'var(--border)'}],{duration:600,fill:'forwards'});
  }
};

window.resetGate = function() {
  hideErr();
  pendingOTP = null; pendingWA = null;
  const s1 = document.getElementById('gateStep1');
  const s2 = document.getElementById('gateStep2');
  if (s1) { s1.style.display = 'block'; s1.style.opacity = '1'; s1.style.transform = 'none'; }
  if (s2) { s2.style.display = 'none'; }
  const wi = document.getElementById('gateWaInput'); if (wi) wi.value = '';
  const oi = document.getElementById('gateOtpInput'); if (oi) oi.value = '';
  const od = document.getElementById('otpDisplay'); if (od) od.textContent = '------';
};

/* ══════════════════════════════
   GOOGLE FLOW
══════════════════════════════ */
const CLIENT_ID = '603525005353-7fuci84idnsqm7lvuvtdltr29mtv7kur.apps.googleusercontent.com';

function parseJwt(token) {
  const b64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
  return JSON.parse(decodeURIComponent(escape(atob(b64))));
}

function handleGoogleCredential(response) {
  try {
    const p = parseJwt(response.credential);
    state.googleUser = { name: p.name, email: p.email, picture: p.picture };
    dismissLoginGate();
    const box = document.getElementById('adminGoogleUser');
    if (box) {
      document.getElementById('adminGoogleAvatar').src = p.picture;
      document.getElementById('adminGoogleName').textContent  = p.name;
      document.getElementById('adminGoogleEmail').textContent = p.email;
      box.style.display = 'flex';
    }
  } catch(e) {
    showErr('Login Google gagal, coba lagi.');
  }
}

function initGoogleAuth() {
  if (typeof google === 'undefined') { setTimeout(initGoogleAuth, 300); return; }
  google.accounts.id.initialize({ client_id: CLIENT_ID, callback: handleGoogleCredential, auto_select: true, cancel_on_tap_outside: false });
  google.accounts.id.prompt();
  // render button into slot
  const slot = document.getElementById('googleBtnSlot');
  if (slot) {
    google.accounts.id.renderButton(slot, { theme:'filled_black', size:'large', shape:'pill', width:280, text:'signin_with' });
  }
}
window._initGoogleAuth = initGoogleAuth;
if (typeof google !== 'undefined') initGoogleAuth();

/* ── tab switcher ── */
window.switchAuthMode = function(mode) {
  authMode = mode;
  hideErr();
  document.getElementById('authTabWa').classList.toggle('active', mode==='wa');
  document.getElementById('authTabGoogle').classList.toggle('active', mode==='google');
  document.getElementById('authPanelWa').style.display     = mode==='wa'     ? 'block' : 'none';
  document.getElementById('authPanelGoogle').style.display = mode==='google' ? 'block' : 'none';
  if (mode === 'google') initGoogleAuth();
};
