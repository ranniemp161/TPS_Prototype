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
  var phoneQuery = matchMedia('(max-width: 767px)');

  /* ---------- ROOMS ----------
     'room' legs light one room and carry that room's ending. The film
     starts at 1.0s, where the drawing is already complete, because the
     stage is on screen before its own scroll begins and frame zero is an
     empty page. It stops at 12.0s, back to a drawing, before the plan
     slides out, so the section leaves on the house rather than on nothing. */
  var START = 1.0;
  var ROOMS = [
    { name: 'build',    to: 3.3,  w: 0.90, kind: 'move', poster: 0 },
    { name: 'dusk',     to: 4.05, w: 0.40, kind: 'move', poster: 0 },
    { name: 'living',   to: 4.95, w: 0.85, kind: 'room', poster: 1 },
    { name: 'kitchen',  to: 6.15, w: 0.85, kind: 'room', poster: 2 },
    { name: 'nursery',  to: 7.6,  w: 0.85, kind: 'room', poster: 3 },
    { name: 'bathroom', to: 8.9,  w: 0.85, kind: 'room', poster: 4 },
    { name: 'all',      to: 10.6, w: 0.85, kind: 'room', poster: 5 },
    { name: 'outro',    to: 12.0, w: 0.50, kind: 'move', poster: 5 }
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
  var dusk = byName.dusk, outro = byName.outro;
  var blocks = [
    { el: section.querySelector('[data-zbeat="intro"]'),
      win: function (t) { return 1 - ramp(t, dusk.s0 - 0.05, dusk.s0 + 0.25); } },
    { el: section.querySelector('[data-zbeat="line"]'),
      win: function (t) { return ramp(t, dusk.s0 + 0.1, dusk.s1 + 0.1) * (1 - ramp(t, outro.s0 - 0.05, outro.s0 + 0.3)); } }
  ].filter(function (b) { return b.el; });

  /* ---------- phrases ----------
     Each ending owns its room's stretch of scroll. It rises in from below
     as the room lights and rises away as the next room takes over, so the
     change reads as the sentence continuing, not as a new slide. */
  var RISE = 0.45;   // of the sentence's font size
  var phrases = ROOMS.filter(function (l) { return l.kind === 'room'; }).map(function (leg, n, all) {
    var el = section.querySelector('[data-zphrase="' + leg.name + '"]');
    var first = n === 0, last = n === all.length - 1;
    return {
      el: el, leg: leg,
      win: function (t) {
        return {
          // The first ending arrives with the sentence itself, so the line
          // never reads "She will" on its own.
          a: first ? ramp(t, dusk.s0 - 0.05, dusk.s0 + 0.1) : ramp(t, leg.s0 - 0.12, leg.s0 + 0.12),
          b: last ? 0 : ramp(t, leg.s1 - 0.12, leg.s1 + 0.12)
        };
      }
    };
  }).filter(function (p) { return p.el; });

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
  phrases.forEach(function (p) { p.cache = { o: -1, tf: '', vis: false }; });

  function paintCopy(t) {
    blocks.forEach(function (b) {
      var o = b.win(t);
      var tf = reduced ? 'none' : 'translate3d(0,' + ((1 - o) * 10).toFixed(1) + 'px,0)';
      paint(b.el, o, tf, b.cache);
    });
    phrases.forEach(function (p) {
      var w = p.win(t);
      var o = w.a * (1 - w.b);
      var tf = 'none';
      if (!reduced) tf = 'translate3d(0,' + (((1 - w.a) - w.b) * RISE).toFixed(3) + 'em,0)';
      paint(p.el, o, tf, p.cache);
    });
  }

  /* ---------- rooms ---------- */
  var roomBtns = [].slice.call(section.querySelectorAll('[data-zroom]'));
  var roomOn = null;
  function paintRooms(t) {
    var current = null;
    ['living', 'kitchen', 'nursery', 'bathroom'].forEach(function (n) {
      if (t >= byName[n].s0 - 0.12) current = n;
    });
    if (t >= byName.all.s0 - 0.12) current = null;
    if (current !== roomOn) {
      roomBtns.forEach(function (b) { b.setAttribute('aria-current', String(b.dataset.zroom === current)); });
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
