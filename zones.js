/* ============================================================
   THE POSTPARTUM SUITE, The Care: around the house

   The plan of the house, scrubbed by the scroll. It is already drawn as
   the section arrives, fills with daylight, dims to night, and then the
   rooms light one at a time while one sentence changes its ending:
   "She will tidy your living room." and so on. Then the whole house
   lights and the plan returns to a drawing as the section leaves.

     ROOMS      the single source of truth: film seconds and scroll weight
     mapTime    track position to film time
     playhead   lerped, deadbanded, coalesced seeks on a streamed clip
     blocks     the intro and the sentence cross over
     phrases    the ending rises out as the next rises in
     rooms      buttons that mark the lit room and jump to any of them

   Deliberately separate from care.js: the flight is finished and stays
   untouched, so the small scrub loop is repeated here rather than shared.

   Film timings were read off a contact sheet of the encoded clip
   (lab/zones-encode.mjs). If the film changes, re-read them.
   ============================================================ */
(function () {
  'use strict';

  var section = document.querySelector('[data-zones]');
  if (!section) return;
  var stage = section.querySelector('[data-zones-stage]');
  var video = section.querySelector('[data-zvideo]');

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(pointer: fine)').matches;
  var phoneQuery = matchMedia('(max-width: 1099px)');

  /* ---------- phones and tablets: tap driven ----------
     Scrubbing a video by scroll is rough on touch screens (seeking lags,
     flicks skip beats, the browser bars resize the screen), so there it is
     not used. The house plays its arrival once as it comes into view and
     stops on the first lit room; the rooms are tabs, and a tap swaps the
     words and fades in that room's lit still (cut from the same film, so
     the pictures match). Desktop below is unchanged. (TJ, 5 Oct 2026) */
  function initTap() {
    section.classList.add('zones--tap');
    var title = section.querySelector('.zones__title');
    var line = section.querySelector('.zones__line');
    var rooms = section.querySelector('.zones__rooms');
    if (!line || !rooms) return;
    var stills = {};
    [].forEach.call(section.querySelectorAll('[data-zstill]'), function (el) { stills[el.dataset.zstill] = el; });

    // Build the tabs from the accordion's own copy: one source for both.
    var tablist = document.createElement('div');
    tablist.className = 'zones__tabs';
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', 'Rooms');
    var marker = document.createElement('span');
    marker.className = 'zones__marker';
    marker.setAttribute('aria-hidden', 'true');
    tablist.appendChild(marker);
    var panels = document.createElement('div');
    panels.className = 'zones__panels';
    var tabs = [], panelEls = [];
    [].forEach.call(rooms.querySelectorAll('.zones__room'), function (li) {
      var key = li.dataset.zitem;
      var tab = document.createElement('button');
      tab.type = 'button'; tab.className = 'zones__tab'; tab.id = 'zt-' + key; tab.dataset.key = key;
      tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', 'zp-' + key);
      tab.textContent = li.querySelector('button').textContent;
      var panel = document.createElement('div');
      panel.className = 'zones__panel'; panel.id = 'zp-' + key; panel.dataset.key = key;
      panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', tab.id);
      var p = document.createElement('p');
      p.textContent = li.querySelector('.zones__more p').textContent;
      panel.appendChild(p);
      tablist.appendChild(tab); panels.appendChild(panel);
      tabs.push(tab); panelEls.push(panel);
    });
    rooms.parentNode.replaceChild(tablist, rooms);
    var srList = line.querySelector('.sr-only');
    if (srList) srList.parentNode.removeChild(srList);
    line.appendChild(panels);

    var active = null, introDone = false, started = false, loaded = false;

    function placeMarker() {
      var t = tabs.filter(function (b) { return b.dataset.key === active; })[0];
      if (!t) return;
      tablist.style.setProperty('--mx', t.offsetLeft + 'px');
      tablist.style.setProperty('--mw', t.offsetWidth + 'px');
    }
    function sizePanels() {
      var pn = panelEls.filter(function (e) { return e.dataset.key === active; })[0];
      if (pn) panels.style.height = pn.offsetHeight + 'px';
    }
    function showStill(key) {
      Object.keys(stills).forEach(function (k) {
        var el = stills[k];
        if (k === key) { el.classList.remove('is-prev'); el.classList.add('is-on'); }
        else if (el.classList.contains('is-on')) {
          el.classList.remove('is-on'); el.classList.add('is-prev');
          setTimeout(function () { el.classList.remove('is-prev'); }, 560);
        }
      });
    }
    function select(key) {
      active = key;
      tabs.forEach(function (b) {
        var on = b.dataset.key === key;
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      panelEls.forEach(function (e) { e.classList.toggle('is-active', e.dataset.key === key); });
      placeMarker(); sizePanels();
      if (introDone) showStill(key);
    }
    function finishIntro() {
      if (introDone) return;
      introDone = true;
      if (video && !video.paused) video.pause();
      if (title) title.classList.add('is-in');
      line.classList.add('is-in');
      showStill(active);
    }

    var STOP = 4.5;   // film seconds: the living room lit
    function loadVideo() {
      if (loaded || reduced || !video) return;
      loaded = true;
      video.preload = 'auto';
      video.src = video.dataset.srcMobile;
      video.load();
    }
    function startIntro() {
      if (started) return;
      started = true;
      if (reduced || !video) { finishIntro(); return; }
      loadVideo();
      var shown = false;
      function watch() {
        if (introDone) return;
        if (!shown && video.currentTime >= 1.0) { shown = true; if (title) title.classList.add('is-in'); }
        if (video.currentTime >= STOP) { video.currentTime = STOP; finishIntro(); return; }
        requestAnimationFrame(watch);
      }
      video.addEventListener('playing', function () { stage.classList.add('has-clip'); }, { once: true });
      var pr = video.play();
      if (pr && pr.then) pr.then(function () { requestAnimationFrame(watch); }, finishIntro);
      else requestAnimationFrame(watch);
      // If the film cannot play or stalls, never leave the words hidden.
      setTimeout(function () { if (!introDone && video.currentTime < 0.2) finishIntro(); }, 6000);
    }

    tablist.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.zones__tab') : null;
      if (!b) return;
      select(b.dataset.key);
      finishIntro();
    });
    tablist.addEventListener('keydown', function (e) {
      var i = tabs.map(function (b) { return b.dataset.key; }).indexOf(active), n = tabs.length, to = -1;
      if (e.key === 'ArrowRight') to = (i + 1) % n; else if (e.key === 'ArrowLeft') to = (i + n - 1) % n;
      if (to < 0) return;
      e.preventDefault(); select(tabs[to].dataset.key); tabs[to].focus(); finishIntro();
    });

    select(tabs.length ? tabs[0].dataset.key : null);
    var relayout = function () { placeMarker(); sizePanels(); };
    addEventListener('resize', relayout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { loadVideo(); o.disconnect(); } }, { rootMargin: '200% 0px' }).observe(stage);
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { startIntro(); o.disconnect(); } }, { threshold: 0.4 }).observe(stage);
    } else {
      finishIntro();
    }
  }
  // Crossing the breakpoint (rotating a tablet) changes the whole mode.
  phoneQuery.addEventListener('change', function () { location.reload(); });
  if (phoneQuery.matches) { initTap(); return; }

  /* ---------- ROOMS ----------
     'room' legs light one room and carry that room's ending. The film
     starts at 1.0s, where the drawing is already complete, because the
     stage is on screen before its own scroll begins and frame zero is an
     empty page. It stops at 12.0s, back to a drawing, before the plan
     slides out, so the section leaves on the house rather than on nothing. */
  /* The bathroom was removed on 5 Oct 2026 (TJ). The film was recut to match:
     the nursery frame is held for half a second and dissolves into the lit
     house, so the old 8.9 to 10.6 and 10.6 to 12.0 stretches are now 7.6 to
     8.9 and 8.9 to 10.3 (everything after the cut moved 1.7 seconds earlier).
     The uncut files are kept beside the new ones as zones.with-bathroom.mp4
     and zones-m.with-bathroom.mp4. */
  var START = 0;
  var ROOMS = [
    { name: 'enter',    to: 1.0,  w: 0.90, kind: 'move', poster: -1 },
    { name: 'build',    to: 3.3,  w: 0.90, kind: 'move', poster: 0 },
    { name: 'dusk',     to: 4.05, w: 0.40, kind: 'move', poster: 0 },
    { name: 'living',   to: 4.95, w: 0.85, kind: 'room', poster: 1 },
    { name: 'kitchen',  to: 6.15, w: 0.85, kind: 'room', poster: 2 },
    { name: 'nursery',  to: 7.6,  w: 0.85, kind: 'room', poster: 3 },
    { name: 'all',      to: 8.9,  w: 0.85, kind: 'room', poster: 4 },
    { name: 'outro',    to: 10.3, w: 0.50, kind: 'move', poster: 4 },
    { name: 'exit',     to: 11.3, w: 0.90, kind: 'move', poster: -1 }
  ];

  var T = 0, film = START;
  ROOMS.forEach(function (leg) {
    leg.from = film; leg.s0 = T;
    T += leg.w; film = leg.to;
    leg.s1 = T;
  });
  var byName = {};
  ROOMS.forEach(function (leg) { byName[leg.name] = leg; });

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var mix = function (a, b, k) { return a + (b - a) * k; };
  var smooth = function (k) { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
  var ramp = function (t, a, b) { return smooth((t - a) / (b - a)); };

  function legAt(t) {
    for (var i = 0; i < ROOMS.length; i++) if (t < ROOMS[i].s1) return ROOMS[i];
    return ROOMS[ROOMS.length - 1];
  }
  function mapTime(t) {
    var leg = legAt(t);
    return mix(leg.from, leg.to, clamp((t - leg.s0) / leg.w, 0, 1));
  }

  /* ---------- blocks ----------
     The intro greets (already at full when the section arrives) and gives
     way as the house dims; the sentence comes in with the night and holds
     until the plan starts turning back into a drawing. */
  var dusk = byName.dusk, outro = byName.outro, enter = byName.enter, exit = byName.exit;
  var blocks = [
    // The title never changes: it arrives with the house and leaves with it.
    { el: section.querySelector('[data-zbeat="title"]'),
      win: function (t) {
        var inn = phoneQuery.matches ? ramp(t, enter.s1 + 0.05, enter.s1 + 0.4) : ramp(t, enter.s0 + 0.35, enter.s1 + 0.1);
        return inn * (1 - ramp(t, exit.s0 - 0.05, exit.s0 + 0.3));
      } },
    // The rooms and the sentence come in with the night and go as the plan
    // turns back into a drawing.
    { el: section.querySelector('[data-zbeat="line"]'),
      win: function (t) { return ramp(t, dusk.s0 + 0.1, dusk.s1 + 0.1) * (1 - ramp(t, outro.s0 - 0.05, outro.s0 + 0.3)); } }
  ].filter(function (b) { return b.el; });

  function paint(el, o, tf, cache) {
    var oo = Math.round(o * 1000) / 1000;
    if (oo !== cache.o) {
      el.style.opacity = oo;
      if (cache.vis !== false) el.style.visibility = oo > 0.001 ? 'visible' : 'hidden';
      cache.o = oo;
    }
    if (tf !== cache.tf) { el.style.transform = tf; cache.tf = tf; }
  }
  blocks.forEach(function (b) { b.cache = { o: -1, tf: '' }; });

  function paintCopy(t) {
    blocks.forEach(function (b) {
      var o = b.win(t);
      var tf = reduced ? 'none' : 'translate3d(0,' + ((1 - o) * 10).toFixed(1) + 'px,0)';
      paint(b.el, o, tf, b.cache);
    });
  }

  /* ---------- rooms ---------- */
  var roomBtns = [].slice.call(section.querySelectorAll('[data-zroom]'));
  var roomOn = null;
  function paintRooms(t) {
    var current = null;
    ['living', 'kitchen', 'nursery'].forEach(function (n) {
      if (t >= byName[n].s0 - 0.12) current = n;
    });
    if (t >= byName.all.s0 - 0.12) current = null;
    if (current !== roomOn) {
      roomBtns.forEach(function (b) {
        var on = b.dataset.zroom === current;
        b.setAttribute('aria-current', String(on));
        b.setAttribute('aria-expanded', String(on));
        b.parentNode.classList.toggle('is-open', on);
      });
      roomOn = current;
    }
  }
  roomBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var leg = byName[btn.dataset.zroom];
      if (!leg) return;
      window.scrollTo({ top: trackTop + (leg.s0 + leg.w * 0.5) * vhPx, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ---------- posters ----------
     First paint, the stand in while the clip loads, and the whole film
     under reduced motion. */
  var posters = [].slice.call(section.querySelectorAll('[data-zposter]'));
  var posterOn = 0;
  function paintPosters(t) {
    var idx = legAt(t).poster;
    if (idx !== posterOn) {
      posters[posterOn] && posters[posterOn].classList.remove('is-on');
      posters[idx] && posters[idx].classList.add('is-on');
      posterOn = idx;
    }
  }

  /* ---------- the clip ----------
     Streamed straight into the element, never fetched whole first (see
     care.js for the two failures that taught this). Loaded only once the
     reader is near the section, so it never competes with the flight's
     much larger film. The poster stays until a real frame has painted. */
  var clipReady = false, loading = false;
  var play = START, target = START;
  var LERP = 0.14;
  var deadband = (phoneQuery.matches || !finePointer) ? 0.02 : 0.008;

  function markReady() {
    if (clipReady) return;
    clipReady = true;
    stage.classList.add('has-clip');
  }

  function loadClip() {
    if (loading || reduced || !video) return;
    loading = true;
    var mobile = phoneQuery.matches || !finePointer;
    video.addEventListener('loadeddata', function once() {
      video.removeEventListener('loadeddata', once);
      var p = video.play();
      var settle = function () {
        video.pause();
        video.addEventListener('seeked', function first() {
          video.removeEventListener('seeked', first);
          if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(markReady);
          setTimeout(markReady, video.requestVideoFrameCallback ? 800 : 120);
        });
        play = target;
        video.currentTime = play;
      };
      if (p && p.then) p.then(settle, settle); else settle();
    });
    video.preload = 'auto';
    video.src = mobile ? video.dataset.srcMobile : video.dataset.src;
    video.load();
  }

  function stepPlayhead() {
    if (!video || !video.src || video.readyState < 1) return;
    var d = target - play;
    play = Math.abs(d) < 0.001 ? target : play + d * LERP;
    if (!video.seeking && Math.abs(video.currentTime - play) > deadband) video.currentTime = play;
  }

  /* ---------- layout ---------- */
  var vhPx = innerHeight, trackTop = 0;
  function layout() {
    vhPx = stage.offsetHeight || innerHeight;
    if (vhPx > 0) section.style.height = Math.round((T + 1) * vhPx) + 'px';
    trackTop = section.getBoundingClientRect().top + scrollY;
  }
  // The flight above sets its own height on the same events, which moves
  // this section; measure after it has, on the next frame.
  function relayout() { requestAnimationFrame(function () { layout(); frame(true); }); }
  addEventListener('resize', relayout);
  addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);

  /* ---------- the frame ---------- */
  var lastT = -1;
  function frame(force) {
    var raw = (scrollY - trackTop) / vhPx;
    var t = clamp(raw, 0, T);

    // Start the clip two screens before the section, so it is decoded by
    // the time the reader arrives.
    if (!loading && raw > -2.5) loadClip();

    if (force || t !== lastT) {
      target = mapTime(t);
      paintCopy(t);
      paintRooms(t);
      paintPosters(t);
      lastT = t;
    }
    stepPlayhead();
  }
  function loop() { frame(false); requestAnimationFrame(loop); }

  layout();
  frame(true);
  requestAnimationFrame(function () { layout(); frame(true); requestAnimationFrame(loop); });

  // For lab/care-check.mjs: read only, nothing on the page depends on it.
  window.__zones = {
    T: T, legs: ROOMS,
    state: function () {
      return { t: clamp((scrollY - trackTop) / vhPx, 0, T), target: target, play: play,
               current: video ? video.currentTime : 0, ready: clipReady, painted: lastT, vh: vhPx, top: trackTop };
    },
    scrollToT: function (t) { window.scrollTo({ top: trackTop + t * vhPx, behavior: 'instant' }); }
  };
})();
