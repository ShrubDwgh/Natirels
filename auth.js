import { state, CONFIG } from './config.js';
import { tryAutoplay } from './music.js';
import { updateNavUserChip } from './ui.js';

const CLIENT_ID = '603525005353-7fuci84idnsqm7lvuvtdltr29mtv7kur.apps.googleusercontent.com';

export function initGoogleAuth() {
  if (typeof google === 'undefined') {
    setTimeout(initGoogleAuth, 300);
    return;
  }
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleGoogleCredential,
    auto_select: true,
    cancel_on_tap_outside: false
  });
  google.accounts.id.prompt();
}

function handleGoogleCredential(response) {
  try {
    const payload = parseJwt(response.credential);
    state.googleUser = { name: payload.name, email: payload.email, picture: payload.picture };
    const nameEl = document.getElementById('f_name');
    if (nameEl && !nameEl.value) nameEl.value = state.googleUser.name;
    updateNavUserChip();
    dismissLoginGate();
  } catch(e) {
    console.error('Google auth error:', e);
    const err = document.getElementById('gateError');
    if (err) { err.textContent = 'Login gagal, coba lagi.'; err.style.display = 'block'; }
  }
}

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

function parseJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
  return JSON.parse(decodeURIComponent(escape(atob(base64))));
}

export function googleSignOut() {
  state.googleUser = null;
  if (typeof google !== 'undefined') google.accounts.id.disableAutoSelect();
  const gate = document.getElementById('loginGate');
  if (gate) { gate.style.display = 'flex'; gate.style.opacity = '1'; }
  updateNavUserChip();
}

// Expose to window for HTML onclick and Google callback
window._initGoogleAuth = initGoogleAuth;
if (typeof google !== 'undefined') initGoogleAuth();

window.googleSignInManual = function() {
  if (typeof google === 'undefined') {
    const err = document.getElementById('gateError');
    if (err) { err.textContent = 'Google Sign-In belum siap. Coba refresh halaman.'; err.style.display = 'block'; }
    return;
  }
  google.accounts.id.prompt(function(notification) {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: 'openid email profile',
          callback: () => {}
        });
        client.requestAccessToken();
      } catch(e) {
        const err = document.getElementById('gateError');
        if (err) { err.textContent = 'Popup diblokir. Coba nonaktifkan ad-blocker.'; err.style.display = 'block'; }
      }
    }
  });
};

window.googleSignOut = googleSignOut;
