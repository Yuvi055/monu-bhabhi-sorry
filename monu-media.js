/*
  MONU BHABHI JI — PRIVATE MEDIA LAYER v5
  - Keeps the original cinematic bow/heart/tree animation untouched.
  - Reveals private memories only after the original film finishes.
  - Two medium-size premium framed photos.
  - Private MOV song in a compact music-player card.
  - Song attempts to start from the visitor's first gesture; manual Play is always available.
  - Uses Supabase private bucket + signed URLs.
*/

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://lqsvyglucnjtuzdflror.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_bb64OK-p8a76714juF91jA_6G61hdZ_';
const BUCKET = 'monu-private-media';

const EXPECTED = {
  photo1: 'Photo 1.JPG.jpeg',
  photo2: 'Photo 2.JPG.jpeg',
  song: 'Song_.mov',
};

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);

const state = {
  songUrl: '',
  songEl: null,
  songReady: false,
  playRequested: false,
};

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

function createNode(tag, attrs = {}) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key === 'className') node.className = value;
    else if (key === 'style') Object.assign(node.style, value);
    else if (value !== undefined && value !== null) {
      node.setAttribute(key, value);
    }
  }

  return node;
}

function injectStyles() {
  if (document.getElementById('monu-media-v5-style')) return;

  const style = document.createElement('style');

  style.id = 'monu-media-v5-style';

  style.textContent = `
    #monuPrivateMediaV5 {
      position: absolute;
      inset: 0;
      z-index: 10;
      overflow-y: auto;
      overflow-x: hidden;
      padding: clamp(46px, 8vh, 88px) 22px 70px;

      background:
        radial-gradient(
          900px 500px at 50% -10%,
          rgba(255,211,184,.95),
          transparent 62%
        ),
        radial-gradient(
          700px 520px at 95% 75%,
          rgba(255,175,198,.34),
          transparent 66%
        ),
        linear-gradient(
          145deg,
          rgba(255,247,240,.97),
          rgba(247,221,209,.95)
        );

      color: #4a2a1c;

      box-shadow:
        inset 0 1px 0 rgba(255,255,255,.55);

      opacity: 0;
      visibility: hidden;

      transform:
        translateY(32px)
        scale(.985);

      pointer-events: none;

      transition:
        opacity 1s cubic-bezier(.2,.7,.2,1),
        transform 1.1s cubic-bezier(.2,.7,.2,1),
        visibility 0s linear 1s;
    }

    #monuPrivateMediaV5.is-visible {
      opacity: 1;
      visibility: visible;

      transform:
        translateY(0)
        scale(1);

      pointer-events: auto;

      transition-delay: 0s;
    }

    #monuPrivateMediaV5::-webkit-scrollbar {
      width: 6px;
    }

    #monuPrivateMediaV5::-webkit-scrollbar-track {
      background: transparent;
    }

    #monuPrivateMediaV5::-webkit-scrollbar-thumb {
      background: rgba(125,63,70,.24);
      border-radius: 999px;
    }

    .monuV5-wrap {
      width: min(980px, 100%);
      margin: 0 auto;
    }

    .monuV5-credits {
      text-align: center;
      margin-bottom: 30px;

      animation:
        monuV5Drop .9s .15s both;
    }

    .monuV5-brand {
      display: inline-block;

      font:
        700 10px/1.2
        "Cormorant Garamond",
        Georgia,
        serif;

      letter-spacing: .28em;
      text-transform: uppercase;

      color: #9a4e61;

      margin-bottom: 10px;
    }

    .monuV5-title {
      margin: 0;

      font:
        700 clamp(32px, 5.5vw, 58px)/.98
        "Fraunces",
        Georgia,
        serif;

      color: #512718;
      letter-spacing: -.025em;
    }

    .monuV5-sub {
      margin: 12px auto 0;
      max-width: 620px;

      font:
        600 clamp(16px, 2.3vw, 21px)/1.35
        "Cormorant Garamond",
        Georgia,
        serif;

      color: #80515a;
    }

    /* =========================
       MUSIC CARD
    ========================== */

    .monuV5-music {
      width: min(680px, 100%);
      margin: 0 auto 38px;

      padding: 16px 18px 18px;

      border-radius: 22px;

      background:
        linear-gradient(
          145deg,
          rgba(255,255,255,.82),
          rgba(255,244,239,.62)
        );

      border:
        1px solid
        rgba(131,67,78,.16);

      box-shadow:
        0 18px 50px rgba(79,33,31,.13),
        inset 0 1px 0 rgba(255,255,255,.8);

      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);

      animation:
        monuV5Rise .9s .35s both;
    }

    .monuV5-musicHead {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 10px;
    }

    .monuV5-disc {
      width: 42px;
      height: 42px;

      border-radius: 50%;

      display: grid;
      place-items: center;

      flex: 0 0 auto;

      background:
        radial-gradient(
          circle at 35% 30%,
          #ffdfe7 0 10%,
          #e75b83 18%,
          #8f2147 75%,
          #5e102f 100%
        );

      box-shadow:
        0 8px 18px rgba(137,31,70,.22);

      animation:
        monuV5Spin 6s linear infinite;
    }

    .monuV5-disc::after {
      content: "♥";
      color: #fff9f7;
      font-size: 14px;
    }

    .monuV5-songTitle {
      font:
        700 17px/1.15
        "Fraunces",
        Georgia,
        serif;

      color: #56291e;
    }

    .monuV5-songNote {
      margin-top: 3px;

      font:
        600 13px/1.2
        "Cormorant Garamond",
        Georgia,
        serif;

      color: #8b5b64;
    }

    .monuV5-music audio,
    .monuV5-music video {
      display: block;
      width: 100%;
      border-radius: 13px;
      margin-top: 12px;
    }

    .monuV5-music audio {
      height: 42px;
    }

    .monuV5-music video {
      max-height: 130px;
      background: #24170f;
      object-fit: cover;
    }

    .monuV5-play {
      width: 100%;
      margin-top: 10px;

      border: 0;
      border-radius: 999px;

      padding: 11px 18px;

      background:
        linear-gradient(
          135deg,
          #9b214e,
          #d14970
        );

      color: #fff;

      font:
        700 12px/1
        "Cormorant Garamond",
        Georgia,
        serif;

      letter-spacing: .18em;
      text-transform: uppercase;

      cursor: pointer;

      box-shadow:
        0 9px 22px rgba(137,31,70,.2);

      transition:
        transform .2s ease,
        filter .2s ease;
    }

    .monuV5-play:hover {
      filter: brightness(1.05);
      transform: translateY(-1px);
    }

    .monuV5-play:active {
      transform: translateY(0);
    }

    /* =========================
       PHOTO GALLERY
    ========================== */

    .monuV5-gallery {
      display: flex;
      justify-content: center;
      align-items: flex-start;

      gap:
        clamp(20px, 5vw, 52px);

      flex-wrap: wrap;

      margin-top: 10px;
    }

    .monuV5-photoCard {
      width:
        min(285px, 42vw);

      min-width: 220px;

      padding:
        11px 11px 15px;

      background:
        #fffaf6;

      box-shadow:
        0 20px 42px rgba(70,36,31,.17),
        0 0 0 1px rgba(80,35,32,.08);

      position: relative;

      transition:
        transform .35s cubic-bezier(.2,.75,.2,1),
        box-shadow .35s ease;

      animation:
        monuV5PhotoIn .95s both;
    }

    .monuV5-photoCard:nth-child(1) {
      transform: rotate(-2.4deg);
      animation-delay: .55s;
    }

    .monuV5-photoCard:nth-child(2) {
      transform: rotate(2.8deg);
      animation-delay: .72s;
    }

    .monuV5-photoCard:hover {
      transform:
        translateY(-8px)
        rotate(0deg)
        scale(1.015);

      box-shadow:
        0 26px 52px rgba(70,36,31,.22),
        0 0 0 1px rgba(80,35,32,.08);
    }

    .monuV5-photoCard::before {
      content: "";

      position: absolute;
      inset: 6px;

      border:
        1px solid
        rgba(143,76,79,.16);

      pointer-events: none;
    }

    .monuV5-photoCard img {
      display: block;

      width: 100%;

      height:
        clamp(250px, 31vw, 330px);

      object-fit: cover;

      border:
        5px solid #fff;

      background:
        #f3e7df;
    }

    .monuV5-photoCard:nth-child(2) img {
      clip-path:
        polygon(
          0 0,
          98% 2%,
          100% 98%,
          2% 100%
        );
    }

    .monuV5-caption {
      padding: 11px 5px 0;

      text-align: center;

      font:
        600 18px/1.08
        "Cormorant Garamond",
        Georgia,
        serif;

      color: #6f404b;
    }

    .monuV5-caption small {
      display: block;

      margin-top: 4px;

      font-size: 12px;
      letter-spacing: .12em;
      text-transform: uppercase;

      color: #aa717b;
    }

    .monuV5-status {
      margin:
        26px auto 0;

      text-align: center;

      max-width: 720px;

      font:
        500 12px/1.5
        "Cormorant Garamond",
        Georgia,
        serif;

      color: #94646d;

      opacity: .8;
    }

    .monuV5-error {
      width:
        min(720px, 100%);

      margin:
        15px auto 0;

      padding:
        10px 13px;

      border-radius: 12px;

      background:
        rgba(156,33,63,.07);

      color: #7b1f38;

      font:
        600 13px/1.45
        "Cormorant Garamond",
        Georgia,
        serif;

      text-align: center;
    }

    .monuV5-signature {
      margin-top: 32px;

      text-align: center;

      font:
        600 italic 18px/1.2
        "Great Vibes",
        cursive;

      color: #995367;

      animation:
        monuV5Rise 1s 1s both;
    }

    @keyframes monuV5Drop {
      from {
        opacity: 0;
        transform: translateY(-18px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes monuV5Rise {
      from {
        opacity: 0;
        transform: translateY(18px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes monuV5PhotoIn {
      from {
        opacity: 0;
        transform:
          translateY(24px)
          scale(.96)
          rotate(0deg);
      }

      to {
        opacity: 1;
      }
    }

    @keyframes monuV5Spin {
      from {
        transform: rotate(0deg);
      }

      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 700px) {

      #monuPrivateMediaV5 {
        padding:
          34px 14px 60px;
      }

      .monuV5-title {
        font-size:
          clamp(30px, 10vw, 44px);
      }

      .monuV5-gallery {
        flex-direction: column;
        align-items: center;
        gap: 24px;
      }

      .monuV5-photoCard {
        width:
          min(300px, 82vw);

        min-width: 0;
      }

      .monuV5-photoCard img {
        height:
          min(360px, 112vw);
      }

      .monuV5-photoCard:nth-child(1),
      .monuV5-photoCard:nth-child(2) {
        transform: rotate(0deg);
      }
    }
  `;

  document.head.appendChild(style);
}

async function ensureAnonymousSession() {
  const current =
    await supabase.auth.getSession();

  if (
    current?.data?.session?.access_token
  ) {
    return current.data.session;
  }

  const { data, error } =
    await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(
      `Anonymous sign-in failed: ${error.message}`
    );
  }

  return data.session;
}

async function listObjects() {
  const { data, error } =
    await supabase.storage
      .from(BUCKET)
      .list('', {
        limit: 100,
        offset: 0
      });

  if (error) {
    throw new Error(
      `Bucket list failed: ${error.message}`
    );
  }

  return Array.isArray(data)
    ? data.filter(
        item => item?.name
      )
    : [];
}

function resolveObject(
  objects,
  expected,
  kind
) {
  const target =
    normalizeName(expected);

  return (
    objects.find(
      o =>
        normalizeName(o.name) ===
        target
    ) ||

    objects.find(
      o =>
        normalizeName(o.name)
          .replace(/\s+/g, '') ===
        target.replace(/\s+/g, '')
    ) ||

    (
      kind === 'photo1'
        ? objects.find(
            o =>
              normalizeName(
                o.name
              ).includes(
                'photo 1'
              )
          )
        : null
    ) ||

    (
      kind === 'photo2'
        ? objects.find(
            o =>
              normalizeName(
                o.name
              ).includes(
                'photo 2'
              )
          )
        : null
    ) ||

    (
      kind === 'song'
        ? objects.find(
            o =>
              normalizeName(
                o.name
              ).includes(
                'song'
              )
          )
        : null
    ) ||

    null
  );
}

async function signedUrl(path) {
  const { data, error } =
    await supabase.storage
      .from(BUCKET)
      .createSignedUrl(
        path,
        60 * 60
      );

  if (error) {
    throw new Error(
      `Signed URL failed for ${path}: ${error.message}`
    );
  }

  if (!data?.signedUrl) {
    throw new Error(
      `No signed URL returned for ${path}`
    );
  }

  return data.signedUrl;
}

function pauseSong() {
  const media =
    state.songEl;

  if (!media) return;

  try {
    media.pause();
  } catch (_) {}
}

function tryPlaySong() {
  state.playRequested = true;

  const media =
    state.songEl;

  if (
    !media ||
    !state.songReady
  ) {
    return;
  }

  media.volume = 0.68;
  media.loop = true;

  const promise =
    media.play();

  if (promise?.catch) {
    promise.catch(() => {
      // Browser autoplay policy may require
      // the visible Play button.
    });
  }
}

function wireGesturePlayback() {
  const archery =
    document.getElementById(
      'archery'
    );

  const handler =
    () => tryPlaySong();

  if (archery) {
    archery.addEventListener(
      'pointerup',
      handler,
      {
        passive: true
      }
    );

    archery.addEventListener(
      'keydown',
      event => {
        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          handler();
        }
      },
      {
        passive: true
      }
    );
  }

  document.addEventListener(
    'pointerdown',
    handler,
    {
      passive: true,
      once: true
    }
  );
}

function watchFilmEnd(section) {
  let lastVisible = false;

  const sync = () => {
    const credits =
      document.getElementById(
        'credits'
      );

    const finished =
      Boolean(window.bdayDone) ||
      Boolean(
        credits?.classList.contains(
          'is-in'
        )
      );

    if (
      finished &&
      !lastVisible
    ) {
      lastVisible = true;

      section.classList.add(
        'is-visible'
      );
    }

    if (
      !finished &&
      lastVisible
    ) {
      lastVisible = false;

      section.classList.remove(
        'is-visible'
      );

      pauseSong();
    }
  };

  const credits =
    document.getElementById(
      'credits'
    );

  if (credits) {
    const observer =
      new MutationObserver(
        sync
      );

    observer.observe(
      credits,
      {
        attributes: true,
        attributeFilter: [
          'class'
        ]
      }
    );
  }

  window.setInterval(
    sync,
    300
  );

  sync();
}

function buildSection() {
  let section =
    document.getElementById(
      'monuPrivateMediaV5'
    );

  if (section) {
    return section;
  }

  section =
    createNode(
      'section',
      {
        id: 'monuPrivateMediaV5',
        'aria-label':
          'Private Monu Bhabhi Ji memories'
      }
    );

  const wrap =
    createNode(
      'div',
      {
        className:
          'monuV5-wrap'
      }
    );

  const credits =
    createNode(
      'div',
      {
        className:
          'monuV5-credits'
      }
    );

  credits.append(
    createNode(
      'span',
      {
        className:
          'monuV5-brand',
        text:
          'A YUVI PRODUCTION 🎬'
      }
    ),

    createNode(
      'h2',
      {
        className:
          'monuV5-title',
        text:
          'Private Memories for Monu Bhabhi Ji ❤️'
      }
    ),

    createNode(
      'p',
      {
        className:
          'monuV5-sub',
        text:
          'The animation was only the beginning… these little memories are kept just for you. 🫂'
      }
    )
  );

  const music =
    createNode(
      'div',
      {
        className:
          'monuV5-music'
      }
    );

  const musicHead =
    createNode(
      'div',
      {
        className:
          'monuV5-musicHead'
      }
    );

  musicHead.append(
    createNode(
      'span',
      {
        className:
          'monuV5-disc',
        'aria-hidden':
          'true'
      }
    ),

    createNode(
      'div',
      {},
      [
        createNode(
          'div',
          {
            className:
              'monuV5-songTitle',
            text:
              'A Song For You 🎵❤️'
          }
        ),

        createNode(
          'div',
          {
            className:
              'monuV5-songNote',
            text:
              'Press play and listen till the end.'
          }
        )
      ]
    )
  );

  music.append(
    musicHead
  );

  const musicHost =
    createNode(
      'div',
      {
        id:
          'monuV5MusicHost'
      }
    );

  music.append(
    musicHost
  );

  const playButton =
    createNode(
      'button',
      {
        className:
          'monuV5-play',
        type:
          'button',
        text:
          '▶ PLAY MY SONG FOR YOU ❤️'
      }
    );

  playButton.addEventListener(
    'click',
    tryPlaySong
  );

  music.append(
    playButton
  );

  const gallery =
    createNode(
      'div',
      {
        className:
          'monuV5-gallery',
        id:
          'monuV5Gallery'
      }
    );

  const status =
    createNode(
      'div',
      {
        className:
          'monuV5-status',
        id:
          'monuV5Status',
        text:
          'Private media is secured with signed access. 🔐'
      }
    );

  const signature =
    createNode(
      'div',
      {
        className:
          'monuV5-signature',
        text:
          'I am sorry, Monu Bhabhi Ji… ❤️'
      }
    );

  wrap.append(
    credits,
    music,
    gallery,
    status,
    signature
  );

  section.append(
    wrap
  );

  document
    .querySelector('.scene')
    ?.appendChild(
      section
    );

  return section;
}

function addPhoto(
  gallery,
  object,
  label,
  note
) {
  const card =
    createNode(
      'figure',
      {
        className:
          'monuV5-photoCard'
      }
    );

  const img =
    createNode(
      'img',
      {
        alt:
          label,
        loading:
          'lazy',
        decoding:
          'async'
      }
    );

  const caption =
    createNode(
      'figcaption',
      {
        className:
          'monuV5-caption'
      }
    );

  caption.append(
    document.createTextNode(
      label
    ),

    createNode(
      'small',
      {
        text:
          note
      }
    )
  );

  if (!object) {
    card.append(
      createNode(
        'div',
        {
          className:
            'monuV5-caption',
          text:
            `${label} could not be found.`
        }
      )
    );

    gallery.append(
      card
    );

    return;
  }

  card.append(
    img,
    caption
  );

  gallery.append(
    card
  );

  signedUrl(
    object.name
  )
    .then(
      url => {
        img.src =
          url;
      }
    )
    .catch(
      error => {
        card.replaceChildren(
          createNode(
            'div',
            {
              className:
                'monuV5-caption',
              text:
                `${label}: ${error.message}`
            }
          )
        );
      }
    );
}

async function addSong(
  host,
  object
) {
  if (!object) {
    host.appendChild(
      createNode(
        'div',
        {
          className:
            'monuV5-error',
          text:
            'Song_.mov was not found in the private bucket.'
        }
      )
    );

    return;
  }

  try {
    state.songUrl =
      await signedUrl(
        object.name
      );

    /*
      First try audio.
      If MOV isn't supported as audio by the browser,
      fall back to the compact video player using
      the exact same private signed URL.
    */

    const audio =
      createNode(
        'audio',
        {
          controls:
            'true',
          preload:
            'metadata',
          'aria-label':
            'Private song for Monu Bhabhi Ji'
        }
      );

    audio.src =
      state.songUrl;

    audio.volume =
      0.68;

    const fallbackVideo =
      createNode(
        'video',
        {
          controls:
            'true',
          playsinline:
            'true',
          preload:
            'metadata',
          'aria-label':
            'Private song video for Monu Bhabhi Ji',

          style: {
            display:
              'none'
          }
        }
      );

    fallbackVideo.src =
      state.songUrl;

    host.append(
      audio,
      fallbackVideo
    );

    state.songEl =
      audio;

    state.songReady =
      true;

    let audioFailed =
      false;

    audio.addEventListener(
      'error',
      () => {

        if (audioFailed)
          return;

        audioFailed =
          true;

        audio.style.display =
          'none';

        fallbackVideo.style.display =
          'block';

        state.songEl =
          fallbackVideo;

        state.songReady =
          true;

        if (
          state.playRequested
        ) {
          tryPlaySong();
        }
      }
    );

    if (
      state.playRequested
    ) {
      tryPlaySong();
    }

  } catch (error) {

    host.appendChild(
      createNode(
        'div',
        {
          className:
            'monuV5-error',

          text:
            `Song could not be loaded: ${error.message}`
        }
      )
    );
  }
}

async function init() {
  injectStyles();

  const section =
    buildSection();

  watchFilmEnd(
    section
  );

  wireGesturePlayback();

  const gallery =
    section.querySelector(
      '#monuV5Gallery'
    );

  const musicHost =
    section.querySelector(
      '#monuV5MusicHost'
    );

  const status =
    section.querySelector(
      '#monuV5Status'
    );

  try {

    await ensureAnonymousSession();

    const objects =
      await listObjects();

    console.info(
      '[Monu private media v5] Supabase objects:',
      objects.map(
        item =>
          item.name
      )
    );

    const photo1 =
      resolveObject(
        objects,
        EXPECTED.photo1,
        'photo1'
      );

    const photo2 =
      resolveObject(
        objects,
        EXPECTED.photo2,
        'photo2'
      );

    const song =
      resolveObject(
        objects,
        EXPECTED.song,
        'song'
      );

    addPhoto(
      gallery,
      photo1,
      'A Memory To Keep ❤️',
      'MONU • MEMORY 01'
    );

    addPhoto(
      gallery,
      photo2,
      'One More Beautiful Memory 🫂',
      'MONU • MEMORY 02'
    );

    await addSong(
      musicHost,
      song
    );

    status.textContent =
      `Private media connected • ${objects.length} private file(s) • signed access 🔐`;

  } catch (error) {

    status.textContent =
      'Private media could not be connected.';

    const errorBox =
      createNode(
        'div',
        {
          className:
            'monuV5-error',

          text:
            error.message
        }
      );

    section
      .querySelector(
        '.monuV5-wrap'
      )
      ?.appendChild(
        errorBox
      );

    console.error(
      '[Monu private media v5]',
      error
    );
  }
}

if (
  document.readyState ===
  'loading'
) {

  document.addEventListener(
    'DOMContentLoaded',
    init,
    {
      once: true
    }
  );

} else {

  init();

}
