/* WHAT WE DO, the opening (7 Oct 2026). See what-we-do-opening.css for the idea.

   The statement ("What we do" in Quentin, the headline in Instrument Serif,
   her two lines) sits large on the left and arrives on load, one part after
   another. The photograph sits whole on the right.

   Desktop (861px and wider): the whole section pins.
     0.00 to 1.40  the photograph grows from its frame to the full window
     0.15 to 0.85  the soft darkening rises at its foot, inside the photograph
     0.30 to 1.20  the statement moves to the lower left, smaller; every frame
                   a cream copy is clipped to the photograph, so each letter
                   turns cream exactly where the photograph is behind it
     1.10 to 1.45  as the photograph reaches full screen, "Who is it for?"
                   arrives at the lower right in Quentin, cream, opposite
                   "What we do" (TJ, 8 Oct 2026)
     1.45 to 2.00  the hinge: both on the picture together
     2.00 to 2.40  the statement leaves; the sentence is left on its own
     2.60 to 3.50  the mirror of half 1: the photograph pulls back to its
                   frame on the right, the introduction travels left to its
                   place, crossing it
                   and turns ink along the photograph's edge, and the rest of
                   the paragraph unfolds beneath its first sentence
     3.15 to 3.95  the answer unfolds beneath the question, block by block
                   (TJ, 8 Oct 2026); then a short hold
   The pin is 4.8 windows.
   Phones (MOBILE-PLAN item 3): the stage pins for 1.9 windows; the photograph grows,
   the statement fades, the question lands and its answer follows on the
   photograph, block by block (TJ, 11 Oct 2026).

   Everything is computed from the window, and the build runs once fonts are
   in and again when the width changes (or the height by 160px or more), so
   it never measures mid animation. */
(function () {
  'use strict';
  var op = document.querySelector('[data-op]');
  if (!op || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var stage = op.querySelector('[data-op-stage]');
  var frame = op.querySelector('[data-op-frame]');
  var scrim = op.querySelector('[data-op-scrim]');
  var dim = op.querySelector('[data-op-dim]');
  var copy = op.querySelector('[data-op-copy]');
  var kicker = op.querySelector('[data-op-k]');
  var head = op.querySelector('[data-op-hd]');
  var lines = Array.prototype.slice.call(op.querySelectorAll('[data-op-l]'));
  var parts = [kicker, head].concat(lines);

  /* The cream copy (TJ, 7 Oct 2026): a second copy of the statement sits
     exactly over the first, in cream, clipped to the photograph's rectangle
     every frame. So each letter is cream exactly where the photograph is
     behind it and ink where the aurora is, the change travelling with the
     photograph's edge. Hidden from screen readers; built only with script. */
  var light = copy.cloneNode(true);
  light.classList.add('op__copy--light');
  light.removeAttribute('data-op-copy');
  light.setAttribute('aria-hidden', 'true');
  Array.prototype.forEach.call(light.querySelectorAll('[id]'), function (e) { e.removeAttribute('id'); });
  var lightH = light.querySelector('h1');
  if (lightH) { var dv = document.createElement('div'); dv.className = lightH.className; dv.innerHTML = lightH.innerHTML; lightH.parentNode.replaceChild(dv, lightH); }
  copy.parentNode.insertBefore(light, copy.nextSibling);
  var lightParts = Array.prototype.slice.call(light.querySelectorAll('.op__kicker, .op__head, [data-op-l]'));
  var both = [copy, light];
  var allParts = parts.concat(lightParts);
  var intro = op.querySelector('[data-op-intro]');
  var introIn = intro.querySelector('.op__intro-in');

  /* The introduction gets its own cream copy (TJ, 7 Oct 2026), the mirror of
     the statement's: it meets the statement at full screen in cream and turns
     ink along the photograph's edge as the photograph pulls back. */
  var introLight = introIn.cloneNode(true);
  introLight.classList.add('op__intro-in--light');
  introLight.setAttribute('aria-hidden', 'true');
  Array.prototype.forEach.call(introLight.querySelectorAll('a'), function (a) { a.setAttribute('tabindex', '-1'); });
  introIn.parentNode.insertBefore(introLight, introIn.nextSibling);
  var introBoth = [introIn, introLight];
  var leads = [introIn.querySelector('[data-op-lead]'), introLight.querySelector('[data-op-lead]')];
  var mores = [introIn.querySelector('[data-op-more]'), introLight.querySelector('[data-op-more]')];
  var blocks = [introIn, introLight].map(function (el) { return Array.prototype.slice.call(el.querySelectorAll('.op__more .wp')); });
  var allBlocks = blocks[0].concat(blocks[1]);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    op.classList.add('op--static');
    if (light.parentNode) light.parentNode.removeChild(light);
    if (introLight.parentNode) introLight.parentNode.removeChild(introLight);
    return;
  }

  var img = frame.querySelector('img');

  /* Phones: "Who is it for?" on the photograph (MOBILE-PLAN item 3). A copy of the
     introduction's heading, hidden from screen readers; the real heading stays in
     the page for them. Hidden on desktop by what-we-do-opening.css. */
  var ask = document.createElement('p');
  ask.className = 'op__ask';
  ask.setAttribute('aria-hidden', 'true');
  ask.textContent = leads[0].textContent;
  /* Phones: the answer on the photograph too (TJ, 11 Oct 2026). A cream copy of
     the five blocks under the question, so the question and its answer are one
     held screen. Hidden from screen readers; the real introduction stays in the
     page for them. Hidden on desktop. */
  var on = document.createElement('div');
  on.className = 'op__on';
  on.setAttribute('aria-hidden', 'true');
  on.appendChild(ask);
  var onBlocks = blocks[0].map(function (el) {
    var p = document.createElement('p'); p.className = 'op__on-p'; p.textContent = el.textContent; on.appendChild(p); return p;
  });
  stage.appendChild(on);

  /* The zoom (TJ, 8 Oct 2026). Small, the frame shows the whole wide
     photograph: the room, the mother, the baby in the Moses basket. Full
     screen, the photograph zooms into the moment itself: the hands tucking
     the linen and the mother's sleeping face, the baby and the window out of
     frame. FOCUS is that moment in image pixels (centre, and either its width
     or its height); the zoom is the scale that makes it fill the window, about
     a transform origin chosen so it lands in the centre. */
  var IW = +img.getAttribute('width'), IHt = +img.getAttribute('height');
  var FOCUS = { desktop: { cx: 1376, cy: 768, w: 2752 }, phone: { cx: 1278, cy: 786, h: 1536 } };   // hands only, 2752 by 1536, shown whole: no zoom in, phones centred on the hands (TJ, 9 Oct 2026)
  function zoomFor(f, w, h) {
    var a = w / h, rw = f.w || f.h * a, rh = f.h || f.w / a;
    var c = Math.max(w / IW, h / IHt);                 // object-fit cover at scale 1
    var S = Math.max(1, Math.max(w / rw, h / rh) / c);
    var px = (f.cx - IW / 2) * c + w / 2, py = (f.cy - IHt / 2) * c + h / 2;
    var ox = S === 1 ? w / 2 : (w / 2 - S * px) / (1 - S), oy = S === 1 ? h / 2 : (h / 2 - S * py) / (1 - S);
    ox = Math.min(w, Math.max(0, ox)); oy = Math.min(h, Math.max(0, oy));
    return { scale: S, origin: (ox / w * 100).toFixed(2) + '% ' + (oy / h * 100).toFixed(2) + '%' };
  }
  var RATIO = (+img.getAttribute('width')) / (+img.getAttribute('height'));
  var CREAM = '#F3EFEC';
  var W = function () { return window.innerWidth; };
  var H = function () { return stage.clientHeight; };
  var TOP = function () { return Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) * 1.265) || 101; };

  var mm = null, builtW = 0, builtH = 0, arrived = false;

  /* The statement arrives once, on the first build, one part after another. */
  function arrive() {
    if (arrived) { gsap.set(allParts, { opacity: 1, y: 0 }); return; }
    arrived = true;
    gsap.fromTo(allParts, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: .16, delay: .2 });
  }

  /* Clip the cream copy to the photograph. The copy is scaled, and clip-path
     works in its own unscaled box, so the photograph's edges are converted
     into that box. */
  function clipLight() { clipTo(light); clipTo(introLight); }
  function clipTo(light) {
    var c = light.getBoundingClientRect(), f = frame.getBoundingClientRect();
    if (!c.width) return;
    var s = c.width / (light.offsetWidth || 1);
    if (!s) return;
    var t = (f.top - c.top) / s, l = (f.left - c.left) / s, r = (c.right - f.right) / s, b = (c.bottom - f.bottom) / s;
    if (f.right <= c.left || f.left >= c.right || f.bottom <= c.top || f.top >= c.bottom) { light.style.clipPath = 'inset(100% 0 0 0)'; return; }
    var rad = (parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0) / s;
    light.style.clipPath = 'inset(' + t.toFixed(2) + 'px ' + r.toFixed(2) + 'px ' + b.toFixed(2) + 'px ' + l.toFixed(2) + 'px round ' + rad.toFixed(2) + 'px)';
  }
  gsap.ticker.add(clipLight);

  function build() {
    builtW = W(); builtH = H();
    mm = gsap.matchMedia();

    /* ---------- Desktop ---------- */
    mm.add('(min-width: 861px)', function () {
      /* The text is the hero: the photograph takes what the text leaves, from
         the text's real right edge plus an even 60px gap to the page margin,
         shown whole. Both sit a touch above the optical centre. */
      var mid = TOP() + (H() - TOP()) * .48;
      copy.style.transform = 'none'; light.style.transform = 'none';
      gsap.set(both, { top: mid, yPercent: -50, y: 0, scale: 1, opacity: 1 });
      /* The photograph tucks in under the long first line of the headline,
         beside the shorter lines below it, and its foot lines up with the
         foot of the text: it starts 60px right of the widest of the lower
         lines and keeps 32px clear of the first line. Shown whole. */
      var st = stage.getBoundingClientRect();
      var rightOf = function (el) {
        var r = document.createRange(), m = 0; r.selectNodeContents(el);
        Array.prototype.forEach.call(r.getClientRects(), function (c) { m = Math.max(m, c.right); });
        return m - st.left;
      };
      var hl = Array.prototype.slice.call(head.querySelectorAll('.op__hl'));
      var lower = hl.slice(1).concat(lines);
      var restRight = Math.max.apply(null, lower.map(rightOf));
      var firstBottom = hl[0].getBoundingClientRect().bottom - st.top;
      var textBottom = lines[lines.length - 1].getBoundingClientRect().bottom - st.top;
      var margin = Math.max(24, W() * .05);
      var left = restRight + 60;
      var sw = W() - margin - left, sh = sw / RATIO;
      var room = textBottom - (firstBottom + 32);
      if (sh > room) { sh = room; sw = sh * RATIO; left = W() - margin - sw; }
      var small = { left: left, top: textBottom - sh, width: sw, height: sh };
      /* On a wide window there is room beside the whole text block; use
         whichever placement gives the larger photograph. */
      var fullRight = Math.max(rightOf(hl[0]), restRight);
      var bw = Math.min(W() - margin - (fullRight + 60), (H() - TOP()) * .8 * RATIO), bh = bw / RATIO;
      if (bw > sw) small = { left: W() - margin - bw, top: mid - bh / 2, width: bw, height: bh };
      /* Opens at full screen (TJ for Ami, 19 Oct 2026): the photograph already
         fills the window and the statement sits on it, cream, at the lower
         left. The grow from the side by side frame is gone; small is unused. */
      gsap.set(frame, { left: 0, top: 0, width: W(), height: H(), right: 'auto', bottom: 'auto', borderRadius: 0, autoAlpha: 1 });
      /* Where the photograph comes back to, placed as in the first hero (TJ,
         8 Oct 2026): the question is the long line, so the photograph tucks in
         under it, 60px right of the answer blocks, its foot level with the
         foot of the text, shown whole; on a wide window, if beside the whole
         block gives a larger photograph, that is used instead. Measured with
         the answer fully open, then collapsed for the animation. */
      var ih = introIn.offsetHeight;
      var restTop = TOP() + (H() - TOP()) / 2 - ih / 2;
      var whoEl = leads[0];
      var whoBottom = restTop + whoEl.offsetTop + whoEl.offsetHeight;
      var textBottom = restTop + ih;
      var rightOfI = function (el) {
        var r = document.createRange(), m = 0; r.selectNodeContents(el);
        Array.prototype.forEach.call(r.getClientRects(), function (c) { m = Math.max(m, c.right); });
        return m - st.left;
      };
      var blocksRight = Math.max.apply(null, Array.prototype.slice.call(introIn.querySelectorAll('.op__more .wp')).map(rightOfI));
      var whoRight = rightOfI(whoEl);
      var el0 = blocksRight + 60;
      var ew = W() - margin - el0, eh = ew / RATIO;
      var eroom = textBottom - (whoBottom + 12);
      if (eh > eroom) { eh = eroom; ew = eh * RATIO; el0 = W() - margin - ew; }
      var end = { left: el0, top: textBottom - eh, width: ew, height: eh };
      var wideW = Math.min(W() - margin - (Math.max(whoRight, blocksRight) + 60), (H() - TOP()) * .8 * RATIO), wideH = wideW / RATIO;
      if (wideW > ew) end = { left: W() - margin - wideW, top: TOP() + (H() - TOP()) / 2 - wideH / 2, width: wideW, height: wideH };
      gsap.set(scrim, { opacity: 1 });
      gsap.set(dim, { opacity: 0 });
      gsap.set(both, { top: H(), yPercent: -100, y: -Math.round(H() * .07), scale: .72 });
      /* The introduction waits at the statement's full screen position, the
         lower left, showing only its first sentence once it arrives. */
      /* At full screen it shares the picture with the statement (TJ, 7 Oct
         2026): its first sentence sits at the lower right, its last line
         level with the statement's last line, its right edge on the page
         margin, so the two balance across the photograph. */
      var foot = -Math.round(H() * .07);
      gsap.set(mores, { height: 0 });
      gsap.set(allBlocks, { opacity: 0, y: 12 });
      var lead0 = leads[0];
      // the question is one line that never wraps, so its box is its width
      var lw = lead0.getBoundingClientRect().width;
      var below = introIn.offsetHeight - (lead0.offsetTop + lead0.offsetHeight);
      var hingeX = Math.round((W() - margin) - (introIn.offsetLeft + lw));
      gsap.set(introBoth, { top: H(), yPercent: -100, y: foot + below, x: hingeX, opacity: 1 });
      gsap.set(leads, { opacity: 0, y: 18 });
      arrive();

      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      var zd = zoomFor(FOCUS.desktop, W(), H());
      gsap.set(img, { scale: zd.scale, transformOrigin: zd.origin });
      // "Who is it for?" rises into its place at the lower right
      tl.to(leads, { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, .1)
        // the hinge: both on the picture together
        .to({}, { duration: .55 }, .45)
        // the statement leaves and the sentence is left on its own
        .to(both, { opacity: 0, y: '-=30', duration: .4, ease: 'power2.in' }, 1.0)
        // the photograph pulls back to its frame while the introduction travels
        // to its place on the left, turning ink along the photograph's edge,
        // and the rest of the paragraph unfolds
        .to(frame, { left: end.left, top: end.top, width: end.width, height: end.height, borderRadius: 16, duration: .9, ease: 'power2.inOut' }, 1.6)
        .to(img, { scale: 1, duration: .9, ease: 'power2.inOut' }, 1.6)
        .to(scrim, { opacity: 0, duration: .6 }, 1.6)
        .fromTo(dim, { opacity: 0 }, { opacity: 1, duration: .2, ease: 'power1.inOut', immediateRender: false }, 1.55)
        .to(dim, { opacity: 0, duration: .35, ease: 'power1.inOut' }, 2.2)
        .to(introBoth, { top: TOP() + (H() - TOP()) / 2, yPercent: -50, y: 0, x: 0, duration: .9, ease: 'power2.inOut' }, 1.6)
        .to(mores, { height: 'auto', duration: .65, ease: 'power1.inOut' }, 1.85);
      blocks[0].forEach(function (el, i) {
        tl.to([el, blocks[1][i]], { opacity: 1, y: 0, duration: .32, ease: 'power2.out' }, 2.15 + i * .17);
      });
      tl.to({}, { duration: .5 }, 2.15 + blocks[0].length * .17 + .32);

      ScrollTrigger.create({
        trigger: op, start: 'top top', end: '+=' + Math.round(H() * 3.6),
        pin: op, scrub: .9, animation: tl, refreshPriority: 10
      });
    });

    /* ---------- Phones and small tablets (TJ, 9 Oct 2026, MOBILE-PLAN item 3) ----------
       The statement sits centred at the top. The photograph takes the rest of the
       first screen: from 22px under the text to 16px above the foot, the full width
       less the gutters, cropped around the hands (FOCUS.phone). If that would leave
       under 160px, the text steps down a size (.op--tight) and is measured again.
       One scrubbed movement, pinned for 1.2 screens: the photograph grows to the
       full screen, the statement fades up and away, the darkening rises and
       "Who is it for?" arrives alone on the photograph. The introduction's own
       heading is kept for screen readers only (.op--phone), so the question is
       seen once; its paragraphs follow in the page. */
    mm.add('(max-width: 860px)', function () {
      op.classList.add('op--phone');
      op.classList.remove('op--tight');
      copy.style.transform = 'none'; light.style.transform = 'none';
      gsap.set(both, { top: TOP() + 10, yPercent: 0, y: 0, scale: 1, opacity: 1 });
      var st = stage.getBoundingClientRect();
      var measure = function () { return copy.getBoundingClientRect().bottom - st.top + 22; };
      var top = measure();
      if (H() - top - 16 < 160) { op.classList.add('op--tight'); top = measure(); }
      /* Full bleed from the start (TJ, 11 Oct 2026): no gutters, no radius; the wide
         photograph keeps its height and runs off both edges, the hands centred. */
      var h = Math.max(160, H() - top - 16), w = W();
      var centre = function (fw, fh) {
        var c = Math.max(fw / IW, fh / IHt), ex = IW * c - fw, ey = IHt * c - fh;
        var px = ex > 0 ? Math.min(100, Math.max(0, (FOCUS.phone.cx * c - fw / 2) / ex * 100)) : 50;
        var py = ey > 0 ? Math.min(100, Math.max(0, (FOCUS.phone.cy * c - fh / 2) / ey * 100)) : 50;
        return px.toFixed(1) + '% ' + py.toFixed(1) + '%';
      };
      /* Opens at full screen (TJ for Ami, 19 Oct 2026): the photograph fills the
         screen from the start with the statement on it in cream. */
      gsap.set(frame, { left: 0, top: 0, width: W(), height: H(), right: 'auto', bottom: 'auto', borderRadius: 0, autoAlpha: 1 });
      gsap.set(img, { objectPosition: centre(W(), H()), scale: 1 });
      gsap.set(scrim, { opacity: 1 });
      // some dimming from the start, so the cream statement reads on the linen
      gsap.set(dim, { opacity: .55 });
      gsap.set(ask, { opacity: 0, y: 18 });
      gsap.set(onBlocks, { opacity: 0, y: 12 });
      arrive();

      /* The answer follows the question onto the photograph with the desktop's
         block by block entrance (each .32, .17 apart, rising 12px), close on the
         question's heels, while an even dimming deepens so the cream reads on
         the pale linen; then a short hold, and the next section follows. */
      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl.to(both, { opacity: 0, y: -30, duration: .28, ease: 'power1.in' }, .1)
        .to(dim, { opacity: 1, duration: .5, ease: 'power1.inOut' }, .3)
        .to(ask, { opacity: 1, y: 0, duration: .35, ease: 'power2.out' }, .4);
      onBlocks.forEach(function (el, i) {
        tl.to(el, { opacity: 1, y: 0, duration: .32, ease: 'power2.out' }, .55 + i * .17);
      });
      tl.to({}, { duration: .3 }, .55 + onBlocks.length * .17 + .32);

      ScrollTrigger.create({
        trigger: stage, start: 'top top', end: '+=' + Math.round(H() * 1.6),
        pin: stage, scrub: .6, animation: tl
      });
      return function () {
        op.classList.remove('op--phone', 'op--tight');
        gsap.set(both, { clearProps: 'opacity,transform' });
        gsap.set(img, { clearProps: 'objectPosition' });
      };
    });
  }

  function rebuild() {
    if (mm) mm.revert();
    gsap.set(frame, { clearProps: 'all' });
    gsap.set(img, { clearProps: 'transform,transformOrigin' });
    build();
    ScrollTrigger.refresh();
  }

  var ready = false;
  function start() { if (ready) return; ready = true; build(); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
  setTimeout(start, 1500);
  window.addEventListener('load', function () { if (ready) rebuild(); });

  var timer = null;
  window.addEventListener('resize', function () {
    if (!ready) return;
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (Math.abs(W() - builtW) > 1 || Math.abs(H() - builtH) > 160) rebuild();
    }, 250);
  }, { passive: true });
})();
