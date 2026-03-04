import { db, CONFIG, state } from './config.js';
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initGoogleAuth } from './auth.js';
import { renderGames, renderTestimonials, renderFaq, applyServerStatus, updateLinks, observeFadeUps, animateCounter } from './ui.js';
import { applyPaketStatus, renderAdminDash } from './admin.js';

async function loadStorage() {
  try {
    const settingsDoc = await getDoc(doc(db, 'afk_config', 'settings'));
    if (settingsDoc.exists()) Object.assign(state.settings, settingsDoc.data());

    const serverDoc = await getDoc(doc(db, 'afk_config', 'server'));
    if (serverDoc.exists()) state.serverOnline = serverDoc.data().online ?? true;

    const slotsDoc = await getDoc(doc(db, 'afk_config', 'slots'));
    if (slotsDoc.exists()) Object.assign(state.slotData, slotsDoc.data());

    const ordersSnap = await getDocs(query(collection(db, 'afk_orders'), orderBy('date', 'desc')));
    state.orders.length = 0;
    ordersSnap.docs.forEach(d => state.orders.push({ _id: d.id, ...d.data() }));

    const codesDoc = await getDoc(doc(db, 'afk_config', 'loginCodes'));
    if (codesDoc.exists()) Object.assign(state.loginCodes, codesDoc.data());

    const suggSnap = await getDocs(query(collection(db, 'afk_suggestions'), orderBy('timestamp', 'desc')));
    state.suggestions.length = 0;
    suggSnap.docs.forEach(d => state.suggestions.push({ _id: d.id, ...d.data() }));

    const paketDoc = await getDoc(doc(db, 'afk_config', 'paketStatus'));
    if (paketDoc.exists()) Object.assign(state.paketStatus, paketDoc.data());

  } catch(e) { console.error('Firebase load error:', e); }

  if (!Object.keys(state.slotData).length) {
    CONFIG.games.forEach(g => { state.slotData[g.id] = 5; });
  }
}

async function submitSuggestion() {
  const name = document.getElementById('s_name').value.trim();
  const category = document.getElementById('s_cat').value;
  const message = document.getElementById('s_msg').value.trim();
  if (!name || !message) { alert('Isi nama dan pesan dulu!'); return; }
  const saran = { name, category, message, timestamp: Date.now(), read: false };
  try {
    const docRef = await addDoc(collection(db, 'afk_suggestions'), saran);
    saran._id = docRef.id;
    state.suggestions.unshift(saran);
  } catch(e) { console.error(e); }
  document.getElementById('suggForm').style.display = 'none';
  document.getElementById('suggSuccess').style.display = 'block';
}

function resetSuggestion() {
  document.getElementById('s_name').value = '';
  document.getElementById('s_msg').value = '';
  document.getElementById('suggForm').style.display = 'block';
  document.getElementById('suggSuccess').style.display = 'none';
}

async function initApp() {
  await loadStorage();
  applyServerStatus();
  updateLinks();
  renderGames();
  renderTestimonials();
  renderFaq();
  applyPaketStatus();
  observeFadeUps();

  const totalOrders = state.orders.length;
  const uniqueUsers = new Set(state.orders.map(o => o.wa)).size;
  animateCounter('counterOrders', totalOrders || 128);
  animateCounter('counterUsers', uniqueUsers || 64);
  animateCounter('counterGames', CONFIG.games.length);

  if (state.adminLoggedIn) renderAdminDash();

  // Init Google Auth
  initGoogleAuth();
}

window.submitSuggestion = submitSuggestion;
window.resetSuggestion = resetSuggestion;

document.addEventListener('DOMContentLoaded', initApp);
