/* ============================================================
   THE POSTPARTUM SUITE, Programmes page: the three lengths on the line

   The testimonials' line device (home.js, actVoices) cut down to three
   fixed stops, 7, 14 and 30 days, with no wrap. The track slides so the
   chosen length sits under the centre circle, and the card under the line
   swaps its figures. Prices and counts come from the pricing engine
   (build-your-programme-pricing.js), so the page and the builder agree.
   ============================================================ */

(function () {
  'use strict';

  var root = document.querySelector('[data-pg]');
  if (!root || typeof TPS_PRICING === 'undefined') return;

  var P = TPS_PRICING;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LENGTHS = [7, 14, 30];
  var WORDS = { 7: 'Seven days', 14: 'Fourteen days', 30: 'Thirty days' };
  var SUB = { 7: 'A full week', 14: 'Two weeks', 30: 'Full confinement' };

  var track = root.querySelector('[data-pg-track]');
  var card  = root.querySelector('[data-pg-card]');
  var prev  = root.querySelector('[data-pg-prev]');
  var next  = root.querySelector('[data-pg-next]');
  var live  = root.querySelector('[data-pg-live]');
  var out = {
    days:  root.querySelector('[data-pg-days]'),
    sub:   root.querySelector('[data-pg-sub]'),
    fee:   root.querySelector('[data-pg-fee]'),
    full:  root.querySelector('[data-pg-full]'),
    counts: root.querySelector('[data-pg-counts]')
  };

  // p is the virtual position under the centre circle, never wrapped, so the
  // track runs on past 30 days into 7 again with no jump, in either
  // direction (TJ, 22 Oct 2026: loop like the testimonials). Stop k always
  // shows length mod(k), so a stop keeps its label for its whole life.
  var n = LENGTHS.length;
  var mod = function (k) { return ((k % n) + n) % n; };
  var WINDOW = 3;           // stops kept either side of the centre
  var items = {};           // virtual stop -> element
  var p = 0;
  var timer = null;

  function times(n) { return n === 1 ? 'Once' : n + ' times'; }

  function figures(d) {
    var sel = P.completeSelection(d);
    var fee = P.calculate(sel).fee;
    var m = P.massageSessions(sel.rhythm, d);
    var rows = [
      ['Postpartum massage with hot stone therapy', m + ' sessions'],
      ['Body scrub', times(P.STD[d].scrub)],
      ['Foot reflexology', times(P.STD[d].reflex)],
      ['Facial massage', times(P.STD[d].facial)],
      ['Herbal foot treatment', times(P.STD[d].herbfoot)],
      ['Thermal blanket treatment', times(P.STD[d].thermal)]
    ];
    return { fee: fee, full: P.CONFIG.fullPrice[d], rows: rows };
  }

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
    var d = LENGTHS[mod(p)], f = figures(d);
    out.days.textContent = WORDS[d];
    out.sub.textContent = SUB[d];
    out.fee.textContent = P.money(f.fee);
    out.full.textContent = 'Programme price ' + P.money(f.full) + ' after ' + P.CONFIG.introHeldFor;
    out.counts.innerHTML = f.rows.map(function (r) {
      return '<li><span>' + r[0] + '</span><b>' + r[1] + '</b></li>';
    }).join('') +
      '<li><span>Herbal bath and belly binding</span><b>Every day</b></li>';
    if (live) live.textContent = WORDS[d] + ', from ' + P.money(f.fee);
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
    clearTimeout(timer);
    card.classList.add('is-swapping');
    timer = setTimeout(function () { fill(); card.classList.remove('is-swapping'); }, 330);
  }

  // Phones: the treatment rows fold behind a toggle (CSS hides it on desktop).
  var treat = root.querySelector('[data-pg-treat]');
  var treatBtn = root.querySelector('[data-pg-treat-toggle]');
  if (treat && treatBtn) {
    treatBtn.addEventListener('click', function () {
      var open = treatBtn.getAttribute('aria-expanded') !== 'true';
      treatBtn.setAttribute('aria-expanded', String(open));
      treat.classList.toggle('is-open', open);
    });
  }

  sync();
  fill();
  paint();
  if (prev) prev.addEventListener('click', function () { move(-1); });
  if (next) next.addEventListener('click', function () { move(1); });
})();
