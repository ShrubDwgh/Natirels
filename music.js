export function tryAutoplay() {
  const bgMusic = document.getElementById('bgMusic');
  const musicPlayer = document.getElementById('musicPlayer');
  if (!bgMusic) return;
  bgMusic.volume = parseFloat(document.getElementById('musicVol')?.value || 0.4);
  bgMusic.play().then(() => {
    musicPlayer?.classList.remove('paused');
    const ip = document.getElementById('iconPlay');
    const ipa = document.getElementById('iconPause');
    if (ip) ip.style.display = 'none';
    if (ipa) ipa.style.display = 'block';
  }).catch(() => {
    // Autoplay blocked — will play after first user interaction
    document.addEventListener('click', function playOnce() {
      bgMusic.play().then(() => {
        musicPlayer?.classList.remove('paused');
        const ip = document.getElementById('iconPlay');
        const ipa = document.getElementById('iconPause');
        if (ip) ip.style.display = 'none';
        if (ipa) ipa.style.display = 'block';
      }).catch(()=>{});
      document.removeEventListener('click', playOnce);
    }, { once: true });
  });
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
