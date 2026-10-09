/* ============================================================
   WHAT WE DO
   Self contained: it needs GSAP and ScrollTrigger, and inner-nav.js for the
   menu. It does not use home.js. The page reads fully without any of this.

     kinetic headings        a line splitter and the hero's own rise
     reveals                 small soft entrances, once
     hero + frames           slow parallax inside photographs
     the stack               earlier cards settle back as the next arrives
     the detail              the held photograph changes with the row in view
     the day                 a line that draws as the day passes
     length of stay          one control, three figures
     FAQ                     scroll spy for the group list
   ============================================================ */
(function () {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 861px)');
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- Line splitter ----------
     Measures real line boxes, so it runs after fonts load and again when the
     width changes (never the height: an address bar is not a reflow). A <br>
     in the source is kept as a hard break. */
  function splitLines(el) {
    var segments = el.innerHTML.split(/<br\s*\/?>/i)
      .map(function (seg) { return seg.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim(); })
      .filter(Boolean);
    var rows = [];
    segments.forEach(function (segment) {
      var words = segment.split(/\s+/);
      el.textContent = '';
      var probes = words.map(function (w) {
        var s = document.createElement('span');
        s.textContent = w; s.style.display = 'inline-block';
        el.appendChild(s); el.appendChild(document.createTextNode(' '));
        return s;
      });
      var currentTop = null;
      probes.forEach(function (s, i) {
        var top = s.offsetTop;
        if (currentTop === null || Math.abs(top - currentTop) > 4) { rows.push([]); currentTop = top; }
        rows[rows.length - 1].push(words[i]);
      });
    });
    el.textContent = '';
    return rows.map(function (row) {
      var mask = document.createElement('span'); mask.className = 'kin-line';
      var inner = document.createElement('span'); inner.textContent = row.join(' ');
      mask.appendChild(inner); el.appendChild(mask); el.appendChild(document.createTextNode(' '));
      return inner;
    });
  }

  var kinEls = [].slice.call(document.querySelectorAll('[data-kin]'));
  var kinSource = new WeakMap();
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.01 }) : null;

  function splitAll() {
    kinEls.forEach(function (el) {
      if (!kinSource.has(el)) kinSource.set(el, el.innerHTML);
      var wasIn = el.classList.contains('is-in');
      el.classList.remove('is-split', 'is-in');
      el.innerHTML = kinSource.get(el);
      splitLines(el).forEach(function (l, i) { l.style.setProperty('--i', i); });
      el.classList.add('is-split');
      if (wasIn || !io || el.hasAttribute('data-kin-now')) el.classList.add('is-in'); else io.observe(el);
    });
  }

  /* ---------- Reveals ---------- */
  function reveals() {
    var els = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if (!('IntersectionObserver' in window) || reduced) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var r = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); r.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (e) { r.observe(e); });
  }

  /* ---------- Parallax inside photographs ---------- */
  function parallax() {
    if (reduced) return;
    gsap.utils.toArray('[data-par]').forEach(function (img) {
      var trigger = img.parentElement;
      var amt = parseFloat(img.getAttribute('data-par')) || 5;
      gsap.fromTo(img, { yPercent: -amt }, {
        yPercent: amt, ease: 'none',
        scrollTrigger: { trigger: trigger, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true }
      });
    });
  }

  /* ---------- The stack ----------
     As the next card slides over, the card beneath settles back a little. */
  var stackTriggers = [];
  function stack() {
    stackTriggers.forEach(function (t) { t.kill(); });
    stackTriggers = [];
    var cards = gsap.utils.toArray('[data-card]');
    cards.forEach(function (c) { gsap.set(c, { clearProps: 'transform' }); });
    if (reduced || !wide.matches) return;
    cards.forEach(function (card, i) {
      var next = cards[i + 1];
      if (!next) return;
      var tw = gsap.to(card, {
        scale: 0.955, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top 90%', end: 'top 25%', scrub: true, invalidateOnRefresh: true }
      });
      stackTriggers.push(tw.scrollTrigger, tw);
    });
  }

  /* ---------- The detail ----------
     The row crossing the middle of the window decides which photograph is on
     show. Each new photograph wipes up over the last (CSS, clip path). */
  function detail() {
    gsap.utils.toArray('.det').forEach(function (sec) {
      var imgs = [].slice.call(sec.querySelectorAll('.det__media img'));
      var rows = [].slice.call(sec.querySelectorAll('[data-di]'));
      if (!imgs.length || !rows.length) return;
      imgs.forEach(function (im, i) { im.style.zIndex = String(i + 1); });
      var active = 0;
      function show(i) {
        if (i === active) return; active = i;
        imgs.forEach(function (im, k) { im.classList.toggle('is-on', k <= i); });
      }
      rows.forEach(function (row, i) {
        ScrollTrigger.create({
          trigger: row, start: 'top 58%', end: 'bottom 58%',
          onToggle: function (self) { if (self.isActive) show(Math.min(i, imgs.length - 1)); }
        });
      });
    });
  }

  /* ---------- The day ----------
     A thin line draws down the timetable as the reader passes each hour. */
  function day() {
    var list = document.querySelector('[data-day]');
    if (!list) return;
    var rows = [].slice.call(list.querySelectorAll('[data-row]'));
    ScrollTrigger.create({
      trigger: list, start: 'top 60%', end: 'bottom 60%',
      onUpdate: function (self) { list.style.setProperty('--p', self.progress.toFixed(4)); }
    });
    rows.forEach(function (row) {
      ScrollTrigger.create({ trigger: row, start: 'top 60%', onToggle: function (self) { row.classList.toggle('is-past', self.isActive || self.progress > 0); },
        onEnter: function () { row.classList.add('is-past'); }, onLeaveBack: function () { row.classList.remove('is-past'); } });
    });
    if (reduced) { list.style.setProperty('--p', '1'); rows.forEach(function (r) { r.classList.add('is-past'); }); }
  }

  /* ---------- Length of stay ----------
     One control, and the numbers beside it change. Only figures the client's
     copy states: three freshly cooked meals a day, a herbal bath every day,
     belly binding every day. Nothing about price. */
  function ledger() {
    var roots = [].slice.call(document.querySelectorAll('[data-ledger]'));
    roots.forEach(function (root) {
    var buttons = [].slice.call(root.querySelectorAll('[data-days]'));
    var STOPS = [5, 7, 14, 30];
    var out = {};
    [].slice.call(root.querySelectorAll('[data-out]')).forEach(function (el) { out[el.getAttribute('data-out')] = el; });
    var shown = { days: 5, meals: 15, baths: 5, binds: 5 };
    var raf = 0, started = false, currentDay = 5, countTarget = 5;
    function set(k, v) { out[k].textContent = String(Math.round(v)); }
    function paint() { Object.keys(shown).forEach(function (k) { set(k, shown[k]); }); }
    function setMarker(days, dur) {
      root.style.setProperty('--tl-dur', dur + 'ms');
      root.style.setProperty('--sel', String(days));
    }
    function countTo(days, dur) {
      countTarget = days;
      var to = { days: days, meals: days * 3, baths: days, binds: days };
      cancelAnimationFrame(raf);
      if (reduced) { Object.keys(to).forEach(function (k) { shown[k] = to[k]; set(k, to[k]); }); return; }
      var from = { days: shown.days, meals: shown.meals, baths: shown.baths, binds: shown.binds };
      var t0 = performance.now();
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        Object.keys(to).forEach(function (k) { shown[k] = from[k] + (to[k] - from[k]) * e; set(k, shown[k]); });
        if (p < 1) raf = requestAnimationFrame(tick);
        else Object.keys(to).forEach(function (k) { shown[k] = to[k]; set(k, to[k]); });
      })(t0);
    }
    function go(days, dur) {
      setMarker(days, dur);
      countTo(days, dur);
    }
    function pick(btn, dur, moveMarker) {
      started = true;
      currentDay = parseInt(btn.getAttribute('data-days'), 10);
      buttons.forEach(function (b) { b.setAttribute('aria-checked', String(b === btn)); b.tabIndex = b === btn ? 0 : -1; });
      if (moveMarker === false) countTo(currentDay, dur || 420);
      else go(currentDay, dur || 650);
    }
    function nearest(v) {
      return STOPS.reduce(function (a, b) { return Math.abs(b - v) < Math.abs(a - v) ? b : a; });
    }
    function buttonFor(d) { return buttons.filter(function (b) { return parseInt(b.getAttribute('data-days'), 10) === d; })[0]; }
    function choose(btn, dur) {
      var days = parseInt(btn.getAttribute('data-days'), 10);
      if (typeof root._tlSeekDay === 'function' && root._tlSeekDay(days)) return;
      pick(btn, dur);
    }

    root._tlLedger = {
      arrive: function (days) {
        started = true;
        setMarker(days, 1);
        cancelAnimationFrame(raf);
        shown = { days: days, meals: days * 3, baths: days, binds: days };
        countTarget = days;
        paint();
      },
      scrub: function (markerDays, activeDays) {
        started = true;
        setMarker(markerDays, 1);
        if (activeDays !== currentDay) pick(buttonFor(activeDays), 420, false);
        else if (countTarget !== activeDays) countTo(activeDays, 420);
      }
    };

    buttons.forEach(function (b, i) {
      b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
      b.addEventListener('click', function () { choose(b); });
      b.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = buttons[(i + 1) % buttons.length];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = buttons[(i + buttons.length - 1) % buttons.length];
        if (n) { e.preventDefault(); choose(n); n.focus(); }
      });
    });

    // The marker slides, and can be dragged along the rule; it settles on the nearest stop.
    var rail = root.querySelector('.tl-rail');
    var handle = root.querySelector('.tl-handle');
    function frac(e) {
      var r = rail.getBoundingClientRect();
      return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    }
    if (rail && handle) {
      handle.addEventListener('pointerdown', function (e) {
        e.preventDefault(); started = true;
        handle.setPointerCapture(e.pointerId);
        root.classList.add('is-drag');
      });
      handle.addEventListener('pointermove', function (e) {
        if (root.classList.contains('is-drag')) root.style.setProperty('--sel', String(frac(e) * 30));
      });
      var end = function (e) {
        if (!root.classList.contains('is-drag')) return;
        root.classList.remove('is-drag');
        choose(buttonFor(nearest(frac(e) * 30)));
      };
      handle.addEventListener('pointerup', end);
      handle.addEventListener('pointercancel', end);
      rail.addEventListener('click', function (e) {
        if (e.target === handle) return;
        choose(buttonFor(nearest(frac(e) * 30)));
      });
    }

    // On phones the marker still travels from 0 to 5 once on arrival. Desktop
    // scroll owns the same arrival so the two controls never fight each other.
    if (!reduced && window.matchMedia('(min-width: 901px)').matches) {
      shown = { days: 0, meals: 0, baths: 0, binds: 0 };
      paint();
      setMarker(0, 1);
    } else if (!reduced) {
      shown = { days: 0, meals: 0, baths: 0, binds: 0 };
      paint();
      root.style.setProperty('--tl-dur', '1ms');
      root.style.setProperty('--sel', '0');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting || started) return;
          started = true; io.disconnect();
          setTimeout(function () { go(5, 1400); }, 350);
        });
      }, { threshold: 0.6 });
      io.observe(root.querySelector('.tl-scale') || root);
    }
    });
  }
  /* ---------- Tailored To You: rooms ----------
     The three paragraphs open one at a time; the photograph beside them follows. */
  function tailRooms() {
    var accs = [].slice.call(document.querySelectorAll('[data-tl-acc]'));
    accs.forEach(function (acc) {
    var items = [].slice.call(acc.querySelectorAll('[data-tl-item]'));
    var section = acc.closest('.tail');
    var pics = [].slice.call(section.querySelectorAll('.tl__pics img'));
    var focused = -1;
    function placeFocus() {
      if (!section.classList.contains('tail--proposal') || focused < 0) { acc.classList.remove('has-focus'); return; }
      var item = items[focused];
      acc.style.setProperty('--tl-focus-y', item.offsetTop + 'px');
      acc.style.setProperty('--tl-focus-h', item.offsetHeight + 'px');
      acc.classList.add('has-focus');
    }
    // Every room starts closed, on every screen. A tap opens one (the others
    // close) and a tap on the open one closes it. The photograph follows the
    // room opened last and stays on it when all are closed.
    function open(i) {
      focused = i;
      items.forEach(function (it, k) {
        it.classList.toggle('is-open', k === i);
        it.querySelector('button').setAttribute('aria-expanded', String(k === i));
      });
      requestAnimationFrame(function () { requestAnimationFrame(placeFocus); });
      if (section.classList.contains('tail--wall-palette')) {
        var palettePic = pics[i + 1] || pics[0];
        section.style.setProperty('--tl-ground', palettePic.getAttribute('data-ground'));
      }
      // photograph 0 is for all closed, 1 to 3 for the rooms, so every change of state changes the picture
      pics.forEach(function (p, k) { p.classList.toggle('is-on', k === i + 1); });
    }
    items.forEach(function (it, i) {
      it.querySelector('button').addEventListener('click', function () {
        open(it.classList.contains('is-open') ? -1 : i);
      });
    });
    open(-1);
    if ('ResizeObserver' in window) {
      var focusObserver = new ResizeObserver(placeFocus);
      items.forEach(function (item) { focusObserver.observe(item); });
    }
    window.addEventListener('resize', placeFocus, { passive: true });
    });
  }

  function tailReadMore() {
    var panels = [].slice.call(document.querySelectorAll('[data-tl-readmore]'));
    panels.forEach(function (panel) {
      var toggle = panel.querySelector('.tl-readmore__toggle');
      var section = panel.closest('.tail');
      var pics = [].slice.call(section.querySelectorAll('.tl__pics img'));
      if (!toggle) return;
      function setMedia(open) {
        var active = open ? 1 : 0;
        pics.forEach(function (pic, index) { pic.classList.toggle('is-on', index === active); });
        section.style.setProperty('--tl-ground', pics[active].getAttribute('data-ground'));
      }
      setMedia(false);
      toggle.addEventListener('click', function () {
        var open = !panel.classList.contains('is-open');
        panel.classList.toggle('is-open', open);
        panel.classList.toggle('has-focus', open);
        toggle.setAttribute('aria-expanded', String(open));
        setMedia(open);
        setTimeout(function () { ScrollTrigger.refresh(); }, 520);
      });
    });
  }
  function tailoredMotion() {
    var section = document.querySelector('#tailored');
    if (!section || reduced) return;
    var text = section.querySelector('.tl__text');
    var pictures = section.querySelector('.tl__pics');
    if (!text || !pictures) return;

    var head = section.querySelector('.tl__head');
    var scale = section.querySelector('.tl-scale');
    var stay = section.querySelector('.tl-stay');
    var glass = section.querySelector('.tl-acc');
    var media = gsap.matchMedia();

    media.add('(min-width: 901px)', function () {
      var shift = function () { return Math.min(window.innerWidth * .18, 260); };
      var ledger = text._tlLedger;
      var stops = [5, 7, 14, 30];
      var milestones = [0, 1 / 3, 2 / 3, 1];
      var pinTrigger;
      var entry = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'top 80px',
          scrub: 1.15,
          refreshPriority: -10,
          invalidateOnRefresh: true,
          onEnter: function () { if (ledger) ledger.arrive(0); },
          onUpdate: function (self) { if (ledger && self.isActive) ledger.arrive(self.progress * 5); },
          onLeave: function () { if (ledger) ledger.arrive(5); },
          onEnterBack: function () { if (ledger) ledger.arrive(5); },
          onLeaveBack: function () { if (ledger) ledger.arrive(0); }
        }
      });
      entry
        .fromTo(head, { x: shift, opacity: .62, force3D: true }, { x: 0, opacity: 1, duration: .34, ease: 'power3.out' }, 0)
        .fromTo(scale, { x: function () { return shift() * .9; }, opacity: .58, force3D: true }, { x: 0, opacity: 1, duration: .36, ease: 'power3.out' }, .035)
        .fromTo(stay, { x: function () { return shift() * .78; }, opacity: .54, force3D: true }, { x: 0, opacity: 1, duration: .37, ease: 'power3.out' }, .07)
        .fromTo(glass, { x: function () { return shift() * .65; }, opacity: .48, force3D: true }, { x: 0, opacity: 1, duration: .38, ease: 'power3.out' }, .1)
        .fromTo(pictures, { xPercent: 44, opacity: 0, scale: 1.035, force3D: true }, { xPercent: 0, opacity: 1, scale: 1, duration: .46, ease: 'power2.out' }, .08)
        .to(pictures, { scale: 1.01, duration: .14, ease: 'sine.inOut' }, .54);

      function dayAt(progress) {
        if (progress >= 1) return 30;
        var segment = Math.min(2, Math.floor(progress * 3));
        var local = progress * 3 - segment;
        var eased = local * local * (3 - 2 * local);
        return stops[segment] + (stops[segment + 1] - stops[segment]) * eased;
      }
      function activeAt(progress) {
        if (progress < 1 / 6) return 5;
        if (progress < 1 / 2) return 7;
        if (progress < 5 / 6) return 14;
        return 30;
      }

      var scrollState = { progress: 0 };
      var scrub = gsap.to(scrollState, {
        progress: 1,
        ease: 'none',
        onUpdate: function () {
          if (ledger && pinTrigger && window.scrollY >= pinTrigger.start - 1) ledger.scrub(dayAt(scrollState.progress), activeAt(scrollState.progress));
        },
        scrollTrigger: {
          trigger: section,
          start: 'top 80px',
          end: function () { return '+=' + Math.round(window.innerHeight * 1.5); },
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: .55,
          refreshPriority: -10,
          invalidateOnRefresh: true,
          onEnter: function () { if (ledger) ledger.scrub(5, 5); },
          onRefresh: function (self) {
            if (!ledger || self.progress <= 0) return;
            scrollState.progress = self.progress;
            ledger.scrub(dayAt(self.progress), activeAt(self.progress));
          }
        }
      });
      pinTrigger = scrub.scrollTrigger;

      text._tlSeekDay = function (days) {
        var index = stops.indexOf(days);
        if (index < 0 || !pinTrigger) return false;
        var target = pinTrigger.start + milestones[index] * (pinTrigger.end - pinTrigger.start);
        window.scrollTo({ top: target, behavior: 'smooth' });
        return true;
      };

      var exit = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: function () { return pinTrigger.end; },
          end: function () { return pinTrigger.end + window.innerHeight; },
          scrub: 1.05,
          refreshPriority: -10,
          invalidateOnRefresh: true
        }
      });
      exit
        // The photograph leaves right off the screen at full strength, early (TJ,
        // 8 Oct 2026), so the clay below Tailored (The Promise's gap now takes
        // Tailored's ground) has the whole background to itself. It used to
        // slide 44 percent and fade, which left it cut across the foot.
        .to(pictures, { xPercent: 112, scale: 1.02, duration: .24, ease: 'power2.in' }, 0)
        // the pale silk band behind the Days row dissolves into the clay as the
        // section leaves (TJ, 8 Oct 2026): its lower edge was a full width line
        // against the clay now beneath it. Off the held look entirely: it only
        // starts to fade once the exit begins and returns when scrolled back.
        .to(section.querySelector('.tail__field'), { opacity: 0, duration: .16, ease: 'power1.inOut' }, 0)
        // and its foot fades into the clay below as the section's edge rises into view
        .fromTo(pictures, { '--tl-foot': 0 }, { '--tl-foot': 1, duration: .018, ease: 'power1.out', immediateRender: false }, 0)
        .to(glass, { x: function () { return shift() * .34; }, opacity: .68, duration: .46, ease: 'power2.in' }, .08)
        .to(stay, { x: function () { return shift() * .4; }, opacity: .7, duration: .43, ease: 'power2.in' }, .13)
        .to(scale, { x: function () { return shift() * .46; }, opacity: .72, duration: .39, ease: 'power2.in' }, .18)
        .to(head, { x: function () { return shift() * .55; }, opacity: .74, duration: .34, ease: 'power2.in' }, .23);

      return function () {
        delete text._tlSeekDay;
        [entry, scrub, exit].forEach(function (animation) {
          if (animation.scrollTrigger) animation.scrollTrigger.kill();
          animation.kill();
        });
      };
    });

    media.add('(max-width: 900px)', function () {
      var timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: .85,
          refreshPriority: -10
        }
      });
      timeline
        .fromTo(head, { x: 22, opacity: .7, force3D: true }, { x: 0, opacity: 1, duration: .25, ease: 'power2.out' }, 0)
        .fromTo(scale, { x: 18, opacity: .68, force3D: true }, { x: 0, opacity: 1, duration: .25, ease: 'power2.out' }, .03)
        .fromTo(stay, { x: 14, opacity: .66, force3D: true }, { x: 0, opacity: 1, duration: .25, ease: 'power2.out' }, .06)
        .fromTo(glass, { x: 10, opacity: .64, force3D: true }, { x: 0, opacity: 1, duration: .25, ease: 'power2.out' }, .09)
        .fromTo(pictures, { xPercent: 16, opacity: .5, scale: 1.02, force3D: true }, { xPercent: 0, opacity: 1, scale: 1, duration: .32, ease: 'power2.out' }, .05)
        .to(pictures, { xPercent: 14, opacity: .58, scale: 1.02, duration: .25, ease: 'power2.in' }, .75)
        .to(glass, { x: 10, opacity: .74, duration: .21, ease: 'power2.in' }, .79)
        .to(stay, { x: 12, opacity: .76, duration: .19, ease: 'power2.in' }, .81)
        .to(scale, { x: 14, opacity: .78, duration: .17, ease: 'power2.in' }, .83)
        .to(head, { x: 16, opacity: .8, duration: .15, ease: 'power2.in' }, .85);
    });
  }
  /* ---------- FAQ scroll spy ---------- */
  function faqSpy() {
    var nav = document.querySelector('.faq__nav');
    if (!nav) return;
    var links = [].slice.call(nav.querySelectorAll('a'));
    links.forEach(function (a, i) {
      var g = document.querySelector(a.getAttribute('href'));
      if (!g) return;
      ScrollTrigger.create({
        trigger: g, start: 'top 45%', end: 'bottom 45%',
        onToggle: function (self) { if (self.isActive) links.forEach(function (x, k) { x.classList.toggle('is-active', k === i); }); }
      });
    });
  }

  function init() {
    splitAll();
    reveals();
    parallax();
    stack();
    detail();
    day();
    ledger();
    tailRooms();
    tailReadMore();
    tailoredMotion();
    faqSpy();
    ScrollTrigger.refresh();
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(init); else window.addEventListener('load', init);

  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(init._t);
    init._t = setTimeout(function () { splitAll(); stack(); ScrollTrigger.refresh(); }, 200);
  });
})();
