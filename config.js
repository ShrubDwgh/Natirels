import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const CONFIG = {
  whatsapp: "6287820071566",
  discord: "https://discord.gg/ccwJUJp7x",
  adminPass: "ahaza7881",
  games: [
    { id:"minecraft", name:"Minecraft", category:"Sandbox", icon:"", bg:"linear-gradient(135deg,#3d7a3d,#1a3a1a)", desc:"AFK farming resources, grind XP, atau running farm otomatis di server Minecraft kamu.", price:"Rp 15K", badge:"hot", rating:4.9 },
    { id:"roblox", name:"Roblox", category:"Sandbox", icon:"", bg:"linear-gradient(135deg,#cc4444,#661111)", desc:"AFK farming Robux, grind level, event farming, dan auto-collect di berbagai game Roblox.", price:"Rp 12K", badge:"hot", rating:4.8 }
  ],
  testimonials: [
    { name:"Rizky A.", game:"Minecraft", stars:5, text:"Mantap banget! Farming Minecraft jalan terus 24 jam. Admin fast respon dan akunnya aman!" },
    { name:"Sari D.", game:"Roblox", stars:5, text:"Bisa pantau status kapan saja!" },
    { name:"Budi S.", game:"Minecraft", stars:5, text:"Udah 1 bulan langganan. Worth banget! Recommended!" },
    { name:"Fitri N.", game:"Roblox", stars:4, text:"Service bagus, harga terjangkau. berjalan sempurna." },
    { name:"Dani P.", game:"Minecraft", stars:5, text:"Resources farm Minecraft selesai sendiri. GG!" },
    { name:"Aisyah R.", game:"Roblox", stars:5, text:"Harga paling murah dibanding tempat lain. Top banget deh!" }
  ],
  faq: [
    { q:"Apakah akun saya aman?", a:"Sangat aman! Data akun hanya digunakan untuk keperluan AFK. Kami tidak melakukan transaksi, pembelian, atau perubahan apapun tanpa izin. Setelah masa layanan selesai, langsung ganti password kamu." },
    { q:"Bagaimana cara mendapatkan kode login pelanggan?", a:"Kode dikirimkan via WhatsApp setelah konfirmasi pembayaran. Kode unik hanya untuk kamu." },
    { q:"Berapa lama order diproses?", a:"Order diproses 15-30 menit setelah konfirmasi pembayaran diterima." },
    { q:"Apa yang terjadi jika server sedang down?", a:"Admin akan aktifkan notifikasi down dan menghubungi pelanggan aktif. Waktu down tidak diperhitungkan." },
    { q:"Metode pembayaran apa yang tersedia?", a:"Transfer bank (BCA, Mandiri, BNI, BRI), GoPay, OVO, DANA, dan ShopeePay." },
    { q:"Bisa game selain Minecraft dan Roblox?", a:"Mohon maaf belum bisa, untuk sekarang hanya bisa Minecraft dan Roblox saja." }
  ]
};

const firebaseConfig = {
  apiKey: "AIzaSyD42NPKvCVVTEnORPsYRNT151bwFf1pV94",
  authDomain: "natirelcloud.firebaseapp.com",
  projectId: "natirelcloud",
  storageBucket: "natirelcloud.firebasestorage.app",
  messagingSenderId: "934740855363",
  appId: "1:934740855363:web:e3ebf6a67759dc589ea2f6"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Shared mutable state — semua modul pakai object yang sama
export const state = {
  slotData: {},
  orders: [],
  loginCodes: {},
  suggestions: [],
  settings: { whatsapp: CONFIG.whatsapp, discord: CONFIG.discord, adminPass: CONFIG.adminPass },
  serverOnline: true,
  adminLoggedIn: false,
  googleUser: null,
  paketStatus: { starter:true, basic:true, pro:true, vip:true, elite:true, ultra:true },
  timerIntervals: {},
  orderFilter: 'semua'
};
