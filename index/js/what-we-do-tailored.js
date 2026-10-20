/* Tailored For You (TJ, 9 Oct 2026). See what-we-do-tailored.css for the idea.

   Desktop: one scrubbed progress over a held (sticky) stage, as A Day With Us.
     0.00 to 0.20  the photograph closes from the full screen onto the slot,
                   the title over it gives way, the glass card lifts in
     0.24 to 0.34  the line draws from nothing to 7 days, led by the circle
     0.34 to 0.90  7, 14, 30: the circle travels and rests at each stop
                   while the figures count (the ledger in what-we-do.js)
   Phones: the photograph closes onto its frame as it scrolls in, the glass
   card joined to its foot (Read more lifts the glass up into it); the line
   runs across, as on desktop, and is tapped, not scrolled (TJ, 12 Oct 2026,
   swiping does not work well on a phone): a tap on 7, 14 or 30, or on the
   line, slides the circle there on the housekeeping rooms' easing, and the
   ledger in what-we-do.js counts the figures. It rests on the 7 day stay.

   Then the sun, desktop only (TJ, 12 Oct 2026: removed on phones): once the
   line is complete and the section is leaving, the 14 day circle lifts off
   the line, which has it at the page's centre, and drifts straight down into
   Day and Night, growing as it goes, and lands on the sun at the moment the
   clock begins, where the sun takes over.
   Reduced motion: the line complete at seven days, no flight. */
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
  var STOPS = [7, 14, 30], MILESTONES = [0, 1 / 2, 1];
  var PH = 0.2, L0 = 0.24, L1 = 0.34, L2 = 0.9;
  var lastW = 0, lastH = 0, phone = false;
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
    var seg = Math.min(1, Math.floor(q * 2)), local = q * 2 - seg;
    return STOPS[seg] + (STOPS[seg + 1] - STOPS[seg]) * smooth(local);
  }
  function activeAt(q) { return q < 1 / 4 ? 7 : q < 3 / 4 ? 14 : 30; }

  function setDays(d, active) {
    var L = ledger(); if (!L) return;
    if (d < 7) L.arrive(d); else L.scrub(d, active);
  }

  function teardown() {
    drive = null;
    sec.classList.remove('is-live', 'is-flow', 'is-calm', 'is-tight');
    if (sec._tyRo) { sec._tyRo.disconnect(); sec._tyRo = null; }
    ['--ty-ci', '--ty-di', '--ty-sw', '--ph-t', '--ph-r', '--ph-b', '--ph-l', '--ph-rad'].forEach(function (p) { sec.style.removeProperty(p); });
    titles.forEach(function (t) { t.style.transform = ''; }); tslot.style.height = '';
    img.style.width = ''; img.style.height = ''; img.style.transform = '';
    delete track._tlSeekDay;
  }

  /* ---------- Desktop: the held stage ----------
     Short windows (TJ, 12 Oct 2026). The held stage has to fit the title, the card,
     the line and the figures on one screen, so it is sized from the window's
     height, and on a short window (or a zoomed in browser) the open Read more text
     spilled out of the card. Now, before anything is drawn, the card is measured
     with Read more open and closed: if the words do not fit, the card tightens
     (.is-tight); if they still do not fit, or the window is under 540px tall, the
     section stops holding still (.is-calm) and scrolls with the page in its
     finished desktop layout, photograph beside the card and the line across,
     tapped as on phones; the card then grows with its words. No scrollbar inside
     the card, ever. */
  var CALM_H = 540;
  // Does the card hold its words, open and closed? Measured with transitions off
  // and put back before they are switched on again, so nothing animates.
  function cardFits() {
    var card = sec.querySelector('.ty__card'), panel = sec.querySelector('[data-tl-readmore]');
    var wasOpen = panel.classList.contains('is-open'), wasWide = sec.classList.contains('is-wide');
    sec.classList.add('ty-measure');
    var ok = true;
    [false, true].forEach(function (open) {
      panel.classList.toggle('is-open', open); sec.classList.toggle('is-wide', open);
      // The words' own extent: the card centres its content, so words that do not
      // fit spill above it as well as below, where scrollHeight cannot see them.
      // They may run into the card's padding (the approved 1440 by 900 layout does),
      // but must keep at least 14px clear of its edge.
      var kids = [].slice.call(card.children);
      var top = Math.min.apply(null, kids.map(function (k) { return k.getBoundingClientRect().top; }));
      var bot = Math.max.apply(null, kids.map(function (k) { return k.getBoundingClientRect().bottom; }));
      var need = bot - top + 28;
      if (need > card.clientHeight + 2) ok = false;
    });
    panel.classList.toggle('is-open', wasOpen); sec.classList.toggle('is-wide', wasWide);
    void card.offsetHeight;
    sec.classList.remove('ty-measure');
    return ok;
  }

  function desktop() {
    sec.classList.add('is-live');
    var calm = window.innerHeight < CALM_H;
    if (!calm && !cardFits()) { sec.classList.add('is-tight'); if (!cardFits()) calm = true; }
    if (calm) sec.classList.add('is-calm');

    var tW, tH, tS, sl, RAD, A, SW, SH, r0, r1, BASE, tX, tY;
    var cover = function (bx, by, bw, bh, fx) { var w = Math.max(bw, bh * A), h = w / A; return { x: bx + (bw - w) * fx, y: by + (bh - h) / 2, w: w, h: h }; };
    // Everything is measured from the layout at rest; on a calm section it is
    // measured again whenever the head row changes height (Read more, resize).
    function geom() {
      titles.forEach(function (t) { t.style.transform = ''; }); img.style.transform = '';
      // The title comes to rest centred over both cards, 20 percent narrower
      // than the two of them together (TJ, 9 Oct 2026): the resting line is as
      // wide as the cards and as tall as the title is at that size, before
      // anything is measured.
      var headW = sec.querySelector('.ty__head').getBoundingClientRect().width;
      tW = title.offsetWidth; tH = title.offsetHeight;
      tS = 0.8 * headW / tW;
      tslot.style.height = Math.ceil(tH * tS) + 'px';
      var stageR = stage.getBoundingClientRect();
      var slotR = slot.getBoundingClientRect();
      sl = { t: slotR.top - stageR.top, l: slotR.left - stageR.left, r: stageR.right - slotR.right, b: stageR.bottom - slotR.bottom };
      RAD = parseFloat(getComputedStyle(slot).borderTopLeftRadius) || 10;
      sec.style.setProperty('--ty-sw', (stageR.width - sl.l - sl.r).toFixed(1) + 'px');
      // The picture's own rectangle: covering the screen at the start (a touch
      // larger) and covering the slot at the end, framed on her at the cot.
      A = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 1920 / 1072;
      SW = stageR.width; SH = stageR.height;
      r0 = cover(-SW * .03, -SH * .03, SW * 1.06, SH * 1.06, .5);
      // In the slot the crop sits on the three of them, right of centre.
      r1 = cover(sl.l, sl.t, SW - sl.l - sl.r, SH - sl.t - sl.b, .8);
      BASE = r0.w;
      img.style.width = BASE + 'px'; img.style.height = (BASE / A) + 'px';
      // The title (TJ, 9 Oct 2026): from its place on the photograph, bottom
      // left, to the line above the photograph and the card, centred and
      // shrinking, on the photograph's own curve. Its two copies take the same
      // transform; which one shows where is decided by the photograph's edge.
      var t0 = title.getBoundingClientRect(), ts = tslot.getBoundingClientRect();
      tX = ts.left - t0.left + (ts.width - tW * tS) / 2; tY = ts.top - t0.top;
    }
    geom();

    function render(p, keepDays) {
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
      if (keepDays) return;
      if (p < L0) setDays(0, 7);
      else if (p < L1) setDays(7 * (p - L0) / (L1 - L0), 7);
      else { var q = clamp((p - L1) / (L2 - L1), 0, 1); setDays(dayAt(q), activeAt(q)); }
    }

    if (calm) {
      // Finished from the start: the photograph in its slot, the title on its line,
      // the card and the line in place, resting on 7 days; a tap on a day, on the
      // line or a drag of the circle moves it (the ledger in what-we-do.js).
      render(1, true);
      var L = ledger(); if (L) L.arrive(7);
      var head = sec.querySelector('.ty__head'), hH = head.offsetHeight;
      var ro = new ResizeObserver(function () {
        if (Math.abs(head.offsetHeight - hH) < 1) return;
        hH = head.offsetHeight; geom(); render(1, true);
      });
      ro.observe(head);
      sec._tyRo = ro;
      return;
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
  /* Phones: the photograph closes as it scrolls in; the line is the ledger's own,
     driven by taps (what-we-do.js: a tap on a day, a tap on the line or a drag of
     the circle slides it there over 650ms on --tease and counts the figures). It
     rests on the 7 day stay, so the figures never read zero (MOBILE-PLAN item 6).
     Nothing drops from it into Day and Night on phones (TJ, 12 Oct 2026). */
  function flow() {
    sec.classList.add('is-flow');
    var gut = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter')) || 24;
    // The photograph closes onto its frame between its top at 85 percent of
    // the screen and at 12 percent.
    var livePh = function () { var vh = window.innerHeight; return clamp((0.85 * vh - photo.getBoundingClientRect().top) / (0.73 * vh), 0, 1); };
    var a = livePh(), shownA = -1;
    var L0 = ledger(); if (L0) L0.arrive(7);
    var paint = function () {
      if (a !== shownA) {
        var e = smooth(a);
        // An even frame (TJ, 12 Oct 2026): the top closes in by the same gutter as
        // the sides; the foot stays open, where the glass card joins the photograph.
        sec.style.setProperty('--ph-t', (e * gut).toFixed(1) + 'px');
        sec.style.setProperty('--ph-l', (e * gut).toFixed(1) + 'px');
        sec.style.setProperty('--ph-r', (e * gut).toFixed(1) + 'px');
        sec.style.setProperty('--ph-rad', (e * 10).toFixed(1) + 'px');
        shownA = a;
      }
    };
    drive = function () { a = ease(a, livePh()); paint(); };
    paint();
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
    var toStart = sec.getBoundingClientRect().bottom - vh;
    var holder = peakStage.parentElement && peakStage.parentElement.classList.contains('pin-spacer') ? peakStage.parentElement : peakStage;
    var toEnd = Math.max(toStart + vh * 0.3, holder.getBoundingClientRect().top + 0.08 * vh);
    return -toStart / (toEnd - toStart);
  }
  function centre(el) { var r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }
  function fly() {
    if (!sun) return;
    var p = phone ? 0 : progress();   // phones: no fall, the circle stays on its line
    if (p <= 0) {
      twin.style.display = 'none'; tip.classList.remove('is-lifted'); stop14.classList.remove('is-lifted'); sun.style.visibility = '';
      return;
    }
    // The circle that drops is the 14 day stop: it sits at the page's centre, so
    // it falls straight down.
    src = stop14;
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
    lastW = window.innerWidth; lastH = window.innerHeight;
    phone = window.innerWidth <= 860;
    if (reduced) { var L = ledger(); if (L) L.arrive(7); return; }
    if (phone) flow(); else desktop();
  }

  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      // Width changes rebuild; on desktop so does a real height change (the fit
      // and the calm switch depend on it). Phones ignore height (the URL bar).
      if (window.innerWidth === lastW && (window.innerWidth <= 860 || Math.abs(window.innerHeight - lastH) < 40)) return;
      build(); ScrollTrigger.refresh();
    }, 200);
  });

  // After what-we-do.js has set up the ledger (it also waits for the fonts).
  gsap.ticker.add(function () { if (drive) drive(); });
  var go = function () { build(); setupSun(); ScrollTrigger.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else window.addEventListener('load', go);
})();
