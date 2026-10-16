/* Scroll recorder (Claude, 16 Oct 2026). Only runs when the page URL contains
   ?debug. Records, every animation frame, where the pinned sections are and
   what is on screen, plus every ScrollTrigger refresh, image load and the
   window load event. Press D to download the log as tps-scroll-log.json.
   It changes nothing on the page. */
(function () {
  'use strict';
  if (!/[?&]debug\b/.test(location.search)) return;
  var t0 = performance.now();
  var log = { ua: navigator.userAgent, dpr: devicePixelRatio, events: [], frames: [] };
  var ev = function (type, data) { log.events.push({ t: Math.round(performance.now() - t0), type: type, y: Math.round(scrollY), data: data || null }); };
  ev('start', { w: innerWidth, h: innerHeight, sw: screen.width, sh: screen.height });
  addEventListener('load', function () { ev('window-load'); });
  document.addEventListener('DOMContentLoaded', function () { ev('dom-ready'); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ev('fonts-ready'); });
  addEventListener('resize', function () { ev('resize', { w: innerWidth, h: innerHeight }); });
  ['wheel', 'touchstart', 'keydown'].forEach(function (n) { addEventListener(n, function (e) { if (n === 'wheel') { if (!log._wheelN) log._wheelN = 0; log._wheelN++; if (log._wheelN % 10 === 1) ev('wheel', { dy: Math.round(e.deltaY), mode: e.deltaMode }); } else ev(n, n === 'keydown' ? { k: e.key } : null); }, { passive: true, capture: true }); });
  document.addEventListener('load', function (e) { if (e.target && e.target.tagName === 'IMG') ev('img', (e.target.currentSrc || e.target.src).split('/').pop()); }, true);

  var hooked = false;
  function pins() {
    if (!window.ScrollTrigger) return null;
    var all = ScrollTrigger.getAll();
    var find = function (cls) { var t = all.find(function (x) { return x.pin && x.trigger && x.trigger.classList && x.trigger.classList.contains(cls); }); return t ? { s: Math.round(t.start), e: Math.round(t.end), p: +t.progress.toFixed(3), a: t.isActive } : null; };
    return { hero: find('act--hero'), turn: find('act--turn'), pan: find('act--pan') };
  }
  var last = '';
  function frame() {
    if (window.ScrollTrigger && !hooked) {
      hooked = true;
      ScrollTrigger.addEventListener('refreshInit', function () { ev('st-refreshInit'); });
      ScrollTrigger.addEventListener('refresh', function () { ev('st-refresh', pins()); });
    }
    var q = function (s) { return document.querySelector(s); };
    var act = q('.act--turn'), tv = q('[data-tv2]'), care = q('#care'), route = q('[data-route]'), layer = q('[data-route-layer]');
    var rail = care && care.querySelector('[data-rail]');
    var row = {
      t: Math.round(performance.now() - t0),
      y: Math.round(scrollY),
      docH: document.documentElement.scrollHeight,
      actTop: act ? Math.round(act.getBoundingClientRect().top) : null,
      actOp: act ? +(+getComputedStyle(act).opacity).toFixed(2) : null,
      tvTop: tv ? Math.round(tv.getBoundingClientRect().top) : null,
      careTop: care ? Math.round(care.getBoundingClientRect().top) : null,
      railX: rail ? Math.round(new DOMMatrix(getComputedStyle(rail).transform).m41) : null,
      routeOp: route ? +(+getComputedStyle(route).opacity).toFixed(2) : null,
      layerT: layer ? (layer.style.transform || '') : null,
      film: window.__flight ? +window.__flight.state().target.toFixed(2) : null
    };
    var key = JSON.stringify([row.y, row.actTop, row.actOp, row.tvTop, row.careTop, row.railX, row.routeOp, row.layerT]);
    if (key !== last) { last = key; row.pins = pins(); log.frames.push(row); if (log.frames.length > 20000) log.frames.shift(); }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  addEventListener('keydown', function (e) {
    if (e.key !== 'd' && e.key !== 'D') return;
    ev('download');
    var blob = new Blob([JSON.stringify(log)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tps-scroll-log.json';
    document.body.appendChild(a); a.click(); a.remove();
    var tag = document.createElement('div');
    tag.textContent = 'Scroll log saved to Downloads';
    tag.style.cssText = 'position:fixed;z-index:99999;left:50%;top:16px;transform:translateX(-50%);background:#0A0A0A;color:#fff;font:600 13px/1 Montserrat,sans-serif;padding:10px 14px;border-radius:8px';
    document.body.appendChild(tag); setTimeout(function () { tag.remove(); }, 2500);
  });
  var badge = document.createElement('div');
  badge.textContent = 'Recording. Reproduce the problem, then press D';
  badge.style.cssText = 'position:fixed;z-index:99999;right:12px;bottom:12px;background:rgba(10,10,10,.8);color:#fff;font:500 12px/1 Montserrat,sans-serif;padding:8px 12px;border-radius:8px;pointer-events:none';
  (document.body ? document.body.appendChild(badge) : addEventListener('DOMContentLoaded', function () { document.body.appendChild(badge); }));
})();
