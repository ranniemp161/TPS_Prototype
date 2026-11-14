/* Homepage house flight: one native scroll distance maps linearly to one film time. */
(function () {
  'use strict';

  var section = document.querySelector('[data-flight]');
  if (!section) return;
  var stage = section.querySelector('[data-stage]');
  var video = section.querySelector('[data-video]');
  var posters = [].slice.call(section.querySelectorAll('[data-poster]'));
  var beats = [].slice.call(section.querySelectorAll('[data-beat]'));
  var ghost = section.querySelector('[data-ghost]');
  var route = section.querySelector('[data-route]');
  var routeList = section.querySelector('[data-route-stops]');
  var routeWash = section.querySelector('[data-route-wash]');
  var routeTip = section.querySelector('.route__tip');
  var routeFill = section.querySelector('.route__fill');
  var routeEnd = section.querySelector('[data-route-end]');
  var routeHome = section.querySelector('[data-route-home]');
  var stopEls = [].slice.call(section.querySelectorAll('[data-stop]'));
  // Each stop's button: the small name for Arrival, the large title for the rooms after it (TJ, 15 Oct 2026).
  var stopBtns = stopEls.map(function (li) { return li.querySelector('.route__name, .route__head'); });
  var flightEnquire = section.querySelector('[data-flight-enquire]');
  var intro = section.querySelector('[data-flight-intro]');
  var introVeil = section.querySelector('[data-flight-veil]');
  // The reveal (TJ, 21 Oct 2026, What We Do): the Four Kinds of Care's held
  // stage is tucked under the end of the film, already in place, and the
  // film dissolves away over its last REVEAL_VH windows to show it, rather
  // than fading to the canvas and the section rising in. Only while that
  // section is live (desktop, what-we-do-hands.js); otherwise the old end.
  var REVEAL_VH = parseFloat(section.dataset.revealVh) || 0;
  var revealNext = section.nextElementSibling;
  var revealing = false;
  var VEIL = 0.62;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phoneQuery = matchMedia('(max-width: 767px)');
  var phone = phoneQuery.matches;
  // Tapped, not scrolled (TJ, 8 Nov 2026): the page scrolls past the flight
  // like any section; Start and the arrows move the film. The film's place is
  // held in vraw (windows from the start of the track) instead of the page
  // scroll, so everything that reads pos() works unchanged.
  var TAP = !reduced;
  var vraw = -1;
  var finePointer = matchMedia('(pointer: fine)').matches;

  // The film now starts just before the front door (TJ, 14 Oct 2026). The
  // bedroom handover and the flight round the outside of the house are cut
  // from the files themselves (the uncut originals are
  // home-flight.with-handover.mp4 and home-flight-m.with-handover.mp4), so
  // CUT is how far into the old timeline the new first frame sat. Every
  // time below is still written in the old timeline's numbers, the ones the
  // footage notes use, and tc() shifts them.
  //
  // The files open 1.0 s before the closed door (frame 69 of the old cut,
  // just after its cut from the flight round the house, where the camera
  // holds on the front of the house and pushes in; the door is frame 99).
  // That glide plays while the bath lifts off the stage (the lead, below),
  // so the film is already moving as the smoke clears and lands on the
  // closed door exactly where it used to hold. From the door on, a vh of
  // scroll moves the film exactly as far as before, so every point after it
  // is where it was.
  var CUT = 69 / 30;
  var DOOR = 99 / 30 - CUT;
  var DURATION = 26.98 - CUT;
  var TRACK_VH = 15.6 * (DURATION - DOOR) / 26.98;
  // The section sits underneath the bath (site.css, .flight--home), so its
  // stage is held on the top of the window from the moment the bath lets
  // go. Over this first stretch, while the bath rises off it (home.js,
  // doorHandoff), the film plays the glide up to the door, easing in from
  // still and arriving at the normal speed as the last of the bath leaves.
  var LEAD_VH = 1;
  // The hand over to What Is Confinement (TJ, 14 Oct 2026). The confinement
  // act's pin starts at PIN_T, once the house and trees have left the frame
  // (gone by 23.9 at 1440 x 900 and 390 x 844) but before the white: the
  // film's last stretch, PIN_T to its end, still plays on scroll under the
  // start of the emerge, its own dissolve to the canvas (--blend) turning the
  // sky white as the act appears. The flight section gives back that stretch
  // plus its stage's own window (a negative bottom margin), so the act's top
  // reaches the window's top exactly at PIN_T while the film's stage stays
  // held to the end of the track, white by then. home.js (actTurn) pins the
  // act there and scrubs its opacity. The route fades out by the last frame
  // with the roof in it (ROUTE_OUT, below). None of it with reduced motion:
  // the film runs to its end and the sections stack as before.
  var turnAct = document.querySelector('.act--turn');
  // Only when the act comes after the flight (since 8 Nov 2026 it is above it, TJ).
  var HELD = !!turnAct && !!(section.compareDocumentPosition(turnAct) & Node.DOCUMENT_POSITION_FOLLOWING) && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PIN_T = 24.0;
  var PIN_VH = (PIN_T - DOOR) / (DURATION - DOOR) * TRACK_VH;
  if (HELD) turnAct.classList.add('is-handover');
  // The route runs on to the confinement question (TJ, 15 Oct 2026), across
  // the act's pin, after the film's stage has stopped being held, so it is
  // lifted out of the stage into a fixed layer of the same size, above the
  // film and the pinned act and below the header (house-flight.css,
  // .route-layer). Every reference to its parts is already taken above.
  if (HELD && route) {
    var routeLayer = document.createElement('div');
    routeLayer.className = 'route-layer';
    routeLayer.setAttribute('data-route-layer', '');
    document.body.appendChild(routeLayer);
    routeLayer.appendChild(route);
  }
  var DEAD_BAND = phone || !finePointer ? 0.025 : 0.01;

  function tc(seconds, frames) { return seconds + frames / 30 - CUT; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function mix(a, b, amount) { return a + (b - a) * amount; }
  function smooth(value) { value = clamp(value, 0, 1); return value * value * (3 - 2 * value); }

  // zone: where the desktop glass panel rests on that frame, chosen for
  // the one quiet area each shot leaves clear of its people. The panel
  // glides in a straight line from its previous zone to this one; there
  // is no per-scene entrance edge any more. treatment is where it ends:
  // treatmentFadeAt (seconds) is when it disappears on the way to exit,
  // before the practitioner's face would cross under it.
  //
  // panelAt: when the desktop panel switches to that scene, in film
  // seconds. Independent of the video's own crossfade timing (SCENES[i]
  // .time, which still drives sceneAt/scenePair/the poster and caption
  // fades below): the panel is free to lead into the next room earlier,
  // by design, so it and the video do not need to agree on when a scene
  // "starts". Scenes without their own panelAt default to their own
  // scene midpoint the way the video crossfade already works.
  var PHONE_ZONE = { top: '62%', left: '50%' };
  var TREATMENT_FADE_AT = tc(23, 15); // ~23.5s, tune against the footage
  var SCENES = [
    { name: 'exterior', beat: 'exterior', time: DOOR, rest: DOOR, fx: 50,
      desc: 'Scroll and come in.',
      zone: { top: '86%', left: '14%' } },
    { name: 'kitchen', beat: 'kitchen', time: (tc(6, 28) + tc(7, 25)) / 2, rest: tc(6, 28), fx: 66, room: 'kitchen',
      desc: '3 fresh meals are cooked in your kitchen every day, made for you, your family and your recovery.',
      zone: { top: '78%', left: '20%' } },
    { name: 'living', beat: 'living', time: (tc(11, 16) + tc(12, 6)) / 2, rest: tc(11, 16), fx: 31, room: 'living',
      desc: 'The living room is where your days with your baby unfold, so we keep it feeling restful and composed.',
      zone: { top: '24%', left: '28%' } },
    { name: 'nursery', beat: 'nursery', time: (tc(16, 8) + tc(17, 10)) / 2, rest: tc(16, 8), fx: 18, room: 'nursery',
      desc: 'Whether it is a 3am feed or an afternoon change, you step into a room that is peaceful, considered and already prepared, with nothing to search for.',
      zone: { top: '52%', left: '77%' }, panelAt: 14 - CUT },
    { name: 'treatment', beat: 'bedroom', time: (tc(21, 19) + tc(22, 12)) / 2, rest: tc(21, 19), fx: 52, room: 'bedroom',
      desc: 'Your treatments are woven into your stay, so warmth, support and restoration build gently day after day, in the comfort of your home.',
      zone: { top: '20%', left: '20%' }, panelAt: 19 - CUT },
    // rest is where a phone settles: on The Window with its words up, not on
    // the last frame, where the route has already faded.
    { name: 'exit', beat: 'sky', time: DURATION, rest: HELD ? PIN_T : 26.1 - CUT - 0.8, fx: 50,
      desc: 'All of it, in one pair of hands.',
      zone: { top: '20%', left: '20%' } }
  ];

  var vh = innerHeight;
  var trackTop = 0;
  function pos() { return TAP ? trackTop + vraw * vh : scrollY; }
  function setPos(y) {
    if (TAP) { vraw = (y - trackTop) / vh; updateFromScroll(); }
    else window.scrollTo({ top: y, behavior: 'instant' });
  }
  var target = 0;
  var desired = 0;
  var lastDesired = 0;
  var wheelUntil = 0;
  var keyUntil = 0;
  var tapUntil = 0;   // a tapped step is moving the page (phones)
  var touchActive = false;
  var settleTimer = 0;
  var inputMode = 'native';
  var ready = false;
  // One continuous film (TJ, 8 Nov 2026). The four legs, each room to the
  // next, are retimed to exactly 2.5s and joined into one 10s film
  // (home-flight-legs.mp4, a 720p copy at 60fps for phones), with a reversed copy for
  // going back. A tap plays the film at normal speed and pauses it on the
  // next room's mark; nothing is scrubbed, sped up or seeked mid leg. Going
  // back plays the reversed film over the forward one, then the forward film
  // is seeked to the same room and the reversed one is hidden on the same
  // frame. Film time runs linearly from one station to the next across a
  // leg, so the route, beats and posters paint from the same clock as before.
  // Each leg now eases in and out of its rooms (see easeP below).
  var MARKS = [0, 2.5, 5, 7.5, 10];
  var FILM_END = 10;
  var LEG_MS = 2500;
  var EPS = 1 / 60;
  // Eased stops (TJ, 8 Nov 2026). Each leg of the film is baked with a
  // trapezoid speed profile: it rises from rest over the leg's first 0.5s,
  // holds, and falls back to rest over the last 0.7s, still covering the
  // whole leg in 2.5s. easeP gives the share of a leg's travel covered at a
  // share of its time, easePInv the reverse. The reversed film is the mirror
  // of the forward one, so a back leg rises over 0.7s and falls over 0.5s;
  // dir picks which.
  var EASE_UP = 0.5 / 2.5, EASE_DOWN = 0.7 / 2.5;
  var EASE_V = 1 / (1 - (EASE_UP + EASE_DOWN) / 2);
  function easeP(u) {
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    if (u < EASE_UP) return EASE_V * u * u / (2 * EASE_UP);
    if (u <= 1 - EASE_DOWN) return EASE_V * (EASE_UP / 2 + u - EASE_UP);
    return 1 - EASE_V * (1 - u) * (1 - u) / (2 * EASE_DOWN);
  }
  function easePInv(f) {
    if (f <= 0) return 0;
    if (f >= 1) return 1;
    if (f < EASE_V * EASE_UP / 2) return Math.sqrt(2 * EASE_UP * f / EASE_V);
    if (f <= 1 - EASE_V * EASE_DOWN / 2) return EASE_UP + f / EASE_V - EASE_UP / 2;
    return 1 - Math.sqrt(2 * EASE_DOWN * (1 - f) / EASE_V);
  }
  function easeSpeed(u) {
    if (u < EASE_UP) return EASE_V * Math.max(0, u) / EASE_UP;
    if (u <= 1 - EASE_DOWN) return EASE_V;
    return EASE_V * Math.max(0, 1 - u) / EASE_DOWN;
  }
  // share of the leg's travel at share u of its time, and the inverse
  function legProgress(u, dir) { return dir > 0 ? easeP(u) : 1 - easeP(1 - u); }
  function legTimeAt(f, dir) { return dir > 0 ? easePInv(f) : 1 - easePInv(1 - f); }
  function legSpeed(u, dir) { return dir > 0 ? easeSpeed(u) : easeSpeed(1 - u); }
  // A cubic-bezier for the stretch of a leg from share u0 to u1 of its time,
  // so a CSS transition over that stretch moves with the film. The handles
  // keep the film's own speed at both ends; their lengths are fitted on a
  // small grid. The whole leg comes out near cubic-bezier(0.25, 0, 0.7, 1)
  // forward and its mirror back. Cached: only a few stretches ever occur.
  var easeCache = {};
  function easeCurve(u0, u1, dir) {
    var key = dir + ':' + u0.toFixed(4) + ':' + u1.toFixed(4);
    if (easeCache[key]) return easeCache[key];
    var w = u1 - u0, q0 = legProgress(u0, dir), h = legProgress(u1, dir) - q0;
    if (w < 0.0005 || h < 0.0005) return (easeCache[key] = 'linear');
    var m0 = legSpeed(u0, dir) * w / h, m1 = legSpeed(u1, dir) * w / h;
    var N = 24, truth = [];
    for (var i = 0; i <= N; i++) truth.push((legProgress(u0 + w * i / N, dir) - q0) / h);
    var S = 64, bx = new Array(S + 1), by = new Array(S + 1);
    var best = 9, out = null;
    for (var a = 0.05; a < 0.951; a += 0.05) {
      for (var b = 0.05; b < 0.951; b += 0.05) {
        var x1 = a, y1 = Math.min(a * m0, 1.5), x2 = 1 - b, y2 = 1 - Math.min(b * m1, 1.5);
        for (var k = 0; k <= S; k++) {
          var t = k / S, c1 = 3 * (1 - t) * (1 - t) * t, c2 = 3 * (1 - t) * t * t, c3 = t * t * t;
          bx[k] = c1 * x1 + c2 * x2 + c3;
          by[k] = c1 * y1 + c2 * y2 + c3;
        }
        var err = 0, j = 0;
        for (i = 0; i <= N && err < best; i++) {
          var x = i / N;
          while (j < S - 1 && bx[j + 1] < x) j++;
          var f = bx[j + 1] > bx[j] ? (x - bx[j]) / (bx[j + 1] - bx[j]) : 0;
          err = Math.max(err, Math.abs(by[j] + (by[j + 1] - by[j]) * clamp(f, 0, 1) - truth[i]));
        }
        if (err < best) { best = err; out = [x1, y1, x2, y2]; }
      }
    }
    return (easeCache[key] = out ? 'cubic-bezier(' + out.map(function (v) { return v.toFixed(3); }).join(', ') + ')' : 'linear');
  }
  var clipSuffix = phone || !finePointer ? '-m' : '';
  var fwd = section.querySelector('[data-film-fwd]');
  var rev = section.querySelector('[data-film-rev]');
  var filmsReady = false;
  var playing = null;     // { el, from, to, fromT, toT, finalIdx, dir, stopAt }
  var stationIdx = 0;     // the room the film rests on
  // The film's last frame is the treatment room itself (frame 10s), so the
  // reversed film at 10 minus a mark shows exactly the forward film's frame
  // at that mark.
  function revTime(i) { return FILM_END - MARKS[i]; }
  // the house leg starts on the wide house (film 0), before the glide to the door
  function legT(k) { return k === 0 ? 0 : STATIONS[k]; }
  // Seek, then call done once the frame is there (at once if it already is).
  function seekTo(el, t, done) {
    if (!el.seeking && Math.abs(el.currentTime - t) < 0.0005) { done(); return; }
    var fired = false;
    var guard = 0;
    var fin = function () {
      if (fired) return;
      fired = true;
      el.removeEventListener('seeked', fin);
      clearTimeout(guard);
      done();
    };
    guard = setTimeout(fin, 1500);
    el.addEventListener('seeked', fin);
    el.currentTime = t;
  }
  // Between legs the reversed film waits on the mirror of the current room,
  // so the next back starts at once.
  var revWant = -1;
  function parkRev(i) {
    if (!rev) return;
    revWant = i;
    seekTo(rev, revTime(i), function () {});
  }
  // The foot fade is baked into the desktop films only (TJ, 8 Nov 2026),
  // which fill the stage. The phone films are left plain: there the film sits
  // in a band and the live wash falls over the ghost below it.
  var bakedFade = false;
  function syncBake() {
    bakedFade = TAP && !clipSuffix && !phone;
    stage.classList.toggle('is-baked', bakedFade);
  }
  // The auroras of the sections either side of the flight sit exactly on the
  // window's edges while it fills the screen, and their blurred layers are
  // still composited every frame: in Chrome that alone dropped a third of a
  // leg's frames (measured 8 Nov 2026). Any aurora not actually on screen is
  // hidden while a leg plays and given back when it ends or the page moves.
  var hiddenAuroras = [];
  function restAuroras() {
    var vh2 = innerHeight;
    document.querySelectorAll('.aurora').forEach(function (a) {
      if (a.closest('[data-flight]')) return;
      var r = a.getBoundingClientRect();
      if (r.bottom <= 8 || r.top >= vh2 - 8) { a.style.visibility = 'hidden'; hiddenAuroras.push(a); }
    });
  }
  function wakeAuroras() {
    hiddenAuroras.forEach(function (a) { a.style.visibility = ''; });
    hiddenAuroras = [];
  }
  // Decided from where the page rests, not at the tap: the style change on
  // those big blurred layers is itself a dropped frame or two.
  var auroraTimer = 0;
  function settleAuroras() {
    clearTimeout(auroraTimer);
    auroraTimer = setTimeout(function () {
      var r = stage.getBoundingClientRect();
      var fills = r.top <= 2 && r.bottom >= innerHeight - 2;
      if (fills && !hiddenAuroras.length) restAuroras();
      else if (!fills && hiddenAuroras.length) wakeAuroras();
      // the breathing zoom pauses while the flight is not the whole window
      stage.classList.toggle('is-away', !fills);
    }, 120);
  }
  // Breathing (TJ, 8 Nov 2026): while the film rests on a room the picture
  // very slowly zooms in and out (.is-resting, house-flight.css). Both films
  // share the one wrapper, so a back swap stays on an identical frame. When a
  // leg starts the zoom glides back to full size from wherever it is,
  // alongside the film's own ease in; once the leg has landed it starts again
  // from full size, where its keyframes begin.
  var breathe = section.querySelector('[data-flight-breathe]');
  function startBreath() {
    if (!breathe || reduced) return;
    breathe.style.transition = '';
    breathe.style.transform = '';
    stage.classList.add('is-resting');
  }
  function stopBreath() {
    if (!breathe || !stage.classList.contains('is-resting')) return;
    var now = getComputedStyle(breathe).transform;
    breathe.style.transition = 'none';
    breathe.style.transform = now && now !== 'none' ? now : 'scale(1)';
    stage.classList.remove('is-resting');
    void breathe.offsetWidth;
    breathe.style.transition = 'transform 600ms ease-out';
    breathe.style.transform = 'scale(1)';
  }
  // Sharp still (TJ, 9 Nov 2026): at rest the room's own source frame
  // dissolves in over the paused film (.is-sharp, house-flight.css). All five
  // are loaded up front for the film in use (the -m stills go with the -m
  // films), so at a landing the still is already decoded. A leg takes it away
  // at once, before the film moves, so a playing film is never covered.
  var sharp = section.querySelector('[data-flight-sharp]');
  // Leaving fade (TJ, 9 Nov 2026): a twin of the still that takes the resting
  // picture and fades it out over the leg's eased start, so leaving a room is
  // a dissolve, not a cut from sharp to soft. A twin, because the still itself
  // is handed the next room's picture as the leg starts.
  var sharpOut = null, sharpOutTimer = 0;
  if (sharp) {
    sharpOut = sharp.cloneNode(false);
    sharpOut.removeAttribute('data-flight-sharp');
    sharpOut.removeAttribute('src');
    sharpOut.className = 'flight__sharp-out';
    sharp.parentNode.insertBefore(sharpOut, sharp.nextSibling);
  }
  function mirrorOut() {
    if (!sharpOut || !sharp) return;
    var src = sharp.getAttribute('src');
    if (!src || sharpOut.getAttribute('src') === src) return;
    sharpOut.src = src;
    if (typeof sharpOut.decode === 'function') sharpOut.decode().catch(function () {});
  }
  function fadeOutSharp() {
    if (!sharpOut || sharpOut.getAttribute('src') !== sharp.getAttribute('src')) return;
    clearTimeout(sharpOutTimer);
    sharpOut.classList.remove('is-fading');
    sharpOut.classList.add('is-on');
    void sharpOut.offsetWidth;
    sharpOut.classList.add('is-fading');
    sharpOutTimer = setTimeout(function () { sharpOut.classList.remove('is-on', 'is-fading'); }, 520);
  }
  // The rooms that get the kitchen treatment (TJ, 9 Nov 2026), by station
  // index: the kitchen, living room, nursery and treatment room. Their stills
  // dissolve in during the slowdown and their stem and title wait for the
  // stop. The house (0) keeps its plain dissolve at rest.
  var ENHANCED = [false, true, true, true, true];
  // Rooms whose desktop still is TJ's enhanced 4K frame, in two sizes: the 4K
  // one only where the window has the pixels for it, 2560 x 1440 otherwise.
  // A room is added here once its enhanced still is installed.
  var BIG_STILL = { kitchen: true, living: true, nursery: true, treatment: true };
  var sharpSrc = ['house', 'kitchen', 'living', 'nursery', 'treatment'].map(function (n) {
    if (BIG_STILL[n] && !clipSuffix) return '../assets/img/flight-rest/' + (innerWidth * (devicePixelRatio || 1) > 2600 ? n : n + '-2560') + '.webp';
    return '../assets/img/flight-rest/' + n + clipSuffix + '.webp';
  });
  var sharpPre = [];
  var sharpWant = -1;
  function preloadSharp() {
    if (!sharp || sharpPre.length) return;
    sharpPre = sharpSrc.map(function (src) { var im = new Image(); im.decoding = 'async'; im.src = src; return im; });
  }
  function showSharp(i) {
    if (!sharp || reduced) return;
    // already dissolving in from the leg's slowdown (dissolveEarly)
    if (sharpWant === i && stage.classList.contains('is-sharp')) return;
    sharpWant = i;
    stage.classList.remove('is-sharp', 'is-early');
    sharp.classList.remove('is-primed');
    var src = sharpSrc[i];
    var shown = function () {
      if (sharpWant !== i || playing) return;
      // one frame on the new picture at opacity 0, then the dissolve
      requestAnimationFrame(function () { if (sharpWant === i && !playing) { stage.classList.add('is-sharp'); mirrorOut(); } });
    };
    var onLoad = function () { if (sharp.naturalWidth) shown(); };
    if (sharp.getAttribute('src') !== src) sharp.src = src;
    if (typeof sharp.decode === 'function') {
      sharp.decode().then(shown, function () {
        if (sharp.complete && sharp.naturalWidth) shown(); else sharp.addEventListener('load', onLoad, { once: true });
      });
    } else if (sharp.complete && sharp.naturalWidth) shown();
    else sharp.addEventListener('load', onLoad, { once: true });
  }
  function hideSharp() {
    sharpWant = -1;
    var wasOn = !!sharp && stage.classList.contains('is-sharp') && parseFloat(getComputedStyle(sharp).opacity) > 0.5;
    if (sharp) { stage.classList.remove('is-sharp', 'is-early'); sharp.classList.remove('is-primed'); }
    if (wasOn && !reduced) fadeOutSharp();
  }
  // Early dissolve (TJ, 9 Nov 2026; the kitchen first, then every room in
  // ENHANCED): on a leg that stops at one of these rooms, forward or back, the
  // still is set and decoded as the jump starts, and starts its dissolve
  // (1200ms, .is-early) when the film is 0.35s from the mark, checked on every
  // video frame (watchLeg). The film slows to its mark underneath; the title
  // and the breathing still wait for the stop. A jump that only passes a room
  // never shows its still. Chrome neither rasterises nor uploads an image
  // layer at opacity 0, even one marked to change opacity, so once decoded the
  // still is primed (.is-primed, opacity 0.002, half a colour level at most)
  // on the leg that ends at the room, and its upload happens as that leg sets
  // off, not on the dissolve's first frame. While the film rests on a room the
  // stills of the rooms either side are decoded ahead (warmSharp), so that
  // work is done at rest too.
  var EARLY_LEAD = 0.35;
  var sharpReady = '';
  function earlySharp(pl) { return !!sharp && !reduced && ENHANCED[pl.finalIdx] && pl.to === pl.finalIdx; }
  function primeSharp() {
    var pl = playing;
    if (pl && earlySharp(pl) && !pl.early && sharpReady === sharpSrc[pl.to] && sharp.getAttribute('src') === sharpReady) sharp.classList.add('is-primed');
  }
  function prepSharp(pl) {
    if (!sharp || reduced || !ENHANCED[pl.finalIdx]) return;
    var src = sharpSrc[pl.finalIdx];
    if (sharp.getAttribute('src') !== src) { sharpReady = ''; sharp.src = src; }
    if (sharpReady === src) { primeSharp(); return; }
    var ok = function () {
      if (sharp.getAttribute('src') !== src || !sharp.naturalWidth) return;
      sharpReady = src;
      primeSharp();
    };
    var late = function () { if (sharp.complete) ok(); else sharp.addEventListener('load', ok, { once: true }); };
    if (typeof sharp.decode === 'function') sharp.decode().then(ok, late); else late();
  }
  function warmSharp(i) {
    [i - 1, i + 1].forEach(function (k) {
      var im = sharpPre[k];
      if (ENHANCED[k] && im && typeof im.decode === 'function') im.decode().catch(function () {});
    });
  }
  function dissolveEarly(pl) {
    pl.early = true;
    // not decoded in time: the landing's own dissolve takes over (showSharp)
    if (sharpReady !== sharpSrc[pl.to] || sharp.getAttribute('src') !== sharpReady) return;
    sharpWant = pl.to;
    sharp.classList.remove('is-primed');
    stage.classList.add('is-early', 'is-sharp');
    mirrorOut();
  }
  // The rest of the page is frozen while a leg plays (TJ, 8 Nov 2026): the
  // aurora drift is paused (html.is-flight-playing, house-flight.css), the
  // header glass goes flat (site.css) and GSAP's ticker sleeps, so the film
  // has the frame budget to itself. A scroll of more than 2px gives it all
  // back at once, the leg still playing.
  var frozen = false, frozenY = 0;
  function freezePage() {
    if (frozen) return;
    frozen = true;
    frozenY = scrollY;
    document.documentElement.classList.add('is-flight-playing');
    if (window.gsap && gsap.ticker) gsap.ticker.sleep();
  }
  function thawPage() {
    if (!frozen) return;
    frozen = false;
    document.documentElement.classList.remove('is-flight-playing');
    if (window.gsap && gsap.ticker) gsap.ticker.wake();
  }
  addEventListener('scroll', function () {
    if (frozen && Math.abs(scrollY - frozenY) > 2) thawPage();
    if (hiddenAuroras.length) wakeAuroras();
    settleAuroras();
  }, { passive: true });
  addEventListener('resize', settleAuroras);
  if (TAP) setTimeout(settleAuroras, 0);
  function playLegs(toIdx) {
    if (!TAP || reduced || playing || !filmsReady) return;
    toIdx = clamp(toIdx, 0, MARKS.length - 1);
    if (toIdx === stationIdx) return;
    cancelAnimationFrame(tweenRaf); tweening = false;
    var dir = toIdx > stationIdx ? 1 : -1;
    if (!hiddenAuroras.length) restAuroras();
    hideSharp();
    freezePage();
    stopBreath();
    playOne(stationIdx, stationIdx + dir, toIdx);
  }
  function legFor(from, to, finalIdx) {
    var dir = to > from ? 1 : -1;
    return { el: dir > 0 ? fwd : rev, from: from, to: to, fromT: legT(from), toT: legT(to),
      finalIdx: finalIdx, dir: dir, stopAt: dir > 0 ? MARKS[to] : revTime(to) };
  }
  function playOne(from, to, finalIdx) {
    var pl = playing = legFor(from, to, finalIdx);
    var el = pl.el;
    // after the leaving fade, so the next room's picture is not decoded and
    // uploaded on the same frames as the fade and the film's first frames
    setTimeout(function () { if (playing === pl) prepSharp(pl); }, 520);
    var go = function () {
      if (playing !== pl) return;
      if (pl.dir < 0) rev.classList.add('is-on');
      el.onended = function () { if (playing && playing.el === el) arrive(playing); };
      var pr = el.play();
      var started = function () { if (playing === pl) { startTween(pl); watchLeg(pl); } };
      if (pr && pr.then) pr.then(started, function () { if (playing === pl) arrive(pl); }); else started();
    };
    // the film already waits on this room; the seek only guards against drift
    seekTo(el, pl.dir > 0 ? MARKS[from] : revTime(from), go);
  }
  // Checked on every video frame (or animation frame where that is missing).
  function watchLeg(pl) {
    var el = pl.el;
    var useV = typeof el.requestVideoFrameCallback === 'function';
    var tick = function () {
      if (playing !== pl) return;
      if (!pl.early && earlySharp(pl) && el.currentTime >= pl.stopAt - EARLY_LEAD) dissolveEarly(pl);
      if (el.ended || el.currentTime >= pl.stopAt - EPS) { arrive(pl); return; }
      if (useV) el.requestVideoFrameCallback(tick); else requestAnimationFrame(tick);
    };
    tick();
  }
  // The leg's end state, written once.
  function settleLeg(pl) {
    stationIdx = pl.to;
    // the transitions off first, so the exact end state lands at once
    endTween();
    paint(pl.toT);
    lastPaint = pl.toT;
    target = desired = pl.toT;
    vraw = pl.to === 0 ? -LEAD_VH : trackForTime(pl.toT);
  }
  function arrive(pl) {
    if (playing !== pl) return;
    var el = pl.el;
    // A room further along: the film plays straight on into the next leg,
    // with no pause at the room it passes.
    if (pl.finalIdx !== pl.to) {
      settleLeg(pl);
      var next = playing = legFor(pl.to, pl.to + pl.dir, pl.finalIdx);
      primeSharp();
      startTween(next);
      watchLeg(next);
      return;
    }
    el.pause();
    el.onended = null;
    var land = function () {
      settleLeg(pl);
      playing = null;
      thawPage();
      settleAuroras();
      startBreath();
      if (ENHANCED[pl.to]) revealStop(pl.to - 1, pl.toT);
      showSharp(pl.to);
      warmSharp(pl.to);
      if (revWant !== pl.to) parkRev(pl.to);
    };
    if (pl.dir > 0) { seekTo(fwd, MARKS[pl.to], land); return; }
    // back: hold the reversed film on the room, bring the forward film to the
    // same frame under it, and only then take the reversed one away
    revWant = pl.to;
    seekTo(rev, revTime(pl.to), function () {
      seekTo(fwd, MARKS[pl.to], function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { rev.classList.remove('is-on'); land(); });
        });
      });
    });
  }
  // A leg's line, dots, titles and opening line run on CSS transitions (TJ,
  // 8 Nov 2026), so nothing is written per frame while the film plays. Each
  // ramp of the film (a title's rise or fall, a dot's growth, the opening
  // line's fade) is mapped from film seconds to the leg's milliseconds: the
  // part of it this leg crosses gives the delay and the length of that
  // property's transition (.is-tween, house-flight.css). The values are then
  // written once, at the leg's end state, and the browser runs them.
  function rampSpan(ramps, pl, legMs) {
    var span = pl.toT - pl.fromT;
    var lo = Math.min(pl.fromT, pl.toT), hi = Math.max(pl.fromT, pl.toT);
    // a film position inside the leg, to the real moment the eased film reaches it
    var at = function (t) { return legTimeAt(clamp((t - pl.fromT) / span, 0, 1), pl.dir) * legMs; };
    for (var r = 0; r < ramps.length; r++) {
      var s0 = Math.max(ramps[r][0], lo), s1 = Math.min(ramps[r][1], hi);
      if (s1 <= s0) continue;
      var t0 = at(span > 0 ? s0 : s1), t1 = at(span > 0 ? s1 : s0);
      return [Math.round(clamp(t0, 0, legMs)), Math.max(1, Math.round(clamp(t1, 0, legMs) - clamp(t0, 0, legMs)))];
    }
    return [0, 1];
  }
  function setTiming(el, name, sp) {
    el.style.setProperty('--' + name + '-delay', sp[0] + 'ms');
    el.style.setProperty('--' + name + '-ms', sp[1] + 'ms');
  }
  function introAt(time) { return phone ? 1 : 1 - smooth((time - (DOOR - 0.4)) / 0.5); }
  function startTween(pl) {
    var legMs = LEG_MS;
    if (pl.toT === pl.fromT) return;
    // the room's stem and title wait for the film to stop (revealStop)
    clearReveal();
    holdStop = ENHANCED[pl.to] ? pl.to - 1 : -1;
    section.style.setProperty('--leg-ms', legMs + 'ms');
    if (route) route.style.setProperty('--leg-ms', legMs + 'ms');
    // the fill holds on the house dot until the door (nowFraction), then runs with the film
    // the fill and tip move with the film's eased speed over the part of the leg they cross
    section.style.setProperty('--leg-ease', easeCurve(0, 1, pl.dir));
    if (route) {
      var fillSp = rampSpan([[DOOR, DURATION]], pl, legMs);
      setTiming(route, 'fill', fillSp);
      route.style.setProperty('--fill-ease', easeCurve(fillSp[0] / legMs, (fillSp[0] + fillSp[1]) / legMs, pl.dir));
    }
    stopEls.forEach(function (li, j) {
      var w = WINDOWS[j];
      var bj = tapFlow() ? STATIONS[j + 1] - 0.05 : births[j];
      setTiming(li, 'p', rampSpan([[w[0], w[0] + 0.3], [w[1] - 0.3, w[1]]], pl, legMs));
      setTiming(li, 'pw', rampSpan([[w[0] + 0.08, w[0] + 0.38], [w[1] - 0.3, w[1]]], pl, legMs));
      setTiming(li, 'd', rampSpan([[bj, bj + 0.15]], pl, legMs));
    });
    setTiming(section, 'intro', rampSpan([[DOOR - 0.4, DOOR + 0.1]], pl, legMs));
    section.classList.add('is-tween');
    if (route) route.classList.add('is-tween');
    // the end state, once
    paintRoute(pl.toT);
    paintBeats(pl.toT);
    var i0 = introAt(pl.fromT), i1 = introAt(pl.toT);
    if (intro) {
      intro.style.opacity = i1.toFixed(3);
      // hidden only once the fade is over, in settleLeg's paint
      intro.style.visibility = i0 > 0.001 || i1 > 0.001 ? 'visible' : 'hidden';
    }
    if (introVeil) introVeil.style.opacity = (VEIL * i1).toFixed(3);
    // phones pan to the next room's crop across the leg (object-position, .is-tween)
    if (phone) {
      var pair = scenePair(pl.toT);
      stage.style.setProperty('--fx', mix(SCENES[pair.left].fx, SCENES[pair.right].fx, pair.amount).toFixed(1) + '%');
    }
  }
  function endTween() {
    if (!section.classList.contains('is-tween')) return;
    section.classList.remove('is-tween');
    if (route) route.classList.remove('is-tween');
    // settle the style now, so a leg that follows starts its own transitions
    // from this leg's end state
    void getComputedStyle(route || section).transitionDuration;
  }
  var posterOn = 0;
  var lastPaint = -1;
  var mx = 0, my = 0, tmx = 0, tmy = 0;
  var gctx = ghost && phone ? ghost.getContext('2d') : null;
  var GHOST_W = 96;
  var GHOST_ZOOM = 1.3;

  function sizeGhost() {
    if (!gctx) return;
    var rect = ghost.getBoundingClientRect();
    ghost.width = GHOST_W;
    ghost.height = Math.max(1, Math.round(GHOST_W * rect.height / Math.max(1, rect.width)));
  }

  // Tiny canvas, upscaled and blurred by CSS: one video decode, near zero draw cost.
  function drawGhost() {
    if (!gctx) return;
    var src = TAP ? (rev && rev.classList.contains('is-on') ? rev : fwd) : (ready ? video : posters[posterOn]);
    if (!src || (src.tagName === 'VIDEO' && src.readyState < 2)) return;
    var isV = src.tagName === 'VIDEO';
    var sw = isV ? src.videoWidth : src.naturalWidth;
    var sh = isV ? src.videoHeight : src.naturalHeight;
    if (!sw || !sh) return;
    var cw = ghost.width, ch = ghost.height;
    var scale = Math.max(cw / sw, ch / sh) * GHOST_ZOOM;
    var dw = sw * scale, dh = sh * scale;
    gctx.drawImage(src, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  // Track 0 is the closed door; the track runs from there to the end.
  function trackForTime(time) { return (time - DOOR) / (DURATION - DOOR) * TRACK_VH; }
  function timeForTrack(track) { return DOOR + clamp(track / TRACK_VH, 0, 1) * (DURATION - DOOR); }

  // The glide before the door, over the lead. Half of it runs at a steady
  // pace and half eases in (time = DOOR * (A x + (1 - A) x^n)), so it is
  // visibly moving from the first scroll (TJ: an ease from still left it
  // looking frozen for half the lift) and n is chosen so it reaches the
  // door at the same speed the track runs at, with no jolt where they meet.
  var SPEED = (DURATION - DOOR) / TRACK_VH;   // film seconds per vh
  var PRE_A = 0.5;
  var PRE_N = Math.max(1, (SPEED * LEAD_VH / DOOR - PRE_A) / (1 - PRE_A));
  function timeForLead(raw) {
    var x = clamp(1 + raw / LEAD_VH, 0, 1);
    return DOOR * (PRE_A * x + (1 - PRE_A) * Math.pow(x, PRE_N));
  }

  function sceneAt(time) {
    var index = 0;
    for (var i = 1; i < SCENES.length; i++) {
      if (time >= (SCENES[i - 1].time + SCENES[i].time) / 2) index = i;
    }
    return index;
  }

  // The desktop panel's own switch points: SCENES[i].panelAt when given,
  // else the same midpoint sceneAt uses. Capped at treatment (index 5),
  // since the panel has no zone of its own past that point.
  var TREATMENT_INDEX = SCENES.findIndex(function (scene) { return scene.name === 'treatment'; });
  function panelIndexAt(time) {
    var index = 0;
    for (var i = 1; i <= TREATMENT_INDEX; i++) {
      var switchAt = SCENES[i].panelAt !== undefined ? SCENES[i].panelAt : (SCENES[i - 1].time + SCENES[i].time) / 2;
      if (time >= switchAt) index = i;
    }
    return index;
  }

  function scenePair(time) {
    var right = 1;
    while (right < SCENES.length && time > SCENES[right].time) right++;
    right = clamp(right, 1, SCENES.length - 1);
    var left = right - 1;
    var span = Math.max(0.001, SCENES[right].time - SCENES[left].time);
    return { left: left, right: right, amount: smooth((time - SCENES[left].time) / span) };
  }

  function beatOpacity(sceneIndex, time) {
    var scene = SCENES[sceneIndex];
    if (sceneIndex === 0) return time < 0.5 ? 1 : clamp(1 - (time - 0.5) / 0.65, 0, 1);
    if (sceneIndex === SCENES.length - 1) return smooth((time - (scene.time - 1.2)) / 0.9);
    var previousMid = (SCENES[sceneIndex - 1].time + scene.time) / 2;
    var nextMid = (scene.time + SCENES[sceneIndex + 1].time) / 2;
    var fade = Math.min(0.75, (nextMid - previousMid) * 0.18);
    var enter = smooth((time - previousMid) / fade);
    var leave = 1 - smooth((time - (nextMid - fade)) / fade);
    return clamp(enter * leave, 0, 1);
  }

  function paintBeats(time) {
    beats.forEach(function (beat) {
      var i = SCENES.findIndex(function (scene) { return scene.beat === beat.dataset.beat; });
      var opacity = i < 0 ? 0 : beatOpacity(i, time);
      beat.style.opacity = opacity.toFixed(3);
      beat.style.visibility = opacity > 0.001 ? 'visible' : 'hidden';
      beat.classList.toggle('is-live', opacity > 0.5);
      beat.style.transform = 'none';
    });
  }

  function paint(time) {
    var current = sceneAt(time);
    if (current !== posterOn) {
      posters[posterOn] && posters[posterOn].classList.remove('is-on');
      posters[current] && posters[current].classList.add('is-on');
      posterOn = current;
    }

    paintBeats(time);

    // The opening line (TJ, 21 Oct 2026): up as the film arrives and through
    // the glide, gone as the door comes up, before the first stop's title.
    // Phones keep it up for the whole flight, above the film (TJ, 23 Oct 2026).
    if (intro) {
      var io = introAt(time);
      intro.style.opacity = io.toFixed(3);
      intro.style.visibility = io > 0.001 ? 'visible' : 'hidden';
    }
    if (introVeil) introVeil.style.opacity = (VEIL * (1 - smooth((time - (DOOR - 0.4)) / 0.5))).toFixed(3);

    var pair = scenePair(time);
    var a = SCENES[pair.left], b = SCENES[pair.right];

    // the dissolve to canvas belongs to the film's own end, which the hand
    // over never reaches
    var endBlend = smooth((time - (26.1 - CUT)) / 0.88);
    if (revealing) {
      // Matched to the old hand over onto What Is Confinement on Home (TJ,
      // 21 Oct 2026): a steady linear fade over one full window of scroll,
      // the last REVEAL_VH of the track, the film still playing under it.
      var fade = clamp((trackForTime(time) - (TRACK_VH - REVEAL_VH)) / REVEAL_VH, 0, 1);
      stage.style.setProperty('--blend', '0');
      stage.style.opacity = (1 - fade).toFixed(3);
      stage.style.pointerEvents = fade > 0.95 ? 'none' : '';
    } else {
      stage.style.setProperty('--blend', endBlend.toFixed(3));
      stage.style.opacity = '';
      stage.style.pointerEvents = '';
    }
    stage.style.setProperty('--fx', phone ? mix(a.fx, b.fx, pair.amount).toFixed(1) + '%' : '50%');

    paintRoute(time);
  }

  // Up for the whole video, first frame to last, no fade of its own: a
  // hard cut the instant scroll carries past the flight's own sticky
  // stage. The nav's Enquire in the top right stays put the whole time,
  // so during the video there are two. Driven off pastFlight directly in
  // frame(), not paint(): target stays pinned at its max once scroll
  // clears the flight section, so paint() stops being called right there,
  // but scrollY (and so pastFlight) keeps moving.
  var flightEnquireLive = null;
  function paintFlightEnquire() {
    if (pastFlight === flightEnquireLive) return;
    flightEnquireLive = pastFlight;
    if (flightEnquire) flightEnquire.classList.toggle('is-live', !pastFlight);
  }

  // The route (TJ, 14 Oct 2026): one fixed centred line, driven by film
  // time. "Now" runs along it piecewise linearly: from the left end at
  // ROUTE_IN to the first stop at its birth, stop to stop at each birth, and
  // from the last stop to the right end at DURATION, so the solid fill and
  // its circle are exactly at a stop's dot when that stop is born. A dot
  // grows when its stop is born and stays. The stop whose WINDOWS entry
  // holds the film time is current: its stem, wash and masked name and words
  // rise and fall with the film (see paintRoute, which writes --p, --pw and
  // --d on each stop; the CSS draws everything from those, with transitions
  // only while a tapped leg plays, see startTween).
  // Measurements are cached in layoutRoute(); paintRoute runs on every paint.
  //
  // Where each stop sits (x is a fraction of the line) and which side of its
  // stem the words take, chosen by looking at each room's settled frame so
  // the words land on the quietest part of the picture, clear of faces. The
  // lower band of the frame, where the words sit, per room:
  //   Arrival   .08 right: plain brick wall left of the door; short words.
  //   Kitchen   .24 right: the plain marble front of the island, with the
  //             cook up and to the right of it.
  //   Living    .42 right: the table legs and rug between the sofa and the
  //             moses basket; both women's faces are well above.
  //   Nursery   .52 left: the chair base and floor left of the crib, clear
  //             of the carer's face and the crib's busy rails.
  //   Treatment .72 left: the plain pink blanket over the bed, below both
  //             faces and left of the feet.
  // On a phone the same x are used and the side is automatic (left half
  // reads to the right, right half to the left) so the words fit.
  var ROUTE_IN = DOOR - 0.5;
  // Out just before the window shot blends to sky (26.1 in the old
  // timeline), so the line leaves with the film's last frames (was 24.8).
  // With the hand over the route no longer fades with the film: it runs on to
  // the confinement question and dissolves after the act's pin (routeOut,
  // driven from home.js). ROUTE_OUT is only used without the hand over.
  // Changed (TJ, 16 Oct 2026): the line ends at the daily treatments and is
  // gone as the view flies out of the window, so it fades from the end of the
  // treatment room's window (21.2, see WINDOWS) and not at the roof shot.
  var ROUTE_OUT = 21.2;
  // The line has an equal tail at each end (TJ, 16 Oct 2026): it starts 0.08
  // of its width before Arrival and runs 0.08 past Daily treatments, which
  // is the last stop. The five stops are evenly spaced between those ends,
  // 0.21 apart: the two ends, the centre, and one midway between each end
  // and the centre (TJ, 16 Oct 2026).
  // The arrival stop is gone and the line starts at the kitchen (TJ, 23 Oct
  // 2026): four stops, evenly spaced between the same two ends, 0.28 apart.
  // The house has its own dot again, at the line's start (TJ, 8 Nov 2026),
  // so the line reads as a journey from the first frame: five dots, evenly
  // spaced between the same two ends. The house dot has no words.
  var HOUSE_X = 0.08;
  var ROUTE_STOPS = [
    { x: 0.29, side: 'right' },
    { x: 0.50, side: 'right' },
    { x: 0.71, side: 'left' },
    { x: 0.92, side: 'left' }
  ];
  // Each stop's [in, out] window in film seconds, read from the footage (TJ, 14 Oct 2026), in
  // SCENES order, for the route's stops only: the route ends at the treatment room (The Window
  // is a film beat with no stop, TJ, 15 Oct 2026). A stop is current only inside its window.
  // Between windows (the hallway, 1.9 to 2.9, and the stretch after the treatment room, from 21.2)
  // no stop is current, and the route's own fade takes over at ROUTE_OUT.
  var WINDOWS = [
    [2.9, 6.1],
    [6.6, 11.3],
    [11.9, 15.7],
    [17.3, 21.2]
  ];
  // A stop is born (its dot shown, the fill reaches it) at the start of its window.
  var births = WINDOWS.map(function (w) { return w[0]; });
  // The last stop, What Is Confinement? (TJ, 15 Oct 2026): a dot only, at
  // END_X, born as the act starts to emerge (PIN_T); the fill reaches it as
  // the emerge ends. Up to PIN_T the fill runs on film time from the
  // treatment room to X_PIN, then on the pin's scrubbed emerge (handE, from
  // home.js) from X_PIN to END_X, at about the same pace: X_PIN splits the
  // distance in the ratio of the film left (treatment's birth to PIN_T) to
  // the emerge's window of scroll in film seconds.
  var END_X = 0.9;
  var EMERGE_FILM_S = 1.0 * (DURATION - DOOR) / TRACK_VH;
  var lastX = ROUTE_STOPS[ROUTE_STOPS.length - 1].x;
  var lastBirth = WINDOWS[WINDOWS.length - 1][0];
  var X_PIN = lastX + (END_X - lastX) * (PIN_T - lastBirth) / (PIN_T - lastBirth + EMERGE_FILM_S);
  var handE = 0;      // the pin's emerge, 0 to 1, scrubbed (home.js)
  var routeOut = 1;   // the route's dissolve after the pin, 1 to 0, scrubbed (home.js)
  var lastEndD = -1;
  // The fill stops at the last stop (the daily treatments, TJ 16 Oct 2026).
  var knotT = [ROUTE_IN].concat(births, [DURATION]);
  var knotX = [HOUSE_X].concat(ROUTE_STOPS.map(function (s) { return s.x; }), [lastX]);
  var lineW = 1;
  var bornNow = [];
  var currentNow = [];
  // Last values written to each stop's --p, --pw and --d custom properties.
  var lastP = [];
  var lastPw = [];
  var lastD = [];
  function nowFraction(time) {
    // Phones, tapped: the fill reaches each dot at that room's resting
    // frame, so a tap always leaves the tip on a dot (TJ, 23 Oct 2026).
    var kt = tapFlow() ? [DOOR].concat(STATIONS.slice(1), [DURATION]) : knotT;
    var kx = knotX;
    if (time <= kt[0]) return kx[0];
    for (var k = 1; k < kt.length; k++) {
      if (time <= kt[k]) return kx[k - 1] + (kx[k] - kx[k - 1]) * (time - kt[k - 1]) / (kt[k] - kt[k - 1]);
    }
    return kx[kx.length - 1];
  }
  function layoutRoute() {
    if (!route || !stopEls.length) return;
    lineW = route.clientWidth || innerWidth;
    if (routeEnd) routeEnd.style.left = (END_X * lineW).toFixed(1) + 'px';
    if (routeHome) routeHome.style.left = (HOUSE_X * lineW).toFixed(1) + 'px';
    var isPhone = innerWidth < 768;
    // Phones (TJ, 16 Oct 2026): the words leave the dots and sit as one
    // block under the line, so the CSS needs each stop's offset (--x) and
    // the line's width (--lw) to pull them back to the line's left edge.
    route.style.setProperty('--lw', lineW.toFixed(1) + 'px');
    // desktop arrows sit just outside the line's ends, but never past the
    // window's edge: on narrow windows they move in over the line's soft ends
    var routeLeft = route.getBoundingClientRect().left;
    route.style.setProperty('--arrow-band', Math.max(0, Math.min(64, Math.round(routeLeft - 4))) + 'px');
    stopEls.forEach(function (li, i) {
      var x = ROUTE_STOPS[i].x;
      var side = isPhone ? (x < 0.5 ? 'right' : 'left') : ROUTE_STOPS[i].side;
      li.style.left = (x * lineW).toFixed(1) + 'px';
      li.style.setProperty('--x', (x * lineW).toFixed(1) + 'px');
      li.classList.toggle('is-right', side === 'right');
      li.classList.toggle('is-left', side === 'left');
      // the words never run past the line's end or into its fading edge
      var room = (side === 'right' ? lineW * (1 - x) : lineW * x) - 16 - lineW * 0.04;
      li.style.setProperty('--room', Math.max(150, room).toFixed(0) + 'px');
      // Titles sit on one line (TJ, 15 Oct 2026). Where a title is wider than
      // the room beside its stem (phones), it is nudged along the line just
      // enough to stay inside the line's width, never clipped or wrapped.
      // Measured, not predicted: an overflowing block cannot right align
      // itself, so the title's real position is read and corrected.
      var mask = li.querySelector('.route__head .route__mask, .route__name .route__mask');
      li.style.setProperty('--tshift', '0px');
      if (mask && !isPhone) {
        var rr = route.getBoundingClientRect();
        var mr = mask.getBoundingClientRect();
        var tw = mr.width;
        var dotX = x * lineW;
        var want = side === 'right' ? dotX + 16 : dotX - 16 - tw;
        // clear of the line's soft ends (--fade, 8 percent, 6 on phones);
        // a title too long for the space between them is centred
        var fadeVal = getComputedStyle(route).getPropertyValue('--fade').trim();
        var m = fadeVal.slice(-1) === '%' ? lineW * parseFloat(fadeVal) / 100 : (parseFloat(fadeVal) || 0);
        want = tw > lineW - 2 * m ? (lineW - tw) / 2 : Math.max(m, Math.min(lineW - m - tw, want));
        li.style.setProperty('--tshift', (want - (mr.left - rr.left)).toFixed(0) + 'px');
      }
    });
    bornNow = [];
    currentNow = [];
  }
  // Writes a stop's ramp variable only when it has moved by more than 0.001, so a
  // paint that changes nothing for this stop costs no style write.
  // Titles after the stop (TJ, 9 Nov 2026; the kitchen first, then every room
  // in ENHANCED): on a leg that ends at one of these rooms, forward or back,
  // its stem and title stay down while the film moves (holdStop, set in
  // startTween; the line, tip and dot run as before). At landing they rise
  // over the still's dissolve: --p over 600ms ease out, --pw 120ms later.
  var holdStop = -1;
  var revealTimer = 0, revealEl = null;
  function clearReveal() {
    clearTimeout(revealTimer);
    if (revealEl) revealEl.style.transition = '';
    revealEl = null;
  }
  function revealStop(j, time) {
    var li = stopEls[j];
    if (!li) return;
    clearReveal();
    holdStop = -1;
    li.style.transition = 'none';
    writeRamp(lastP, j, '--p', 0);
    writeRamp(lastPw, j, '--pw', 0);
    // settle the zero first, so the rise starts from it
    void getComputedStyle(li).getPropertyValue('--p');
    void li.offsetWidth;
    li.style.transition = '--p 600ms ease-out 0ms, --pw 600ms ease-out 120ms';
    revealEl = li;
    paintRoute(time);
    revealTimer = setTimeout(clearReveal, 800);
  }
  function writeRamp(cache, i, name, value) {
    if (cache[i] !== undefined && Math.abs(cache[i] - value) <= 0.001) return;
    cache[i] = value;
    stopEls[i].style.setProperty(name, value.toFixed(3));
  }
  // Runs on every paint: the ramps follow film time exactly, so scrolling stops them
  // and scrolling back runs them back.
  function paintRoute(time) {
    if (!route || !stopBtns.length) return;
    var o = (TAP ? 1 : smooth((time - ROUTE_IN) / 0.5)) * (1 - smooth((time - ROUTE_OUT) / 0.8));
    route.style.opacity = o.toFixed(3);
    // tapped on a desktop layout: the foot fade is baked into the desktop films (8 Nov 2026)
    if (routeWash && !bakedFade) routeWash.style.opacity = o.toFixed(3);
    route.style.visibility = o > 0.01 ? 'visible' : 'hidden';
    route.classList.toggle('is-live', o > 0.5);
    var f = nowFraction(time);
    if (HELD && handE > 0) f = X_PIN + (END_X - X_PIN) * handE;
    if (routeEnd) {
      var endD = HELD ? smooth(handE / 0.08) : 0;
      if (Math.abs(endD - lastEndD) > 0.001) { lastEndD = endD; routeEnd.style.setProperty('--d', endD.toFixed(3)); }
    }
    routeFill.style.transform = 'scaleX(' + f.toFixed(4) + ')';
    routeTip.style.transform = 'translate3d(' + (f * lineW).toFixed(1) + 'px,0,0)';
    var cur = -1;
    for (var i = 0; i < stopEls.length; i++) {
      if (time >= WINDOWS[i][0] && time < WINDOWS[i][1]) cur = i;
    }
    for (var j = 0; j < stopEls.length; j++) {
      var win = WINDOWS[j];
      var bj = tapFlow() ? STATIONS[j + 1] - 0.05 : births[j];   // phones: red as the tip arrives
      var born = time >= bj;
      var isCur = j === cur;
      if (born !== bornNow[j]) { bornNow[j] = born; stopEls[j].classList.toggle('is-born', born); }
      if (isCur !== currentNow[j]) {
        currentNow[j] = isCur;
        stopEls[j].classList.toggle('is-current', isCur);
        stopBtns[j].tabIndex = isCur ? 0 : -1;
        stopBtns[j].setAttribute('aria-expanded', String(isCur));
        if (isCur) stopBtns[j].setAttribute('aria-current', 'step'); else stopBtns[j].removeAttribute('aria-current');
      }
      var fall = smooth((win[1] - time) / 0.3);
      var p = smooth((time - win[0]) / 0.3) * fall;
      var pw = smooth((time - win[0] - 0.08) / 0.3) * fall;
      var d = smooth((time - bj) / 0.15);
      if (j === holdStop) { p = 0; pw = 0; }
      writeRamp(lastP, j, '--p', p);
      writeRamp(lastPw, j, '--pw', pw);
      writeRamp(lastD, j, '--d', d);
    }
  }

  function attachClip(source) {
    video.addEventListener('loadeddata', function loaded() {
      video.removeEventListener('loadeddata', loaded);
      video.currentTime = Math.max(0.001, target);
      var promise = video.play();
      var stop = function () {
        video.pause();
        ready = true;
        stage.classList.add('has-clip');
      };
      if (promise && promise.then) promise.then(stop, stop); else stop();
    });
    video.preload = 'auto';
    video.src = source;
    video.load();
  }

  function loadClip() {
    if (reduced) return;
    if (TAP) {
      // no long film: the continuous tapped film and its reversed copy
      stage.classList.add('is-tap');
      ready = true;
      if (!fwd || !rev) return;
      var key = clipSuffix ? 'srcMobile' : 'src';
      if (clipSuffix) fwd.poster = '../assets/img/home-flight-legs-poster-m.webp';
      preloadSharp();
      // Preroll (8 Nov 2026): a cold decoder stalled the first leg on phones
      // by a frame or two. The reversed film, held on the same house frame,
      // covers the forward one while it runs a few frames unseen and rewinds;
      // only then are taps taken.
      var primed = false;
      var prime = function () {
        seekTo(rev, revTime(0), function () {
          rev.classList.add('is-on');
          var back = function () {
            fwd.pause();
            seekTo(fwd, MARKS[0], function () {
              requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                  rev.classList.remove('is-on');
                  filmsReady = true;
                  startBreath();
                  showSharp(0);
                  warmSharp(0);
                });
              });
            });
          };
          var pr = fwd.play();
          if (pr && pr.then) pr.then(function () { setTimeout(back, 160); }, back); else setTimeout(back, 160);
        });
      };
      var check = function () {
        if (primed || fwd.readyState < 3 || rev.readyState < 3) return;
        primed = true;
        if (stationIdx === 0) prime(); else { filmsReady = true; startBreath(); showSharp(stationIdx); warmSharp(stationIdx); parkRev(stationIdx); }
      };
      [fwd, rev].forEach(function (el) {
        el.addEventListener('canplaythrough', check);
        el.addEventListener('canplay', check);
        el.preload = 'auto';
        el.src = el.dataset[key];
        el.load();
      });
      return;
    }
    var source = phone || !finePointer ? video.dataset.srcMobile : video.dataset.src;
    var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (local && window.fetch) {
      fetch(source).then(function (response) { if (!response.ok) throw new Error(response.status); return response.blob(); })
        .then(function (blob) { attachClip(URL.createObjectURL(blob)); })
        .catch(function () { attachClip(source); });
    } else attachClip(source);
  }

  function layout() {
    vh = stage.offsetHeight || innerHeight;
    section.style.height = Math.round((LEAD_VH + TRACK_VH + 1) * vh) + 'px';
    // the hand over: give back the stage's own window and the track past
    // PIN_T, so the confinement act starts at PIN_T over the held film
    section.style.marginBottom = HELD ? -Math.round((1 + TRACK_VH - PIN_VH) * vh) + 'px' : '';
    // the reveal: give back the stage's own window plus REVEAL_VH, so the
    // next section's top meets the window's top REVEAL_VH before the film ends
    revealing = !HELD && !reduced && REVEAL_VH > 0 && !!revealNext && revealNext.classList.contains('is-live');
    section.classList.toggle('is-reveal', revealing);
    if (revealing) section.style.marginBottom = -Math.round((1 + REVEAL_VH) * vh) + 'px';
    // Home since 8 Nov 2026 (TJ): give back the stage's own blank window at the end,
    // so the next section comes up as the film finishes dissolving (data-tail-vh).
    else if (!HELD && !reduced && section.dataset.tailVh) section.style.marginBottom = -Math.round(parseFloat(section.dataset.tailVh) * vh) + 'px';
    // trackTop is where scrubbing starts, after the lead, so every
    // scrollTo below that adds a track position to it stays correct.
    trackTop = section.getBoundingClientRect().top + scrollY + LEAD_VH * vh;
    if (TAP) {
      // one window, no scroll track: the film is moved by taps
      section.style.height = Math.round(vh) + 'px';
      section.style.marginBottom = '';
      revealing = false;
      section.classList.remove('is-reveal');
    }
    syncBake();
    sizeGhost();
    layoutRoute();
    lastPaint = -1;
  }

  // True once scroll has carried the page past the flight's own sticky
  // stage into whatever comes next; used only to drop the flight's
  // Enquire button and hand the nav's own one back, since track/target
  // themselves stay pinned at their max and cannot tell the two apart.
  var pastFlight = false;
  function updateFromScroll() {
    if (playing) return;
    var raw = (pos() - trackTop) / vh;
    var track = clamp(raw, 0, TRACK_VH);
    // The section carries an extra +1vh of height past TRACK_VH on
    // purpose (see layout()), runway after the scrubbing itself maxes
    // out and before the next section visually arrives. The button
    // should stay up for all of that too, not drop the instant the
    // video's own scrub distance is exhausted.
    // With the hand over, the act takes the window where the track ends.
    pastFlight = pos() - trackTop >= (HELD ? TRACK_VH : TRACK_VH + 1) * vh;
    var nextDesired = raw < 0 ? timeForLead(raw) : timeForTrack(track);
    var direct = performance.now() < wheelUntil || performance.now() < keyUntil || performance.now() < tapUntil || touchActive;
    desired = nextDesired;
    clearTimeout(settleTimer);
    if (direct) {
      target = desired;
      inputMode = 'direct';
    } else {
      target = clamp(target + (desired - target) * 0.4, 0, DURATION);
      inputMode = 'scrollbar';
      settleTimer = setTimeout(function () {
        target = desired;
        inputMode = 'settled';
      }, 140);
    }
    lastDesired = desired;
  }

  var lastMx = '', lastMy = '';
  function frame() {
    // while a leg plays its transitions carry the route, so no paint
    if (!playing && Math.abs(target - lastPaint) > 0.0001) {
      paint(target);
      lastPaint = target;
    }
    paintFlightEnquire();
    paintStep();
    if (!TAP && !playing && ready && !video.seeking && Math.abs(video.currentTime - target) > DEAD_BAND) video.currentTime = target;
    drawGhost();

    // the pointer drift holds still while a leg plays and only writes on a change
    if (finePointer && !reduced && !playing) {
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;
      var sx = mx.toFixed(3), sy = my.toFixed(3);
      if (sx !== lastMx) { lastMx = sx; stage.style.setProperty('--mx', sx); }
      if (sy !== lastMy) { lastMy = sy; stage.style.setProperty('--my', sy); }
    }
    requestAnimationFrame(frame);
  }

  stopBtns.forEach(function (btn, i) {
    var go = function () {
      var scene = SCENES.filter(function (s) { return s.name === stopEls[i].dataset.stop; })[0];
      if (scene && TAP) { locked = true; playLegs(STATIONS.indexOf(scene.rest)); }
      else if (scene) window.scrollTo({ top: trackTop + trackForTime(scene.time) * vh, behavior: reduced ? 'auto' : 'smooth' });
    };
    btn.addEventListener('click', go);
    stopEls[i].querySelector('.route__dot').addEventListener('click', go);
  });

  if (finePointer && !reduced) {
    addEventListener('pointermove', function (event) {
      tmx = clamp(event.clientX / innerWidth * 2 - 1, -1, 1);
      tmy = clamp(event.clientY / innerHeight * 2 - 1, -1, 1);
    }, { passive: true });
  }

  function nearestRestTime(time) {
    var best = SCENES[0], bestDist = Infinity;
    for (var i = 0; i < SCENES.length; i++) {
      var dist = Math.abs(SCENES[i].rest - time);
      if (dist < bestDist) { bestDist = dist; best = SCENES[i]; }
    }
    return best.rest;
  }

  // The phone settle (fixed 16 Oct 2026). It used to fire 120ms after ANY
  // scroll event and snap to the nearest rest, and one swipe (about a
  // second of film) is less than half the gap between rests, so every
  // swipe was pulled straight back to the door: the film could not be
  // scrolled on a phone at all. Now it waits for the scroll to have truly
  // stopped (no scroll events for SETTLE_IDLE ms, and no touch or wheel
  // live), and only settles when the film is already within SETTLE_REACH
  // seconds of a rest, so a reader who has moved on is never dragged back.
  var SETTLE_IDLE = 420;
  var SETTLE_REACH = 0.9;
  var restSettleTimer = 0;
  var restSettling = false;
  var settleArmed = false;   // only a touch arms the settle; a wheel never does
  function scheduleRestSettle() {
    if (TAP || !phone || restSettling || !settleArmed || tapFlow()) return;
    clearTimeout(restSettleTimer);
    restSettleTimer = setTimeout(function () {
      if (touchActive) { scheduleRestSettle(); return; }
      var track = clamp((scrollY - trackTop) / vh, 0, TRACK_VH);
      // never past the pin's start: from there the act's pin owns the scroll
      if (track <= 0 || track >= (HELD ? PIN_VH : TRACK_VH)) return;
      var now = timeForTrack(track);
      var restTime = nearestRestTime(now);
      if (Math.abs(restTime - now) > SETTLE_REACH || Math.abs(restTime - now) < 0.03) return;
      restSettling = true;
      window.scrollTo({ top: trackTop + trackForTime(restTime) * vh, behavior: reduced ? 'auto' : 'smooth' });
      setTimeout(function () { restSettling = false; }, 600);
    }, SETTLE_IDLE);
  }

  // ---- Phones: a tapped flight (TJ, 23 Oct 2026) ----
  // Once the reader reaches the film it holds: a drag no longer scrubs it.
  // Back and next under the saying play it one room at a time (the door,
  // then the four rooms). A clear swipe leaves the film the way it points,
  // and next on the last room plays the film out and carries on down the
  // page. The page is still moved by scrolling under the hood, so the film,
  // the line and everything after them work exactly as before.
  var stepBox = section.querySelector('[data-route-step]');
  var stepBack = stepBox ? stepBox.querySelector('[data-step="-1"]') : null;
  var stepNext = stepBox ? stepBox.querySelector('[data-step="1"]') : null;
  var STATIONS = [DOOR].concat(['kitchen', 'living', 'nursery', 'treatment'].map(function (n) {
    return SCENES.filter(function (s) { return s.name === n; })[0].rest;
  }));
  var locked = false, tweening = false, tweenRaf = 0, snapTimer = 0;
  var swipeY = null, swipeLocked = false;
  function tapFlow() { return (phone || TAP) && !reduced && !!stepBox; }
  function yForTime(time) { return trackTop + trackForTime(time) * vh; }
  // Where next on the last room comes to rest: the next section, just
  // under the header.
  function landingY() {
    var next = section.nextElementSibling;
    while (next && (next.hidden || next.offsetHeight === 0)) next = next.nextElementSibling;
    var navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 0;
    return next ? next.getBoundingClientRect().top + scrollY - navH : trackTop + TRACK_VH * vh + 2;
  }
  function lastY() { return yForTime(STATIONS[STATIONS.length - 1]); }
  // The hold runs from the door to just above the landing, so the film's
  // tail after the last room is part of it: coming back up from Mother and
  // Baby Care, one swipe is caught and carried back to the last room
  // (TJ, 23 Oct 2026).
  function inHold(y) {
    return y >= yForTime(STATIONS[0]) - 0.25 * vh && y < landingY() - 4;
  }
  var tailPending = false;
  function catchTail() {
    tailPending = false;
    if (TAP || tweening || !inHold(scrollY) || scrollY <= lastY() + 0.25 * vh) return false;
    goStation(STATIONS.length - 1);
    return true;
  }
  function stationNow() {
    var best = 0, d = Infinity;
    for (var i = 0; i < STATIONS.length; i++) {
      var di = Math.abs(STATIONS[i] - target);
      if (di < d) { d = di; best = i; }
    }
    return best;
  }
  function tweenTo(y, ms, done) {
    cancelAnimationFrame(tweenRaf);
    tweening = true;
    var from = pos(), t0 = performance.now();
    tapUntil = t0 + ms + 250;
    (function step(now) {
      var k = clamp((now - t0) / ms, 0, 1);
      var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      setPos(from + (y - from) * e);
      if (k < 1) tweenRaf = requestAnimationFrame(step);
      else { tweening = false; if (done) done(); }
    })(t0);
  }
  // film seconds to milliseconds: a room to the next takes about two seconds
  function msFor(fromTime, toTime) { return clamp(Math.abs(toTime - fromTime) * 420, 600, 2600); }
  function goStation(i) {
    i = clamp(i, 0, STATIONS.length - 1);
    locked = true;
    if (TAP) { playLegs(i); return; }
    tweenTo(yForTime(STATIONS[i]), msFor(target, STATIONS[i]));
  }
  // After the last room the film plays out and the page comes to rest at
  // the start of the next section, Mother and Baby Care (TJ, 23 Oct 2026).
  function leaveDown() {
    locked = false;
    if (TAP) {
      // play the film out, carry the page on to the next section, then set
      // the flight back to its start, ready for Start again
      tweenTo(trackTop + TRACK_VH * vh, msFor(target, DURATION), function () {
        window.scrollTo({ top: landingY(), behavior: 'smooth' });
        setTimeout(function () { vraw = -LEAD_VH; updateFromScroll(); }, 1200);
      });
      return;
    }
    tweenTo(landingY(), msFor(target, DURATION) + 700);
  }
  function leaveUp() {
    locked = false;
    if (TAP) { playLegs(0); return; }
    tweenTo(Math.max(0, trackTop - (LEAD_VH + 0.6) * vh), 900);
  }
  // Tapped (TJ, 8 Nov 2026): the house, with "Fly through the service" up,
  // is the first stop; the four rooms follow. The house has only next, the
  // last room only back; the page itself is scrolled on by the reader.
  function tapIndex() { return playing ? playing.to : stationIdx; }
  function step(dir) {
    if (!tapFlow() || playing) return;
    if (TAP) {
      var t = tapIndex() + dir;
      if (t <= 0) leaveUp();
      else if (t < STATIONS.length) goStation(t);
      return;
    }
    var i = stationNow() + dir;
    if (i < 0) return;
    if (i >= STATIONS.length) leaveDown(); else goStation(i);
  }
  function paintStep() {
    if (!tapFlow() || !stepBack) return;
    if (TAP) {
      var t = tapIndex();
      stepBack.classList.toggle('is-gone', t === 0);
      stepNext.classList.toggle('is-gone', t === STATIONS.length - 1);
      return;
    }
    stepBack.disabled = stationNow() === 0;
  }
  // Ami via TJ, 14 Nov 2026, "Click" hint beside the next arrow until the first click.
  var stepHint = stepBox ? stepBox.querySelector('[data-route-hint]') : null;
  function dropHint() {
    if (!stepHint) return;
    var h = stepHint; stepHint = null;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { h.hidden = true; return; }
    h.classList.add('is-off');
    setTimeout(function () { h.hidden = true; }, 300);
  }
  // The word is a second target for the next arrow: same click, so the step and dropHint both run.
  if (stepHint && stepNext) stepHint.addEventListener('click', function () { stepNext.click(); });
  if (stepBack) stepBack.addEventListener('click', dropHint);
  if (stepNext) stepNext.addEventListener('click', dropHint);
  if (stepBack) stepBack.addEventListener('click', function () { step(-1); });
  if (stepNext) stepNext.addEventListener('click', function () { step(1); });
  // Arriving by scroll: once the page comes to rest inside the film, it
  // settles on the nearest room and holds.
  addEventListener('scroll', function () {
    if (TAP || !tapFlow() || tweening) return;
    if (!inHold(scrollY)) { locked = false; clearTimeout(snapTimer); return; }
    // in the tail: straight back to the last room, once the finger is off
    if (!locked && scrollY > lastY() + 0.25 * vh) {
      locked = true;
      if (touchActive) tailPending = true; else catchTail();
      return;
    }
    locked = true;
    clearTimeout(snapTimer);
    snapTimer = setTimeout(function () {
      if (touchActive || tweening || !inHold(scrollY)) return;
      var i = stationNow();
      if (Math.abs(scrollY - yForTime(STATIONS[i])) > 2) goStation(i);
    }, 180);
  }, { passive: true });
  addEventListener('touchstart', function (e) {
    swipeLocked = !TAP && tapFlow() && locked && !tweening;
    swipeY = e.touches[0].clientY;
  }, { passive: true });
  addEventListener('touchmove', function (e) {
    if (swipeLocked && e.cancelable) e.preventDefault();
  }, { passive: false });
  addEventListener('touchend', function (e) {
    if (tailPending) { swipeY = null; if (catchTail()) return; }
    if (!swipeLocked || swipeY === null) return;
    var dy = e.changedTouches[0].clientY - swipeY;
    swipeY = null;
    if (dy < -70) leaveDown(); else if (dy > 70) leaveUp();
  }, { passive: true });

  addEventListener('wheel', function () { wheelUntil = performance.now() + 350; settleArmed = false; clearTimeout(restSettleTimer); }, { passive: true, capture: true });
  addEventListener('touchstart', function () { touchActive = true; settleArmed = true; clearTimeout(restSettleTimer); }, { passive: true, capture: true });
  addEventListener('touchend', function () { touchActive = false; scheduleRestSettle(); }, { passive: true, capture: true });
  addEventListener('touchcancel', function () { touchActive = false; }, { passive: true, capture: true });
  addEventListener('keydown', function () { keyUntil = performance.now() + 350; }, { capture: true });
  addEventListener('scroll', updateFromScroll, { passive: true });
  addEventListener('scroll', scheduleRestSettle, { passive: true });

  // phone is read once above for things that cannot change mid-session
  // without breaking playback (which video file loaded) or degrading
  // gently on their own (the ghost canvas). The route's spacing changes
  // with the breakpoint, so crossing it re-measures the track.
  phoneQuery.addEventListener('change', function (event) {
    phone = event.matches;
    syncBake();
    layoutRoute();
    lastPaint = -1;
  });

  addEventListener('resize', layout);
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  // The hero and bath now sit above the flight, and their pin spacers are
  // added or resized whenever ScrollTrigger refreshes. Re-measure the
  // flight's start then too, or trackTop is left pointing at the old origin.
  // refreshInit runs before ScrollTrigger measures, so every pin below the
  // film (the confinement act's) is measured against the current heights
  // and margin; refresh runs after, for trackTop, which depends on the pin
  // spacers ScrollTrigger has just placed above the film.
  if (window.ScrollTrigger) {
    ScrollTrigger.addEventListener('refreshInit', layout);
    ScrollTrigger.addEventListener('refresh', layout);
  }

  layout();
  updateFromScroll();
  paint(0);
  requestAnimationFrame(frame);
  if (document.readyState === 'complete') loadClip(); else addEventListener('load', loadClip);

  window.__flight = {
    T: TRACK_VH,
    scenes: SCENES,
    state: function () {
      var track = clamp((pos() - trackTop) / vh, 0, TRACK_VH);
      return { t: track, progress: track / TRACK_VH, target: target, desired: desired, inputMode: inputMode,
        current: video.currentTime || 0, ready: reduced || ready, vh: vh, top: trackTop,
        duration: DURATION, trackVh: TRACK_VH, endVh: TRACK_VH, pinVh: HELD ? PIN_VH : TRACK_VH, pinT: PIN_T, held: HELD };
    },
    // the tapped film's own state, for tests
    tap: function () { return { playing: !!playing, station: stationIdx, ready: filmsReady }; },
    scrollToT: function (track) { window.scrollTo({ top: trackTop + clamp(track, 0, TRACK_VH) * vh, behavior: 'instant' }); },
    // the hand over's route, from the confinement pin (home.js)
    setHandover: function (e) { if (Math.abs(e - handE) < 0.0005) return; handE = e; lastPaint = -1; },
    setRouteOut: function (r) { if (Math.abs(r - routeOut) < 0.0005) return; routeOut = r; lastPaint = -1; },
    route: function () { return { fill: nowFraction(target), handE: handE, routeOut: routeOut, xPin: X_PIN, endX: END_X }; },
    scrollToTime: function (time) { window.scrollTo({ top: trackTop + trackForTime(time) * vh, behavior: 'instant' }); }
  };
})();
