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
  var stopEls = [].slice.call(section.querySelectorAll('[data-stop]'));
  // Each stop's button: the small name for Arrival, the large title for the rooms after it (TJ, 15 Oct 2026).
  var stopBtns = stopEls.map(function (li) { return li.querySelector('.route__name, .route__head'); });
  var flightEnquire = section.querySelector('[data-flight-enquire]');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phoneQuery = matchMedia('(max-width: 767px)');
  var phone = phoneQuery.matches;
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
  var HELD = !!turnAct && !matchMedia('(prefers-reduced-motion: reduce)').matches;
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
      desc: 'Three fresh meals are cooked in your kitchen every day, made for you, your family and your recovery.',
      zone: { top: '78%', left: '20%' } },
    { name: 'living', beat: 'living', time: (tc(11, 16) + tc(12, 6)) / 2, rest: tc(11, 16), fx: 78, room: 'living',
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
  var target = 0;
  var desired = 0;
  var lastDesired = 0;
  var wheelUntil = 0;
  var keyUntil = 0;
  var touchActive = false;
  var settleTimer = 0;
  var inputMode = 'native';
  var ready = false;
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
    var src = ready ? video : posters[posterOn];
    if (!src) return;
    var sw = ready ? video.videoWidth : src.naturalWidth;
    var sh = ready ? video.videoHeight : src.naturalHeight;
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

  function paint(time) {
    var current = sceneAt(time);
    if (current !== posterOn) {
      posters[posterOn] && posters[posterOn].classList.remove('is-on');
      posters[current] && posters[current].classList.add('is-on');
      posterOn = current;
    }

    beats.forEach(function (beat) {
      var i = SCENES.findIndex(function (scene) { return scene.beat === beat.dataset.beat; });
      var opacity = i < 0 ? 0 : beatOpacity(i, time);
      beat.style.opacity = opacity.toFixed(3);
      beat.style.visibility = opacity > 0.001 ? 'visible' : 'hidden';
      beat.classList.toggle('is-live', opacity > 0.5);
      beat.style.transform = 'none';
    });

    var pair = scenePair(time);
    var a = SCENES[pair.left], b = SCENES[pair.right];

    // the dissolve to canvas belongs to the film's own end, which the hand
    // over never reaches
    stage.style.setProperty('--blend', smooth((time - (26.1 - CUT)) / 0.88).toFixed(3));
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
  // --d on each stop; the CSS draws everything from those, no transitions).
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
  var ROUTE_OUT = 26.1 - CUT - 0.4;
  var ROUTE_STOPS = [
    { x: 0.08, side: 'right' },
    { x: 0.24, side: 'right' },
    { x: 0.42, side: 'right' },
    { x: 0.52, side: 'left' },
    { x: 0.72, side: 'left' }
  ];
  // Each stop's [in, out] window in film seconds, read from the footage (TJ, 14 Oct 2026), in
  // SCENES order, for the route's stops only: the route ends at the treatment room (The Window
  // is a film beat with no stop, TJ, 15 Oct 2026). A stop is current only inside its window.
  // Between windows (the hallway, 1.9 to 2.9, and the stretch after the treatment room, from 21.2)
  // no stop is current, and the route's own fade takes over at ROUTE_OUT.
  var WINDOWS = [
    [DOOR, 1.9],
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
  var knotT = [ROUTE_IN].concat(births, [HELD ? PIN_T : DURATION]);
  var knotX = [0].concat(ROUTE_STOPS.map(function (s) { return s.x; }), [HELD ? X_PIN : 1]);
  var lineW = 1;
  var bornNow = [];
  var currentNow = [];
  // Last values written to each stop's --p, --pw and --d custom properties.
  var lastP = [];
  var lastPw = [];
  var lastD = [];
  function nowFraction(time) {
    if (time <= knotT[0]) return 0;
    for (var k = 1; k < knotT.length; k++) {
      if (time <= knotT[k]) return knotX[k - 1] + (knotX[k] - knotX[k - 1]) * (time - knotT[k - 1]) / (knotT[k] - knotT[k - 1]);
    }
    return knotX[knotX.length - 1];
  }
  function layoutRoute() {
    if (!route || !stopEls.length) return;
    lineW = route.clientWidth || innerWidth;
    if (routeEnd) routeEnd.style.left = (END_X * lineW).toFixed(1) + 'px';
    var isPhone = innerWidth < 768;
    stopEls.forEach(function (li, i) {
      var x = ROUTE_STOPS[i].x;
      var side = isPhone ? (x < 0.5 ? 'right' : 'left') : ROUTE_STOPS[i].side;
      li.style.left = (x * lineW).toFixed(1) + 'px';
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
      if (mask) {
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
  function writeRamp(cache, i, name, value) {
    if (cache[i] !== undefined && Math.abs(cache[i] - value) <= 0.001) return;
    cache[i] = value;
    stopEls[i].style.setProperty(name, value.toFixed(3));
  }
  // Runs on every paint: the ramps follow film time exactly, so scrolling stops them
  // and scrolling back runs them back.
  function paintRoute(time) {
    if (!route || !stopBtns.length) return;
    var o = smooth((time - ROUTE_IN) / 0.5) * (HELD ? routeOut : 1 - smooth((time - ROUTE_OUT) / 0.8));
    route.style.opacity = o.toFixed(3);
    if (routeWash) routeWash.style.opacity = o.toFixed(3);
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
      var born = time >= births[j];
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
      var d = smooth((time - births[j]) / 0.15);
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
    // trackTop is where scrubbing starts, after the lead, so every
    // scrollTo below that adds a track position to it stays correct.
    trackTop = section.getBoundingClientRect().top + scrollY + LEAD_VH * vh;
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
    var raw = (scrollY - trackTop) / vh;
    var track = clamp(raw, 0, TRACK_VH);
    // The section carries an extra +1vh of height past TRACK_VH on
    // purpose (see layout()), runway after the scrubbing itself maxes
    // out and before the next section visually arrives. The button
    // should stay up for all of that too, not drop the instant the
    // video's own scrub distance is exhausted.
    // With the hand over, the act takes the window where the track ends.
    pastFlight = scrollY - trackTop >= (HELD ? TRACK_VH : TRACK_VH + 1) * vh;
    var nextDesired = raw < 0 ? timeForLead(raw) : timeForTrack(track);
    var direct = performance.now() < wheelUntil || performance.now() < keyUntil || touchActive;
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

  function frame() {
    if (Math.abs(target - lastPaint) > 0.0001) {
      paint(target);
      lastPaint = target;
    }
    paintFlightEnquire();
    if (ready && !video.seeking && Math.abs(video.currentTime - target) > DEAD_BAND) video.currentTime = target;
    drawGhost();

    if (finePointer && !reduced) {
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;
      stage.style.setProperty('--mx', mx.toFixed(3));
      stage.style.setProperty('--my', my.toFixed(3));
    }
    requestAnimationFrame(frame);
  }

  stopBtns.forEach(function (btn, i) {
    var go = function () {
      var scene = SCENES[i];
      if (scene) window.scrollTo({ top: trackTop + trackForTime(scene.time) * vh, behavior: reduced ? 'auto' : 'smooth' });
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
    if (!phone || restSettling || !settleArmed) return;
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
      var track = clamp((scrollY - trackTop) / vh, 0, TRACK_VH);
      return { t: track, progress: track / TRACK_VH, target: target, desired: desired, inputMode: inputMode,
        current: video.currentTime || 0, ready: reduced || ready, vh: vh, top: trackTop,
        duration: DURATION, trackVh: TRACK_VH, endVh: TRACK_VH, pinVh: HELD ? PIN_VH : TRACK_VH, pinT: PIN_T, held: HELD };
    },
    scrollToT: function (track) { window.scrollTo({ top: trackTop + clamp(track, 0, TRACK_VH) * vh, behavior: 'instant' }); },
    // the hand over's route, from the confinement pin (home.js)
    setHandover: function (e) { if (Math.abs(e - handE) < 0.0005) return; handE = e; lastPaint = -1; },
    setRouteOut: function (r) { if (Math.abs(r - routeOut) < 0.0005) return; routeOut = r; lastPaint = -1; },
    route: function () { return { fill: nowFraction(target), handE: handE, routeOut: routeOut, xPin: X_PIN, endX: END_X }; },
    scrollToTime: function (time) { window.scrollTo({ top: trackTop + trackForTime(time) * vh, behavior: 'instant' }); }
  };
})();
