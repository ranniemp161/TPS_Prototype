/* Tailored For You (TJ, 9 Oct 2026). See what-we-do-tailored.css for the idea.

   Desktop: one scrubbed progress over a held (sticky) stage, as A Day With Us.
     0.00 to 0.20  the photograph closes from the full screen onto the slot,
                   the title over it gives way, the glass card lifts in
     0.24 to 0.34  the line draws from nothing to 5 days, led by the circle
     0.34 to 0.90  5, 7, 14, 30: the circle travels and rests at each stop
                   while the figures count (the ledger in what-we-do.js)
   Phones: the photograph closes onto its frame as it scrolls in; the line
   runs down the middle and its circle holds at 72 percent of the screen
   while the line draws past it, as the tip does in A Day With Us.

   Then the sun: once the line is complete and the section is leaving, the
   circle lifts off the line and drifts down into Day and Night, growing as it
   goes, and lands on the sun at the moment the clock begins, where the sun
   takes over. Across and down on desktop; straight down the centre on phones.
   Reduced motion: the line complete at five days, no flight. */
(function () {
  'use strict';
  var sec = document.querySelector('[data-ty]');
  if (!sec || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = sec.querySelector('.ty__stage');
  var track = sec.querySelector('[data-ledger]');
  var slot = sec.querySelector('.ty__slot');
  var photo = sec.querySelector('.ty__photo');
  var img = photo.querySelector('img');
  var title = sec.querySelector('h2[data-ty-title]');
  var titles = [].slice.call(sec.querySelectorAll('[data-ty-title]'));
  var tslot = sec.querySelector('.ty__tslot');
  var days = sec.querySelector('.ty__days');
  var tip = sec.querySelector('[data-ty-tip]');
  var stop14 = sec.querySelector('.ty__stop[style*="--at: 14"]');
  var STOPS = [5, 7, 14, 30], MILESTONES = [0, 1 / 3, 2 / 3, 1];
  var PH = 0.2, L0 = 0.24, L1 = 0.34, L2 = 0.9;
  var lastW = 0, phone = false;
  // One driver per mode, run every frame. Positions are read live from the
  // page rather than measured once, because the sections above change height
  // after load (the zones size themselves late) and a stored position drifts.
  var drive = null;
  var ease = function (cur, target) { var d = target - cur; return Math.abs(d) < 0.0004 ? target : cur + d * 0.16; };

  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var smooth = function (x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
  var ledger = function () { return track._tlLedger; };

  // Desktop: the circle rests at each stop, easing between them.
  function dayAt(q) {
    if (q >= 1) return 30;
    var seg = Math.min(2, Math.floor(q * 3)), local = q * 3 - seg;
    return STOPS[seg] + (STOPS[seg + 1] - STOPS[seg]) * smooth(local);
  }
  function activeAt(q) { return q < 1 / 6 ? 5 : q < 1 / 2 ? 7 : q < 5 / 6 ? 14 : 30; }
  // Phones: the line is drawn straight from scroll, so the stop is the last one passed.
  function activeFor(d) { var a = 5; STOPS.forEach(function (s) { if (d >= s - 0.01) a = s; }); return a; }

  function setDays(d, active) {
    var L = ledger(); if (!L) return;
    if (d < 5) L.arrive(d); else L.scrub(d, active);
  }

  function teardown() {
    drive = null;
    sec.classList.remove('is-live', 'is-flow');
    ['--ty-ci', '--ty-di', '--ty-sw', '--ph-t', '--ph-r', '--ph-b', '--ph-l', '--ph-rad'].forEach(function (p) { sec.style.removeProperty(p); });
    titles.forEach(function (t) { t.style.transform = ''; }); tslot.style.height = '';
    img.style.width = ''; img.style.height = ''; img.style.transform = '';
    delete track._tlSeekDay;
  }

  /* ---------- Desktop: the held stage ---------- */
  function desktop() {
    sec.classList.add('is-live');
    // The title comes to rest centred over both cards, 20 percent narrower
    // than the two of them together (TJ, 9 Oct 2026): the resting line is as
    // wide as the cards and as tall as the title is at that size, before
    // anything is measured.
    var headW = sec.querySelector('.ty__head').getBoundingClientRect().width;
    var tW = title.offsetWidth, tH = title.offsetHeight;
    var tS = 0.8 * headW / tW;
    tslot.style.height = Math.ceil(tH * tS) + 'px';
    var stageR = stage.getBoundingClientRect();
    var slotR = slot.getBoundingClientRect();
    var sl = { t: slotR.top - stageR.top, l: slotR.left - stageR.left, r: stageR.right - slotR.right, b: stageR.bottom - slotR.bottom };
    var RAD = parseFloat(getComputedStyle(slot).borderTopLeftRadius) || 10;
    sec.style.setProperty('--ty-sw', (stageR.width - sl.l - sl.r).toFixed(1) + 'px');
    // The picture's own rectangle: covering the screen at the start (a touch
    // larger) and covering the slot at the end, framed on her at the cot.
    var A = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 1920 / 1072;
    var cover = function (bx, by, bw, bh, fx) { var w = Math.max(bw, bh * A), h = w / A; return { x: bx + (bw - w) * fx, y: by + (bh - h) / 2, w: w, h: h }; };
    var SW = stageR.width, SH = stageR.height;
    var r0 = cover(-SW * .03, -SH * .03, SW * 1.06, SH * 1.06, .5);
    // In the slot the crop sits on the three of them, right of centre.
    var r1 = cover(sl.l, sl.t, SW - sl.l - sl.r, SH - sl.t - sl.b, .8);
    var BASE = r0.w;
    img.style.width = BASE + 'px'; img.style.height = (BASE / A) + 'px';

    // The title (TJ, 9 Oct 2026): from its place on the photograph, bottom
    // left, to the line above the photograph and the card, centred and
    // shrinking, on the photograph's own curve. Its two copies take the same
    // transform; which one shows where is decided by the photograph's edge.
    var t0 = title.getBoundingClientRect(), ts = tslot.getBoundingClientRect();
    var tX = ts.left - t0.left + (ts.width - tW * tS) / 2, tY = ts.top - t0.top;

    function render(p) {
      var a = clamp(p / PH, 0, 1), e = a < .5 ? 2 * a * a : 1 - Math.pow(-2 * a + 2, 2) / 2;
      sec.style.setProperty('--ph-t', (e * sl.t).toFixed(1) + 'px');
      sec.style.setProperty('--ph-r', (e * sl.r).toFixed(1) + 'px');
      sec.style.setProperty('--ph-b', (e * sl.b).toFixed(1) + 'px');
      sec.style.setProperty('--ph-l', (e * sl.l).toFixed(1) + 'px');
      sec.style.setProperty('--ph-rad', (e * RAD).toFixed(1) + 'px');
      var x = r0.x + (r1.x - r0.x) * e, y = r0.y + (r1.y - r0.y) * e, w = r0.w + (r1.w - r0.w) * e;
      img.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + (w / BASE).toFixed(4) + ')';
      var tf = 'translate(' + (tX * e).toFixed(1) + 'px,' + (tY * e).toFixed(1) + 'px) scale(' + (1 + (tS - 1) * e).toFixed(4) + ')';
      titles.forEach(function (t) { t.style.transform = tf; });
      sec.style.setProperty('--ty-ci', smooth((p - PH * 0.5) / (PH * 0.45)).toFixed(3));
      sec.style.setProperty('--ty-di', smooth((p - PH * 0.8) / (PH * 0.4)).toFixed(3));
      if (p < L0) setDays(0, 5);
      else if (p < L1) setDays(5 * (p - L0) / (L1 - L0), 5);
      else { var q = clamp((p - L1) / (L2 - L1), 0, 1); setDays(dayAt(q), activeAt(q)); }
    }

    var live = function () { return clamp(-sec.getBoundingClientRect().top / (sec.offsetHeight - window.innerHeight), 0, 1); };
    var cur = live(), shown = -1;
    drive = function () {
      cur = ease(cur, live());
      if (cur !== shown) { render(cur); shown = cur; }
    };
    render(cur);

    // A day chosen by click, key or drag scrolls the page to where the
    // circle rests on it, so scroll stays the one thing driving the line.
    track._tlSeekDay = function (d) {
      var i = STOPS.indexOf(d); if (i < 0) return false;
      var top = sec.getBoundingClientRect().top + window.scrollY;
      var p = L1 + MILESTONES[i] * (L2 - L1) + (i === 0 ? 0.005 : 0);
      window.scrollTo({ top: top + p * (sec.offsetHeight - window.innerHeight), behavior: 'smooth' });
      return true;
    };
  }

  /* ---------- Phones: the line down the middle ---------- */
  // The circle holds low on the screen, so the figures above stay in view.
  var HOLD = 0.72;
  function flow() {
    sec.classList.add('is-flow');
    var gut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter')) || 24;
    // The photograph closes onto its frame between its top at 85 percent of
    // the screen and at 12 percent; the line draws past the hold point.
    var livePh = function () { var vh = window.innerHeight; return clamp((0.85 * vh - photo.getBoundingClientRect().top) / (0.73 * vh), 0, 1); };
    var liveLn = function () { return clamp((HOLD * window.innerHeight - days.getBoundingClientRect().top) / days.offsetHeight, 0, 1); };
    var a = livePh(), q = liveLn(), shownA = -1, shownQ = -1;
    var paint = function () {
      if (a !== shownA) {
        var e = smooth(a);
        sec.style.setProperty('--ph-l', (e * gut).toFixed(1) + 'px');
        sec.style.setProperty('--ph-r', (e * gut).toFixed(1) + 'px');
        sec.style.setProperty('--ph-rad', (e * 10).toFixed(1) + 'px');
        shownA = a;
      }
      if (q !== shownQ) { var d = q * 30; setDays(d, activeFor(d)); shownQ = q; }
    };
    drive = function () { a = ease(a, livePh()); q = ease(q, liveLn()); paint(); };
    paint();

    track._tlSeekDay = function (d) {
      if (STOPS.indexOf(d) < 0) return false;
      var top = days.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (d / 30) * days.offsetHeight - HOLD * window.innerHeight + 1, behavior: 'smooth' });
      return true;
    };
  }

  /* ---------- The sun ----------
     A twin of the circle, fixed to the window, carries it from the end of the
     line to the sun. The real circle and the real sun are hidden while it
     flies, so there is only ever one disc. Measured live every frame from
     both ends, so it holds whatever the two sections are doing. */
  var twin = null, sun = null, peakStage = null, src = null, ink = null, dnWrap = null, dnFrame = null;
  // Start: the line is complete and the section begins to leave (desktop: the
  // held stage lets go; phones: the line's end has passed the hold point).
  // End: the Day and Night pin has started (its stage's place in the flow, the
  // pin spacer when pinned) and the clock, and so the sun, has arrived, 8
  // percent of a screen into it. Both read live, in distance still to scroll.
  function progress() {
    var vh = window.innerHeight;
    var toStart = phone ? days.getBoundingClientRect().bottom - HOLD * vh : sec.getBoundingClientRect().bottom - vh;
    var holder = peakStage.parentElement && peakStage.parentElement.classList.contains('pin-spacer') ? peakStage.parentElement : peakStage;
    var toEnd = Math.max(toStart + vh * 0.3, holder.getBoundingClientRect().top + 0.08 * vh);
    return -toStart / (toEnd - toStart);
  }
  function centre(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }
  function fly() {
    if (!sun) return;
    var p = progress();
    if (p <= 0) {
      twin.style.display = 'none'; tip.classList.remove('is-lifted'); stop14.classList.remove('is-lifted'); sun.style.visibility = '';
      return;
    }
    // The circle that drops: on desktop the 14 day stop, which sits at the page's
    // centre, so it falls straight down; on phones the circle at the line's foot,
    // which sits on the centred line.
    src = phone ? tip : stop14;
    src.classList.add('is-lifted');
    if (p >= 1) { twin.style.display = 'none'; sun.style.visibility = ''; return; }
    sun.style.visibility = 'hidden';
    var a = centre(src), b = centre(sun);
    var ex = smooth(p), ey = Math.pow(p, 1.15), es = smooth(p);
    var w = a.w + (b.w - a.w) * es;
    var x = a.x + (b.x - a.x) * ex, y = a.y + (b.y - a.y) * ey;
    twin.style.display = 'block';
    twin.style.width = twin.style.height = w.toFixed(1) + 'px';
    twin.style.transform = 'translate(' + (x - w / 2).toFixed(1) + 'px,' + (y - w / 2).toFixed(1) + 'px)';
    // Where the photograph's visible top edge is: the frame's top plus the
    // part its wipe still hides (the wipe is a clip from the top).
    var fr = dnFrame.getBoundingClientRect();
    var m = /inset\(\s*([\d.]+)%/.exec(dnFrame.style.clipPath || '');
    var edge = fr.top + (m ? parseFloat(m[1]) / 100 : 0) * fr.height;
    var cut = Math.min(w, Math.max(0, edge - (y - w / 2)));
    ink.style.clipPath = 'inset(' + cut.toFixed(1) + 'px 0 0 0)';
    ink.style.background = 'rgb(' + (getComputedStyle(dnWrap).getPropertyValue('--dnt-c').trim() || '10, 10, 10') + ')';
  }
  function setupSun() {
    sun = document.querySelector('.act--peak [data-peak-sun]');
    peakStage = document.querySelector('.act--peak [data-stage]');
    if (!sun || !peakStage || reduced) { sun = null; return; }
    twin = document.createElement('span');
    twin.className = 'ty-sun';
    twin.setAttribute('aria-hidden', 'true');
    twin.style.cssText = 'position:fixed;left:0;top:0;z-index:45;display:none;border-radius:50%;background:#fff;pointer-events:none;will-change:transform,width,height;';
    // Its dark half (TJ, 9 Oct 2026): a second disc over the first, clipped to
    // where the Day and Night photograph has risen behind it, in the colour the
    // sun is about to take, so the circle turns dark exactly as the photograph's
    // edge passes and lands already the sun's colour.
    ink = document.createElement('span');
    ink.style.cssText = 'position:absolute;inset:0;border-radius:50%;clip-path:inset(100% 0 0 0);';
    twin.appendChild(ink);
    dnWrap = document.querySelector('.dn-wrap');
    dnFrame = document.querySelector('.act--peak .peak__frame');
    document.body.appendChild(twin);
    gsap.ticker.add(fly);
  }

  function build() {
    teardown();
    lastW = window.innerWidth;
    phone = window.innerWidth <= 860;
    if (reduced) { var L = ledger(); if (L) L.arrive(5); return; }
    if (phone) flow(); else desktop();
  }

  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      if (window.innerWidth === lastW) return;
      build(); ScrollTrigger.refresh();
    }, 200);
  });

  // After what-we-do.js has set up the ledger (it also waits for the fonts).
  gsap.ticker.add(function () { if (drive) drive(); });
  var go = function () { build(); setupSun(); ScrollTrigger.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else window.addEventListener('load', go);
})();
