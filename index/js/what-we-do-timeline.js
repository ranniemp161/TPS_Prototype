/* A Day With Us, vertical timeline (TJ, 8 Oct 2026).
   Adapted from the 21st.dev Product Timeline (hyperiux). One scrubbed timeline
   on a held (sticky) stage:
     the axis line draws down as the track slides up, so the tip of the line
     stays at one height on screen while the hours arrive under it;
     each hour, as the tip reaches it, grows a stem and a dot, then its time,
     title and text rise out of masked lines (own line splitter, so no GSAP
     SplitText is needed);
     the closing line is the last stop.
   Entry windows overlap by half, as in the component. Reduced motion shows
   the finished list. Rebuilds when the width changes, never the height. */
(function () {
  'use strict';
  var sec = document.querySelector('[data-vt]');
  if (!sec || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var stage = sec.querySelector('.vt__stage');
  var track = sec.querySelector('.vt__track');
  var itemsBox = sec.querySelector('.vt__items');
  var axis = sec.querySelector('.vt__axis');
  var fill = sec.querySelector('.vt__fill');
  var tipDot = sec.querySelector('.vt__tip');
  var items = [].slice.call(sec.querySelectorAll('[data-vt-item]'));
  var textEls = [].slice.call(sec.querySelectorAll('[data-vt-t]'));
  var close = sec.querySelector('.vt__close');
  var card = sec.querySelector('.vt__card');
  var head = sec.querySelector('.vt__head');
  var slot = sec.querySelector('.vt__slot');
  var photo = sec.querySelector('.vt__photo');
  var cardTexts = [].slice.call(card.querySelectorAll('.wh2, .vt__sub, .wlead'));
  cardTexts.forEach(function (el) { el.dataset.src = el.textContent; });
  var tl = null, lastW = 0;

  textEls.forEach(function (el) { el.dataset.src = el.textContent; });

  /* Splits plain text into masked lines by measuring real line boxes. */
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
      var mask = document.createElement('span'); mask.className = 'vt-line';
      var inner = document.createElement('span'); inner.textContent = row.join(' ');
      mask.appendChild(inner); el.appendChild(mask);
      return inner;
    });
  }
  function revert() { textEls.concat(cardTexts).forEach(function (el) { el.textContent = el.dataset.src; }); }

  function teardown() {
    if (tl) { if (tl.scrollTrigger) tl.scrollTrigger.kill(); tl.kill(); tl = null; }
    var stems = items.map(function (i) { return i.querySelector('.vt__stem'); });
    var dots = items.map(function (i) { return i.querySelector('.vt__dot'); });
    gsap.set([track, fill, tipDot].concat(stems, dots).filter(Boolean), { clearProps: 'transform' });
    items.forEach(function (i) { i.style.opacity = ''; i.style.height = ''; });
    ['--vt-ci', '--ph-t', '--ph-r', '--ph-b', '--ph-l', '--ph-rad', '--ph-tv', '--ph-to', '--ph-ty'].forEach(function (p) { sec.style.removeProperty(p); });
    photo.style.transform = '';
    var pimg = photo.querySelector('img');
    pimg.style.width = ''; pimg.style.height = ''; pimg.style.transform = '';
    revert();
  }

  function build() {
    teardown();
    lastW = window.innerWidth;
    if (reduced) { sec.classList.remove('is-live'); sec.classList.add('is-static'); axis.style.height = ''; return; }
    sec.classList.remove('is-static'); sec.classList.add('is-live');

    var phone = window.innerWidth <= 860;
    var stems = items.map(function (i) { return i.querySelector('.vt__stem'); });
    var dots = items.map(function (i) { return i.querySelector('.vt__dot'); });
    var lineSets = items.map(function (i) {
      return [].slice.call(i.querySelectorAll('[data-vt-t]')).reduce(function (a, el) { return a.concat(splitLines(el)); }, []);
    });
    var closeLines = close ? splitLines(close) : [];
    var cardLines = cardTexts.reduce(function (a, el) { return a.concat(splitLines(el)); }, []);

    // Each hour takes the pitch, or more where its own text would run into
    // the next hour on the same side (two hours on), or into the close.
    if (!phone) {
      var cs = getComputedStyle(sec);
      // The pitch is a clamp(), which a custom property hands back unresolved,
      // so it is read from the first hour's rendered height (inline heights
      // were cleared in teardown, so this is the stylesheet's value).
      var pitch = items[0].getBoundingClientRect().height || 120;
      var gap = parseFloat(cs.getPropertyValue('--vt-pitch-gap')) || 22;
      var hs = items.map(function () { return pitch; });
      var bodies = items.map(function (it) { return it.querySelector('.vt__body').getBoundingClientRect().height; });
      items.forEach(function (it, i) {
        var need = bodies[i] + gap;
        if (i + 2 < items.length) { if (hs[i] + hs[i + 1] < need) hs[i + 1] = need - hs[i]; }
        else if (i + 1 < items.length) { if (hs[i] + hs[i + 1] < need) hs[i + 1] = need - hs[i]; }
        else hs[i] = Math.max(hs[i], need);
      });
      items.forEach(function (it, i) { it.style.height = Math.ceil(hs[i]) + 'px'; });
    }

    // Measure in track coordinates, with the track at rest.
    gsap.set(track, { y: 0 });
    var trackTop = track.getBoundingClientRect().top;
    var boxTop = itemsBox.getBoundingClientRect().top - trackTop;
    var ys = dots.map(function (d) { var r = d.getBoundingClientRect(); return r.top + r.height / 2 - trackTop; });
    // The line starts on the card's lower edge (as the component's starts at
    // its picture) and ends on the last hour.
    // Measured at the card's resting place, not its lowered entrance start.
    sec.style.setProperty('--vt-ci', '1');
    var headR = head.getBoundingClientRect();
    var lineStart = headR.bottom - trackTop;
    var lineEnd = ys[ys.length - 1];
    axis.style.top = (lineStart - boxTop) + 'px';
    axis.style.height = (lineEnd - lineStart) + 'px';

    var stageH = stage.clientHeight;
    // The tip of the line holds here on screen; never above the head row's
    // foot, so the track does not move before the line has left the card.
    // On short screens it is capped at 72 percent, so the first hours never
    // arrive off the bottom; the track then starts a little raised, and the
    // photograph eases onto that offset as it shrinks (see photoY).
    var TIP = Math.max(stageH * (phone ? 0.6 : 0.56), Math.min(lineStart, stageH * 0.72));
    var TIPEND = 0.86, W = 0.12;

    var allLines = lineSets.concat([closeLines]).reduce(function (a, b) { return a.concat(b); }, []);
    gsap.set(stems, { scaleX: 0 });
    gsap.set(dots, { scale: 0 });
    gsap.set(allLines, { yPercent: 112 });
    gsap.set(fill, { scaleY: 0 });

    // The photograph's slot, relative to the stage, with the track at rest.
    var stageR = stage.getBoundingClientRect();
    var slotR = slot.getBoundingClientRect();
    var sl = { t: slotR.top - stageR.top, l: slotR.left - stageR.left, r: stageR.right - slotR.right, b: stageR.bottom - slotR.bottom };
    var RAD = parseFloat(getComputedStyle(slot).borderTopLeftRadius) || 10;
    // The picture's own rectangle: covering the screen at the start (a touch
    // larger, 1.06) and covering the slot at the end. On phones the screen is
    // portrait, so the start is framed on the mother and baby (64 percent);
    // the specialist comes into view as it lands.
    var img = photo.querySelector('img');
    var A = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 2400 / 1340;
    var cover = function (bx, by, bw, bh, fx) { var w = Math.max(bw, bh * A), h = w / A; return { x: bx + (bw - w) * fx, y: by + (bh - h) / 2, w: w, h: h }; };
    var SW = stageR.width, SH = stageR.height;
    var r0 = cover(-SW * .03, -SH * .03, SW * 1.06, SH * 1.06, phone ? .64 : .5);
    var r1 = cover(sl.l, sl.t, SW - sl.l - sl.r, SH - sl.t - sl.b, .5);
    var BASE = r0.w;
    img.style.width = BASE + 'px'; img.style.height = (BASE / A) + 'px';
    gsap.set(cardLines, { yPercent: 112 });
    gsap.set(sec, { '--vt-ci': 0 });
    var ph = { a: 0 }, curE = 0, curTy = 0;
    var photoY = function () { photo.style.transform = 'translateY(' + (curTy * curE).toFixed(1) + 'px)'; };
    var smooth = function (x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
    function applyPhoto() {
      var a = ph.a, e = a < .5 ? 2 * a * a : 1 - Math.pow(-2 * a + 2, 2) / 2;
      curE = e; photoY();
      sec.style.setProperty('--ph-t', (e * sl.t).toFixed(1) + 'px');
      sec.style.setProperty('--ph-r', (e * sl.r).toFixed(1) + 'px');
      sec.style.setProperty('--ph-b', (e * sl.b).toFixed(1) + 'px');
      sec.style.setProperty('--ph-l', (e * sl.l).toFixed(1) + 'px');
      sec.style.setProperty('--ph-rad', (e * RAD).toFixed(1) + 'px');
      var x = r0.x + (r1.x - r0.x) * e, y = r0.y + (r1.y - r0.y) * e, w = r0.w + (r1.w - r0.w) * e;
      img.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + (w / BASE).toFixed(4) + ')';
      sec.style.setProperty('--ph-to', (1 - smooth(a / 0.42)).toFixed(3));
      sec.style.setProperty('--ph-ty', (-36 * smooth(a / 0.42)).toFixed(1) + 'px');
      sec.style.setProperty('--ph-tv', (1 - smooth((a - 0.15) / 0.5)).toFixed(3));
    }

    var st = { p: 0 };
    function apply() {
      var tip = Math.min(1, st.p / TIPEND);
      var tipY = lineStart + tip * (lineEnd - lineStart);
      var ty = Math.min(0, TIP - tipY);
      gsap.set(fill, { scaleY: tip });
      // The circle at the point of motion rides the tip of the line.
      if (tipDot) tipDot.style.transform = 'translateY(' + (tip * (lineEnd - lineStart)).toFixed(1) + 'px)';
      gsap.set(track, { y: ty });
      curTy = ty; photoY();
      // Hours that have travelled far above the tip give way softly.
      var top0 = stageH * 0.04, top1 = stageH * 0.2;
      items.forEach(function (it, i) {
        var k = Math.min(1, Math.max(0, (ys[i] + ty - top0) / (top1 - top0)));
        it.style.opacity = (0.28 + 0.72 * k).toFixed(3);
      });
    }

    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.5,
        // Measured after the pinned sections above have claimed their spacers.
        refreshPriority: -13
      }
    });
    // First the photograph (0 to PH of the scroll): full screen under the
    // title, it closes down into its slot as the glass card lifts in beside it
    // and the card's lines rise. Then the line, over the rest.
    var PH = 0.17, at = function (s) { return PH + s * (1 - PH); };
    tl.to(ph, { a: 1, duration: PH, onUpdate: applyPhoto }, 0);
    tl.to(sec, { '--vt-ci': 1, duration: PH * 0.4 }, PH * 0.55);
    tl.to(cardLines, { yPercent: 0, duration: PH * 0.35, stagger: PH * 0.04, ease: 'power2.out' }, PH * 0.62);
    tl.to(st, { p: 1, duration: 1 - PH, onUpdate: apply }, PH);

    items.forEach(function (it, i) {
      // Each hour starts as the tip of the line reaches its dot.
      var start = Math.max(0, TIPEND * (ys[i] - lineStart) / (lineEnd - lineStart) - W * 0.35);
      var sub = gsap.timeline();
      sub.fromTo(stems[i], { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, 0)
         .fromTo(dots[i], { scale: 0 }, { scale: 1, duration: 0.4 }, 0)
         .fromTo(lineSets[i], { yPercent: 112 }, { yPercent: 0, duration: 1, stagger: 0.035, ease: 'power2.out' }, 0.25);
      sub.duration(W * (1 - PH));
      tl.add(sub, at(start));
    });
    if (closeLines.length) {
      var cs = gsap.timeline();
      cs.fromTo(closeLines, { yPercent: 112 }, { yPercent: 0, duration: 1, stagger: 0.05, ease: 'power2.out' }, 0);
      cs.duration(0.08 * (1 - PH));
      tl.add(cs, at(0.91));
    }
    applyPhoto();
    apply();
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
