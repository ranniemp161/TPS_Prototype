/* ABOUT, the founders' story (TJ, 10 Oct 2026). Light motion only:
   - rises on entry ([data-os-rise]) and masked line rises ([data-os-lines]),
   - the five needs drawing in, as the specialist checks do on What We Do,
   - one slow parallax on the traditions photograph,
   - the details line: it draws down as you read, its tip held at 62 percent
     of the screen, each act appearing as the tip reaches its dot. Scrubbed by
     scroll position, never pinned.
   No ScrollTrigger: one rAF loop on scroll, IntersectionObserver for entries. */
(function () {
  'use strict';
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Masked lines: split a heading into its rendered lines.
  function splitLines(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    var spans = words.map(function (w) {
      var s = document.createElement('span'); s.textContent = w; s.style.display = 'inline-block';
      el.appendChild(s); el.appendChild(document.createTextNode(' ')); return s;
    });
    var rows = [], top = null;
    spans.forEach(function (s, i) {
      var t = s.offsetTop;
      if (top === null || Math.abs(t - top) > 4) { rows.push([]); top = t; }
      rows[rows.length - 1].push(words[i]);
    });
    el.textContent = '';
    rows.forEach(function (r) {
      var m = document.createElement('span'); m.className = 'os-mline';
      var inner = document.createElement('span'); inner.textContent = r.join(' ');
      m.appendChild(inner); el.appendChild(m);
    });
  }

  function start() {
    var lineEls = [].slice.call(document.querySelectorAll('[data-os-lines]'));
    if (!REDUCED) lineEls.forEach(splitLines);

    [].slice.call(document.querySelectorAll('[data-os-needs] li')).forEach(function (li, i) { li.style.setProperty('--i', i); });

    var targets = [].slice.call(document.querySelectorAll('[data-os-rise], [data-os-lines], [data-os-needs]'));
    if (REDUCED || !('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
      targets.forEach(function (t) { io.observe(t); });
      // The opening is already on screen: let it rise on load.
      var open = document.querySelector('.os-open');
      if (open) setTimeout(function () { open.querySelectorAll('[data-os-lines], [data-os-rise]').forEach(function (t) { t.classList.add('is-in'); }); }, 120);
    }

    var line = document.querySelector('[data-os-line]');
    var acts = line ? [].slice.call(line.querySelectorAll('.os-act')) : [];
    var par = document.querySelector('[data-os-par]');
    if (REDUCED) { acts.forEach(function (a) { a.classList.add('is-reached'); }); return; }

    var ticking = false;
    function frame() {
      ticking = false;
      var vh = window.innerHeight;
      if (line) {
        var r = line.getBoundingClientRect();
        var hold = vh * 0.62;
        var p = Math.min(1, Math.max(0, (hold - r.top) / r.height));
        line.style.setProperty('--os-fill', p.toFixed(4));
        line.style.setProperty('--os-tip', (p * r.height).toFixed(1) + 'px');
        acts.forEach(function (a) {
          var dot = a.querySelector('.os-act__dot').getBoundingClientRect();
          a.classList.toggle('is-reached', dot.top + dot.height / 2 <= hold + 1);
        });
      }
      if (par) {
        var b = par.parentElement.getBoundingClientRect();
        if (b.bottom > 0 && b.top < vh) {
          var k = (b.top + b.height / 2 - vh / 2) / (vh + b.height);
          par.style.transform = 'translate3d(0,' + (k * -12).toFixed(2) + '%,0)';
        }
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else window.addEventListener('load', start);
})();
