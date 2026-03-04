export function tryAutoplay() {
  const bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) return;
  bgMusic.volume = parseFloat(document.getElementById('musicVol')?.value || 0.35);
  bgMusic.play().then(() => setMusicPlayingUI(true)).catch(() => {
    // Blocked — play on first interaction
    const unlock = () => {
      bgMusic.play().then(() => setMusicPlayingUI(true)).catch(()=>{});
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
    };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
  });
}

function setMusicPlayingUI(playing) {
  const player = document.getElementById('musicPlayer');
  const ip  = document.getElementById('iconPlay');
  const ipa = document.getElementById('iconPause');
  if (player) player.classList.toggle('paused', !playing);
  if (ip)  ip.style.display  = playing ? 'none'  : 'block';
  if (ipa) ipa.style.display = playing ? 'block' : 'none';
}

export function toggleMusic() {
  const bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) return;
  if (bgMusic.paused) {
    bgMusic.play().then(() => setMusicPlayingUI(true)).catch(()=>{});
  } else {
    bgMusic.pause();
    setMusicPlayingUI(false);
  }
}

export function setMusicVol(v) {
  const bgMusic = document.getElementById('bgMusic');
  if (bgMusic) bgMusic.volume = parseFloat(v);
}

window.toggleMusic = toggleMusic;
window.setMusicVol = setMusicVol;
