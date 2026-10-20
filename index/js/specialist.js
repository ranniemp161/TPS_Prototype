/* YOUR POSTPARTUM SPECIALIST, the hero of Who Comes Into Your Home (TJ,
   19 Oct 2026: moved here whole from What We Do, built there 9 Oct 2026).
   See specialist.css for the idea.

   Desktop (861px and wider): the portrait's opening is scrubbed by the
   scroll. The frame opens from a narrow slot (inset 36 percent each side) to
   the full frame while the photograph settles from 1.16 to 1.02, between
   the frame's top reaching 85 percent of the window and its middle reaching
   the middle. The checks draw in once the opening is nearly done, and stay.

   Phones: one soft opening (CSS transitions) when the frame arrives, then
   the checks. Reduced motion or no GSAP: the frame is open, the checks are
   there.

   The heading's line rise, the copy's soft entrance and the slow parallax
   inside the photograph (data-par on the img) came from what-we-do.js and
   are kept below, for this section only. */
(function () {
  'use strict';
  var frame = document.querySelector('[data-spec-frame]');
  var zoom = document.querySelector('[data-spec-zoom]');
  var checks = document.querySelector('[data-spec-checks]');
  if (!frame || !zoom) return;

  /* Phones: the title above the portrait (TJ, 11 Oct 2026). The heading moves
     out of the copy to sit before the frame; back in the copy on desktop. */
  var title = document.querySelector('.spec__copy > .wh2');
  var copyEl = title && title.parentNode;
  var phone = window.matchMedia('(max-width: 860px)');
  function place() {
    if (!title) return;
    if (phone.matches) { if (title.nextElementSibling !== frame) frame.parentNode.insertBefore(title, frame); }
    else if (title.parentNode !== copyEl) copyEl.insertBefore(title, copyEl.firstChild);
  }
  place();
  if (phone.addEventListener) phone.addEventListener('change', place); else phone.addListener(place);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* The heading's line rise, from what-we-do.js: measures real line boxes,
     so it runs after fonts load and again when the width changes. */
  var kin = title && title.hasAttribute('data-kin') ? title : null;
  var kinSource = kin ? kin.innerHTML : '';
  function splitLines(el) {
    var words = kinSource.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim().split(/\s+/);
    el.textContent = '';
    var probes = words.map(function (w) {
      var s = document.createElement('span');
      s.textContent = w; s.style.display = 'inline-block';
      el.appendChild(s); el.appendChild(document.createTextNode(' '));
      return s;
    });
    var rows = [], currentTop = null;
    probes.forEach(function (s, i) {
      var top = s.offsetTop;
      if (currentTop === null || Math.abs(top - currentTop) > 4) { rows.push([]); currentTop = top; }
      rows[rows.length - 1].push(words[i]);
    });
    el.textContent = '';
    return rows.map(function (row) {
      var mask = document.createElement('span'); mask.className = 'kin-line';
      var inner = document.createElement('span'); inner.textContent = row.join(' ');
      mask.appendChild(inner); el.appendChild(mask); el.appendChild(document.createTextNode(' '));
      return inner;
    });
  }
  var kinIo = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); kinIo.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }) : null;
  function split() {
    if (!kin || reduced) return;
    var wasIn = kin.classList.contains('is-in');
    kin.classList.remove('is-split', 'is-in');
    kin.innerHTML = kinSource;
    splitLines(kin).forEach(function (l, i) { l.style.setProperty('--i', i); });
    kin.classList.add('is-split');
    if (wasIn || !kinIo) kin.classList.add('is-in'); else kinIo.observe(kin);
  }
  var lastW = window.innerWidth, splitTimer;
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(split);
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(splitTimer); splitTimer = setTimeout(split, 150);
  });

  /* The copy's soft entrance, from what-we-do.js. */
  var revealEls = [].slice.call(document.querySelectorAll('.spec [data-reveal]'));
  if (!('IntersectionObserver' in window) || reduced) revealEls.forEach(function (e) { e.classList.add('is-in'); });
  else {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); rio.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach(function (e) { rio.observe(e); });
  }

  [].slice.call(checks ? checks.children : []).forEach(function (li, i) { li.style.setProperty('--i', i); });
  var showChecks = function () { if (checks) checks.classList.add('is-in'); };

  if (reduced || !('IntersectionObserver' in window)) { showChecks(); return; }

  var CLOSED = 'inset(0% 36% 0% 36% round 16px)';
  var OPEN = 'inset(0% 0% 0% 0% round 16px)';

  // Phones, or a page without GSAP: one soft opening.
  function soft() {
    frame.classList.add('is-armed', 'is-soft');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        // a beat after the title has started sliding in above it
        setTimeout(function () { frame.classList.add('is-open'); }, 300);
        setTimeout(showChecks, 1000);
        io.disconnect();
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.05 });
    io.observe(frame);
  }

  if (!window.gsap || !window.ScrollTrigger) { soft(); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* The slow parallax inside the photograph, from what-we-do.js. */
  [].slice.call(document.querySelectorAll('.spec [data-par]')).forEach(function (img) {
    var amt = parseFloat(img.getAttribute('data-par')) || 5;
    gsap.fromTo(img, { yPercent: -amt }, {
      yPercent: amt, ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
    });
  });

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
