/* The Four Kinds of Care: one pair of hands (TJ, 8 Oct 2026).
   One scrubbed timeline on a sticky stage. She stays still; for each kind
   after the first:
     the next photograph cross fades in over the last (her head is in the same
     place in all four, so only the room and what she carries change);
     the outgoing words rise out through their line masks and the incoming
     words rise in, staggered line by line; the item list fades across;
     the rail's tick moves on and any open item closes.
   Each kind holds for a beat. The first kind's words rise in as the section
   arrives. Items open in place on click, one at a time per kind. Desktop
   with motion only; phones and reduced motion get photograph then words.
   Rebuilds on width change only. */
(function () {
  'use strict';
  var sec = document.querySelector('[data-hd]');
  if (!sec || sec.hidden) return;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 861px)');
  var plates = [].slice.call(sec.querySelectorAll('[data-hd-plate]'));
  var cuts = [].slice.call(sec.querySelectorAll('[data-hd-cut]'));
  var kinds = [].slice.call(sec.querySelectorAll('[data-hd-kind]'));
  var ticks = [].slice.call(sec.querySelectorAll('.hd__rail span'));
  var copy = sec.querySelector('.hd__copy');
  var splitEls = [].slice.call(sec.querySelectorAll('[data-hd-split]'));
  splitEls.forEach(function (el) { el.dataset.src = el.textContent; });

  /* Items: open in place, one at a time per kind. Works with or without GSAP. */
  function closeAll(kind) {
    [].slice.call(kind.querySelectorAll('.hd__item.is-open')).forEach(function (it) {
      it.classList.remove('is-open');
      it.querySelector('.hd__toggle').setAttribute('aria-expanded', 'false');
    });
  }
  kinds.forEach(function (kind) {
    kind.addEventListener('click', function (e) {
      var btn = e.target.closest('.hd__toggle');
      if (btn) {
        var item = btn.closest('.hd__item');
        var open = !item.classList.contains('is-open');
        closeAll(kind);
        item.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        return;
      }
      // Tight screens: the clamped paragraph opens in full on click.
      var para = e.target.closest('.hd__para');
      if (para && sec.classList.contains('is-tight')) para.classList.toggle('is-full');
    });
  });

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var HOLD = 1, MOVE = 1;
  var UNITS = kinds.length * HOLD + (kinds.length - 1) * MOVE;
  var VH_PER_UNIT = 0.7;
  var tl = null, intro = null, lastW = 0, current = 0;

  function splitLines(el) {
    var words = el.dataset.src.trim().split(/\s+/);
    el.textContent = '';
    var probes = words.map(function (w) {
      var s = document.createElement('span');
      s.textContent = w; s.style.display = 'inline-block';
      el.appendChild(s); el.appendChild(document.createTextNode(' '));
      return s;
    });
    var rows = [], top = null;
    probes.forEach(function (s, i) {
      var t = s.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { rows.push([]); top = t; }
      rows[rows.length - 1].push(words[i]);
    });
    el.textContent = '';
    return rows.map(function (row) {
      var mask = document.createElement('span'); mask.className = 'hd-line';
      var inner = document.createElement('span'); inner.textContent = row.join(' ');
      mask.appendChild(inner); el.appendChild(mask);
      return inner;
    });
  }
  function revert() { splitEls.forEach(function (el) { el.textContent = el.dataset.src; el.classList.remove('is-full'); }); }

  function setTick(i) {
    ticks.forEach(function (t, k) { t.classList.toggle('is-on', k === i); });
    if (i !== current) { closeAll(kinds[current]); current = i; }
  }

  function teardown() {
    [tl, intro].forEach(function (t) { if (t) { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); } });
    tl = intro = null;
    revert();
    gsap.set(plates.concat(cuts, kinds, [].slice.call(sec.querySelectorAll('[data-hd-fade]'))), { clearProps: 'all' });
    sec.classList.remove('is-live', 'is-tight');
    sec.style.removeProperty('--hd-len');
    ticks.forEach(function (t) { t.classList.remove('is-on'); });
    current = 0;
  }

  function build() {
    teardown();
    lastW = window.innerWidth;
    if (reduced || !wide.matches) return;
    sec.classList.add('is-live');
    sec.style.setProperty('--hd-len', (1 + UNITS * VH_PER_UNIT).toFixed(2));

    // If the tallest kind does not fit beside her, the tight layout takes over.
    var avail = copy.clientHeight - 24;
    var tallest = Math.max.apply(null, kinds.map(function (k) { return k.offsetHeight; }));
    if (tallest > avail) sec.classList.add('is-tight');

    var lines = kinds.map(function (k) {
      return [].slice.call(k.querySelectorAll('[data-hd-split]')).reduce(function (a, el) { return a.concat(splitLines(el)); }, []);
    });
    var fades = kinds.map(function (k) { return k.querySelector('[data-hd-fade]'); });

    // Layers (TJ, 8 Oct 2026): words still, room slow, hands faster, all
    // sideways only. Both picture layers are scaled up first so their travel
    // never shows an edge: the room at 1.08 (4 percent spare each side, it
    // travels 2), the hands at 1.12 (6 spare, they travel at most 5.5).
    var N = kinds.length;
    var T0 = function (k) { return k * HOLD + (k - 1) * MOVE; };     // change into kind k starts
    var holdStart = function (k) { return k === 0 ? 0 : T0(k) + MOVE; };
    var holdEnd = function (k) { return k === N - 1 ? UNITS : T0(k + 1); };
    var PLATE = { s0: 1.08, s1: 1.1, x0: 2, x1: -2 };
    // The hands' path sits right of centre so they clear the words; moving
    // right only exposes the cut out's transparent side, so only the leftward
    // travel (to -3.5) has to stay inside the 6 percent spare.
    var CUT = { s: 1.12, xIn: 8, x0: 4, x1: 0, xOut: -3.5, sIn: 1.15 };
    // Per kind extra shift right, for the objects that reach furthest left
    // (the tray, the laundry), so every pair of hands clears the words.
    var SHIFT = [0, 3, 8, 10];
    var cx = function (k, v) { return v + (SHIFT[k] || 0); };
    gsap.set(plates, { opacity: function (i) { return i === 0 ? 1 : 0; }, scale: PLATE.s0, xPercent: PLATE.x0, transformOrigin: '50% 50%' });
    gsap.set(cuts, { opacity: 0, scale: CUT.sIn, xPercent: function (k) { return cx(k, CUT.xIn); }, transformOrigin: '50% 50%' });
    gsap.set(kinds, { autoAlpha: function (i) { return i === 0 ? 1 : 0; } });
    lines.forEach(function (ls) { gsap.set(ls, { yPercent: 110 }); });
    gsap.set(fades, { opacity: 0, y: 10 });
    setTick(0);

    // The first kind's words rise in as the section arrives.
    intro = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 70%', end: 'top top', scrub: 0.5, refreshPriority: -15 } });
    intro.to(cuts[0], { opacity: 1, xPercent: cx(0, CUT.x0), scale: CUT.s, ease: 'power2.out', duration: 1 }, 0)
         .to(lines[0], { yPercent: 0, stagger: 0.06, ease: 'power2.out', duration: 0.6 }, 0.2)
         .to(fades[0], { opacity: 1, y: 0, ease: 'power2.out', duration: 0.4 }, 0.45);

    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.6,
        refreshPriority: -15,
        onUpdate: function (self) {
          var u = self.progress * UNITS, idx = 0;
          for (var k = 1; k < kinds.length; k++) { if (u >= k * HOLD + (k - 1) * MOVE + MOVE * 0.5) idx = k; }
          setTick(idx);
        }
      }
    });
    tl.set({}, {}, UNITS);

    // Each room drifts slowly right to left and zooms in a touch, over the
    // whole time it is on screen, including the change into and out of it,
    // so the motion carries through every change.
    plates.forEach(function (p, k) {
      var a = k === 0 ? 0 : T0(k), b = k === N - 1 ? UNITS : T0(k + 1) + MOVE;
      tl.fromTo(p, { xPercent: PLATE.x0, scale: PLATE.s0 }, { xPercent: PLATE.x1, scale: PLATE.s1, duration: b - a, immediateRender: false }, a);
    });
    // Each pair of hands drifts the same way, further, while its kind holds.
    cuts.forEach(function (c, k) {
      tl.fromTo(c, { xPercent: cx(k, CUT.x0) }, { xPercent: cx(k, CUT.x1), duration: holdEnd(k) - holdStart(k), immediateRender: false }, holdStart(k));
    });

    for (var i = 1; i < N; i++) {
      var t0 = T0(i);
      // The change: nothing leaves the frame. The hands slide a little further
      // left and fade; the room cross fades behind (already drifting); the new
      // hands fade in from slightly right and slightly larger, sliding into place.
      tl.fromTo(cuts[i - 1], { xPercent: cx(i - 1, CUT.x1), opacity: 1 }, { xPercent: cx(i - 1, CUT.xOut), opacity: 0, ease: 'power1.in', duration: MOVE * 0.5, immediateRender: false }, t0)
        .to(plates[i], { opacity: 1, ease: 'power1.inOut', duration: MOVE * 0.6 }, t0 + MOVE * 0.2)
        .fromTo(cuts[i], { xPercent: cx(i, CUT.xIn), scale: CUT.sIn, opacity: 0 }, { xPercent: cx(i, CUT.x0), scale: CUT.s, opacity: 1, ease: 'power2.out', duration: MOVE * 0.6, immediateRender: false }, t0 + MOVE * 0.4)
        .to(lines[i - 1], { yPercent: -110, stagger: 0.025, ease: 'power2.in', duration: MOVE * 0.4 }, t0)
        .to(fades[i - 1], { opacity: 0, y: -10, ease: 'power1.in', duration: MOVE * 0.3 }, t0)
        .set(kinds[i - 1], { autoAlpha: 0 }, t0 + MOVE * 0.5)
        .set(kinds[i], { autoAlpha: 1 }, t0 + MOVE * 0.45)
        .to(lines[i], { yPercent: 0, stagger: 0.035, ease: 'power2.out', duration: MOVE * 0.45 }, t0 + MOVE * 0.5)
        .to(fades[i], { opacity: 1, y: 0, ease: 'power2.out', duration: MOVE * 0.3 }, t0 + MOVE * 0.7);
    }
  }

  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      if (window.innerWidth === lastW) return;
      build(); ScrollTrigger.refresh();
    }, 200);
  });

  var go = function () { build(); ScrollTrigger.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else window.addEventListener('load', go);
})();
