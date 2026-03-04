export function tryAutoplay() {
  const bgMusic = document.getElementById('bgMusic');
  const musicPlayer = document.getElementById('musicPlayer');
  if (!bgMusic) return;
  bgMusic.volume = parseFloat(document.getElementById('musicVol')?.value || 0.4);
  bgMusic.play().then(() => {
    musicPlayer?.classList.remove('paused');
    document.getElementById('iconPlay') && (document.getElementById('iconPlay').style.display = 'none');
    document.getElementById('iconPause') && (document.getElementById('iconPause').style.display = 'block');
  }).catch(() => {});
}

export function toggleMusic() {
  const bgMusic = document.getElementById('bgMusic');
  const musicPlayer = document.getElementById('musicPlayer');
  if (!bgMusic) return;
  if (bgMusic.paused) {
    bgMusic.play().then(() => {
      musicPlayer?.classList.remove('paused');
      document.getElementById('iconPlay').style.display = 'none';
      document.getElementById('iconPause').style.display = 'block';
    }).catch(() => {});
  } else {
    bgMusic.pause();
    musicPlayer?.classList.add('paused');
    document.getElementById('iconPlay').style.display = 'block';
    document.getElementById('iconPause').style.display = 'none';
  }
}

export function setMusicVol(v) {
  const bgMusic = document.getElementById('bgMusic');
  if (bgMusic) bgMusic.volume = parseFloat(v);
}

window.toggleMusic = toggleMusic;
window.setMusicVol = setMusicVol;
