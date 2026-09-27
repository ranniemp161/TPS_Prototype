/* Homepage house flight: one native scroll distance maps linearly to one film time. */
(function () {
  'use strict';

  var section = document.querySelector('[data-flight]');
  if (!section) return;
  var stage = section.querySelector('[data-stage]');
  var video = section.querySelector('[data-video]');
  var posters = [].slice.call(section.querySelectorAll('[data-poster]'));
  var beats = [].slice.call(section.querySelectorAll('[data-beat]'));
  var rooms = [].slice.call(section.querySelectorAll('[data-room]'));
  var dot = section.querySelector('[data-plan-dot]');
  var ghost = section.querySelector('[data-ghost]');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = matchMedia('(max-width: 767px)').matches;
  var finePointer = matchMedia('(pointer: fine)').matches;

  var DURATION = 26.98;
  var TRACK_VH = 15.6;
  var DEAD_BAND = phone || !finePointer ? 0.025 : 0.01;

  function tc(seconds, frames) { return seconds + frames / 30; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function mix(a, b, amount) { return a + (b - a) * amount; }
  function smooth(value) { value = clamp(value, 0, 1); return value * value * (3 - 2 * value); }

  var SCENES = [
    { name: 'handover', beat: 'handover', time: 0, rest: 0, fx: 50, dot: [112, 148] },
    { name: 'exterior', beat: 'exterior', time: tc(2, 11.5), rest: tc(2, 9), fx: 50, dot: [112, 148] },
    { name: 'kitchen', beat: 'kitchen', time: (tc(6, 28) + tc(7, 25)) / 2, rest: tc(6, 28), fx: 66, dot: [140, 120], room: 'kitchen' },
    { name: 'living', beat: 'living', time: (tc(11, 16) + tc(12, 6)) / 2, rest: tc(11, 16), fx: 78, dot: [60, 120], room: 'living' },
    { name: 'nursery', beat: 'nursery', time: (tc(16, 8) + tc(17, 10)) / 2, rest: tc(16, 8), fx: 18, dot: [60, 80], room: 'nursery' },
    { name: 'treatment', beat: 'bedroom', time: (tc(21, 19) + tc(22, 12)) / 2, rest: tc(21, 19), fx: 52, dot: [140, 80], room: 'bedroom' },
    { name: 'exit', beat: 'sky', time: DURATION, rest: DURATION, fx: 50, dot: [196, 70] }
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
    var x = mix(a.dot[0], b.dot[0], pair.amount);
    var y = mix(a.dot[1], b.dot[1], pair.amount);
    if (dot) { dot.setAttribute('cx', x.toFixed(1)); dot.setAttribute('cy', y.toFixed(1)); }

    var planOpacity = smooth((time - 2.7) / 0.8) * (1 - smooth((time - 24.8) / 0.8));
    stage.style.setProperty('--plan-o', planOpacity.toFixed(3));
    stage.style.setProperty('--plan-v', planOpacity > 0.01 ? 'visible' : 'hidden');
    stage.style.setProperty('--blend', smooth((time - 26.1) / 0.88).toFixed(3));
    stage.style.setProperty('--fx', phone ? mix(a.fx, b.fx, pair.amount).toFixed(1) + '%' : '50%');

    rooms.forEach(function (room) {
      room.setAttribute('aria-current', String(room.dataset.room === SCENES[current].room));
    });
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

  function updateFromScroll() {
    var track = clamp((scrollY - trackTop) / vh, 0, TRACK_VH);
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

  rooms.forEach(function (button) {
    button.addEventListener('click', function () {
      var scene = SCENES.find(function (item) { return item.room === button.dataset.room; });
      if (scene) window.scrollTo({ top: trackTop + trackForTime(scene.time) * vh, behavior: reduced ? 'auto' : 'smooth' });
    });
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
