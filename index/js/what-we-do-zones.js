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
/* The desktop master number (TJ, 15 Nov 2026): the root size over 16, so a
   fixed distance in pixels here scales with the rest of the page. tpsPx turns
   a length read from the styles (now in rem) into pixels. */
function tpsU() { return (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16) / 16; }
function tpsPx(v) { var n = parseFloat(v); if (isNaN(n)) return n; return /rem\s*$/.test(String(v).trim()) ? n * 16 * tpsU() : n; }
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
     stops dimmed, before any room lights (TJ, 11 Oct 2026); the rooms are tabs, and a tap swaps the
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
    // The start of the line (TJ, 11 Oct 2026): a small circle where the line rests,
    // smaller than the moving one; a tap on it returns to the whole house, no room lit.
    var home = document.createElement('button');
    home.type = 'button'; home.className = 'zones__home';
    home.setAttribute('aria-label', 'The whole house');
    tablist.appendChild(home);
    rooms.parentNode.replaceChild(tablist, rooms);
    var srList = line.querySelector('.sr-only');
    if (srList) srList.parentNode.removeChild(srList);
    line.appendChild(panels);

    var active = null, introDone = false, started = false, loaded = false;

    function placeMarker() {
      var t = tabs.filter(function (b) { return b.dataset.key === active; })[0];
      var rest = tabs.length ? Math.round(tabs[0].offsetLeft / 2) : 0;
      tablist.style.setProperty('--mr', rest + 'px');
      // No room chosen yet (TJ, 11 Oct 2026): the line rests in the start before the
      // rooms, half way to the first, a little already drawn; no room reached.
      if (!t) { tablist.style.setProperty('--mc', rest + 'px'); tabs.forEach(function (b) { b.classList.remove('is-past'); }); return; }
      // The line fills to the chosen room's centre, where the circle sits.
      tablist.style.setProperty('--mc', (t.offsetLeft + t.offsetWidth / 2) + 'px');
      var reached = true;
      tabs.forEach(function (b) { b.classList.toggle('is-past', reached); if (b === t) reached = false; });
    }
    function sizePanels() {
      var pn = panelEls.filter(function (e) { return e.dataset.key === active; })[0];
      panels.style.height = (pn ? pn.offsetHeight : 0) + 'px';
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
        b.tabIndex = on || (!key && b === tabs[0]) ? 0 : -1;
      });
      panelEls.forEach(function (e) { e.classList.toggle('is-active', e.dataset.key === key); });
      home.classList.toggle('is-home', !key);
      placeMarker(); sizePanels();
      // Back to nothing: the room's still fades and the film's unlit frame shows
      // again (or the first still, if the film never played).
      if (introDone) showStill(key || (stage.classList.contains('has-clip') ? null : 'intro'));
    }
    function finishIntro() {
      if (introDone) return;
      introDone = true;
      if (video && !video.paused) video.pause();
      if (title) title.classList.add('is-in');
      line.classList.add('is-in');
      if (active) showStill(active);
    }

    // Film seconds: the house dimmed, no room lit yet (TJ, 11 Oct 2026; the
    // living room starts to glow at about 3.7). Was 4.5, the living room lit.
    var STOP = 3.55;
    function loadVideo() {
      if (loaded || reduced || !video) return;
      loaded = true;
      video.preload = 'auto';
      video.src = video.dataset.srcMobile;
      video.load();
    }
    // The words never wait for the film (TJ, 9 Oct 2026, MOBILE-PLAN item 1): with
    // autoplay blocked (Low Power Mode, data saver) or a slow connection the film may
    // never pass one second, and the title and rooms stayed hidden. They now rise in
    // as the section arrives; the film plays behind them when it can.
    function showWords() {
      if (title) title.classList.add('is-in');
      line.classList.add('is-in');
      sizePanels();
    }
    function startIntro() {
      if (started) return;
      started = true;
      setTimeout(showWords, 350);
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
      // If the film cannot play, or starts and then stalls, settle on the lit room.
      setTimeout(function () { if (!introDone) finishIntro(); }, 8000);
    }

    home.addEventListener('click', function () { select(null); finishIntro(); });
    tablist.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.zones__tab') : null;
      if (!b) return;
      select(b.dataset.key);
      finishIntro();
    });
    tablist.addEventListener('keydown', function (e) {
      var i = tabs.map(function (b) { return b.dataset.key; }).indexOf(active), n = tabs.length, to = -1;
      if (e.key === 'ArrowRight') to = (i + 1) % n; else if (e.key === 'ArrowLeft') to = i < 0 ? n - 1 : (i + n - 1) % n;
      if (to < 0) return;
      e.preventDefault(); select(tabs[to].dataset.key); tabs[to].focus(); finishIntro();
    });

    // Nothing chosen until the reader taps a room (TJ, 11 Oct 2026).
    select(null);
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


  /* ---------- desktop: click driven (TJ, 17 Nov 2026) ----------
     As on phones: the section scrolls with the page like any other. When it
     comes into view the film plays its arrival once (the floors fly in as a
     drawing and fill with colour) and stops at STOP_D, the house in colour
     before any light goes down; the words rise in as it starts. The room list
     keeps its line, with an unlabelled stop at the top where the circle rests.
     A click on a room fades in that room's lit picture (the posters) over the
     film; the top stop fades back to the house in colour. With reduced motion,
     or a film that cannot play, the day poster stands in. The old scroll film
     is in git history before this date. */
  function initClick() {
    section.classList.add('zones--click');
    var title = section.querySelector('.zones__title'), line = section.querySelector('.zones__line');
    var list = section.querySelector('.zones__rooms');
    var btns = [].slice.call(section.querySelectorAll('[data-zroom]'));
    var posters = {};
    [].forEach.call(section.querySelectorAll('[data-zposter]'), function (el) { posters[el.dataset.zposter] = el; });
    var POSTER = { living: '1', kitchen: '2', nursery: '3' };
    var STOP_D = 3.3;
    if (!list || !btns.length) return;
    var fill = document.createElement('span'); fill.className = 'zones__fill'; fill.setAttribute('aria-hidden', 'true');
    var tip = document.createElement('span'); tip.className = 'zones__tip'; tip.setAttribute('aria-hidden', 'true');
    var home = document.createElement('button');
    home.type = 'button'; home.className = 'zones__home'; home.setAttribute('aria-label', 'The whole house');
    list.appendChild(fill); list.appendChild(tip); list.appendChild(home);
    var active = null, introDone = false, started = false, loaded = false;
    function place() {
      // The start: half way down the space above the first room, a little already drawn.
      var pad = btns[0].parentNode.offsetTop, bh = btns[0].offsetHeight, rest = Math.round(pad / 2);
      list.style.setProperty('--zh', bh + 'px');
      list.style.setProperty('--zr', rest + 'px');
      var i = btns.map(function (b) { return b.dataset.zroom; }).indexOf(active);
      // Rooms above the chosen one are closed, so its row sits at pad + i rows.
      list.style.setProperty('--zf', (i < 0 ? rest : pad + i * bh + bh / 2) + 'px');
      btns.forEach(function (b, k) { b.parentNode.classList.toggle('is-past', i >= 0 && k <= i); });
    }
    function paintPoster() {
      // A room's picture over the film; the house in colour is the film's own
      // last frame, or the day poster where the film never played.
      var want = active ? POSTER[active] : (stage.classList.contains('has-clip') ? null : (introDone ? '0' : null));
      Object.keys(posters).forEach(function (k) { posters[k].classList.toggle('is-on', k === want); });
    }
    function select(key) {
      active = key;
      btns.forEach(function (b) {
        var on = b.dataset.zroom === key;
        b.setAttribute('aria-current', String(on));
        b.setAttribute('aria-expanded', String(on));
        b.parentNode.classList.toggle('is-open', on);
      });
      home.classList.toggle('is-home', !key);
      place(); paintPoster();
    }
    function showWords() {
      if (title) title.classList.add('is-in');
      if (line) line.classList.add('is-in');
      place();
    }
    function finishIntro() {
      if (introDone) return;
      introDone = true;
      if (video && stage.classList.contains('has-clip')) { video.pause(); video.currentTime = STOP_D; }
      showWords(); paintPoster();
    }
    function loadVideo() {
      if (loaded || reduced || !video) return;
      loaded = true;
      video.preload = 'auto';
      video.src = video.dataset.src;
      video.load();
    }
    function startIntro() {
      if (started) return;
      started = true;
      setTimeout(showWords, 350);
      if (reduced || !video) { finishIntro(); return; }
      loadVideo();
      function watch() {
        if (introDone) return;
        if (video.currentTime >= STOP_D) { finishIntro(); return; }
        requestAnimationFrame(watch);
      }
      video.addEventListener('playing', function () { stage.classList.add('has-clip'); paintPoster(); }, { once: true });
      video.currentTime = 0;
      var pr = video.play();
      if (pr && pr.then) pr.then(function () { requestAnimationFrame(watch); }, finishIntro);
      else requestAnimationFrame(watch);
      // If the film cannot play, or starts and then stalls, settle on the house in colour.
      setTimeout(function () { if (!introDone) finishIntro(); }, 8000);
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { finishIntro(); select(b.dataset.zroom); }); });
    home.addEventListener('click', function () { finishIntro(); select(null); });
    select(null);
    addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { loadVideo(); o.disconnect(); } }, { rootMargin: '200% 0px' }).observe(stage);
      new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { startIntro(); o.disconnect(); } }, { threshold: 0.4 }).observe(stage);
    } else {
      finishIntro();
    }
  }
  initClick();
})();
