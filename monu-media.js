/*
  MONU BHABHI JI — PRIVATE MEDIA LAYER v4
  - Private Supabase bucket
  - Anonymous authenticated session
  - Lists the bucket first so filenames are taken from Supabase itself
  - Creates signed URLs independently for each media item
  - One broken item never blocks the others
*/

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://lqsvyglucnjtuzdflror.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_bb64OK-p8a76714juF91jA_6G61hdZ_';
const BUCKET = 'monu-private-media';

const EXPECTED = {
  photo1: 'Photo 1.JPG.jpeg',
  photo2: 'Photo 2.JPG.jpeg',
  song: 'Song_.mov'
};

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
);

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'text') {
      node.textContent = value;
    } else if (key === 'html') {
      node.innerHTML = value;
    } else if (key === 'className') {
      node.className = value;
    } else if (key === 'style') {
      Object.assign(node.style, value);
    } else if (value != null) {
      node.setAttribute(key, value);
    }
  }

  for (const child of children) {
    node.append(child);
  }

  return node;
}

function normalizeName(value) {
  return String(value || '').trim().toLowerCase();
}

function findObject(objects, expectedName, kind) {
  const exact = objects.find(
    o => normalizeName(o.name) === normalizeName(expectedName)
  );

  if (exact) return exact;

  const expected = normalizeName(expectedName);

  const loose = objects.find(
    o =>
      normalizeName(o.name).replace(/\s+/g, '') ===
      expected.replace(/\s+/g, '')
  );

  if (loose) return loose;

  if (kind === 'photo1') {
    return objects.find(
      o => normalizeName(o.name).includes('photo 1')
    ) || null;
  }

  if (kind === 'photo2') {
    return objects.find(
      o => normalizeName(o.name).includes('photo 2')
    ) || null;
  }

  if (kind === 'song') {
    return objects.find(
      o => normalizeName(o.name).includes('song')
    ) || null;
  }

  return null;
}

async function ensureAnonymousSession() {
  const { data: sessionData } =
    await supabase.auth.getSession();

  if (sessionData?.session?.access_token) {
    return sessionData.session;
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

async function getRootObjects() {
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
    ? data.filter(item => item?.name)
    : [];
}

async function signedUrlFor(path) {
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

function injectStyles() {
  if (
    document.getElementById(
      'monu-private-media-styles'
    )
  ) {
    return;
  }

  const style = document.createElement('style');

  style.id = 'monu-private-media-styles';

  style.textContent = `
    #monuPrivateMedia {
      width: min(1080px, 92vw);
      margin: 48px auto 70px;
      padding: 28px;
      border-radius: 30px;
      background: rgba(255,255,255,.56);
      border: 1px solid rgba(130,88,52,.16);
      box-shadow: 0 20px 60px rgba(72,40,20,.12);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      color: #3b2517;
      position: relative;
      z-index: 20;
    }

    #monuPrivateMedia .mpm-kicker {
      text-align: center;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .24em;
      opacity: .62;
      margin-bottom: 8px;
    }

    #monuPrivateMedia h2 {
      text-align: center;
      margin: 0 0 8px;
      font-family: 'Fraunces', Georgia, serif;
      font-size: clamp(28px, 5vw, 48px);
    }

    #monuPrivateMedia .mpm-note {
      text-align: center;
      margin: 0 auto 24px;
      max-width: 620px;
      opacity: .72;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 19px;
    }

    #monuPrivateMedia .mpm-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    #monuPrivateMedia .mpm-card {
      overflow: hidden;
      border-radius: 22px;
      background: rgba(255,255,255,.72);
      border: 1px solid rgba(130,88,52,.14);
      box-shadow: 0 14px 34px rgba(72,40,20,.10);
    }

    #monuPrivateMedia img,
    #monuPrivateMedia video {
      width: 100%;
      display: block;
      background: #24170f;
      aspect-ratio: 4 / 5;
      object-fit: cover;
    }

    #monuPrivateMedia video {
      aspect-ratio: 16 / 10;
    }

    #monuPrivateMedia .mpm-caption {
      padding: 13px 15px 15px;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 18px;
      text-align: center;
    }

    #monuPrivateMedia .mpm-song {
      margin-top: 18px;
    }

    #monuPrivateMedia .mpm-song video {
      aspect-ratio: 16 / 9;
      max-height: 420px;
      object-fit: contain;
    }

    #monuPrivateMedia .mpm-status {
      margin-top: 18px;
      font-size: 12px;
      text-align: center;
      opacity: .62;
      word-break: break-word;
    }

    #monuPrivateMedia .mpm-error {
      margin-top: 8px;
      padding: 10px 12px;
      border-radius: 12px;
      background: rgba(150,30,50,.08);
      color: #7e1b2e;
      font-size: 13px;
      line-height: 1.45;
    }

    @media (max-width: 700px) {
      #monuPrivateMedia {
        padding: 18px;
        border-radius: 22px;
      }

      #monuPrivateMedia .mpm-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  document.head.appendChild(style);
}

function makeSection() {
  let section =
    document.getElementById(
      'monuPrivateMedia'
    );

  if (section) {
    return section;
  }

  section = el(
    'section',
    {
      id: 'monuPrivateMedia',
      'aria-label': 'Private Monu memories'
    }
  );

  section.append(
    el(
      'div',
      {
        className: 'mpm-kicker',
        text: 'PRIVATE MEMORIES'
      }
    ),

    el(
      'h2',
      {
        text: 'Just For You, Monu Bhabhi Ji ❤️'
      }
    ),

    el(
      'p',
      {
        className: 'mpm-note',
        text: 'Two little memories and one song — kept private, just for this apology.'
      }
    )
  );

  const grid = el(
    'div',
    {
      className: 'mpm-grid',
      id: 'mpmGrid'
    }
  );

  section.append(grid);

  const credits =
    document.getElementById('credits');

  if (credits?.parentNode) {
    credits.parentNode.insertBefore(
      section,
      credits
    );
  } else {
    document
      .querySelector('.scene')
      ?.append(section);
  }

  return section;
}

function addError(section, message) {
  const box = el(
    'div',
    {
      className: 'mpm-error',
      text: message
    }
  );

  section.append(box);
}

async function addSignedPhoto(
  grid,
  object,
  label
) {
  if (!object) {
    const card = el(
      'div',
      {
        className: 'mpm-card'
      }
    );

    card.append(
      el(
        'div',
        {
          className: 'mpm-caption',
          text: `${label}: file not found in Supabase bucket.`
        }
      )
    );

    grid.append(card);
    return;
  }

  const card = el(
    'div',
    {
      className: 'mpm-card'
    }
  );

  const caption = el(
    'div',
    {
      className: 'mpm-caption',
      text: label
    }
  );

  const img = el(
    'img',
    {
      alt: label,
      loading: 'lazy',
      decoding: 'async'
    }
  );

  card.append(
    img,
    caption
  );

  grid.append(card);

  try {
    img.src =
      await signedUrlFor(
        object.name
      );
  } catch (error) {
    img.replaceWith(
      el(
        'div',
        {
          className: 'mpm-caption',
          text: error.message
        }
      )
    );
  }
}

async function addSignedSong(
  section,
  object
) {
  const card = el(
    'div',
    {
      className: 'mpm-card mpm-song'
    }
  );

  const title = el(
    'div',
    {
      className: 'mpm-caption',
      text: 'A Song For You 🎵❤️'
    }
  );

  card.append(title);
  section.append(card);

  if (!object) {
    card.append(
      el(
        'div',
        {
          className: 'mpm-caption',
          text: 'Song file not found in Supabase bucket.'
        }
      )
    );

    return;
  }

  try {
    const url =
      await signedUrlFor(
        object.name
      );

    const video = el(
      'video',
      {
        controls: 'true',
        playsinline: 'true',
        preload: 'metadata',
        'aria-label':
          'Private song for Monu Bhabhi Ji'
      }
    );

    video.src = url;

    card.prepend(video);

  } catch (error) {
    card.append(
      el(
        'div',
        {
          className: 'mpm-caption',
          text: error.message
        }
      )
    );
  }
}

async function loadPrivateMedia() {
  injectStyles();

  const section =
    makeSection();

  const grid =
    section.querySelector(
      '#mpmGrid'
    );

  try {
    await ensureAnonymousSession();
  } catch (error) {
    addError(
      section,
      error.message
    );

    return;
  }

  let objects;

  try {
    objects =
      await getRootObjects();

    console.info(
      '[Monu private media] Supabase objects:',
      objects.map(
        x => x.name
      )
    );

  } catch (error) {
    addError(
      section,
      `${error.message} — check the storage.objects SELECT policy for authenticated users.`
    );

    return;
  }

  const photo1 =
    findObject(
      objects,
      EXPECTED.photo1,
      'photo1'
    );

  const photo2 =
    findObject(
      objects,
      EXPECTED.photo2,
      'photo2'
    );

  const song =
    findObject(
      objects,
      EXPECTED.song,
      'song'
    );

  await Promise.allSettled([
    addSignedPhoto(
      grid,
      photo1,
      'A Memory To Keep ❤️'
    ),

    addSignedPhoto(
      grid,
      photo2,
      'One More Beautiful Memory 🫂'
    ),

    addSignedSong(
      section,
      song
    )
  ]);

  const status =
    el(
      'div',
      {
        className:
          'mpm-status',
        text:
          `Private media connected • ${objects.length} file(s) found • signed access`
      }
    );

  section.append(status);
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    loadPrivateMedia().catch(
      error => {
        console.error(
          '[Monu private media] Unexpected error:',
          error
        );
      }
    );
  }
);
