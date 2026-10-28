/* ============================================================
   THE POSTPARTUM SUITE, Programmes page: the three lengths on the line

   The testimonials' line device (home.js, actVoices) cut down to three
   fixed stops, 7, 14 and 30 days, with no wrap. The track slides so the
   chosen length sits under the centre circle, and the card under the line
   swaps its figures. The per day price and the treatment total are the
   sales brochure's fixed display figures (TJ, 26 Oct 2026); the pricing
   engine is no longer read here, and the bespoke builder keeps its own.
   ============================================================ */

(function () {
  'use strict';

  var root = document.querySelector('[data-pg]');
  if (!root) return;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LENGTHS = [7, 14, 30];
  // Numerals on the cards (Ami, 24 Oct 2026), over the no numerals in titles rule.
  var WORDS = { 7: '7 Days', 14: '14 Days', 30: '30 Days' };
  // The brochure's figures, display only (TJ, 26 Oct 2026, from the sales
  // brochure): "from £… per day" and the treatments across the whole stay.
  var PER_DAY = { 7: 360, 14: 298, 30: 224 };
  var TREATMENTS = { 7: 8, 14: 15, 30: 30 };
  // Three meals a day across the stay (TJ, 26 Oct 2026).
  var MEALS = { 7: 21, 14: 42, 30: 90 };
  var START = 1;            // the page opens on 14 days (TJ, 23 Oct 2026)

  var track = root.querySelector('[data-pg-track]');
  var card  = root.querySelector('[data-pg-card]');
  var prev  = root.querySelector('[data-pg-prev]');
  var next  = root.querySelector('[data-pg-next]');
  var live  = root.querySelector('[data-pg-live]');
  var out = {
    days:  root.querySelector('[data-pg-days]'),
    fee:   root.querySelector('[data-pg-fee]'),
    treat: root.querySelector('[data-pg-treat]'),
    meals: root.querySelector('[data-pg-meals]')
  };

  // p is the virtual position under the centre circle, never wrapped, so the
  // track runs on past 30 days into 7 again with no jump, in either
  // direction (TJ, 22 Oct 2026: loop like the testimonials). Stop k always
  // shows length mod(k), so a stop keeps its label for its whole life.
  var n = LENGTHS.length;
  var mod = function (k) { return ((k % n) + n) % n; };
  var WINDOW = 3;           // stops kept either side of the centre
  var items = {};           // virtual stop -> element
  var p = START;
  var timer = null;

  function makeItem(k) {
    var d = LENGTHS[mod(k)];
    var el = document.createElement('div');
    el.className = 'tv2__item';
    el.style.setProperty('--q', k);
    el.innerHTML = '<span class="tv2__dot" aria-hidden="true"></span>' +
      '<button class="tv2__stop" type="button" aria-label="Show the ' + d + ' day programme">' + d + ' days</button>';
    el.querySelector('button').addEventListener('click', function () { if (k !== p) move(k - p); });
    return el;
  }

  // Keep the stops either side of the centre and drop the ones well past
  // the mask, which are already off the line.
  function sync() {
    for (var k = p - WINDOW; k <= p + WINDOW; k++) {
      if (!items[k]) { items[k] = makeItem(k); track.appendChild(items[k]); }
    }
    Object.keys(items).forEach(function (key) {
      var k = +key;
      if (Math.abs(k - p) > WINDOW) { items[k].remove(); delete items[k]; }
    });
  }

  function fill() {
    var d = LENGTHS[mod(p)];
    out.days.textContent = WORDS[d];
    // The digits sit closer together, the £ as it was (TJ, 25 Oct 2026).
    out.fee.innerHTML = '£<span class="pg-price__digits">' + PER_DAY[d] + '</span>';
    if (out.treat) out.treat.textContent = TREATMENTS[d];
    if (out.meals) out.meals.textContent = MEALS[d];
    if (live) live.textContent = WORDS[d] + ', from £' + PER_DAY[d] + ' per day, up to ' + TREATMENTS[d] + ' treatments, up to ' + MEALS[d] + ' meals';
    fit();
  }

  function paint() {
    track.style.transform = 'translateX(calc(' + (-p) + ' * var(--tv-s)))';
    Object.keys(items).forEach(function (key) {
      var btn = items[key].querySelector('button');
      if (+key === p) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });
  }

  function move(step) {
    p += step;
    sync();
    paint();
    if (REDUCED) { fill(); return; }
    // The card's words leave the way the track moves and the new ones come
    // in from the other side (TJ, 23 Oct 2026). Next moves the track left.
    clearTimeout(timer);
    card.style.setProperty('--pg-dir', step > 0 ? 1 : -1);
    card.classList.remove('is-entering');
    card.classList.add('is-swapping');
    timer = setTimeout(function () {
      fill();
      card.classList.add('is-entering');
      card.classList.remove('is-swapping');
      void card.offsetWidth;
      card.classList.remove('is-entering');
    }, 330);
  }

  /* The card above the fold on any laptop window (TJ, 26 Oct 2026): --pg-fit
     runs from 1 down until the card's foot clears the window, and the hero's
     spacing and type follow it (programmes.css). Phones keep their own layout. */
  var section = root;
  function fit() {
    if (window.innerWidth <= 860) { section.style.removeProperty('--pg-fit'); return; }
    var f = 1;
    section.style.setProperty('--pg-fit', f);
    var room = window.innerHeight - 16;
    while (f > 0.35 && card.getBoundingClientRect().bottom + window.scrollY > room) {
      f = Math.round((f - 0.05) * 100) / 100;
      section.style.setProperty('--pg-fit', f);
    }
  }

  sync();
  fill();
  paint();
  var rt = 0;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(fit, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  if (prev) prev.addEventListener('click', function () { move(-1); });
  if (next) next.addEventListener('click', function () { move(1); });

  // Phones: a sideways swipe on the card moves one length (TJ, 23 Oct 2026).
  var sx = 0, sy = 0;
  card.addEventListener('touchstart', function (e) {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  card.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
  }, { passive: true });
})();
