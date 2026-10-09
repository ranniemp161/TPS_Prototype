/* Day and Night Care, the title's glide (TJ, 9 Oct 2026).
   The Quentin title starts top left, out of the way of the circle that falls
   down the centre of the page from Tailored For You to become the sun. Once the
   circle has passed below the title, the title glides to the centre, and it
   glides back if the reader scrolls up past that point again. It shrinks to
   half its size over the same glide. Read live every
   frame from where the circle actually is, so it holds whatever the sections
   above are doing. Reduced motion: centred from the start. Its colours and its
   exit are in what-we-do-day-night.css. */
(function () {
  'use strict';
  var wrap = document.querySelector('.dn-wrap');
  var titles = wrap ? [].slice.call(wrap.querySelectorAll('[data-dn-script]')) : [];
  if (!titles.length || !window.gsap) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var title = titles[0];
  var cur = reduced ? 1 : 0, shown = -1;
  var smooth = function (x) { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

  // Where the circle is, as a height on the screen: still in its line above
  // (not yet falling), falling (the twin), or already the sun.
  function passed() {
    var twin = document.querySelector('.ty-sun');
    if (twin && twin.style.display === 'block') {
      var r = twin.getBoundingClientRect(), t = title.getBoundingClientRect();
      // Starts as the circle's top clears the title's foot, done a fifth of a screen later.
      return Math.min(1, Math.max(0, (r.top - t.bottom) / (window.innerHeight * 0.2)));
    }
    return document.querySelector('.ty .is-lifted') ? 1 : 0;
  }
  function frame() {
    if (!reduced) { var target = passed(), d = target - cur; cur = Math.abs(d) < 0.001 ? target : cur + d * 0.18; }
    if (cur === shown) return;
    shown = cur;
    var dx = (window.innerWidth - title.offsetWidth) / 2 - title.offsetLeft;
    // Half its size once settled in the centre (TJ, 9 Oct 2026), shrinking
    // smoothly over the same glide.
    var e = smooth(cur);
    wrap.style.setProperty('--dn-tx', (dx * e).toFixed(1) + 'px');
    wrap.style.setProperty('--dn-ts', (1 - 0.5 * e).toFixed(4));
  }
  gsap.ticker.add(frame);
  window.addEventListener('resize', function () { shown = -1; });
})();
