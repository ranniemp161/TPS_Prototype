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
   with motion only; phones get photograph then words, each photograph zooming
   gently in its frame as it crosses the screen; reduced motion gets them still.
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
  /* Read more (TJ, 21 Oct 2026, from Ami). Opens one kind's full text: on
     desktop the photograph washes out and the text lies across the width; on
     phones it takes over the screen, sized to fit without scrolling where it
     can (the paragraph never below 12px; past that it scrolls inside). Read
     less, Escape or, on desktop, scrolling on to the next kind closes it. */
  var reading = null;
  kinds.forEach(function (k) {
    var text = k.querySelector('.hd__text'); if (!text || text.querySelector('.hd__teaser')) return;
    var t = document.createElement('div'); t.className = 'hd__teaser';
    var span = document.createElement('span'); span.className = 'hd__tease';
    t.appendChild(span); t.appendChild(document.createTextNode(' '));
    t.appendChild(text.querySelector('.hd__read'));
    text.insertBefore(t, text.firstChild);
  });
  /* The teaser (TJ, 21 Oct 2026): the promise and the opening paragraph as
     one run of words, cut to the lines there is room for, with the dots and
     Read more ending the last line. Ami's words, trimmed, never reworded. */
  function teaseWords(kind) {
    var promise = kind.querySelector('.hd__promise'), para = kind.querySelector('.hd__para');
    var parts = [promise ? promise.textContent : ''];
    if (para) [].slice.call(para.querySelectorAll('p')).forEach(function (q) { parts.push(q.textContent); });
    return parts.join(' ').trim().split(/\s+/);
  }
  function tease(kind, lines) {
    var span = kind.querySelector('.hd__tease'), box = kind.querySelector('.hd__teaser');
    if (!span || !box) return;
    var words = teaseWords(kind);
    var lineH = parseFloat(getComputedStyle(box).lineHeight) || parseFloat(getComputedStyle(kind).fontSize) * 1.6;
    var limit = lines * lineH + 2;
    var fits = function (n) { span.textContent = words.slice(0, n).join(' ') + (n < words.length ? '\u2026' : ''); return span.offsetHeight <= limit; };
    var lo = 1, hi = words.length;
    if (fits(hi)) return;
    while (lo < hi) { var mid = Math.ceil((lo + hi) / 2); if (fits(mid)) lo = mid; else hi = mid - 1; }
    fits(lo);
  }
  var FIT_MIN = 12 / (0.92 * 16);
  plates.forEach(function (p, i) { if (kinds[i]) kinds[i].style.setProperty('--hd-bg', 'url("' + p.getAttribute('src') + '")'); });
  /* The notch (TJ, 21 Oct 2026): Read more never moves, and the open stack
     is centred and wide, so its first lines would run under the pinned
     button. A float the size of the button, placed at the button's spot,
     indents those lines past it. */
  function notch(kind, spot) {
    unnotch(kind);
    var first = kind.querySelector('.hd__text .hd__promise');
    if (!first) return;
    var tr = first.getBoundingClientRect();
    // The float runs from the stack's first line down past the button, but
    // its shape starts at the button's top, so only the lines level with
    // the button indent past it; the lines above flow full width.
    var w = Math.round(spot.right - tr.left + 10);
    if (w <= 0) return;
    var n = document.createElement('span');
    n.className = 'hd__notch';
    n.style.width = w + 'px';
    n.style.height = Math.round(spot.bottom - tr.top + 4) + 'px';
    n.style.shapeOutside = 'inset(' + Math.max(0, Math.round(spot.top - tr.top - 4)) + 'px 0 0 0)';
    first.insertBefore(n, first.firstChild);
  }
  function unnotch(kind) {
    [].slice.call(kind.querySelectorAll('.hd__notch')).forEach(function (n) { n.parentNode.removeChild(n); });
  }
  /* The flight (TJ, 21 Oct 2026). flyBox: the box the teaser's words occupy
     in a state (closed: the tease block; open: the top of the stack, from
     the promise down, at the stack's width). fly: a fixed copy of the
     teaser's words glides and widens from one box to the other, then fades
     as the real text has come in. */
  function flyBox(kind, open) {
    if (open) {
      var text = kind.querySelector('.hd__text').getBoundingClientRect();
      var pr = kind.querySelector('.hd__promise').getBoundingClientRect();
      var pa = kind.querySelector('.hd__para').getBoundingClientRect();
      return { left: text.left, top: pr.top, width: text.width, height: pa.bottom - pr.top };
    }
    var t = kind.querySelector('.hd__tease').getBoundingClientRect();
    return { left: t.left, top: t.top, width: t.width, height: t.height };
  }
  // The copy is the opening text itself (the promise and the paragraph),
  // clipped to the teaser's box when closed and the full block when open,
  // so on landing the real text takes over on the same pixels, no dissolve.
  function fly(kind, from, to) {
    if (!from || !to) return;
    var g = document.createElement('div');
    g.className = 'hd__fly';
    g.appendChild(kind.querySelector('.hd__promise').cloneNode(true));
    g.appendChild(kind.querySelector('.hd__para').cloneNode(true));
    g.style.fontSize = getComputedStyle(kind).fontSize;
    g.style.setProperty('--hd-gap', sec.style.getPropertyValue('--hd-gap') || '1');
    ['left', 'top', 'width', 'height'].forEach(function (k) { g.style[k] = from[k] + 'px'; });
    document.body.appendChild(g);
    flying = g;
    g.getBoundingClientRect();
    ['left', 'top', 'width', 'height'].forEach(function (k) { g.style[k] = to[k] + 'px'; });
    setTimeout(function () { if (g.parentNode) g.parentNode.removeChild(g); if (flying === g) flying = null; }, 1000);
  }
  function fit(kind) {
    var f = 1;
    kind.style.setProperty('--fit', '1');
    while (kind.scrollHeight > kind.clientHeight + 1 && f > FIT_MIN) {
      f = Math.max(FIT_MIN, f - 0.02);
      kind.style.setProperty('--fit', f.toFixed(3));
    }
  }
  // quick: a close caused by scrolling on to the next kind (setTick), with no
  // flight and no fade, so nothing lands on the kind that has taken over.
  var flying = null;
  function setReading(kind, on, quick) {
    if (!on && !kind) return;
    if (on && reading && reading !== kind) setReading(reading, false);
    var btn = kind.querySelector('[data-hd-read]');
    var live = sec.classList.contains('is-live');
    // Read more never moves (TJ): its closed spot is measured and it is
    // pinned there while the kind is open.
    var spot = live && btn && on ? btn.getBoundingClientRect() : null;
    // the flight: where the text is now, before the switch
    var flyFrom = live && !quick ? flyBox(kind, !on) : null;
    if (quick && flying && flying.parentNode) { flying.parentNode.removeChild(flying); flying = null; }
    if (live && btn && !on) { btn.style.left = ''; btn.style.top = ''; }
    kind.classList.toggle('is-reading', on);
    sec.classList.toggle('is-reading', on);
    if (spot) {
      var op = (btn.offsetParent || kind).getBoundingClientRect();
      btn.style.left = (spot.left - op.left).toFixed(1) + 'px';
      btn.style.top = (spot.top - op.top).toFixed(1) + 'px';
    }
    if (live && !on) unnotch(kind);
    sec.classList.toggle('is-reading-phone', on && !live);
    document.documentElement.style.overflow = on && !live ? 'hidden' : '';
    if (btn) { btn.textContent = on ? 'Read less' : 'Read more'; btn.setAttribute('aria-expanded', on ? 'true' : 'false'); }
    reading = on ? kind : null;
    // Desktop: the name and promise glide to the page's centre, each line on
    // its own (TJ, 21 Oct 2026), and back on close. The button stays put.
    if (live) {
      var heads = [].slice.call(kind.querySelectorAll('.hd__name .hd-line'));
      var st = sec.querySelector('.hd__stage').getBoundingClientRect();
      var mid = st.left + st.width / 2;
      heads.forEach(function (l) {
        if (!on) { l.style.transform = ''; return; }
        var r = l.getBoundingClientRect();
        l.style.transform = 'translateX(' + (mid - (r.left + r.width / 2)).toFixed(1) + 'px)';
      });
    }
    if (live && quick) kind.classList.remove('is-switching', 'is-closing');
    if (live && !quick) {
      kind.classList.add('is-switching');
      kind.classList.toggle('is-closing', !on);
      var flyTo = flyBox(kind, on);
      fly(kind, flyFrom, flyTo);
      // the real text fades in as the copy lands
      setTimeout(function () { kind.classList.remove('is-switching', 'is-closing'); }, 1000);
    }
    if (on && !live) { kind.scrollTop = 0; fit(kind); }
    if (!on) kind.style.removeProperty('--fit');
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && reading) setReading(reading, false); });

  kinds.forEach(function (kind) {
    kind.addEventListener('click', function (e) {
      var read = e.target.closest('[data-hd-read]');
      if (read) { setReading(kind, !kind.classList.contains('is-reading')); return; }
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
  var tl = null, intro = null, lastW = 0, current = 0, zooms = [];

  /* Phones (TJ, 11 Oct 2026): each picture keeps its frame while the photograph
     inside grows as it crosses the screen, 1 to 1.2, about the hands, reaching
     full zoom while the picture is still on screen.
     Room and hands are scaled together from the same origin, so they stay
     lined up. */
  var ZOOM = { to: 1.2, origin: '62% 46%' };   // 1.08 first; TJ asked for more (11 Oct 2026)
  function phoneZoom() {
    [].slice.call(sec.querySelectorAll('[data-hd-scene]')).forEach(function (scene) {
      var layers = [].slice.call(scene.querySelectorAll('[data-hd-plate], [data-hd-cut]'));
      zooms.push(gsap.fromTo(layers, { scale: 1, transformOrigin: ZOOM.origin }, {
        scale: ZOOM.to, ease: 'none',
        scrollTrigger: { trigger: scene, start: 'top 92%', end: 'bottom 35%', scrub: 0.6, invalidateOnRefresh: true }
      }));
    });
  }

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
    if (i !== current) { closeAll(kinds[current]); if (reading) setReading(reading, false, true); current = i; }
  }

  function teardown() {
    [tl, intro].forEach(function (t) { if (t) { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); } });
    tl = intro = null;
    if (reading) setReading(reading, false);
    zooms.forEach(function (z) { if (z.scrollTrigger) z.scrollTrigger.kill(); z.kill(); });
    zooms = [];
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
    if (reduced) return;
    if (!wide.matches) { phoneZoom(); kinds.forEach(function (k) { tease(k, 5); }); return; }
    sec.classList.add('is-live');
    // Under the end of the house flight (TJ, 21 Oct 2026): the film above
    // dissolves to show this stage already in place, so it reaches the top of
    // the window REVEAL windows early. Those windows are added to the length
    // and the timeline starts after them, so nothing here moves while the
    // film is still dissolving; the first kind's words are in before it.
    var prev = sec.previousElementSibling;
    var REVEAL = prev && prev.hasAttribute('data-flight') ? (parseFloat(prev.dataset.revealVh) || 0) : 0;
    sec.style.setProperty('--hd-len', (1 + UNITS * VH_PER_UNIT + REVEAL).toFixed(2));

    // If the tallest kind does not fit beside her, the tight layout takes over.
    var avail = copy.clientHeight - 24;
    var tallest = Math.max.apply(null, kinds.map(function (k) { return k.offsetHeight; }));
    if (tallest > avail) sec.classList.add('is-tight');

    var lines = kinds.map(function (k) {
      return [].slice.call(k.querySelectorAll('[data-hd-split]')).reduce(function (a, el) { return a.concat(splitLines(el)); }, []);
    });
    // Read more and the hidden full text fade together (TJ, 21 Oct 2026)
    var fades = kinds.map(function (k) { return [].slice.call(k.querySelectorAll('[data-hd-fade]')); });

    // One top per kind for both states (TJ, 21 Oct 2026), so Read more never
    // moves, and one stack width per kind (TJ): the widest of a few steps at
    // which the open stack, under the name, ends above the foot of the
    // window. Where even the widest will not fit (a short window), the body
    // size steps down for all four kinds together, never under 13px, so the
    // text stays uniform. The closed teaser then takes the lines left under
    // the name at that same top.
    var stageW = sec.querySelector('.hd__stage').clientWidth;
    sec.style.setProperty('--stage-w', stageW + 'px');
    var availH = copy.clientHeight;
    var WIDTHS = [0.56, 0.64, 0.72, 0.8, 0.88];
    // the stack's left edge clears Read more, which stays at the left (TJ)
    var stLeft = sec.querySelector('.hd__stage').getBoundingClientRect().left;
    var btnRight = copy.getBoundingClientRect().left - stLeft + Math.max.apply(null, kinds.map(function (k) { var b = k.querySelector('[data-hd-read]'); return b ? b.offsetWidth : 0; }));
    var clearW = Math.round(stageW - 2 * (btnRight + 32));
    var maxW = Math.min(1180, clearW, Math.round((stageW - 48) * 0.88));
    var fitWidth = function (k) {
      k.classList.add('is-measure');
      var chosen = null;
      for (var wi = 0; wi < WIDTHS.length && chosen === null; wi++) {
        var wpx = Math.min(maxW, Math.round((stageW - 48) * WIDTHS[wi]));
        k.style.setProperty('--hd-w', wpx + 'px');
        if (k.offsetHeight <= availH - 24) chosen = wpx;
      }
      if (chosen === null) k.style.setProperty('--hd-w', maxW + 'px');
      var h = k.offsetHeight;
      k.classList.remove('is-measure');
      return { fits: chosen !== null, h: h };
    };
    kinds.forEach(function (k) { k.style.transform = 'none'; k.style.top = '0px'; });
    // Size first, down to the 13px floor; then the gaps between paragraphs
    // tighten, never under half, all four kinds together so they stay alike.
    var scale = 1, FS_MIN = 13 / 14.72, gap = 1, GAP_MIN = 0.5, result;
    for (;;) {
      sec.style.setProperty('--hd-fs', (0.92 * scale).toFixed(4) + 'rem');
      sec.style.setProperty('--hd-gap', gap.toFixed(2));
      result = kinds.map(fitWidth);
      if (result.every(function (r) { return r.fits; })) break;
      if (scale > FS_MIN + 0.0001) scale = Math.max(FS_MIN, scale - 0.02);
      else if (gap > GAP_MIN + 0.001) gap = Math.max(GAP_MIN, gap - 0.05);
      else break;
    }
    kinds.forEach(function (k, i) {
      var openH = result[i].h;
      var nameEl = k.querySelector('.hd__name');
      var nameH = nameEl.offsetHeight + parseFloat(getComputedStyle(nameEl).marginBottom);
      var lineH = parseFloat(getComputedStyle(k).fontSize) * 1.6;
      var top = Math.round(Math.max(0, Math.min((availH - openH) / 2, availH - openH - 24)));
      k.style.top = top + 'px';
      var teaserLines = Math.floor((availH - top - nameH - 24 - lineH * 1.55) / lineH);
      tease(k, Math.max(2, Math.min(5, teaserLines)));
    });

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
    gsap.set([].concat.apply([], fades), { opacity: 0, y: 10 });
    setTick(0);

    // The first kind's words rise in as the section arrives.
    intro = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 70%', end: REVEAL ? 'top 25%' : 'top top', scrub: 0.5, refreshPriority: -15 } });
    intro.to(cuts[0], { opacity: 1, xPercent: cx(0, CUT.x0), scale: CUT.s, ease: 'power2.out', duration: 1 }, 0)
         .to(lines[0], { yPercent: 0, stagger: 0.06, ease: 'power2.out', duration: 0.6 }, 0.2)
         .to(fades[0], { opacity: 1, y: 0, ease: 'power2.out', duration: 0.4 }, 0.45);

    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: REVEAL ? function () { return 'top+=' + Math.round(REVEAL * window.innerHeight) + ' top'; } : 'top top', end: 'bottom bottom', scrub: 0.6,
        invalidateOnRefresh: true,
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
