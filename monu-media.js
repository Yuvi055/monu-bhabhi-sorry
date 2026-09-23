/* ============================================================
   MONU BHABHI JI — PRIVATE MEDIA LAYER (FIXED)
   Private Supabase bucket + signed URLs.
   ============================================================ */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://lqsvyglucnjtuzdflror.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_bb64OK-p8a76714juF91jA_6G61hdZ_';
const BUCKET = 'monu-private-media';

const MEDIA = {
  photo1: 'Photo 1.JPG.jpeg',
  photo2: 'Photo 2.JPG.jpeg',
  song: 'Song_.mov',
};

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let ready = false;
let songUrl = '';
let userInteracted = false;
let privateOpened = false;

function addUI() {
  if (document.getElementById('monuMedia')) return;

  const root = document.createElement('section');
  root.id = 'monuMedia';
  root.className = 'monu-media';
  root.hidden = true;
  root.innerHTML = `
    <div class="monu-media__backdrop"></div>
    <div class="monu-media__card" role="dialog" aria-modal="true" aria-label="Private memories for Monu Bhabhi Ji">
      <button class="monu-media__close" id="monuMediaClose" type="button" aria-label="Close memories">×</button>
      <p class="monu-media__eyebrow">A PRIVATE LITTLE MEMORY BOX</p>
      <h2>Monu Bhabhi Ji ❤️</h2>
      <p class="monu-media__intro">Just two memories and one song — kept private, just for you. 🫂</p>

      <div class="monu-media__photos">
        <figure class="monu-photo-card">
          <img id="monuPhoto1" alt="Private memory 1" loading="eager" />
          <figcaption>One beautiful memory ❤️</figcaption>
        </figure>
        <figure class="monu-photo-card">
          <img id="monuPhoto2" alt="Private memory 2" loading="eager" />
          <figcaption>A moment worth keeping ✨</figcaption>
        </figure>
      </div>

      <div class="monu-media__music">
        <button id="monuSongBtn" class="monu-song-btn" type="button">▶ PLAY MY SONG FOR YOU</button>
        <span id="monuSongStatus">Preparing your private memories…</span>
      </div>

      <video id="monuSong" class="monu-song" preload="metadata" playsinline loop aria-label="Private song"></video>
      <p class="monu-media__footer">Made with love by Yuvi ❤️</p>
    </div>
  `;
  document.body.appendChild(root);

  document.getElementById('monuMediaClose')?.addEventListener('click', hidePrivateMemories);
  document.getElementById('monuSongBtn')?.addEventListener('click', toggleSong);

  const backdrop = root.querySelector('.monu-media__backdrop');
  backdrop?.addEventListener('click', hidePrivateMemories);
}

function setStatus(text) {
  const el = document.getElementById('monuSongStatus');
  if (el) el.textContent = text;
}

function waitForImage(img, src) {
  return new Promise((resolve, reject) => {
    const finish = () => resolve();
    img.onload = finish;
    img.onerror = () => reject(new Error('Image failed to load'));
    img.src = src;
    if (img.complete && img.naturalWidth > 0) finish();
  });
}

async function signedUrl(path, expiresIn = 7200) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error(`No signed URL returned for ${path}`);
  return data.signedUrl;
}

async function ensureAnonymousSession() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session) return sessionData.session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data?.session) throw new Error('Anonymous session was not created.');
  return data.session;
}

async function preparePrivateMedia() {
  addUI();
  setStatus('Connecting to your private memories…');

  try {
    await ensureAnonymousSession();

    const [photo1, photo2, song] = await Promise.all([
      signedUrl(MEDIA.photo1),
      signedUrl(MEDIA.photo2),
      signedUrl(MEDIA.song),
    ]);

    const photo1El = document.getElementById('monuPhoto1');
    const photo2El = document.getElementById('monuPhoto2');
    const songEl = document.getElementById('monuSong');

    if (!photo1El || !photo2El || !songEl) throw new Error('Private media UI is missing.');

    await Promise.all([
      waitForImage(photo1El, photo1),
      waitForImage(photo2El, photo2),
    ]);

    songUrl = song;
    songEl.src = song;
    songEl.volume = 0.45;

    songEl.addEventListener('error', () => {
      setStatus('The private song is loaded but this browser cannot play this MOV.');
    }, { once: true });

    ready = true;
    setStatus('Private memories are ready. ❤️');

    // If the visitor already interacted and the film is finished, try the song now.
    if (userInteracted && window.bdayDone) {
      startSong();
    }

    // Show automatically once the cinematic film has finished.
    if (window.bdayDone) showPrivateMemories();
  } catch (error) {
    console.error('[Monu private media]', error);
    setStatus('Private media could not be loaded. Please refresh once.');
  }
}

async function startSong() {
  if (!ready || !songUrl) return false;
  const songEl = document.getElementById('monuSong');
  if (!songEl) return false;

  try {
    if (songEl.src !== songUrl) songEl.src = songUrl;
    await songEl.play();
    const btn = document.getElementById('monuSongBtn');
    if (btn) btn.textContent = '❚❚ PAUSE MY SONG';
    setStatus('Playing privately for you ❤️');
    return true;
  } catch (error) {
    console.warn('[Monu song]', error);
    setStatus('Tap PLAY MY SONG FOR YOU to start the music.');
    return false;
  }
}

function toggleSong() {
  userInteracted = true;
  const songEl = document.getElementById('monuSong');
  const btn = document.getElementById('monuSongBtn');
  if (!songEl) return;

  if (!songEl.paused) {
    songEl.pause();
    if (btn) btn.textContent = '▶ PLAY MY SONG FOR YOU';
    setStatus('Paused • tap play whenever you want ❤️');
    return;
  }

  startSong();
}

function showPrivateMemories() {
  if (!ready) return;
  addUI();
  const root = document.getElementById('monuMedia');
  if (!root) return;

  privateOpened = true;
  root.hidden = false;
  requestAnimationFrame(() => root.classList.add('is-visible'));

  // A user gesture has already happened on this page during the film.
  startSong();
}

function hidePrivateMemories() {
  const root = document.getElementById('monuMedia');
  const songEl = document.getElementById('monuSong');
  const btn = document.getElementById('monuSongBtn');

  if (songEl) songEl.pause();
  if (btn) btn.textContent = '▶ PLAY MY SONG FOR YOU';
  if (root) {
    root.classList.remove('is-visible');
    setTimeout(() => { root.hidden = true; }, 450);
  }
  privateOpened = false;
}

function watchFilmEnd() {
  setInterval(() => {
    if (window.bdayDone && ready && !privateOpened) showPrivateMemories();
  }, 300);
}

// Mobile browser audio unlock: remember that a real gesture happened.
window.addEventListener('pointerup', () => {
  userInteracted = true;
  if (window.bdayDone) startSong();
}, { passive: true });

window.addEventListener('keydown', () => {
  userInteracted = true;
  if (window.bdayDone) startSong();
}, { passive: true });

addUI();
preparePrivateMedia();
watchFilmEnd();
