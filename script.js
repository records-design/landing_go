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
  'aria.countdown': 'Countdown', 'aria.soldout': '8 pm show sold out', 'aria.bands': 'Tickets available',
  'nav.shows': 'Shows', 'nav.cast': 'Cast', 'nav.talent': 'Talent', 'nav.venue': 'Getting there', 'nav.tickets': 'Tickets',
  'hero.claim': 'What if we go back?', 'hero.date': 'Sat Dec 12', 'venue.name': 'Gran Rex Theatre',
  'cta.main': 'Get my ticket', 'hero.hand': 'selling fast!',
  'count.pre': 'Only', 'count.d': 'days', 'count.h': 'hours', 'count.m': 'minutes', 'count.s': 'seconds',
  'count.post': 'until we’re back at the Gran Rex',
  'shows.title': 'Shows', 'shows.hand': 'the 8 pm show<br>is sold out',
  'ticket.show': 'GO! · What if we go back?', 'ticket.day': 'Sat', 'ticket.month': 'Dec',
  'ticket.t16': '4 pm', 'ticket.t20': '8 pm', 'ticket.place': 'Gran Rex Theatre · Av. Corrientes 857',
  'ticket.new': 'New show', 'ticket.buy': 'Buy', 'ticket.s20': '8 pm show', 'ticket.stamp': 'Sold out',
  'ticket.pass': 'Backstage pass', 'ticket.meet': 'Meet the cast at the Gran Rex', 'ticket.info': 'More info',
  'cast.title': 'they’re back', 'talent.title': '…and they’re not alone',
  'talent.center': 'Everyone’s back', 'talent.hint': 'tap each face', 'talent.generic': 'GO! talent',
  'venue.title': 'Gran Rex<br>Theatre', 'venue.addr': 'Av. Corrientes 857, Buenos Aires, Argentina',
  'cta.buy': 'Get tickets', 'venue.map': 'get directions →',
  'footer.legal': 'GO! Vive a tu manera is a Netflix original series. © 2026 Onceloops Media.',
};
const ES_EXTRA = { 'talent.generic': 'Talento GO!' };
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
  return ES_EXTRA[key] ?? (el ? original.get(el) : key);
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

// Cuenta regresiva a la función del 12/12, con flip en cada cambio
const cd = document.querySelector('[data-countdown]');
const target = new Date(cd.dataset.countdown).getTime();
const units = ['d', 'h', 'm', 's'].map((u) => cd.querySelector(`[data-unit="${u}"]`));
const pad = (n) => String(n).padStart(2, '0');
function tick() {
  const diff = Math.max(0, target - Date.now());
  const s = Math.floor(diff / 1000);
  const values = [String(Math.floor(s / 86400)), pad(Math.floor((s % 86400) / 3600)), pad(Math.floor((s % 3600) / 60)), pad(s % 60)];
  units.forEach((el, i) => {
    if (el.textContent === values[i]) return;
    el.textContent = values[i];
    if (reduceMotion) return;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  });
}
tick();
setInterval(tick, 1000);

// Órbita de talentos: al pasar (o tocar) una cara, su nombre va al centro.
// Versiones más claras de cada color para que se lean sobre el fondo oscuro.
const orbitTitleColors = { 'c-mia': '#2fb3c4', 'c-lupe': '#e0609b', 'c-juanma': '#E8C42D', 'c-alvaro': '#a58bd6' };
const orbit = document.querySelector('[data-orbit]');
if (orbit) {
  const title = orbit.querySelector('[data-orbit-title]');
  const sub = orbit.querySelector('[data-orbit-sub]');
  const faces = orbit.querySelectorAll('.orbit__ring li');
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
      swap(sub, li.dataset.actor === li.dataset.name ? t('talent.generic') : li.dataset.actor);
      title.style.color = orbitTitleColors[li.className.match(/c-\w+/)[0]];
    } else {
      swap(title, t('talent.center'));
      swap(sub, t('talent.hint'));
      title.style.color = '';
    }
  };
  faces.forEach((li) => {
    li.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(li); });
    li.addEventListener('click', () => {
      const active = li.classList.contains('is-active');
      orbit.classList.toggle('is-paused', !active);
      show(active ? null : li);
      if (!active && !reduceMotion) {
        const r = li.getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, 8);
      }
    });
  });
  document.addEventListener('langchange', () => {
    orbit.classList.remove('is-paused');
    show(null);
  });
  orbit.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse' && !orbit.classList.contains('is-paused')) show(null);
  });
}
