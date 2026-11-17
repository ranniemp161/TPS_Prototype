/* Testimonial options page (TJ, 17 Nov 2026).
   The quotes are a copy of TV2 in home.js, the live list. The first band is
   the home page's actVoices() unchanged in behaviour; the other two show
   three or two cards at once and step one card at a time, with the same
   chevrons and the same line of names underneath. */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TV2 = [
    { quote: "I left feeling absolutely amazing! The massage was so relaxing and exactly what my body and mind needed after giving birth. I felt lighter, calmer and completely refreshed. It was such a lovely opportunity to take some time for myself, release all the tension and feel looked after. I felt relaxed, re-energised and so much more at ease afterwards. A truly wonderful experience that I would highly recommend to any new mum.",
      author: "Roubina", role: "Postpartum Massage" },
    { quote: "It was the best massage I've ever had. I suffer from severe back pain so thank you for helping me feel relieved.",
      author: "Helena", role: "Postpartum Massage" },
    { quote: "My wife said she enjoyed it, she felt relaxed. So all good.",
      author: "Anonymous", role: "Postpartum Massage with Traditional Hot Stone" },
    { quote: "With our first baby, I felt like the hospital sent us home and left us to it. We had to work everything out ourselves. This time was completely different. I don't think my husband and I realised how much we needed postpartum care until we had it. Thank you, Ami and the whole team.",
      author: "Mother of two", role: "30 day programme" }
  ];

  var n = TV2.length;
  function mod(k) { return ((k % n) + n) % n; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
    });
  }

  /* The line of names: a fixed circle at the centre, the stops slide under
     it, one per testimonial, and each name is a button. Shared by all three
     bands. onPick(step) is called with how far to move. */
  function nameLine(track, onPick, lit) {
    lit = lit || function () { return 1; };
    var WINDOW = 6, items = new Map(), v = 0;
    function make(k) {
      var t = TV2[mod(k)];
      var el = document.createElement('div');
      el.className = 'tv2__item';
      el.style.setProperty('--q', k);
      el.innerHTML = '<span class="tv2__dot" aria-hidden="true"></span>' +
        '<button class="tv2__stop" type="button" aria-label="Show testimonial from ' + esc(t.author) + '">' + esc(t.author) + '</button>';
      el.querySelector('button').addEventListener('click', function () {
        var L = lit();
        if (k < v) onPick(k - v);
        else if (k > v + L - 1) onPick(k - (v + L - 1));
      });
      return el;
    }
    function set(next) {
      v = next;
      for (var k = v - WINDOW; k <= v + WINDOW; k++) {
        if (!items.has(k)) { var el = make(k); items.set(k, el); track.appendChild(el); }
      }
      items.forEach(function (el, k) {
        if (Math.abs(k - v) > WINDOW) { el.remove(); items.delete(k); }
      });
      track.style.transform = 'translateX(calc(' + (-v) + ' * var(--st, var(--tv-s))))';
      var L = lit();
      items.forEach(function (el, k) {
        var b = el.querySelector('button');
        if (k >= v && k < v + L) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      });
    }
    return { set: set, get: function () { return v; } };
  }

  /* ---- Current: one quote at a time, as on the home page ---- */
  function current(root) {
    var q = root.querySelector('[data-tv2-quote]');
    var name = root.querySelector('[data-tv2-name]');
    var role = root.querySelector('[data-tv2-role]');
    var meta = root.querySelector('[data-tv2-meta]');
    var live = root.querySelector('[data-tv2-live]');
    var timers = [];
    var line = nameLine(root.querySelector('[data-tv2-track]'), move);
    var p = 0;

    function paint() {
      var t = TV2[mod(p)];
      timers.forEach(clearTimeout); timers = [];
      q.innerHTML = ('“' + t.quote + '”').split(' ')
        .map(function (w) { return '<span class="tv2__w">' + esc(w) + '</span>'; }).join('');
      var words = [].slice.call(q.children);
      words.forEach(function (w, i) {
        if (REDUCED) w.classList.add('is-in');
        else timers.push(setTimeout(function () { w.classList.add('is-in'); }, i * 30));
      });
      name.textContent = t.author;
      role.textContent = t.role;
      meta.classList.remove('is-in');
      requestAnimationFrame(function () { requestAnimationFrame(function () { meta.classList.add('is-in'); }); });
      line.set(p);
      if (live) live.textContent = 'Testimonial ' + (mod(p) + 1) + ' of ' + n + ', ' + t.author + ': ' + t.quote;
    }
    function move(step) { p += step; paint(); }
    root.querySelector('[data-tv2-next]').addEventListener('click', function () { move(1); });
    root.querySelector('[data-tv2-prev]').addEventListener('click', function () { move(-1); });
    paint();
    root.classList.add('is-in');
  }

  /* ---- Two or three at once ----
     The current display repeated side by side. Each column is the same
     quote and name as the single version, and rebuilds the same way, word
     by word out of blur. The line underneath has a lit dot and a name under
     every quote in view, and slides one stop per click. */
  function multi(root) {
    var cols = root.querySelector('[data-tvm-cols]');
    var car = root.querySelector('[data-tvm-car]');
    var oldTip = car.querySelector('.tv2__tip');
    if (oldTip) oldTip.remove();
    var MAX = 3, slots = [], tips = [], p = 0;

    for (var i = 0; i < MAX; i++) {
      var col = document.createElement('div');
      col.className = 'tvm__col';
      col.innerHTML = '<blockquote class="tv2__quote"></blockquote>' +
        '<div class="tv2__by"><div class="tv2__meta"><span class="tv2__rule" aria-hidden="true"></span>' +
        '<span class="tv2__name"></span><span class="tv2__role"></span></div></div>';
      cols.appendChild(col);
      slots.push({ col: col, q: col.querySelector('.tv2__quote'), meta: col.querySelector('.tv2__meta'),
        name: col.querySelector('.tv2__name'), role: col.querySelector('.tv2__role'), timers: [] });
      var tip = document.createElement('span');
      tip.className = 'tv2__tip tvm__tip';
      tip.setAttribute('aria-hidden', 'true');
      tip.style.setProperty('--i', i);
      car.appendChild(tip);
      tips.push(tip);
    }

    function per() { return Math.round(parseFloat(getComputedStyle(root).getPropertyValue('--per'))) || 1; }
    var line = nameLine(root.querySelector('[data-tvm-line]'), move, per);

    function measure() {
      var P = per();
      var gap = parseFloat(getComputedStyle(cols).columnGap) || 0;
      var colW = (cols.clientWidth - (P - 1) * gap) / P;
      car.style.setProperty('--c0', (colW / 2) + 'px');
      car.style.setProperty('--st', (colW + gap) + 'px');
      slots.forEach(function (s, i) { s.col.hidden = i >= P; });
      tips.forEach(function (t, i) { t.style.display = i >= P ? 'none' : ''; });
    }

    function fill(s, t) {
      s.timers.forEach(clearTimeout); s.timers = [];
      s.q.innerHTML = ('“' + t.quote + '”').split(' ')
        .map(function (w) { return '<span class="tv2__w">' + esc(w) + '</span>'; }).join('');
      [].slice.call(s.q.children).forEach(function (w, i) {
        if (REDUCED) w.classList.add('is-in');
        else s.timers.push(setTimeout(function () { w.classList.add('is-in'); }, i * 30));
      });
      s.name.textContent = t.author;
      s.role.textContent = t.role;
      s.meta.classList.remove('is-in');
      requestAnimationFrame(function () { requestAnimationFrame(function () { s.meta.classList.add('is-in'); }); });
    }

    function paint() {
      var P = per();
      slots.forEach(function (s, i) { if (i < P) fill(s, TV2[mod(p + i)]); });
      line.set(p);
    }
    function move(s) { p += s; paint(); }

    root.querySelector('[data-tvm-next]').addEventListener('click', function () { move(1); });
    root.querySelector('[data-tvm-prev]').addEventListener('click', function () { move(-1); });
    var lastPer = per();
    window.addEventListener('resize', function () {
      measure();
      if (per() !== lastPer) { lastPer = per(); paint(); }
    });
    measure();
    paint();
  }

  function boot() {
    var c = document.querySelector('[data-tv2]');
    if (c) current(c);
    [].forEach.call(document.querySelectorAll('[data-tvm]'), multi);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot); else boot();
})();
