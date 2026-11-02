// Link de compra de entradas: cambiarlo acá y se actualiza en todos los botones.
const TICKETS_URL = 'https://www.tuentrada.com/go-vive-a-tu-manera-tgr';
// Instagram oficial de GO!
const INSTAGRAM_URL = 'https://www.instagram.com/goviveatumanera.ok/';
// Link del pre-save de las canciones nuevas (cuando lo tengamos, pegarlo acá).
// Mientras esté vacío, el botón del popup lleva a la página de Lanzamientos.
const PRESAVE_URL = '';
// Día en que salen las canciones: desde ahí el botón dice "Escuchalas ya".
const RELEASE_DATE = new Date('2026-11-13T00:00:00-03:00');

// Popup que aparece a los 5 s. Cada visita ve uno, y va rotando: la primera vez
// se sortea (con estas proporciones), y si la persona vuelve le toca el siguiente.
// Para sacar uno, ponerle 0. Para probar uno: ?popup=tickets | presave | merch
const POPUP_DELAY = 5000;
const POPUPS = { tickets: 50, presave: 30, merch: 20 };

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAR = '<svg aria-hidden="true"><use href="#star"/></svg>';

document.querySelectorAll('[data-instagram]').forEach((a) => {
  a.href = INSTAGRAM_URL;
  a.target = '_blank';
  a.rel = 'noopener';
});
document.querySelectorAll('[data-tickets]').forEach((a) => {
  a.href = TICKETS_URL;
  a.target = '_blank';
  a.rel = 'noopener';
});

// Links externos (pre-save y merch) se abren en otra pestaña
const released = new Date() >= RELEASE_DATE;
document.querySelectorAll('[data-presave]').forEach((a) => { if (PRESAVE_URL) a.href = PRESAVE_URL; });
document.querySelectorAll('[data-presave], .product').forEach((a) => {
  if (a.href.startsWith('http') && !a.href.startsWith(location.origin)) { a.target = '_blank'; a.rel = 'noopener'; }
});
// Ya salieron las canciones: cambian los textos (antes de guardar el español original)
if (released) {
  document.documentElement.classList.add('is-released'); // el botón ya no lleva el +
  const ES_OUT = {
    'popup.p.text': ['popup.p.out', 'Ya están en todas las plataformas. ¡Dale play!'],
    'songs.cta': ['songs.listen', 'Escuchalas ya'],
  };
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const out = ES_OUT[el.dataset.i18n];
    if (out) { el.dataset.i18n = out[0]; el.textContent = out[1]; }
  });
}

// Carga: la estrella gira hasta que la página está lista (imágenes y fuentes),
// con un mínimo para que se vea girar y un máximo por si algo tarda de más.
const pageLoaded = new Promise((resolve) => {
  if (document.readyState === 'complete') resolve();
  else window.addEventListener('load', resolve, { once: true });
});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const loaded = Promise.race([Promise.all([pageLoaded, document.fonts.ready, wait(reduceMotion ? 0 : 1300)]), wait(5000)]);
loaded.then(() => {
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-ready');
});

/* ---------- Idioma (ES / EN) ----------
   El español está escrito en el HTML; acá va solo el inglés.
   Cada texto traducible tiene data-i18n="clave" (o data-i18n-aria para aria-label). */
const EN = {
  'aria.home': 'GO! Vive a tu manera, home', 'aria.sections': 'Sections', 'aria.lang': 'Language',
  'aria.soldout': 'Saturday 12, 8 pm show sold out', 'aria.bands': 'Tickets available',
  'aria.close': 'Close', 'aria.menu': 'Menu',
  'nav.home': 'Home', 'nav.shows': 'Shows', 'nav.releases': 'Music', 'nav.merch': 'Shop', 'nav.cast': 'Cast', 'nav.venue': 'Getting there', 'nav.tickets': 'Tickets',
  'hero.claim': 'What if we go back?', 'hero.date': 'Sat Dec 12', 'venue.name': 'Gran Rex Theatre',
  'cta.main': 'Get my ticket',
  'shows.title': 'Shows',
  'ticket.title': 'What if we go back?', 'ticket.day': 'Sat', 'ticket.month': 'Dec',
  'ticket.t16': '4 pm', 'ticket.t20': '8 pm', 'ticket.place': 'Gran Rex Theatre · Av. Corrientes 857',
  'ticket.s16': '4 pm show', 'ticket.s20': '8 pm show', 'ticket.buy': 'Buy', 'ticket.stamp': 'Sold out',
  'ticket.lastFlag': 'Last tickets!',
  'cast.title': 'they’re back',
  'bio.mia': 'On a scholarship at Saint Mary, with a huge talent for music. Her voice changes everything.',
  'bio.lupe': 'The queen of Saint Mary and star of GO!. Competitive, but she’d do anything for her friends.',
  'bio.juanma': 'Saint Mary’s basketball star, until he discovers that music is what he really loves.',
  'bio.alvaro': 'Lupe’s brother. Loyal and protective, he always stands by Mía when it really matters.', 'talent.title': '…and they’re not alone',
  'venue.title': 'Gran Rex<br>Theatre', 'venue.addr': 'Av. Corrientes 857, Buenos Aires, Argentina',
  'cta.buy': 'Get tickets',
  'venue.how': 'Getting there', 'venue.lead': 'to the Gran Rex Theatre',
  'venue.intro': 'The experience starts before you arrive! The Gran Rex is in the heart of downtown Buenos Aires, on Av. Corrientes, just steps from the Obelisk. See you there!',
  'venue.transport': 'Public transport', 'venue.subteB': 'Subway · Line B', 'venue.subteC': 'Subway · Line C', 'venue.subteD': 'Subway · Line D',
  'venue.stB': 'Carlos Pellegrini station', 'venue.stC': 'Diagonal Norte station', 'venue.stD': '9 de Julio station', 'venue.bus': 'Buses',
  'venue.parking': 'Parking', 'venue.parkingText': 'Find parking near the theatre', 'venue.parkingCta': 'Search',
  'venue.route': 'plan your route →',
  'songs.title': 'new music!', 'songs.date': 'NOV 13',
  'songs.where': 'Listen on every platform',
  'songs.cta': 'Pre save', 'songs.listen': 'Listen now',
  'merch.title': 'Merch', 'merch.sub': 'take GO! home', 'merch.go': 'Buy →',
  'popup.t.kicker': 'Gran Rex Theatre', 'popup.t.title': 'Sat Dec 12 · 4 pm',
  'popup.t.text': 'The 8 pm show is already sold out. Don’t miss out!',
  'popup.p.text': 'Out on NOV 13. <span class="nw">Pre-save</span> them and listen as soon as they drop.',
  'popup.p.out': 'Out now on every platform. Hit play!',
  'popup.m.kicker': 'Official merch', 'popup.m.text': 'T-shirts, hoodies and more from the show.', 'popup.m.cta': 'See the shop',
  'footer.ig': 'Follow us on Instagram',
  'footer.legal': 'GO! Vive a tu manera is a Netflix original series. © 2026 Onceloops Media.',
};
const BANDS = {
  es: { 'band--a': ['¡Entradas disponibles!', '12 de diciembre', 'Teatro Gran Rex'], 'band--b': ['Vive a tu manera', '¿Y si volvemos?', 'GO!'] },
  en: { 'band--a': ['Tickets available!', 'December 12', 'Gran Rex Theatre'], 'band--b': ['Live your way', 'What if we go back?', 'GO!'] },
};
const TITLES = {
  es: document.title,
  en: { 'page-merch': 'Merch · GO! Live Your Way', 'page-lanzamientos': 'Music · GO! Live Your Way', 'page-como-llegar': 'Getting there · GO! Live Your Way' }[document.body.classList[1]] || 'GO! Live Your Way · What if we go back? · Gran Rex Theatre',
};

// Guardamos el español original de cada elemento antes de tocar nada
const original = new Map();
document.querySelectorAll('[data-i18n]').forEach((el) => original.set(el, el.innerHTML));
document.querySelectorAll('[data-i18n-aria]').forEach((el) => original.set(`${el.dataset.i18nAria}`, el.getAttribute('aria-label')));
const altOriginal = new Map();
document.querySelectorAll('img[alt*=" como "]').forEach((img) => altOriginal.set(img, img.alt));

let lang = 'es';
const t = (key) => {
  if (lang === 'en') return EN[key];
  const el = document.querySelector(`[data-i18n="${key}"]`);
  return el ? original.get(el) : key;
};

// "¿Y si volvemos?" letra por letra (la primera vez espera la intro; al cambiar de idioma, no)
function splitLetters(el, firstTime) {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.innerHTML = [...text].map((ch, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${ch}</span>`).join('');
  if (!firstTime) el.style.setProperty('--base', '0s');
}

function renderBands() {
  document.querySelectorAll('.band').forEach((band) => {
    const words = BANDS[lang][band.classList.contains('band--a') ? 'band--a' : 'band--b'];
    band.querySelector('.band__track').innerHTML = words.map((w) => `<span>${w}</span>${STAR}`).join('').repeat(4);
  });
}

function applyLang(next, firstTime = false) {
  lang = next;
  document.documentElement.lang = lang;
  document.title = TITLES[lang];
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.innerHTML = lang === 'en' ? EN[el.dataset.i18n] : original.get(el);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.dataset.i18nAria;
    el.setAttribute('aria-label', lang === 'en' ? EN[key] : original.get(key));
  });
  altOriginal.forEach((alt, img) => { img.alt = lang === 'en' ? alt.replace(' como ', ' as ') : alt; });
  document.querySelectorAll('[data-split]').forEach((el) => splitLetters(el, firstTime));
  renderBands();
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  document.dispatchEvent(new CustomEvent('langchange'));
}

// Idioma inicial: ?lang=en en el link > lo que eligió antes > idioma del navegador
function initialLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (fromUrl === 'es' || fromUrl === 'en') return fromUrl;
  try {
    const saved = localStorage.getItem('go-lang');
    if (saved === 'es' || saved === 'en') return saved;
  } catch {}
  return (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';
}
applyLang(initialLang(), true);

document.querySelectorAll('[data-lang]').forEach((btn) => {
  btn.addEventListener('click', () => {
    if (btn.dataset.lang === lang) return;
    applyLang(btn.dataset.lang);
    try { localStorage.setItem('go-lang', lang); } catch {}
  });
});

// Nav sólida y CTA fija al salir del hero
const nav = document.querySelector('.nav');
const sticky = document.querySelector('.sticky-cta');
const hero = document.querySelector('.hero');
if (hero) { // en la página de merch no hay portada: la nav ya viene sólida
  new IntersectionObserver(([entry]) => {
    nav.classList.toggle('is-solid', !entry.isIntersecting);
    sticky.classList.toggle('is-visible', !entry.isIntersecting);
  }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
}

// Menú hamburguesa (mobile): abre/cierra el panel; se cierra al elegir, con Esc o tocando afuera
const toggle = document.querySelector('.nav__toggle');
if (toggle) {
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  nav.querySelectorAll('.nav__links a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setOpen(false); });
}

// Aparición al hacer scroll: entradas que caen, fotos que se pegan,
// tiza que se escribe y garabatos que se dibujan
// La tiza arranca recortada del todo (clip-path), y así el observer no la detecta:
// por eso se observa su contenedor y se le avisa al título.
const revealTarget = new Map();
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = revealTarget.get(e.target) || e.target;
    el.classList.add(el.classList.contains('doodle') ? 'is-drawn' : 'is-in');
    io.unobserve(e.target);
  });
}, { threshold: 0.25 });
document.querySelectorAll('.tickets, .polaroids').forEach((group) => {
  group.querySelectorAll('.toss, .pin').forEach((el, i) => el.style.setProperty('--d', `${i * 140}ms`));
});
document.querySelectorAll('.toss, .pin, .mega, .doodle--chalk, .canciones .record').forEach((el) => io.observe(el));
document.querySelectorAll('.products').forEach((group) => {
  group.querySelectorAll('.pin').forEach((el, i) => el.style.setProperty('--d', `${i * 120}ms`));
});
document.querySelectorAll('.chalk-title').forEach((el) => {
  revealTarget.set(el.parentElement, el);
  io.observe(el.parentElement);
});

// Hero: el contenido se desvanece al bajar
if (hero && !reduceMotion) {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const p = Math.min(1, Math.max(0, window.scrollY / hero.offsetHeight));
      hero.style.setProperty('--sy', p.toFixed(3));
      ticking = false;
    });
  }, { passive: true });
}

// Chispas de estrella en los botones
const sparkColors = ['var(--mia)', 'var(--lupe)', 'var(--juanma)', 'var(--alvaro)', '#fff'];
function burst(x, y, count = 9) {
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'burst';
    s.innerHTML = STAR;
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 50 + Math.random() * 50;
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    s.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
    s.style.setProperty('--rot', `${Math.random() * 360}deg`);
    s.style.setProperty('--c', sparkColors[i % sparkColors.length]);
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }
}
if (!reduceMotion) {
  document.querySelectorAll('.ticket-btn, a.ticket').forEach((btn) => {
    btn.addEventListener('pointerdown', (e) => burst(e.clientX, e.clientY, 10));
  });
}

// Días que faltan para la función del 12/12, en la nota a mano de la portada
const showDate = new Date('2026-12-12T16:00:00-03:00');
const daysLeftEl = document.querySelector('[data-countdown] [data-days-left]');
function renderDaysLeft() {
  if (!daysLeftEl) return;
  // se cuentan días de calendario en Buenos Aires, no bloques de 24 h
  const day = (d) => new Date(d.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })).getTime();
  const days = Math.round((day(showDate) - day(new Date())) / 86400000);
  const es = days > 1 ? `¡faltan ${days} días!` : days === 1 ? '¡es mañana!' : days === 0 ? '¡es hoy!' : '¡gracias por venir!';
  const en = days > 1 ? `only ${days} days to go!` : days === 1 ? 'it’s tomorrow!' : days === 0 ? 'it’s today!' : 'thanks for coming!';
  daysLeftEl.textContent = lang === 'en' ? en : es;
}
renderDaysLeft();
setInterval(renderDaysLeft, 60 * 1000);
document.addEventListener('langchange', renderDaysLeft);

// Polaroids: en pantallas táctiles la ficha se abre y se cierra tocando la foto
document.querySelectorAll('.polaroid').forEach((card, _, all) => {
  card.addEventListener('click', () => {
    if (window.matchMedia('(hover: hover)').matches) return; // con mouse alcanza con pasar por encima
    const open = !card.classList.contains('is-open');
    all.forEach((c) => c.classList.remove('is-open'));
    card.classList.toggle('is-open', open);
  });
});

// Ola de talentos: las caras avanzan de izquierda a derecha sobre una línea
// ondulada de tiza. Al pasar (o tocar) una cara se frena y su nombre aparece debajo de ella.
const wave = document.querySelector('[data-orbit]');
if (wave) {
  const faces = [...wave.querySelectorAll('.wave__faces li')];
  const line = wave.querySelector('.wave__line');
  const SPEED = 45; // px por segundo

  // medidas de la ola (se recalculan si cambia el tamaño de la pantalla)
  let W, H, face, spacing, track, amp, lambda;
  const waveY = (x) => amp * Math.sin((2 * Math.PI * x) / lambda);
  function measure() {
    W = wave.clientWidth;
    H = wave.clientHeight;
    face = faces[0].offsetWidth;
    spacing = Math.max(face * 1.8, (W + face * 2) / faces.length);
    track = spacing * faces.length;
    amp = Math.max(0, (H - face) / 2 - 16 - 22); // 22px abajo para el nombre
    lambda = Math.max(W / 1.6, 380);
    line.setAttribute('viewBox', `0 0 ${W} ${H}`);
    let d = '';
    for (let x = -20; x <= W + 20; x += 8) d += `${d ? 'L' : 'M'}${x} ${(H / 2 + waveY(x)).toFixed(1)}`;
    line.querySelector('path').setAttribute('d', d);
  }

  let offset = 0;
  function place() {
    faces.forEach((li, i) => {
      const x = ((offset + i * spacing) % track + track) % track - face; // centro de la cara
      li.style.transform = `translate3d(${(x - face / 2).toFixed(1)}px, ${waveY(x).toFixed(1)}px, 0)`;
    });
  }

  // animación: se frena con el mouse encima, con una cara tocada o fuera de pantalla
  let hovering = false, paused = false, visible = false, last = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (!hovering && !paused) { offset += SPEED * dt; place(); }
    if (visible) requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => {
    const was = visible;
    visible = e.isIntersecting;
    if (visible && !was && !reduceMotion) { last = performance.now(); requestAnimationFrame(frame); }
  }).observe(wave);
  measure();
  place();
  window.addEventListener('resize', () => { measure(); place(); });

  const show = (li) => {
    faces.forEach((f) => f.classList.toggle('is-active', f === li));
  };
  faces.forEach((li) => {
    li.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(li); });
    li.addEventListener('click', () => {
      const active = li.classList.contains('is-active');
      paused = !active;
      show(active ? null : li);
      if (!active && !reduceMotion) {
        const r = li.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 8);
      }
    });
  });
  wave.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
  wave.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse') return;
    hovering = false;
    if (!paused) show(null);
  });
  document.addEventListener('langchange', () => {
    paused = false;
    show(null);
  });
}

// Popup rotativo: una vez por visita, a los 5 s de terminar la carga
const popup = document.querySelector('.popup');
if (popup && typeof popup.showModal === 'function') {
  const params = new URLSearchParams(location.search);
  const forced = params.get('popup');
  const store = (kind, key, value) => {
    try {
      const st = kind === 'local' ? localStorage : sessionStorage;
      if (value === undefined) return st.getItem(key);
      st.setItem(key, value);
    } catch {}
    return null;
  };
  // después de la función ya no se ofrecen entradas
  const options = Object.keys(POPUPS).filter((k) => POPUPS[k] > 0 && !(k === 'tickets' && new Date() > showDate));
  function pick() {
    if (forced in POPUPS) return forced;
    if (!options.length) return null;
    const last = store('local', 'go-popup-last');
    if (options.includes(last)) return options[(options.indexOf(last) + 1) % options.length];
    let r = Math.random() * options.reduce((sum, k) => sum + POPUPS[k], 0);
    return options.find((k) => (r -= POPUPS[k]) < 0) || options[0];
  }
  const variant = (forced !== '0' && (forced || !store('session', 'go-popup-shown'))) ? pick() : null;

  if (variant) {
    popup.querySelectorAll('[data-variant]').forEach((card) => {
      const on = card.dataset.variant === variant;
      card.hidden = !on;
      if (on) card.querySelector('.popup__title').id = 'popup-title';
    });
    const close = () => popup.close();
    popup.querySelector('.popup__close').addEventListener('click', close);
    popup.querySelectorAll('[data-popup-close], a').forEach((a) => a.addEventListener('click', close));
    popup.addEventListener('click', (e) => { if (e.target === popup) close(); }); // tocar afuera
    // si la persona ya está comprando o abrió otra cosa, no la interrumpimos
    let busy = false;
    document.querySelectorAll('[data-tickets], [data-presave], .product').forEach((a) => {
      if (!popup.contains(a)) a.addEventListener('click', () => { busy = true; });
    });
    loaded.then(() => setTimeout(() => {
      if (busy || popup.open) return;
      popup.showModal();
      store('session', 'go-popup-shown', '1');
      store('local', 'go-popup-last', variant);
    }, forced ? 1200 : POPUP_DELAY));
  }
}

// Títulos que se escriben letra por letra (con cursor). En el espacio va un salto
// de línea que solo se ve en mobile (.br-m). Se vuelve a escribir al cambiar de idioma.
function typeIn(el) {
  clearTimeout(el._typing);
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  const out = document.createElement('span');
  out.setAttribute('aria-hidden', 'true');
  el.replaceChildren(out);
  const put = (ch) => {
    out.append(ch);
    if (ch === ' ') { const br = document.createElement('br'); br.className = 'br-m'; out.append(br); }
  };
  if (reduceMotion) { [...text].forEach(put); return; }
  let i = 0;
  const step = () => {
    if (i >= text.length) return;
    const ch = text[i++];
    put(ch);
    el._typing = setTimeout(step, ch === ' ' ? 180 : 95);
  };
  el._typing = setTimeout(step, 500);
}
document.querySelectorAll('[data-type]').forEach(typeIn);
document.addEventListener('langchange', () => document.querySelectorAll('[data-type]').forEach(typeIn));
