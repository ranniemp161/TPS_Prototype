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
  // Numerals on the cards (Ami, 24 Oct 2026), over the no numerals in titles rule.
  var WORDS = { 7: '7 Days', 14: '14 Days', 30: '30 Days' };
  var START = 1;            // the page opens on 14 days (TJ, 23 Oct 2026)

  var track = root.querySelector('[data-pg-track]');
  var card  = root.querySelector('[data-pg-card]');
  var prev  = root.querySelector('[data-pg-prev]');
  var next  = root.querySelector('[data-pg-next]');
  var live  = root.querySelector('[data-pg-live]');
  var out = {
    days:  root.querySelector('[data-pg-days]'),
    fee:   root.querySelector('[data-pg-fee]'),
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
  var p = START;
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
    // Only the per day price shows (TJ, 23 Oct 2026, Ami's directive),
    // rounded down so "Starting from" stays true.
    return { perDay: Math.floor(fee / d), rows: rows };
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
    // The digits sit closer together, the £ as it was (TJ, 25 Oct 2026).
    var money = P.money(f.perDay);
    out.fee.innerHTML = money.charAt(0) + '<span class="pg-price__digits">' + money.slice(1) + '</span>';
    out.counts.innerHTML = f.rows.map(function (r) {
      return '<li><span>' + r[0] + '</span><b>' + r[1] + '</b></li>';
    }).join('') +
      '<li><span>Herbal bath and belly binding</span><b>Every day</b></li>';
    if (live) live.textContent = WORDS[d] + ', starting from ' + P.money(f.perDay) + ' per day';
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

  // Phones: the treatment rows fold behind a toggle (CSS hides it on desktop).
  var treat = root.querySelector('[data-pg-treat]');
  var treatBtn = root.querySelector('[data-pg-treat-toggle]');
  if (treat && treatBtn) {
    treatBtn.addEventListener('click', function () {
      var open = treatBtn.getAttribute('aria-expanded') !== 'true';
      treatBtn.setAttribute('aria-expanded', String(open));
      treat.classList.toggle('is-open', open);
      // Opening brings the line and the whole open card, button included,
      // into one screen: the line settles just under the header
      // (TJ, 23 Oct 2026). Closing leaves the page where it is.
      // The header folds to --nav-h once the page scrolls, so that is the
      // height to clear. On a screen too short for both, the card's foot
      // wins, so the button is always in view.
      if (open) {
        var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
        var lineTop = root.querySelector('.pg-line').getBoundingClientRect().top + window.scrollY;
        var cardBottom = card.getBoundingClientRect().bottom + window.scrollY;
        var top = lineTop - navH - 6;
        if (cardBottom - top > window.innerHeight) top = cardBottom - window.innerHeight + 8;
        window.scrollTo({ top: Math.max(0, top), behavior: REDUCED ? 'auto' : 'smooth' });
      }
    });
  }

  sync();
  fill();
  paint();
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
