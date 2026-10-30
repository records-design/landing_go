// Link de compra de entradas: cambiarlo acá y se actualiza en todos los botones.
const TICKETS_URL = 'https://www.tuentrada.com/';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover) and (min-width: 701px)').matches;
const STAR = '<svg aria-hidden="true"><use href="#star"/></svg>';

document.querySelectorAll('[data-tickets]').forEach((a) => {
  a.href = TICKETS_URL;
  a.target = '_blank';
  a.rel = 'noopener';
});

// Telón: se saca del DOM cuando terminó de subir
const curtain = document.querySelector('.curtain');
setTimeout(() => {
  document.body.classList.remove('is-loading');
  curtain?.remove();
}, reduceMotion ? 0 : 1800);

// "¿Y si volvemos?" letra por letra
document.querySelectorAll('[data-split]').forEach((el) => {
  const text = el.textContent;
  el.setAttribute('aria-label', text);
  el.innerHTML = [...text].map((ch, i) => `<span class="ch" aria-hidden="true" style="--i:${i}">${ch}</span>`).join('');
});

// Cintas cruzadas
const bandText = {
  'band--a': ['¡Entradas disponibles!', '12 de diciembre', 'Teatro Gran Rex'],
  'band--b': ['Vive a tu manera', '¿Y si volvemos?', 'GO!'],
};
document.querySelectorAll('.band').forEach((band) => {
  const key = Object.keys(bandText).find((k) => band.classList.contains(k));
  const chunk = bandText[key].map((t) => `<span>${t}</span>${STAR}`).join('');
  band.querySelector('.band__track').innerHTML = chunk.repeat(4);
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

// Hero: parallax con el mouse y con el scroll
if (!reduceMotion) {
  if (canHover) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
    });
  }
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
    let last = 0;
    btn.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || Date.now() - last < 600) return;
      last = Date.now();
      const r = btn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 7);
    });
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
  const defaults = { title: title.textContent, sub: sub.textContent };
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
      swap(sub, li.dataset.actor === li.dataset.name ? 'Talento GO!' : li.dataset.actor);
      title.style.color = orbitTitleColors[li.className.match(/c-\w+/)[0]];
    } else {
      swap(title, defaults.title);
      swap(sub, defaults.sub);
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
  orbit.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse' && !orbit.classList.contains('is-paused')) show(null);
  });
}
