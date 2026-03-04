import { state, CONFIG } from './config.js';
import { tryAutoplay } from './music.js';
import { updateNavUserChip } from './ui.js';

let pendingOTP = null;
let pendingWA = null;
const ADMIN_WA = CONFIG.whatsapp;

function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function showError(msg) {
  const el = document.getElementById('gateError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function hideError() {
  const el = document.getElementById('gateError');
  if (el) el.style.display = 'none';
}

window.requestOTP = function() {
  hideError();
  let wa = document.getElementById('gateWaInput').value.trim().replace(/\D/g,'');
  if (!wa || wa.length < 9) { showError('Masukkan nomor WA yang valid.'); return; }
  // Normalize: remove leading 0, add 62
  if (wa.startsWith('0')) wa = '62' + wa.slice(1);
  else if (!wa.startsWith('62')) wa = '62' + wa;

  pendingOTP = genOTP();
  pendingWA = wa;

  // Show OTP to user
  document.getElementById('otpDisplay').textContent = pendingOTP;

  // Set WA link to admin
  const msg = `Halo Admin NatirelCloud! Saya minta kode OTP untuk akses website.\n\nNomor WA: +${wa}\nKode OTP Saya: *${pendingOTP}*\n\nMohon kirimkan kode konfirmasi ke saya. Terima kasih!`;
  document.getElementById('otpWaBtn').href = `https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`;

  // Switch to step 2
  document.getElementById('gateStep1').style.display = 'none';
  document.getElementById('gateStep2').style.display = 'block';
};

window.verifyOTP = function() {
  hideError();
  const input = document.getElementById('gateOtpInput').value.trim().toUpperCase();
  if (!input) { showError('Masukkan kode dari admin.'); return; }
  if (!pendingOTP) { showError('Minta kode OTP dulu.'); return; }

  // Admin sends same OTP back to user — user enters it here
  if (input === pendingOTP) {
    state.googleUser = { name: 'Pengguna', wa: pendingWA, picture: null };
    updateNavUserChip();
    dismissLoginGate();
  } else {
    showError('Kode salah. Coba lagi atau minta kode baru.');
    document.getElementById('gateOtpInput').value = '';
  }
};

window.resetGate = function() {
  hideError();
  pendingOTP = null;
  pendingWA = null;
  document.getElementById('gateStep1').style.display = 'block';
  document.getElementById('gateStep2').style.display = 'none';
  document.getElementById('gateWaInput').value = '';
  document.getElementById('gateOtpInput').value = '';
  document.getElementById('otpDisplay').textContent = '------';
};

export function dismissLoginGate() {
  const gate = document.getElementById('loginGate');
  if (!gate) return;
  gate.style.transition = 'opacity .5s ease';
  gate.style.opacity = '0';
  setTimeout(() => {
    gate.style.display = 'none';
    tryAutoplay();
  }, 500);
}

export function googleSignOut() {
  state.googleUser = null;
  pendingOTP = null;
  pendingWA = null;
  const gate = document.getElementById('loginGate');
  if (gate) { gate.style.display = 'flex'; gate.style.opacity = '1'; window.resetGate(); }
  updateNavUserChip();
}

window.googleSignOut = googleSignOut;
