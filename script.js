// Link de compra de entradas: cambiarlo acá y se actualiza en todos los botones.
const TICKETS_URL = 'https://www.tuentrada.com/';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const STAR = '<svg aria-hidden="true"><use href="#star"/></svg>';

document.querySelectorAll('[data-tickets]').forEach((a) => {
  a.href = TICKETS_URL;
  a.target = '_blank';
  a.rel = 'noopener';
});

// Carga: la estrella gira hasta que la página está lista (imágenes y fuentes),
// con un mínimo para que se vea girar y un máximo por si algo tarda de más.
const pageLoaded = new Promise((resolve) => {
  if (document.readyState === 'complete') resolve();
  else window.addEventListener('load', resolve, { once: true });
});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
Promise.race([Promise.all([pageLoaded, document.fonts.ready, wait(reduceMotion ? 0 : 1300)]), wait(5000)])
  .then(() => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
  });

/* ---------- Idioma (ES / EN) ----------
   El español está escrito en el HTML; acá va solo el inglés.
   Cada texto traducible tiene data-i18n="clave" (o data-i18n-aria para aria-label). */
const EN = {
  'aria.home': 'GO! Vive a tu manera, home', 'aria.sections': 'Sections', 'aria.lang': 'Language',
  'aria.soldout': 'Saturday 12, 8 pm show sold out', 'aria.bands': 'Tickets available',
  'nav.shows': 'Shows', 'nav.cast': 'Cast', 'nav.talent': 'Talent', 'nav.venue': 'Getting there', 'nav.tickets': 'Tickets',
  'hero.claim': 'What if we go back?', 'hero.date': 'Sat Dec 12', 'venue.name': 'Gran Rex Theatre',
  'cta.main': 'Get my ticket',
  'shows.title': 'Shows',
  'ticket.show': 'GO! · What if we go back?', 'ticket.day': 'Sat', 'ticket.month': 'Dec',
  'ticket.t16': '4 pm', 'ticket.t20': '8 pm', 'ticket.place': 'Gran Rex Theatre · Av. Corrientes 857',
  'ticket.s16': '4 pm show', 'ticket.s20': '8 pm show', 'ticket.buy': 'Buy', 'ticket.stamp': 'Sold out',
  'ticket.lastFlag': 'Last tickets!',
  'cast.title': 'they’re back', 'talent.title': '…and they’re not alone',
  'talent.center': 'Everyone’s back',
  'venue.title': 'Gran Rex<br>Theatre', 'venue.addr': 'Av. Corrientes 857, Buenos Aires, Argentina',
  'cta.buy': 'Get tickets', 'venue.map': 'get directions →',
  'footer.legal': 'GO! Vive a tu manera is a Netflix original series. © 2026 Onceloops Media.',
};
const BANDS = {
  es: { 'band--a': ['¡Entradas disponibles!', '12 de diciembre', 'Teatro Gran Rex'], 'band--b': ['Vive a tu manera', '¿Y si volvemos?', 'GO!'] },
  en: { 'band--a': ['Tickets available!', 'December 12', 'Gran Rex Theatre'], 'band--b': ['Live your way', 'What if we go back?', 'GO!'] },
};
const TITLES = {
  es: document.title,
  en: 'GO! Live Your Way · What if we go back? · Gran Rex Theatre',
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
new IntersectionObserver(([entry]) => {
  nav.classList.toggle('is-solid', !entry.isIntersecting);
  sticky.classList.toggle('is-visible', !entry.isIntersecting);
}, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);

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
document.querySelectorAll('.toss, .pin, .mega, .doodle--chalk').forEach((el) => io.observe(el));
document.querySelectorAll('.chalk-title').forEach((el) => {
  revealTarget.set(el.parentElement, el);
  io.observe(el.parentElement);
});

// Hero: el contenido se desvanece al bajar
if (!reduceMotion) {
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
const countdownEl = document.querySelector('[data-countdown]');
const showDate = new Date(countdownEl.dataset.countdown);
const daysLeftEl = countdownEl.querySelector('[data-days-left]');
function renderDaysLeft() {
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

// Ola de talentos: las caras avanzan de izquierda a derecha sobre una línea
// ondulada de tiza. Al pasar (o tocar) una cara se frena y su nombre aparece abajo.
// Versiones más claras de cada color para que se lean sobre el fondo oscuro.
const orbitTitleColors = { 'c-mia': '#2fb3c4', 'c-lupe': '#e0609b', 'c-juanma': '#E8C42D', 'c-alvaro': '#a58bd6' };
const wave = document.querySelector('[data-orbit]');
if (wave) {
  const title = document.querySelector('[data-orbit-title]');
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
    amp = Math.max(0, (H - face) / 2 - 16);
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

  const swap = (el, text) => {
    if (el.textContent === text) return;
    el.textContent = text;
    el.classList.remove('swap');
    void el.offsetWidth;
    el.classList.add('swap');
  };
  const show = (li) => {
    faces.forEach((f) => f.classList.toggle('is-active', f === li));
    if (li) {
      swap(title, li.dataset.name);
      title.style.color = orbitTitleColors[li.className.match(/c-\w+/)[0]];
    } else {
      swap(title, t('talent.center'));
      title.style.color = '';
    }
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
