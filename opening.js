/* WHAT WE DO, the opening (7 Oct 2026). See opening.css for the idea.

   The statement ("What we do" in Quentin, the headline in Instrument Serif,
   her two lines) sits large on the left and arrives on load, one part after
   another. The photograph sits whole on the right.

   Desktop (861px and wider): the whole section pins for 4.2 windows.
     0.00 to 1.40  the photograph grows from its frame to the full window
     0.15 to 0.85  the soft darkening rises at its foot, inside the photograph
     0.30 to 1.20  the statement moves to the lower left, smaller; every frame
                   a cream copy is clipped to the photograph, so each letter
                   turns cream exactly where the photograph is behind it
     2.30 to 3.20  the room closes: the photograph pulls back to the right,
                   the statement leaves, the introduction arrives
     3.20 to 3.80  hold
   Phones: the stage pins for 1.8 windows and plays only the first half; the
   introduction follows in normal flow.

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

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    op.classList.add('op--static');
    if (light.parentNode) light.parentNode.removeChild(light);
    return;
  }

  var img = frame.querySelector('img');
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
  function clipLight() {
    var c = light.getBoundingClientRect(), f = frame.getBoundingClientRect();
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
      gsap.set(frame, { left: small.left, top: small.top, width: small.width, height: small.height, right: 'auto', bottom: 'auto', borderRadius: 16, autoAlpha: 1 });
      gsap.set(scrim, { opacity: 0 });
      gsap.set(introIn, { opacity: 0, y: 36 });
      arrive();

      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      // half 1: the room opens
      tl.to(frame, { left: 0, top: 0, width: W(), height: H(), borderRadius: 0, duration: 1.4, ease: 'power2.inOut' }, 0)
        .to(scrim, { opacity: 1, duration: .7, ease: 'power1.inOut' }, .15)
        .fromTo(dim, { opacity: 0 }, { opacity: 1, duration: .25, ease: 'power1.inOut', immediateRender: false }, .05)
        .to(dim, { opacity: 0, duration: .4, ease: 'power1.inOut' }, 1.05)
        .to(both, { top: '100%', yPercent: -100, y: -Math.round(H() * .07), scale: .72, duration: .9, ease: 'power2.inOut' }, .3)
        .to({}, { duration: .55 }, 1.4)
        // half 2: the room closes
        .to(both, { opacity: 0, y: '-=40', duration: .45, ease: 'power2.in' }, 2.3)
        // back to the same size and column, centred on the introduction
        .to(frame, { left: small.left, top: H() / 2 - small.height / 2, width: small.width, height: small.height, borderRadius: 16, duration: .9, ease: 'power2.inOut' }, 2.3)
        .to(scrim, { opacity: 0, duration: .6 }, 2.3)
        .to(introIn, { opacity: 1, y: 0, duration: .55, ease: 'power2.out' }, 2.75)
        .to({}, { duration: .6 }, 3.3);

      ScrollTrigger.create({
        trigger: op, start: 'top top', end: '+=' + Math.round(H() * 4.2),
        pin: op, scrub: .9, animation: tl, refreshPriority: 10
      });
    });

    /* ---------- Phones and small tablets ---------- */
    mm.add('(max-width: 860px)', function () {
      copy.style.transform = 'none'; light.style.transform = 'none';
      gsap.set(both, { top: TOP() + 10, yPercent: 0, y: 0, scale: 1, opacity: 1 });
      /* The photograph sits below the text. On a short phone, if it would
         not fit, it shrinks (still whole) rather than climbing over the words. */
      var bottom = copy.getBoundingClientRect().bottom - stage.getBoundingClientRect().top;
      var top = bottom + 22;
      var w = W() - 32, h = w / RATIO;
      var room = H() - top - 16;
      if (h > room) { h = Math.max(120, room); w = h * RATIO; }
      var left = (W() - w) / 2;
      gsap.set(frame, { left: left, top: top, width: w, height: h, right: 'auto', bottom: 'auto', borderRadius: 12, autoAlpha: 1 });
      gsap.set(scrim, { opacity: 0 });
      arrive();

      var tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl.to(frame, { left: 0, top: 0, width: W(), height: H(), borderRadius: 0, duration: 1.2, ease: 'power2.inOut' }, 0)
        .to(scrim, { opacity: 1, duration: .6, ease: 'power1.inOut' }, .1)
        .fromTo(dim, { opacity: 0 }, { opacity: 1, duration: .2, ease: 'power1.inOut', immediateRender: false }, .05)
        .to(dim, { opacity: 0, duration: .35, ease: 'power1.inOut' }, .95)
        .to(both, { top: '100%', yPercent: -100, y: -18, scale: .94, duration: .85, ease: 'power2.inOut' }, .25)
        .to({}, { duration: .5 }, 1.2);

      ScrollTrigger.create({
        trigger: stage, start: 'top top', end: '+=' + Math.round(H() * 1.8),
        pin: stage, scrub: .7, animation: tl
      });
      gsap.fromTo(introIn, { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: 'power2.out', scrollTrigger: { trigger: intro, start: 'top 85%', end: 'top 50%', scrub: .6 } });
    });
  }

  function rebuild() {
    if (mm) mm.revert();
    gsap.set(frame, { clearProps: 'all' });
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
