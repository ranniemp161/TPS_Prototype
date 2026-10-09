/* WHAT WE DO, Your Postpartum Specialist (TJ, 9 Oct 2026). See
   what-we-do-specialist.css for the idea.

   Desktop (861px and wider): the portrait's opening is scrubbed by the
   scroll. The frame opens from a narrow slot (inset 36 percent each side) to
   the full frame while the photograph settles from 1.16 to 1.02, between
   the frame's top reaching 85 percent of the window and its middle reaching
   the middle. The checks draw in once the opening is nearly done, and stay.

   Phones: one soft opening (CSS transitions) when the frame arrives, then
   the checks. Reduced motion or no GSAP: the frame is open, the checks are
   there. The slow parallax inside the photograph comes from what-we-do.js
   (data-par on the img). */
(function () {
  'use strict';
  var frame = document.querySelector('[data-spec-frame]');
  var zoom = document.querySelector('[data-spec-zoom]');
  var checks = document.querySelector('[data-spec-checks]');
  if (!frame || !zoom) return;

  [].slice.call(checks ? checks.children : []).forEach(function (li, i) { li.style.setProperty('--i', i); });
  var showChecks = function () { if (checks) checks.classList.add('is-in'); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) { showChecks(); return; }

  var CLOSED = 'inset(0% 36% 0% 36% round 16px)';
  var OPEN = 'inset(0% 0% 0% 0% round 16px)';

  // Phones, or a page without GSAP: one soft opening.
  function soft() {
    frame.classList.add('is-armed', 'is-soft');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        frame.classList.add('is-open');
        setTimeout(showChecks, 700);
        io.disconnect();
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.05 });
    io.observe(frame);
  }

  if (!window.gsap || !window.ScrollTrigger) { soft(); return; }
  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', function () {
    frame.classList.add('is-armed');
    frame.classList.remove('is-soft', 'is-open');
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: frame,
        start: 'top 85%',
        end: 'center 50%',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: function (self) { if (self.progress > 0.85) showChecks(); }
      }
    });
    tl.fromTo(frame, { clipPath: CLOSED }, { clipPath: OPEN, ease: 'power2.inOut' }, 0)
      .fromTo(zoom, { scale: 1.16 }, { scale: 1.02, ease: 'power1.out' }, 0);
    // Already past it on load (a reload half way down the page): open it.
    if (tl.scrollTrigger.progress > 0.85) showChecks();
    return function () {
      gsap.set([frame, zoom], { clearProps: 'clipPath,transform' });
      frame.classList.remove('is-armed');
    };
  });
  mm.add('(max-width: 860px)', function () {
    soft();
    return function () { frame.classList.remove('is-armed', 'is-soft', 'is-open'); };
  });
})();
