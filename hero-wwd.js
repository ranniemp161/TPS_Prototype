/* WHAT WE DO hero, proposal (7 Oct 2026). See hero-wwd.css for the idea.

   One pinned stage, one scrubbed timeline. Beats, in scroll order:
     1. the question alone on Canvas
     2. the first photograph rises, column by column in a stepped edge, as the
        question lifts away; "We do." lands over it in Quentin
     3. "We do." gives way to the glass panel: the answer small, the first
        kind of care and its claim
     4, 5, 6. the next photograph rises through the last, and the claim turns
     7. a short hold, then the page releases
   Each photograph's columns start in a fixed scattered order so the edge
   reads as a skyline rather than a wipe. Reduced motion gets the resolved
   page from the stylesheet and no script. */
(function () {
  'use strict';
  var hero = document.querySelector('[data-hw]');
  if (!hero || !window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  var stage = hero.querySelector('[data-hw-stage]');
  var ask = hero.querySelector('[data-hw-ask]');
  var we = hero.querySelector('[data-hw-we]');
  var panel = hero.querySelector('[data-hw-panel]');
  var veil = hero.querySelector('[data-hw-veil]');
  var photos = Array.prototype.slice.call(hero.querySelectorAll('[data-hw-photo]'));
  var claims = Array.prototype.slice.call(hero.querySelectorAll('[data-hw-claim]'));
  var ticks = Array.prototype.slice.call(hero.querySelectorAll('[data-hw-tick]'));

  /* Cut every photograph into columns. The first is cut too, so it rises the
     same way the others do. */
  var N = window.innerWidth < 860 ? 8 : 14;
  var ORDER = [5, 9, 2, 12, 0, 7, 10, 3, 13, 6, 1, 8, 11, 4]; // lead order, a fixed scatter
  photos.forEach(function (photo) {
    var src = photo.getAttribute('data-src');
    var pos = photo.getAttribute('data-pos') || '50% 50%';
    var alt = photo.getAttribute('data-alt') || '';
    for (var i = 0; i < N; i += 1) {
      var col = document.createElement('span');
      col.className = 'hw__col';
      col.style.setProperty('--i', i);
      // Each strip overlaps its neighbours by .15% so no seam can show.
      col.style.setProperty('--l', Math.max(0, i * 100 / N - .15).toFixed(3) + '%');
      col.style.setProperty('--r', Math.max(0, 100 - (i + 1) * 100 / N - .15).toFixed(3) + '%');
      var img = document.createElement('img');
      img.src = src; img.alt = i === 0 ? alt : ''; img.decoding = 'async';
      img.style.setProperty('--pos', pos);
      col.appendChild(img);
      photo.appendChild(col);
    }
  });

  var BEAT = 1;                    // one unit of the timeline per beat
  var tl = gsap.timeline({ defaults: { ease: 'none' } });

  function rise(photo, at) {
    // Columns rise over .8 of a beat, each starting a little after the last
    // in the scattered order, so the edge is stepped and never a flat line.
    var cols = Array.prototype.slice.call(photo.querySelectorAll('.hw__col'));
    var lead = .45 / cols.length;
    cols.forEach(function (col) {
      var rank = ORDER.indexOf(parseInt(col.style.getPropertyValue('--i'), 10) % ORDER.length);
      if (rank < 0) rank = 0;
      tl.fromTo(col, { '--t': '100%' }, { '--t': '0%', duration: .55, ease: 'power2.out' }, at + rank * lead);
    });
  }

  // 1 and 2: the question lifts away as the first photograph rises
  tl.to(ask, { y: -40, opacity: 0, duration: .45 }, .2);
  rise(photos[0], .3);
  tl.to(veil, { opacity: 1, duration: .4 }, .5);
  tl.to(we, { opacity: 1, duration: .35, ease: 'power2.out' }, .95);
  // 3: the answer gives way to the panel
  tl.to(we, { opacity: 0, y: -24, duration: .3 }, 1.9);
  tl.to(panel, { opacity: 1, duration: .35, ease: 'power2.out' }, 2.05);
  tl.set(claims[0], { opacity: 1 }, 0);
  // 4 to 6: each next photograph rises through the last, and the claim turns
  for (var k = 1; k < photos.length; k += 1) {
    var at = 2.4 + (k - 1) * BEAT;
    rise(photos[k], at);
    tl.to(claims[k - 1], { opacity: 0, y: -10, duration: .22 }, at + .25);
    tl.fromTo(claims[k], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .28, ease: 'power2.out' }, at + .42);
    tl.call(setTick, [k], at + .4);
    tl.call(setTick, [k - 1], at + .4 - .001); // scrubbing back
  }
  // 7: hold
  tl.to({}, { duration: .5 });

  function setTick(i) {
    ticks.forEach(function (t, j) { t.classList.toggle('is-on', j === i); });
  }
  setTick(0);

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: function () { return '+=' + Math.round(window.innerHeight * 4.2); },
    pin: stage,
    scrub: .8,
    animation: tl,
    invalidateOnRefresh: true,
    refreshPriority: 10,
    onUpdate: function (self) {
      // Keep the ticks honest while scrubbing in either direction.
      var p = self.progress * tl.duration();
      var i = 0;
      for (var k = 1; k < photos.length; k += 1) if (p >= 2.4 + (k - 1) * BEAT + .4) i = k;
      setTick(i);
    }
  });

  // The folded paragraph
  var copy = hero.querySelector('[data-hw-copy]');
  var more = hero.querySelector('[data-hw-more]');
  if (copy && more) more.addEventListener('click', function () {
    var folded = copy.hasAttribute('data-folded');
    if (folded) copy.removeAttribute('data-folded'); else copy.setAttribute('data-folded', '');
    more.textContent = folded ? 'Read less' : 'Read more';
    more.setAttribute('aria-expanded', folded ? 'true' : 'false');
    ScrollTrigger.refresh();
  });

  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
