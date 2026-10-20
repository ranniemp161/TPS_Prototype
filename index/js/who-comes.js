/* WHO COMES INTO YOUR HOME, redesigned (TJ, 19 Oct 2026). See who-comes.css.

     the statement     its words rise one after another when it arrives
     the photo stack   each photograph settles back as the next slides over it
     the checks        one line draws down with the scroll; each check lights
                       in Ember as the line reaches it, then cools to ink
     before she arrives  slow parallax inside the wide photograph
     reveals           small soft entrances, once

   Anything animated gets is-armed from here, so without script, without
   GSAP or with reduced motion the page simply reads. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };

  function once(els, fn, margin) {
    if (!hasIO) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
    }, { rootMargin: margin || '0px 0px -12% 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Reveals ---- */
  var reveals = $$('.wc-tr [data-reveal], .wc-ck [data-reveal], .wc-bf [data-reveal]');
  if (reduced) reveals.forEach(function (e) { e.classList.add('is-in'); });
  else once(reveals, function (e) { e.classList.add('is-in'); });

  /* ---- Section headings: lines measured and rising, as the hero's ---- */
  var heads = $$('.wc-h2[data-kin]');
  var headSource = new WeakMap();
  function splitHead(el) {
    var words = headSource.get(el).split(/\s+/);
    el.textContent = '';
    var probes = words.map(function (w) {
      var s = document.createElement('span'); s.textContent = w; s.style.display = 'inline-block';
      el.appendChild(s); el.appendChild(document.createTextNode(' ')); return s;
    });
    var rows = [], top = null;
    probes.forEach(function (s, i) {
      if (top === null || Math.abs(s.offsetTop - top) > 4) { rows.push([]); top = s.offsetTop; }
      rows[rows.length - 1].push(words[i]);
    });
    el.textContent = '';
    rows.forEach(function (row, i) {
      var mask = document.createElement('span'); mask.className = 'kin-line';
      var inner = document.createElement('span'); inner.textContent = row.join(' '); inner.style.setProperty('--i', i);
      mask.appendChild(inner); el.appendChild(mask); el.appendChild(document.createTextNode(' '));
    });
  }
  function splitHeads() {
    heads.forEach(function (el) {
      if (!headSource.has(el)) headSource.set(el, el.textContent.trim());
      var wasIn = el.classList.contains('is-in');
      el.classList.remove('is-split', 'is-in');
      splitHead(el);
      if (reduced) return;
      el.classList.add('is-split');
      if (wasIn) el.classList.add('is-in'); else once([el], function (t) { t.classList.add('is-in'); }, '0px 0px -10% 0px');
    });
  }
  if (heads.length) {
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(splitHeads);
    var hw = window.innerWidth, ht;
    window.addEventListener('resize', function () { if (window.innerWidth === hw) return; hw = window.innerWidth; clearTimeout(ht); ht = setTimeout(splitHeads, 150); });
  }

  /* ---- The statement: one span per word ---- */
  $$('[data-wc-words]').forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.textContent = '';
    words.forEach(function (w, i) {
      var mask = document.createElement('span'); mask.className = 'wc-w'; mask.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('span'); inner.textContent = w; inner.style.setProperty('--i', i);
      mask.appendChild(inner); el.appendChild(mask); el.appendChild(document.createTextNode(' '));
    });
    if (reduced || !hasIO) return;
    el.classList.add('is-armed');
    once([el], function (t) { t.classList.add('is-in'); }, '0px 0px -20% 0px');
  });

  /* ---- The stack: each card's sticky offset steps down a little ---- */
  var cards = $$('[data-wc-card]');
  cards.forEach(function (c, i) { c.style.setProperty('--k', i); });

  /* ---- The checks ---- */
  var wrap = document.querySelector('[data-wc-checks]');
  var line = wrap && wrap.querySelector('[data-wc-line]');
  var checks = wrap ? [].slice.call(wrap.querySelectorAll('[data-wc-check]')) : [];

  if (reduced || !window.gsap || !window.ScrollTrigger) {
    // No scrub: the checks light as each one arrives.
    if (wrap && !reduced && hasIO) {
      wrap.classList.add('is-armed');
      if (line) line.style.transform = 'none';
      once(checks, function (li) { li.classList.add('is-lit'); }, '0px 0px -30% 0px');
    }
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  cards.forEach(function (c, i) {
    var next = cards[i + 1];
    if (!next) return;
    gsap.to(c, {
      scale: 0.92, opacity: 0.55, ease: 'none',
      scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 35%', scrub: true, invalidateOnRefresh: true }
    });
  });

  if (wrap && line) {
    wrap.classList.add('is-armed');
    var marks = [];
    var measure = function () {
      var h = wrap.offsetHeight || 1;
      marks = checks.map(function (li) { return (li.offsetTop + li.offsetHeight / 2) / h; });
    };
    measure();
    var light = function (p) {
      checks.forEach(function (li, i) { if (p >= marks[i]) li.classList.add('is-lit'); });
    };
    gsap.fromTo(line, { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: {
        trigger: wrap, start: 'top 72%', end: 'bottom 60%', scrub: 0.4,
        invalidateOnRefresh: true,
        onRefresh: function (self) { measure(); light(self.progress); },
        onUpdate: function (self) { light(self.progress); }
      }
    });
  }

  $$('[data-wc-par]').forEach(function (img) {
    gsap.fromTo(img, { yPercent: -5 }, {
      yPercent: 5, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
    });
  });
})();

/* Phones: the hero fits one screen (TJ, 20 Oct 2026). From the title down to
   the last of the three points, everything sits above the fold at scroll zero,
   on any phone. The portrait gives up the height: its natural 4:5 height
   less whatever the column runs past the screen, keeping 16px clear at the
   foot. Measured from layout positions, so the copy's entrance rise does not
   count. Re-fitted on a width change or a height change of 100px or more (an
   address bar showing or hiding is less than that). */
(function () {
  'use strict';
  var frame = document.querySelector('.page--who .spec__frame');
  var points = document.querySelectorAll('.page--who .wc-points li');
  if (!frame || !points.length) return;
  var phone = window.matchMedia('(max-width: 860px)');
  var GAP = 16, lastW = 0, lastH = 0;
  function docTop(el) { var y = 0; for (var n = el; n; n = n.offsetParent) y += n.offsetTop; return y; }
  function fit() {
    lastW = window.innerWidth; lastH = document.documentElement.clientHeight;
    frame.style.height = ''; frame.style.aspectRatio = '';
    if (!phone.matches) return;
    var last = points[points.length - 1];
    var over = docTop(last) + last.offsetHeight - (lastH - GAP);
    if (over <= 0) return;
    var natural = frame.offsetHeight;
    frame.style.aspectRatio = 'auto';
    frame.style.height = Math.max(60, natural - over) + 'px';
  }
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
  window.addEventListener('resize', function () {
    if (window.innerWidth !== lastW || Math.abs(document.documentElement.clientHeight - lastH) >= 100) fit();
  });
})();
