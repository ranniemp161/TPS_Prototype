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
  var deskcard = section.querySelector('[data-deskcard]');
  var deskcardName = section.querySelector('[data-deskcard-name]');
  var deskcardDesc = section.querySelector('[data-deskcard-desc]');
  var cards = section.querySelector('[data-cards]');
  var cardEls = [].slice.call(section.querySelectorAll('[data-card]'));
  var flightEnquire = section.querySelector('[data-flight-enquire]');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phoneQuery = matchMedia('(max-width: 767px)');
  var phone = phoneQuery.matches;
  var finePointer = matchMedia('(pointer: fine)').matches;

  var DURATION = 26.98;
  var TRACK_VH = 15.6;
  var DEAD_BAND = phone || !finePointer ? 0.025 : 0.01;

  function tc(seconds, frames) { return seconds + frames / 30; }
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
    { name: 'handover', beat: 'handover', time: 0, rest: 0, fx: 50,
      desc: 'A warm hand-off, in the first minutes home.',
      zone: { top: '72%', left: '73%' } },
    { name: 'exterior', beat: 'exterior', time: tc(2, 11.5), rest: tc(2, 9), fx: 50,
      desc: 'Scroll and come in.',
      zone: { top: '86%', left: '14%' } },
    { name: 'kitchen', beat: 'kitchen', time: (tc(6, 28) + tc(7, 25)) / 2, rest: tc(6, 28), fx: 66, room: 'kitchen',
      desc: 'Warm, nourishing meals made in your own kitchen, so you eat well without lifting a thing.',
      zone: { top: '78%', left: '20%' } },
    { name: 'living', beat: 'living', time: (tc(11, 16) + tc(12, 6)) / 2, rest: tc(11, 16), fx: 78, room: 'living',
      desc: 'Laundry, ironing and the small daily jobs. The house keeps running while you rest.',
      zone: { top: '24%', left: '28%' } },
    { name: 'nursery', beat: 'nursery', time: (tc(16, 8) + tc(17, 10)) / 2, rest: tc(16, 8), fx: 18, room: 'nursery',
      desc: 'Feeds, settling and the long nights, so you can finally sleep.',
      zone: { top: '52%', left: '77%' }, panelAt: 14 },
    { name: 'treatment', beat: 'bedroom', time: (tc(21, 19) + tc(22, 12)) / 2, rest: tc(21, 19), fx: 52, room: 'bedroom',
      desc: 'Postpartum treatments at home, to help your body recover.',
      zone: { top: '20%', left: '20%' }, panelAt: 19 },
    { name: 'exit', beat: 'sky', time: DURATION, rest: DURATION, fx: 50,
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

  function trackForTime(time) { return time / DURATION * TRACK_VH; }
  function timeForTrack(track) { return clamp(track / TRACK_VH, 0, 1) * DURATION; }

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
  function panelIndexAt(time) {
    var index = 0;
    for (var i = 1; i <= 5; i++) {
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

    stage.style.setProperty('--blend', smooth((time - 26.1) / 0.88).toFixed(3));
    stage.style.setProperty('--fx', phone ? mix(a.fx, b.fx, pair.amount).toFixed(1) + '%' : '50%');

    if (phone) paintPhoneCards(current);
    else paintDeskCard(time);
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

  // Desktop: one panel, gliding. It is live from the first frame and
  // fades out approaching TREATMENT_FADE_AT, before the practitioner's
  // face would cross under it on the way to the window scene; it never
  // reappears after that, so exit has no panel of its own. Its own
  // switch points (panelIndexAt) run ahead of the video's scene changes
  // by design; it does not take current from sceneAt.
  //
  // Shape: the panel pinches down to PANEL_H_MIN for most of the glide,
  // then opens back out to full height in the final PANEL_OPEN_SPAN of
  // it, eased rather than linear, so it reads as an arrival rather than
  // a size change. Driven every frame on the same 900ms clock as the
  // CSS top/left transition (GLIDE_MS below, kept equal to the CSS
  // value by hand since a JS clock can't read a CSS transition-duration
  // back out), not a separate wall-clock timer, so it can never drift
  // out of sync with the move itself.
  var GLIDE_MS = 900;
  var PANEL_H_MIN = 0.3;
  var PANEL_OPEN_SPAN = 0.15; // the last 15% of the glide
  function panelShapeAt(p) {
    var openStart = 1 - PANEL_OPEN_SPAN;
    if (p < openStart) return PANEL_H_MIN;
    var t = smooth((p - openStart) / PANEL_OPEN_SPAN);
    return PANEL_H_MIN + (1 - PANEL_H_MIN) * t;
  }

  var deskLiveIndex = -1;
  var deskGlideStart = 0;
  var deskGlideRunning = false;
  function runDeskGlide() {
    var p = clamp((performance.now() - deskGlideStart) / GLIDE_MS, 0, 1);
    deskcard.style.setProperty('--panel-h', panelShapeAt(p).toFixed(3));
    if (p >= 1) { deskGlideRunning = false; return; }
    requestAnimationFrame(runDeskGlide);
  }

  function paintDeskCard(time) {
    if (!deskcard) return;
    var visible = time < TREATMENT_FADE_AT;
    var fadeOut = clamp(1 - (time - (TREATMENT_FADE_AT - 0.6)) / 0.6, 0, 1);
    var opacity = visible ? fadeOut : 0;
    stage.style.setProperty('--cards-o', opacity.toFixed(3));
    stage.style.setProperty('--cards-v', opacity > 0.01 ? 'visible' : 'hidden');
    deskcard.classList.toggle('is-live', opacity > 0.5);

    var clamped = panelIndexAt(time);
    if (clamped === deskLiveIndex) return;
    deskLiveIndex = clamped;
    var scene = SCENES[clamped];
    deskcard.style.top = scene.zone.top;
    deskcard.style.left = scene.zone.left;
    if (scene.room) deskcard.setAttribute('data-room', scene.room); else deskcard.removeAttribute('data-room');

    // The words fade out immediately, then back in once the shape curve
    // has finished opening, so they never appear on a still-thin bar or
    // read as sliding with the panel; only the panel itself moves.
    deskcard.style.setProperty('--deskcard-text-o', 0);
    deskcard.style.setProperty('--deskcard-text-delay', '0ms');
    // Names live once, in the phone cards' own markup; read from there
    // rather than duplicating a name map that could drift out of sync.
    var sourceCard = cardEls.filter(function (c) { return c.dataset.card === scene.name; })[0];
    var displayName = sourceCard ? sourceCard.querySelector('.cards__name').textContent : scene.name;

    deskGlideStart = performance.now();
    if (!deskGlideRunning) { deskGlideRunning = true; requestAnimationFrame(runDeskGlide); }

    setTimeout(function () {
      if (deskLiveIndex !== clamped) return; // a later scene has already taken over
      deskcardName.textContent = displayName;
      deskcardDesc.textContent = scene.desc;
      deskcard.style.setProperty('--deskcard-text-o', 1);
    }, GLIDE_MS);
  }

  // Phone: one fixed spot (PHONE_ZONE). A scene change slides the old
  // card out toward the side the swipe came from and the new one in from
  // the other; the position itself never changes, only which card sits
  // there and which side it arrived from.
  var OFFSTAGE = { left: '-140%', right: '140%' };
  function placePhoneCard(card, dir) {
    card.style.top = PHONE_ZONE.top;
    card.style.left = PHONE_ZONE.left;
    card.style.setProperty('--card-x', dir === 'left' ? OFFSTAGE.left : dir === 'right' ? OFFSTAGE.right : '0%');
    card.style.setProperty('--card-y', '0%');
  }

  var phoneLiveIndex = -1;
  function paintPhoneCards(current) {
    if (!cards || !cardEls.length) return;
    var cardsOpacity = 1 - smooth((SCENES[current].time - 24.8) / 0.8);
    stage.style.setProperty('--cards-o', cardsOpacity.toFixed(3));
    stage.style.setProperty('--cards-v', cardsOpacity > 0.01 ? 'visible' : 'hidden');
    if (cards) cards.classList.toggle('is-live', cardsOpacity > 0.5);

    if (current === phoneLiveIndex) return;
    var forward = phoneLiveIndex >= 0 && current > phoneLiveIndex;
    var backward = phoneLiveIndex >= 0 && current < phoneLiveIndex;
    var scene = SCENES[current];
    var card = cardEls.filter(function (c) { return c.dataset.card === scene.name; })[0];
    var outgoing = phoneLiveIndex >= 0
      ? cardEls.filter(function (c) { return c.dataset.card === SCENES[phoneLiveIndex].name; })[0]
      : null;
    phoneLiveIndex = current;
    if (!card) return;

    cardEls.forEach(function (c) { if (c !== card) c.classList.remove('is-live'); });

    if (outgoing && outgoing !== card) {
      // Leaves toward the side the swipe is heading, i.e. the opposite
      // side the new card is arriving from.
      placePhoneCard(outgoing, forward ? 'left' : backward ? 'right' : null);
      outgoing.style.setProperty('--card-o', 0);
    }

    if (forward || backward) {
      card.style.transition = 'none';
      placePhoneCard(card, forward ? 'right' : 'left');
      card.style.setProperty('--card-o', 1);
      requestAnimationFrame(function () {
        card.style.transition = '';
        card.style.setProperty('--card-x', '0%');
      });
    } else {
      placePhoneCard(card, null);
      card.style.setProperty('--card-o', 1);
    }
    card.classList.add('is-live');
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
    section.style.height = Math.round((TRACK_VH + 1) * vh) + 'px';
    trackTop = section.getBoundingClientRect().top + scrollY;
    sizeGhost();
  }

  // True once scroll has carried the page past the flight's own sticky
  // stage into whatever comes next; used only to drop the flight's
  // Enquire button and hand the nav's own one back, since track/target
  // themselves stay pinned at their max and cannot tell the two apart.
  var pastFlight = false;
  function updateFromScroll() {
    var track = clamp((scrollY - trackTop) / vh, 0, TRACK_VH);
    // The section carries an extra +1vh of height past TRACK_VH on
    // purpose (see layout()), runway after the scrubbing itself maxes
    // out and before the next section visually arrives. The button
    // should stay up for all of that too, not drop the instant the
    // video's own scrub distance is exhausted.
    pastFlight = scrollY - trackTop >= (TRACK_VH + 1) * vh;
    var nextDesired = timeForTrack(track);
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

  cardEls.filter(function (card) { return card.dataset.room; }).forEach(function (card) {
    card.addEventListener('click', function () {
      var scene = SCENES.find(function (item) { return item.room === card.dataset.room; });
      if (scene) window.scrollTo({ top: trackTop + trackForTime(scene.time) * vh, behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  if (deskcard) {
    deskcard.addEventListener('click', function () {
      var room = deskcard.dataset.room;
      if (!room) return;
      var scene = SCENES.find(function (item) { return item.room === room; });
      if (scene) window.scrollTo({ top: trackTop + trackForTime(scene.time) * vh, behavior: reduced ? 'auto' : 'smooth' });
    });
  }

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

  var restSettleTimer = 0;
  var restSettling = false;
  function scheduleRestSettle() {
    if (!phone || restSettling) return;
    clearTimeout(restSettleTimer);
    restSettleTimer = setTimeout(function () {
      var track = clamp((scrollY - trackTop) / vh, 0, TRACK_VH);
      if (track <= 0 || track >= TRACK_VH) return;
      var restTime = nearestRestTime(timeForTrack(track));
      restSettling = true;
      window.scrollTo({ top: trackTop + trackForTime(restTime) * vh, behavior: reduced ? 'auto' : 'smooth' });
      setTimeout(function () { restSettling = false; }, 500);
    }, 120);
  }

  addEventListener('wheel', function () { wheelUntil = performance.now() + 350; }, { passive: true, capture: true });
  addEventListener('touchstart', function () { touchActive = true; clearTimeout(restSettleTimer); }, { passive: true, capture: true });
  addEventListener('touchend', function () { touchActive = false; }, { passive: true, capture: true });
  addEventListener('touchcancel', function () { touchActive = false; }, { passive: true, capture: true });
  addEventListener('keydown', function () { keyUntil = performance.now() + 350; }, { capture: true });
  addEventListener('scroll', updateFromScroll, { passive: true });
  addEventListener('scroll', scheduleRestSettle, { passive: true });

  // phone is read once above for things that cannot change mid-session
  // without breaking playback (which video file loaded) or degrading
  // gently on their own (the ghost canvas). But which caption system is
  // live, .deskcard or .cards__card, has to track the real breakpoint:
  // testing by resizing a desktop Chrome window down to phone width
  // switches the CSS instantly but previously left the JS still running
  // desktop logic, so .deskcard sat there fully opaque and just hidden
  // by @media, and no phone card was ever marked live. A change listener
  // on the same query CSS uses, not a debounced resize, catches every
  // way the breakpoint gets crossed.
  phoneQuery.addEventListener('change', function (event) {
    phone = event.matches;
    deskLiveIndex = -1;
    phoneLiveIndex = -1;
    lastPaint = -1;
  });

  addEventListener('resize', layout);
  addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);

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
        duration: DURATION, trackVh: TRACK_VH };
    },
    scrollToT: function (track) { window.scrollTo({ top: trackTop + clamp(track, 0, TRACK_VH) * vh, behavior: 'instant' }); },
    scrollToTime: function (time) { window.scrollTo({ top: trackTop + trackForTime(time) * vh, behavior: 'instant' }); }
  };
})();
