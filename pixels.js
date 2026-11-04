// ─────────────────────────────────────────────────────────────
// Píxeles de publicidad y medición.
// Pegar cada código entre las comillas. Mientras esté vacío, ese
// píxel no se carga (la web funciona igual, sin medir nada).
// ─────────────────────────────────────────────────────────────
const META_PIXEL_ID = '';   // Meta (Facebook / Instagram): solo números, ej. '123456789012345'
const GA4_ID        = '';   // Google Analytics 4: empieza con G-, ej. 'G-AB12CD34EF'
const GOOGLE_ADS_ID = '';   // Google Ads (si hay anuncios): empieza con AW-, ej. 'AW-123456789'
const TIKTOK_PIXEL_ID = ''; // TikTok: letras y números, ej. 'C1A2B3C4D5E6F7G8H9I0'

(function () {
  const load = (src) => {
    const s = document.createElement('script');
    s.async = true;
    s.src = src;
    document.head.appendChild(s);
  };

  // Meta Pixel
  if (META_PIXEL_ID) {
    const f = window;
    if (!f.fbq) {
      const n = (f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      load('https://connect.facebook.net/en_US/fbevents.js');
    }
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
  }

  // Google (Analytics 4 y/o Ads comparten el mismo script)
  const googleId = GA4_ID || GOOGLE_ADS_ID;
  if (googleId) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    if (GA4_ID) gtag('config', GA4_ID);
    if (GOOGLE_ADS_ID) gtag('config', GOOGLE_ADS_ID);
    load('https://www.googletagmanager.com/gtag/js?id=' + googleId);
  }

  // TikTok Pixel
  if (TIKTOK_PIXEL_ID) {
    const w = window;
    w.TiktokAnalyticsObject = 'ttq';
    const ttq = (w.ttq = w.ttq || []);
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
    ttq.setAndDefer = (t, e) => { t[e] = function () { t.push([e].concat([].slice.call(arguments, 0))); }; };
    ttq.methods.forEach((m) => ttq.setAndDefer(ttq, m));
    ttq.load = (id) => {
      ttq._i = ttq._i || {}; ttq._i[id] = []; ttq._i[id]._u = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._t = ttq._t || {}; ttq._t[id] = +new Date();
      ttq._o = ttq._o || {}; ttq._o[id] = {};
      load('https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + id + '&lib=ttq');
    };
    ttq.load(TIKTOK_PIXEL_ID);
    ttq.page();
  }

  // ── Clics que importan ─────────────────────────────────────
  // Se manda un evento a cada píxel que esté activo.
  const send = (meta, google, tiktok, params) => {
    if (window.fbq && META_PIXEL_ID) {
      if (meta.custom) fbq('trackCustom', meta.name, params);
      else fbq('track', meta.name, params);
    }
    if (window.gtag && googleId) gtag('event', google, params);
    if (window.ttq && TIKTOK_PIXEL_ID) ttq.track(tiktok, params);
  };
  // Desde dónde se hizo el clic (popup, nav, ticket, sección del teatro…)
  const where = (a) => {
    if (a.closest('.popup')) return 'popup';
    if (a.closest('.nav')) return 'nav';
    if (a.closest('.ticket')) return 'ticket';
    if (a.closest('.hero')) return 'hero';
    if (a.closest('.sticky-cta') || a.classList.contains('sticky-cta')) return 'boton_fijo';
    if (a.closest('.lugar')) return 'teatro';
    if (a.closest('.footer')) return 'footer';
    return 'otro';
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const params = { content_name: 'GO! Vive a tu manera', ubicacion: where(a) };
    if (a.matches('[data-tickets]')) {
      // Fue a comprar entradas a TuEntrada
      send({ name: 'InitiateCheckout' }, 'begin_checkout', 'InitiateCheckout', params);
    } else if (a.matches('[data-presave]')) {
      // Pre-save / escuchar las canciones
      send({ name: 'PreSave', custom: true }, 'presave', 'ClickButton', params);
    } else if (a.matches('.product')) {
      // Producto de la tienda (cuando abra)
      send({ name: 'ViewContent' }, 'select_item', 'ViewContent', { ...params, producto: a.textContent.trim().slice(0, 60) });
    } else if (a.matches('[data-instagram]') || a.href.includes('instagram.com')) {
      send({ name: 'Instagram', custom: true }, 'click_instagram', 'ClickButton', params);
    }
  }, true);
})();
