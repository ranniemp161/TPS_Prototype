/* The Four Kinds of Care, held stage (TJ, 8 Oct 2026).
   Adapted from the 21st.dev Services Stack (ivarunchaudhary), code ours.
   One scrubbed timeline on a sticky stage. For each kind after the first:
     the new glass card slides up from below over the last;
     the last dissolves back into the room (fades, shrinks to .9, drifts up);
     the ground (that card's photograph, blurred) cross fades to the new one;
     the name on the left rises out and the new one rises in;
     the rail's tick moves on.
   Each kind holds for a beat before the next arrives. Desktop only with motion
   allowed; phones and reduced motion get the plain list. Rebuilds on width
   change only. */
(function () {
  'use strict';
  var sec = document.querySelector('[data-kc]');
  if (!sec || sec.hidden || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 861px)');
  var cards = [].slice.call(sec.querySelectorAll('[data-kc-card]'));
  var grounds = [].slice.call(sec.querySelectorAll('[data-kc-ground]'));
  var names = [].slice.call(sec.querySelectorAll('[data-kc-name] > span'));
  var ticks = [].slice.call(sec.querySelectorAll('.kc__rail span'));
  var deck = sec.querySelector('.kc__deck');
  var tl = null, intro = null, lastW = 0;

  var HOLD = 1, MOVE = 1;                      // timeline units
  var UNITS = cards.length * HOLD + (cards.length - 1) * MOVE;
  var VH_PER_UNIT = 0.6;                       // screen heights of scroll per unit

  function teardown() {
    [tl, intro].forEach(function (t) { if (t) { if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); } });
    tl = intro = null;
    gsap.set(cards.concat(grounds, names), { clearProps: 'all' });
    sec.classList.remove('is-live', 'is-tight');
    sec.style.removeProperty('--kc-len');
    ticks.forEach(function (t) { t.classList.remove('is-on'); });
  }

  function setTick(i) { ticks.forEach(function (t, k) { t.classList.toggle('is-on', k === i); }); }

  function build() {
    teardown();
    lastW = window.innerWidth;
    if (reduced || !wide.matches) return;
    sec.classList.add('is-live');
    sec.style.setProperty('--kc-len', (1 + UNITS * VH_PER_UNIT).toFixed(2));

    // The tallest card must fit the deck; if not, the tight layout (smaller
    // portrait column and type) takes over.
    var avail = deck.clientHeight;
    var tallest = Math.max.apply(null, cards.map(function (c) { return c.offsetHeight; }));
    if (tallest > avail) sec.classList.add('is-tight');

    var H = window.innerHeight;
    gsap.set(cards, { yPercent: -50, y: function (i) { return i === 0 ? 0 : H; }, opacity: 1, scale: 1 });
    gsap.set(grounds, { opacity: function (i) { return i === 0 ? 1 : 0; } });
    gsap.set(names, { y: 0, yPercent: function (i) { return i === 0 ? 0 : 105; } });
    setTick(0);

    // The first card and name rise in as the section scrolls into view.
    intro = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top 85%', end: 'top top', scrub: 0.4, refreshPriority: -14 } });
    intro.fromTo(cards[0], { y: H * 0.14, opacity: 0 }, { y: 0, opacity: 1, ease: 'power2.out', duration: 1 }, 0)
         .fromTo(names[0], { yPercent: 105 }, { yPercent: 0, ease: 'power2.out', duration: .6 }, .35);

    tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.6,
        refreshPriority: -14,
        onUpdate: function (self) {
          var u = self.progress * UNITS, i = 0;
          for (var k = 1; k < cards.length; k++) { if (u >= k * HOLD + (k - 1) * MOVE + MOVE * 0.5) i = k; }
          setTick(i);
        }
      }
    });
    tl.set({}, {}, UNITS);   // the timeline's full length, holds included

    for (var i = 1; i < cards.length; i++) {
      var t0 = i * HOLD + (i - 1) * MOVE;
      tl.to(cards[i], { y: 0, ease: 'power2.out', duration: MOVE }, t0)
        .to(cards[i - 1], { opacity: 0, scale: 0.9, y: -H * 0.06, ease: 'power1.in', duration: MOVE * 0.85 }, t0 + MOVE * 0.12)
        .to(grounds[i], { opacity: 1, duration: MOVE * 0.9 }, t0 + MOVE * 0.05)
        .to(names[i - 1], { yPercent: -105, ease: 'power2.in', duration: MOVE * 0.45 }, t0)
        .to(names[i], { yPercent: 0, ease: 'power2.out', duration: MOVE * 0.5 }, t0 + MOVE * 0.42);
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
