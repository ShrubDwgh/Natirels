import { db, state, CONFIG } from './config.js';
import { doc, addDoc, collection, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export function genCode(prefix, len=4) {
  return prefix + Math.random().toString(36).substring(2, 2+len).toUpperCase();
}

export async function submitOrder() {
  const name = document.getElementById('f_name').value.trim();
  const wa = document.getElementById('f_wa').value.trim();
  const game = document.getElementById('f_game').value;
  const pkg = document.getElementById('f_package').value;
  const dur = document.getElementById('f_duration').value;
  const account = document.getElementById('f_account').value.trim();
  const server = document.getElementById('f_server').value.trim();
  const password = document.getElementById('f_password').value.trim();
  const note = document.getElementById('f_note').value.trim();

  if (!name || !wa || !game || !pkg || !dur || !account || !server || !password) {
    alert('Harap isi semua field yang wajib diisi!'); return;
  }

  const code = genCode('NC');
  const loginCode = genCode('LC', 6);
  const date = new Date().toLocaleDateString('id-ID');

  const order = { code, name, wa, game, package: pkg, duration: dur, account, server, password, note, date, status: 'menunggu', loginCode };

  try {
    const docRef = await addDoc(collection(db, 'afk_orders'), order);
    order._id = docRef.id;
    state.orders.unshift(order);
    state.loginCodes[loginCode] = code;

    const codesDoc = doc(db, 'afk_config', 'loginCodes');
    await updateDoc(codesDoc, { [loginCode]: code }).catch(() =>
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js").then(({setDoc}) =>
        setDoc(codesDoc, state.loginCodes)
      )
    );
  } catch(e) { console.error('Submit order error:', e); }

  document.getElementById('orderCode').textContent = code;
  const waMsg = `Halo NatirelCloud! Saya ingin konfirmasi order.\n\nKode Order: ${code}\nNama: ${name}\nGame: ${game}\nPaket: ${pkg}\nDurasi: ${dur}\nIGN/Akun: ${account}\nServer: ${server}\nCatatan: ${note||'-'}\n\nMohon diproses. Terima kasih!`;
  document.getElementById('successWaBtn').href = `https://wa.me/${state.settings.whatsapp}?text=${encodeURIComponent(waMsg)}`;
  document.getElementById('successModal').classList.add('show');

  // Reset form
  ['f_name','f_wa','f_account','f_server','f_password','f_note'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

export function trackOrder() {
  const code = document.getElementById('tr_code').value.trim().toUpperCase();
  const found = state.orders.find(o => o.code === code);
  if (!found) {
    document.getElementById('trackerResult').innerHTML = '<div style="color:var(--neon-pink);font-family:var(--font-mono);font-size:.85rem;">Kode order tidak ditemukan.</div>';
    return;
  }
  renderTrackerResult(found);
}

function renderTrackerResult(found) {
  const statusMap = { menunggu:'Menunggu Konfirmasi', diproses:'Sedang Diproses', berjalan:'Sedang Berjalan', selesai:'Selesai' };
  const statusColor = { menunggu:'var(--neon-orange)', diproses:'var(--neon-cyan)', berjalan:'var(--neon-green)', selesai:'var(--text-muted)' };
  document.getElementById('trackerResult').innerHTML = `
    <div class="tracker-card">
      <div class="tracker-info">
        <div class="tracker-field"><div class="tracker-label">Kode Order</div><div class="tracker-val" style="color:var(--neon-cyan);letter-spacing:3px;">${found.code}</div></div>
        <div class="tracker-field"><div class="tracker-label">Nama</div><div class="tracker-val">${found.name}</div></div>
        <div class="tracker-field"><div class="tracker-label">Game</div><div class="tracker-val">${found.game}</div></div>
        <div class="tracker-field"><div class="tracker-label">Paket</div><div class="tracker-val">${found.package}</div></div>
        <div class="tracker-field"><div class="tracker-label">Durasi</div><div class="tracker-val">${found.duration}</div></div>
        <div class="tracker-field"><div class="tracker-label">Tanggal</div><div class="tracker-val">${found.date}</div></div>
        <div class="tracker-field"><div class="tracker-label">Status</div><div class="tracker-val" style="color:${statusColor[found.status]||'var(--neon-cyan)'};">${statusMap[found.status]||found.status}</div></div>
        <div class="tracker-field"><div class="tracker-label">Timer</div><div class="tracker-val" id="tr_timer">—</div></div>
      </div>
    </div>`;
  if (found.status === 'berjalan' && found.startedAt) {
    import('./admin.js').then(m => m.startOrderTimer(found, 'tr_timer'));
  }
}

window.submitOrder = submitOrder;
window.trackOrder = trackOrder;
