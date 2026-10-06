/* ============================================================
   THE POSTPARTUM SUITE — scroll narrative
   GSAP + ScrollTrigger. Seven acts, five device families,
   no family twice in a row.

   Motion rule inherited from the brand: calm before persuasive.
   Nothing here bounces, overshoots, or asks for attention.
   ============================================================ */

document.documentElement.classList.add('js');

/* Every pin on this page is measured against the document as it stands when
   the pin is built, and the hero handoff is the most sensitive of them: it
   depends on a -196svh margin, a pin spacer that does not exist yet, and a
   scene that has to be flush at the top of the window before it climbs.

   If the browser has already moved the window before that measurement, all
   of it is computed from the wrong origin and the handoff runs ahead of
   itself. Two things move it: an anchor in the URL, which the browser
   resolves at parse time against a document that has no pin spacers in it
   yet, and scroll restoration on reload.

   Measured: loading v1.html#programmes landed the window at scroll 243 and
   the frame at 1.2 viewport-heights then differed from a clean load across
   30% of its pixels, with the hero already consumed a third of a viewport
   early. Turning restoration off and taking the scroll back to zero before
   boot() builds anything removes the difference entirely.

   The anchor is not discarded, it is honoured after the refresh instead,
   which is also the first time it can land in the right place: before the
   pins exist the document is about four viewport-heights shorter than it
   ends up, so #programmes resolved to a position near the top of the page. */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE = 'power2.out';

// The mist handoff's total scroll length, in viewport-heights, and how long
// the hero stays pinned within it. Shared with nav() so the wordmark's own
// scroll-triggered change waits until this has fully resolved instead of
// firing mid-illusion.
//
// The pin ends exactly where the bath section's own sticky takes over,
// which is what the -100svh margin on .act--bath buys. See mistHandoff()
// for the rest of the arithmetic.
// The hero is pinned for almost the whole handoff now, because it is
// consumed from below by the rising scene rather than sliding out from
// under it. A pinned hero has no moving edge, which is what lets the veil
// stay light enough that the screen never goes blank.
const MIST_VH = 1.5;
const MIST_PIN_VH = 1.46;

/* ------------------------------------------------------------
   Kinetic type: split a heading into real line boxes.
   Measured after fonts load, because line boxes move when the
   display face swaps in.
   ------------------------------------------------------------ */
function splitLines(el) {
  // A <br> in the source is an instruction, not a suggestion. Everything else
  // still breaks wherever the measured line boxes fall, so a heading can pin
  // the one break that carries meaning and let the rest wrap naturally.
  const segments = el.innerHTML.split(/<br\s*\/?>/i)
    .map(seg => seg.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim())
    .filter(Boolean);

  const rows = [];
  segments.forEach(segment => {
    const words = segment.split(/\s+/);
    el.textContent = '';

    // Lay every word out individually so we can read its offsetTop.
    const probes = words.map(w => {
      const s = document.createElement('span');
      s.textContent = w;
      s.style.display = 'inline-block';
      el.appendChild(s);
      el.appendChild(document.createTextNode(' '));
      return s;
    });

    let currentTop = null;
    probes.forEach((s, i) => {
      const top = s.offsetTop;
      if (currentTop === null || Math.abs(top - currentTop) > 4) {
        rows.push([]);
        currentTop = top;
      }
      rows[rows.length - 1].push(words[i]);
    });
  });

  el.textContent = '';
  return rows.map(row => {
    const mask = document.createElement('span');
    mask.className = 'kin-line';
    const inner = document.createElement('span');
    inner.textContent = row.join(' ');
    mask.appendChild(inner);
    el.appendChild(mask);
    return inner;
  });
}

/* ------------------------------------------------------------
   ACT 1 · Arrival
   pin + focus pull + kinetic lines
   ------------------------------------------------------------ */
function actHero() {
  const act = document.querySelector('.act--hero');
  if (!act) return;

  const img = act.querySelector('[data-focus]');
  const heading = act.querySelector('[data-kinetic]');
  const fades = act.querySelectorAll('[data-fade]');

  // A slow push in, and only a trace of softening. This used to run to
  // 7px of blur, which on top of the fog left the hero looking degraded
  // rather than obscured: the photograph has to stay intact and simply be
  // buried, or the whole handoff reads as an image failing rather than as
  // weather. The fog does the hiding now, so this only has to keep the
  // frame from sitting still.
  if (!REDUCED) {
    gsap.set(img, { filter: 'blur(0px)', scale: 1 });
    gsap.to(img, {
      filter: 'blur(2px)',
      scale: 1.05,
      ease: 'none',
      scrollTrigger: {
        trigger: act,
        start: 'top top',
        end: () => '+=' + window.innerHeight * MIST_PIN_VH,
        scrub: 0.6
      }
    });
  }

  // The landing screen is the one screen every visitor sees, so its headline
  // must never depend on a JS animation finishing. This entrance is CSS
  // keyframes with fill-mode both: a throttled or stalled rAF cannot leave
  // the hero parked at a fraction of full opacity, and with JS disabled
  // entirely the copy is simply there. JS only measures the line boxes.
  const lines = heading ? splitLines(heading) : [];
  lines.forEach((line, i) => line.style.setProperty('--i', i));
  fades.forEach((el, i) => el.style.setProperty('--i', i));
  act.classList.add('is-ready');
}

/* ------------------------------------------------------------
   ACT 2 · Rest
   reveal. A wipe up a full-bleed frame.
   ------------------------------------------------------------ */
function actRest() {
  const act = document.querySelector('.act--rest');
  if (!act) return;

  const say = act.querySelector('[data-fade]');
  const frame = act.querySelector('[data-reveal]');

  gsap.set(say, { opacity: 0, y: REDUCED ? 0 : 16 });
  gsap.to(say, {
    opacity: 1, y: 0, duration: 0.8, ease: EASE,
    scrollTrigger: { trigger: say, start: 'top 82%', once: true }
  });

  if (REDUCED) return;

  gsap.set(frame, { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.to(frame, {
    clipPath: 'inset(0% 0% 0% 0%)',
    ease: 'none',
    scrollTrigger: {
      trigger: frame,
      start: 'top 88%',
      end: 'top 32%',
      scrub: 0.5
    }
  });
}

/* ------------------------------------------------------------
   ACT 3 · The treatment
   parallax drift + cross-fade across three stills
   ------------------------------------------------------------ */
function actTreatment() {
  const act = document.querySelector('.act--treatment');
  if (!act) return;

  const imgs = gsap.utils.toArray('.xfade__img', act);
  const heading = act.querySelector('[data-kinetic]');
  const copy = act.querySelectorAll('.stage__side .body');

  if (heading) {
    const lines = splitLines(heading);
    gsap.set(lines, { yPercent: 108, opacity: 0 });
    gsap.to(lines, {
      yPercent: 0, opacity: 1,
      duration: REDUCED ? 0.01 : 0.9,
      stagger: REDUCED ? 0 : 0.08,
      ease: EASE,
      scrollTrigger: { trigger: act, start: 'top 68%', once: true }
    });
  }

  gsap.set(copy, { opacity: 0, y: REDUCED ? 0 : 14 });
  gsap.to(copy, {
    opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: EASE,
    scrollTrigger: { trigger: act, start: 'top 62%', once: true }
  });

  if (REDUCED || imgs.length < 2) return;

  // Drift closer as the act crosses the viewport. Attention being paid.
  gsap.fromTo(imgs,
    { scale: 1.1 },
    {
      scale: 1, ease: 'none',
      scrollTrigger: { trigger: act, start: 'top bottom', end: 'bottom top', scrub: 0.7 }
    }
  );

  // Cross-fade. Each still fades up over the one before it and then holds.
  // Sequential positions matter: overlapping them put all three part-way at
  // once, and three stacked semi-transparent photographs read as a double
  // exposure rather than as a transition.
  // Hold long, hand over fast. Under a scrub the reader's most likely
  // position is the middle of whatever is running, so a slow cross-fade
  // means they mostly see a half-and-half blend of two unrelated
  // compositions, which reads as a rendering fault rather than a
  // transition. Roughly a fifth of each segment is the actual fade.
  gsap.set(imgs.slice(1), { opacity: 0 });
  const tl = gsap.timeline({
    scrollTrigger: { trigger: act, start: 'top 76%', end: 'bottom 30%', scrub: 0.8 }
  });
  tl.to({}, { duration: 1.1 });
  imgs.slice(1).forEach(img => {
    tl.to(img, { opacity: 1, duration: 0.38, ease: 'power1.inOut' })
      .to({}, { duration: 1.1 });
  });
}

/* ------------------------------------------------------------
   ACT 4 · Four kinds of care
   pan. Vertical scroll, lateral travel.
   ------------------------------------------------------------ */
function actPan() {
  const act = document.querySelector('.act--pan');
  if (!act) return;

  const rail = act.querySelector('[data-rail]');
  const stage = act.querySelector('[data-stage]');
  if (!rail || !stage) return;

  if (REDUCED) {
    // The rail is navigation, not decoration, so it cannot simply be frozen.
    stage.style.overflowX = 'auto';
    stage.style.height = 'auto';
    stage.style.paddingBlock = '64px';
    rail.style.scrollSnapType = 'x proximity';
    return;
  }

  const measure = () => Math.max(0, rail.scrollWidth - window.innerWidth);

  // Measure the overflow rather than assuming it. A rail narrower than the
  // viewport travels zero and the act becomes a motionless pinned screen.
  //
  // Held as a named tween because the per item entrances below need to be
  // driven by it, not by scroll position.
  const railTween = gsap.to(rail, { x: () => -measure(), ease: 'none' });

  ScrollTrigger.create({
    trigger: act,
    start: 'top top',
    // Only a short beat past the end of the travel, enough to read the
    // closing note. A larger buffer leaves the rail finished and the stage
    // pinned on a motionless screen, which reads as the page having stalled.
    end: () => '+=' + (measure() + window.innerHeight * 0.22),
    pin: stage,
    scrub: 0.8,
    refreshPriority: 2,
    invalidateOnRefresh: true,
    animation: railTween
  });

  // Each item settles as it crosses in from the right edge.
  //
  // This used to be keyed to 'top 92%', a vertical position, on elements that
  // only ever move horizontally inside a pinned stage. Their tops barely
  // change, so all four fired within a frame of each other the moment the act
  // arrived, and the stagger the code was written for never happened. The
  // empty `containerAnimation: null` was the hook for exactly this and was
  // left unset. Pointing it at the rail tween makes the trigger read
  // horizontal progress along the rail instead, so a card animates when it
  // actually enters the frame, at whatever pace the reader is scrolling.
  //
  // The intro block is exempt: it carries the heading and has to be present
  // the moment the act lands. Card one is not exempt, but it starts on screen
  // on desktop, so it settles immediately and reads as simply being there.
  const items = gsap.utils.toArray('.rail__item', rail).slice(1);
  items.forEach(item => {
    gsap.fromTo(item,
      { opacity: 0.55, y: 18 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: EASE,
        scrollTrigger: {
          trigger: item,
          containerAnimation: railTween,
          start: 'left 92%',
          once: true
        }
      }
    );
  });
}

/* ------------------------------------------------------------
   ACT 5 · The dissolve. THE PEAK.
   pin + cross-dissolve. The frame does not move. The light leaves it.
   Largest span on the page.
   ------------------------------------------------------------ */
function actPeak() {
  const act = document.querySelector('.act--peak');
  if (!act) return;

  const stage = act.querySelector('[data-stage]');
  const night = act.querySelector('.dissolve__night');
  const plate = act.querySelector('.plate');
  const cues = {
    a: act.querySelector('[data-cue="a"]'),
    b: act.querySelector('[data-cue="b"]'),
    c: act.querySelector('[data-cue="c"]')
  };

  if (REDUCED) {
    gsap.set([cues.a, cues.b, cues.c], { opacity: 1, y: 0 });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: act,
      start: 'top top',
      // A function, not a string. Computed once, this froze the peak's span at
      // whatever the viewport was on first paint, so every later refresh, a
      // resize, a rotation, an address bar collapsing, left the pin running
      // to a stale pixel value while everything around it had re-measured.
      end: () => '+=' + window.innerHeight * 3.2,
      pin: stage,
      scrub: 0.9,
      // Pins are refreshed highest priority first. Giving them explicit
      // descending values in document order means each one measures its own
      // start after every pin above it has already claimed its spacer.
      refreshPriority: 1,
      invalidateOnRefresh: true
    }
  });

  // "Three in the afternoon" is already on screen when the act begins,
  // so the pinned stage is never a frame of empty photograph.
  gsap.set(cues.a, { opacity: 1, y: 0 });
  gsap.set([cues.b, cues.c], { opacity: 0, y: 12 });

  // The dissolve is the act. It used to run 0.7 to 3.1 of a six unit
  // timeline, so the light had finished leaving barely half way through and
  // the remaining scroll was carried by two lines of text fading, which move
  // about a third of one percent of the screen. Measured, that was a full
  // viewport-height of scrolling with nothing visibly happening, in the one
  // act built to be the thing people remember. Running it 0.25 to 5.15
  // instead means the room is still darkening under every line, and the
  // closing frame is unchanged: night full, plate gone.
  tl.to(cues.a, { opacity: 0, y: -10, duration: 0.8 }, 0.9)
    .to(night,   { opacity: 1, duration: 4.9, ease: 'none' }, 0.25)
    .to(cues.b,  { opacity: 1, y: 0, duration: 0.8 }, 1.5)
    .to(cues.b,  { opacity: 0, y: -10, duration: 0.7 }, 2.9)
    .to(cues.c,  { opacity: 1, y: 0, duration: 0.9 }, 3.3)
    // This is not the last act on the page, so its closing line must not
    // hold. A held cue stays lit through the whole un-pin slide, travelling
    // a full viewport upward and overlapping the section that follows.
    // The plate goes with it: fading only the line leaves an empty canvas
    // box sitting on the photograph, which reads as a rendering fault.
    .to(plate,   { opacity: 0, duration: 0.6 }, 5.4);
}

/* ------------------------------------------------------------
   ACT 6 · Night, then stillness
   ------------------------------------------------------------ */
function actNight() {
  const act = document.querySelector('.act--night');
  if (!act) return;
  const items = act.querySelectorAll('.say, .script');
  gsap.set(items, { opacity: 0, y: REDUCED ? 0 : 18 });
  gsap.to(items, {
    opacity: 1, y: 0, duration: 0.9, stagger: 0.22, ease: EASE,
    scrollTrigger: { trigger: act, start: 'top 72%', once: true }
  });
}

/* ------------------------------------------------------------
   ACT 7 · Programmes
   flow + in. Fires once on entry, never re-hides.
   ------------------------------------------------------------ */
function actFlow() {
  gsap.utils.toArray('[data-in]').forEach(block => {
    const kids = block.children.length ? block.children : [block];
    gsap.set(kids, { opacity: 0, y: REDUCED ? 0 : 14 });
    gsap.to(kids, {
      opacity: 1, y: 0,
      duration: REDUCED ? 0.01 : 0.62,
      stagger: 0.07,
      ease: EASE,
      scrollTrigger: { trigger: block, start: 'top 88%', once: true }
    });
  });
}

/* ------------------------------------------------------------
   NAVIGATION, centred lockup
   Tab group left, mark centre, tab group right. One panel open at a
   time, the open tab carries the accent, the page behind goes back
   under a veil.

   The bar itself is transparent, so legibility is the chips' job plus
   one theme flip: this page is light almost everywhere, and the only
   dark ground is the night half of the peak dissolve.
   ------------------------------------------------------------ */
function nav() {
  const root = document.querySelector('[data-nav]');
  if (!root) return;

  const tabs = [...root.querySelectorAll('.tab[data-tab]')];
  const menu = root.querySelector('[data-menu]');
  const panels = [...root.querySelectorAll('.menu__panel')];
  const veil = document.querySelector('[data-veil]');
  const burger = root.querySelector('[data-burger]');
  let open = null;

  // The logo morph: full lockup through the mist handoff, mark alone once
  // it has fully resolved. Originally a flat 48px, which fired while the
  // fog was still building and read as the header reacting on its own,
  // competing with the dissolve. Waiting out the whole handoff (with a
  // small margin so it does not sit at the exact frame the curtain clears)
  // keeps the bar inert while the one thing that should be noticed is.
  const updateScrolled = () => root.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * MIST_VH * 1.05);
  window.addEventListener('scroll', updateScrolled, { passive: true });
  window.addEventListener('resize', updateScrolled, { passive: true });
  updateScrolled();

  const close = ({ focusTab = false } = {}) => {
    if (!open) return;
    const was = tabs.find(t => t.dataset.tab === open);
    tabs.forEach(t => t.setAttribute('aria-expanded', 'false'));
    open = null;
    const done = () => {
      menu.hidden = true;
      veil.hidden = true;
      if (burger) burger.setAttribute('aria-expanded', 'false');
      root.classList.remove('is-open');
    };
    if (REDUCED) { gsap.set(menu, { height: 0 }); gsap.set(veil, { opacity: 0 }); done(); }
    else {
      gsap.to(veil, { opacity: 0, duration: 0.2, ease: EASE });
      gsap.to(menu, { height: 0, duration: 0.28, ease: EASE, onComplete: done });
    }
    if (focusTab && was) was.focus();
  };

  const openPanel = name => {
    const tab = tabs.find(t => t.dataset.tab === name);
    if (!tab) return;
    panels.forEach(p => { p.hidden = p.dataset.panel !== name; });
    tabs.forEach(t => t.setAttribute('aria-expanded', String(t.dataset.tab === name)));
    const first = open === null;
    open = name;

    menu.hidden = false;
    veil.hidden = false;
    const h = menu.scrollHeight;
    if (REDUCED) { gsap.set(menu, { height: 'auto' }); gsap.set(veil, { opacity: 1 }); return; }
    // Only the first open animates its height, so switching tabs swaps the
    // contents without the panel concertinaing each time.
    if (first) {
      gsap.fromTo(menu, { height: 0 }, { height: h, duration: 0.34, ease: EASE });
      gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.26, ease: EASE });
    } else {
      gsap.to(menu, { height: h, duration: 0.26, ease: EASE });
    }
    gsap.fromTo(menu.querySelectorAll('.menu__group'),
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: EASE, delay: first ? 0.08 : 0 });
  };

  tabs.forEach(tab => tab.addEventListener('click', () => {
    if (open === tab.dataset.tab) close({ focusTab: true });
    else openPanel(tab.dataset.tab);
  }));

  veil.addEventListener('click', () => close());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) close({ focusTab: true }); });
  root.addEventListener('focusout', e => { if (open && !root.contains(e.relatedTarget)) close(); });

  if (burger) {
    burger.addEventListener('click', () => {
      const isOpen = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!isOpen));
      root.classList.toggle('is-open', !isOpen);
      if (isOpen) close();
      else { openPanel(tabs[0].dataset.tab); tabs[0].focus(); }
    });
  }

}



/* ------------------------------------------------------------
   THE MIST HANDOFF
   A bank of ground fog climbs the pinned hero, buries it, and the bath is
   standing there when the bank thins.

   Three things this is built to avoid, all of them learned the hard way.

   The hero is never faded and never wiped. A photograph losing opacity
   reads as an image failing to load, not as one being swallowed, and a
   clip-path front puts a ruler-straight line across the frame. The only
   thing that happens to the hero is that fog accumulates in front of it.

   The fog arrives by moving, not by fading. Ramping the opacity of a full
   frame plate is a wash, and a wash is what made the last attempt look
   like a white screen rather than weather.

   And the two sections overlap rather than queue. .act--bath carries a
   -100svh margin so its sticky scene is already in position when the pin
   releases at p 0.57. Without that the page has to spend a full viewport
   scrolling one section out and the next one in with nothing to look at,
   which is where the several screens of blank white came from.
   ------------------------------------------------------------ */
function mistHandoff() {
  const heroStage = document.querySelector('.act--hero .stage');
  const fog = document.querySelector('[data-fog]');
  const bath = document.querySelector('[data-bath]');
  if (!heroStage || !fog || !bath) return;

  const veil = fog.querySelector('[data-fog-veil]');
  const ground = bath.querySelector('[data-bath-ground]');
  const scrim = bath.querySelector('[data-bath-scrim]');
  const bathImg = bath.querySelector('[data-bath-img]');
  const line = bath.querySelector('[data-bath-line]');

  if (REDUCED) {
    gsap.set([ground, scrim, line], { opacity: 1 });
    gsap.set(line, { y: 0 });
    return;
  }

  // The whole handoff is now one photograph moving. The steam and the bath
  // are the same exposure, in the same light, off the same tub, so the
  // relationship between them is not something we have to fake with a fog
  // plate floating over a second picture. It also means there is nothing
  // left to line up: no plate travel to match against a scene travel, no
  // two masks to keep in step. The image goes up, and that is the mechanic.
  //
  // It travels exactly its own height, which puts it entirely below the
  // frame at the start and rested on the bottom at the end. Read as a
  // function so it re-measures on resize, because the height is derived
  // from the window width.
  const RISE_AT = 0.06;
  const RISE_END = 0.97;
  const riseBy = () => bathImg.offsetHeight;

  // Far lighter than it was, and it now only covers the beat before the
  // steam is on screen at all. It used to be load bearing, hiding a join;
  // there is no join any more.
  const VEIL_PEAK = 0.42;

  gsap.set(fog, { opacity: 1 });
  gsap.set(veil, { opacity: 0 });
  gsap.set([ground, scrim], { opacity: 0 });
  gsap.set(bathImg, { y: riseBy });
  gsap.set(line, { opacity: 0, y: 18 });

  const vh = () => window.innerHeight;

  // The hero holds still for the whole of the covering, so it has no moving
  // edge that could enter the frame while it is being buried.
  ScrollTrigger.create({
    trigger: '.act--hero',
    start: 'top top',
    end: () => '+=' + vh() * MIST_PIN_VH,
    pin: heroStage,
    pinSpacing: true,
    refreshPriority: 3,
    invalidateOnRefresh: true
  });

  const tl = gsap.timeline({
    scrollTrigger: {
      start: 0,
      end: () => vh() * MIST_VH,
      scrub: 0.7,
      invalidateOnRefresh: true
    }
  });

  tl
    // The one move. Steam sweeps up the frame, thickening as the denser part
    // of the column arrives, the bath surfaces underneath it, and the spent
    // steam carries on up past the top of the window where .bath clips it.
    .fromTo(bathImg,
      { y: riseBy },
      { y: 0, ease: 'none', duration: RISE_END - RISE_AT }, RISE_AT)

    // Weather before the steam itself is high enough to read, so the room
    // is already softening by the time the column arrives rather than
    // sitting sharp until something crosses it.
    .to(veil, { opacity: VEIL_PEAK, duration: 0.16, ease: 'none' }, 0.08)
    .to(veil, { opacity: 0, duration: 0.28, ease: 'none' }, 0.38)

    // The ground the steam ends up dissolving into. At rest the top of the
    // frame is still steam rather than photograph, so something has to be
    // behind it, and the hero cannot be: the bedroom would show through.
    // It arrives at the end of the climb, when that part of the frame is
    // carrying the densest steam it ever carries, and both grounds are pale
    // enough that the swap is a few levels of grey under all of that.
    .to(ground, { opacity: 1, duration: 0.13, ease: 'none' }, 0.83)
    .to(scrim, { opacity: 1, duration: 0.13, ease: 'none' }, 0.83)
    .to(line, { opacity: 1, y: 0, duration: 0.10, ease: EASE }, 0.88);
}

/* ------------------------------------------------------------
   NAV THEME
   The bar carries no background, so its ink has to flip over the one
   dark ground on the page: the night half of the peak dissolve.

   Measured across the whole peak section, not just its pinned travel.
   A toggle driven off the pin stops updating the moment the pin ends,
   which is precisely when the dark frame is still sliding up past the
   bar. Created after the pin exists so it measures the spacer.
   ------------------------------------------------------------ */
// The pinned dissolve as a fraction of the whole peak act. actPeak() pins
// for 3.2 viewport-heights inside an act that runs 4.2, so this converts a
// position on the dissolve into a position on this trigger.
const DISSOLVE_SPAN = 3.2 / 4.2;

function navTheme() {
  const bar = document.querySelector('[data-nav]');
  const peak = document.querySelector('.act--peak');
  if (!bar || !peak) return;

  ScrollTrigger.create({
    trigger: peak,
    start: 'top top',
    end: 'bottom top',
    invalidateOnRefresh: true,
    // Where the wordmark and the tab ink flip to white together.
    //
    // Two different scales meet here and they are easy to confuse. This
    // trigger spans the whole peak act, 4.2 viewport-heights, because a
    // toggle driven off the pin alone stops updating while the dark frame
    // is still sliding up past the bar. The dissolve itself is only the
    // pinned 3.2 of that. So a position measured on the dissolve has to be
    // converted before it can be compared against self.progress, which is
    // what DISSOLVE_SPAN does. Getting this wrong put the flip at 0.50 of
    // the dissolve rather than 0.34, and left a stretch where dark ink sat
    // at 3.4 to 1 waiting for a switch that had not come yet.
    //
    // 0.345 is the crossover: measured on the chip surface the text
    // actually sits on, dark ink reads 4.60 and white reads 4.57 at that
    // point, so both clear 4.5 and the 180ms cross fade cannot be caught
    // in an unreadable state either side of it.
    onUpdate: self => bar.classList.toggle('is-dark', self.progress > 0.345 * DISSOLVE_SPAN),
    onLeave: () => bar.classList.remove('is-dark'),
    onLeaveBack: () => bar.classList.remove('is-dark')
  });
}

/* ------------------------------------------------------------
   BLUSH DRIFT
   The shared ground under "The care turns toward you" and "You go back
   to bed". One canvas, one WebGL context, one continuous field across
   both, so the two acts read as one place and there is no join between
   them to see.

   Shader and uniform values are the Blush Drift preset from
   "TPS Mesh Drift Background v2 stronger.html", unchanged. Only the
   palette is named here; everything else is copied so the field on
   the page is the one that was designed, not an approximation of it.

   Two things this does that the source file does not need to.

   It fades. The canvas is behind the whole document, so it has to be
   switched off everywhere else, and the switching itself must not be
   visible. Both fades are therefore timed to run while an opaque
   neighbour is covering the screen: in behind the treatment gallery,
   which carries its own canvas ground and a full viewport of height,
   and out behind the pinned photograph of the dissolve. By the time
   either edge of the field could be seen, it has finished moving.

   It sleeps. A fragment shader running on every frame for the eleven
   viewport-heights where it cannot be seen is heat and battery spent
   on nothing, so the loop runs only across the span it serves.
   ------------------------------------------------------------ */
function meshDrift() {
  const canvas = document.querySelector('[data-drift]');
  const vsEl = document.getElementById('drift-vs');
  const fsEl = document.getElementById('drift-fs');
  // Document order, not narrative order. The 2026-09-05 rearrange put
  // .act--treatment before .act--rest, so the field now starts at the
  // treatment and ends at the rest. They are still adjacent, which is the
  // whole point of the field: it spans both so their join is not a line.
  const first = document.querySelector('.act--treatment');
  const last = document.querySelector('.act--rest');
  // The testimonials are served by the same field, five acts earlier. They
  // are not adjacent to the pair above, so this is a second visit rather
  // than a wider span: the field comes up for the testimonials, goes back
  // down behind the blush band, and comes up again for the treatment. Both
  // of the extra fades happen while something opaque is covering the
  // screen, and between the two visits the shader is asleep rather than
  // drawing eight viewport-heights of field nobody can see.
  const voices = document.querySelector('.act--voices');
  if (!canvas || !vsEl || !fsEl || !first || !last) return;

  const gl = canvas.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false,
    powerPreference: 'low-power'
  }) || canvas.getContext('experimental-webgl');

  // No WebGL is not a failure worth a fallback colour here. The two acts
  // already have grounds they look correct on, so leave them alone.
  if (!gl) return;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
      console.error(gl.getShaderInfoLog(s));
    return s;
  };

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsEl.textContent));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsEl.textContent));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  // One triangle big enough to cover the clip volume. Cheaper than a quad
  // and there is no seam down the diagonal.
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const U = name => gl.getUniformLocation(prog, name);
  const uColors = U('u_colors[0]');
  const uScene = U('u_scene');

  // Verbatim from the preset. scale/intensity/paramA/warp, then
  // detail/contrast/brightness/saturation, then hue/vignette/blur/grain,
  // then seed/rotate/drift/oklab. Cursor reactivity is off: this is a
  // ground behind reading copy, not something to play with.
  gl.uniform4f(U('u_shape'), 1.16, 0.34, 0.50, 0.00);
  gl.uniform4f(U('u_surface'), 2.40, 1.24, 0.00, 1.00);
  gl.uniform4f(U('u_finish'), 0.00, 0.00, 0.000, 0.09);
  gl.uniform4f(U('u_transform'), 1453.0, 0.00, 0.00, 0.0);
  gl.uniform4f(U('u_space'), 0.00, 0.00, 0.00, 0.00);
  gl.uniform4f(U('u_cursor'), 0.00, 2.00, 0.65, 0.46);

  // Warm paper. The first colour also seeds the field's base weight, so it
  // is the ground the other three bloom through.
  //
  // Blush drift was tried here first and failed two measurements, both from
  // the same cause: it draws its colour from the same corner of the palette
  // as the coral band in the act below. It met that band as warm pink
  // against duller mauve, 240,189,183 against 226,202,198, close enough
  // that the join read as a fault rather than as a change. And it cost
  // about half the contrast on the page, taking the caption under the bleed
  // photo to 3.22 where body text needs 4.5. Warm paper stays in the
  // neutrals, so the meeting with the band is a real change of colour again
  // and the copy keeps its headroom.
  const FIELD = ['#F6F6F6', '#E3D7D3', '#E2CAC6', '#C9B9B5'];
  const colorBuf = new Float32Array(24);
  FIELD.concat(FIELD, FIELD).slice(0, 8).forEach((hex, i) => {
    const n = parseInt(hex.slice(1), 16);
    colorBuf[i * 3] = ((n >> 16) & 255) / 255;
    colorBuf[i * 3 + 1] = ((n >> 8) & 255) / 255;
    colorBuf[i * 3 + 2] = (n & 255) / 255;
  });
  gl.uniform3fv(uColors, colorBuf);

  let w = 0, h = 0;
  const resize = () => {
    // Capped at 2. Past that the shader is paying for pixels nobody can
    // resolve, on exactly the phones least able to afford them.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nw = Math.round(window.innerWidth * dpr);
    const nh = Math.round(window.innerHeight * dpr);
    if (nw === w && nh === h) return;
    w = nw; h = nh;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
  };
  resize();

  let elapsed = 0, prev = 0, raf = 0, frozen = false, running = false;

  const draw = () => {
    resize();
    gl.uniform4f(uScene, w, h, elapsed * 0.73, FIELD.length);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const tick = now => {
    raf = requestAnimationFrame(tick);
    // Clamped, so a tab that was backgrounded or a frame that took a
    // second does not jump the field forward to somewhere unrelated.
    elapsed += Math.min((now - prev) / 1000, 0.1);
    prev = now;
    draw();
  };

  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  // Two separate stretches of the page can ask for the field now, so this
  // counts them rather than storing a single on or off. A plain boolean
  // would let whichever stretch was left last switch the field off while
  // the other still wanted it.
  let awake = 0;
  const wake = on => {
    awake = Math.max(0, awake + (on ? 1 : -1));
    running = awake > 0;
    if (running) start(); else stop();
  };
  const start = () => {
    if (raf) return;
    // Reduced motion still gets the field, just not the drift. It is a
    // ground, and a still gradient is not the thing anyone was asking to
    // be spared.
    if (frozen || REDUCED) { draw(); return; }
    prev = performance.now();
    raf = requestAnimationFrame(tick);
  };

  window.addEventListener('resize', () => { if (!raf) draw(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else if (running) start();
  });

  // Expressed against the acts rather than as absolute scroll positions,
  // so it survives the sections changing height. "top bottom+=100%" is a
  // full viewport before this act's top would reach the bottom of the
  // screen, which is well inside the stretch the bath is covering.
  gsap.fromTo(canvas, { opacity: 0 }, {
    opacity: 1, ease: 'none',
    scrollTrigger: {
      trigger: first,
      start: 'top bottom+=100%',
      end: 'top bottom+=20%',
      scrub: true,
      invalidateOnRefresh: true
    }
  });

  gsap.to(canvas, {
    opacity: 0, ease: 'none',
    scrollTrigger: {
      trigger: last,
      start: 'bottom top',
      end: 'bottom top-=40%',
      scrub: true,
      invalidateOnRefresh: true
    }
  });

  // Slightly wider than the fades at both ends, so the field is already
  // being drawn before it is worth anything and stops only once it is
  // worth nothing.
  ScrollTrigger.create({
    trigger: first,
    start: 'top bottom+=110%',
    endTrigger: last,
    end: 'bottom top-=50%',
    invalidateOnRefresh: true,
    onToggle: self => wake(self.isActive)
  });

  // The same three triggers again, for the testimonials.
  if (voices) {
    gsap.fromTo(canvas, { opacity: 0 }, {
      opacity: 1, ease: 'none',
      scrollTrigger: {
        trigger: voices,
        // Later than the treatment's fade, and deliberately so. The bath
        // scene carries one opacity as it arrives, so for the whole of the
        // handoff anything behind it shows through faintly, the field
        // included. Measured, a fade starting a full viewport early tinted
        // the bath by up to 50 levels at 1.3 viewport-heights. This window
        // sits after the bath is at full strength and before the
        // testimonials have reached the bottom of the screen, so the field
        // comes up behind something solid and is simply there when the
        // section arrives.
        start: 'top bottom+=25%',
        end: 'top bottom+=2%',
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    gsap.to(canvas, {
      opacity: 0, ease: 'none',
      scrollTrigger: {
        trigger: voices,
        start: 'bottom top',
        end: 'bottom top-=40%',
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    ScrollTrigger.create({
      trigger: voices,
      start: 'top bottom+=35%',
      end: 'bottom top-=50%',
      invalidateOnRefresh: true,
      onToggle: self => wake(self.isActive)
    });
  }

  document.documentElement.classList.add('drift-on');
  draw();

  // For the capture harness only. A shader on a wall clock never draws the
  // same frame twice, so every before and after comparison would fail for
  // a reason that has nothing to do with the change being tested.
  window.__drift = {
    freeze(t) { frozen = true; stop(); elapsed = t || 0; draw(); }
  };
}

/* ------------------------------------------------------------
   TREATMENT GALLERY
   Click a thumbnail, the frame plays large on the right with its
   detail. Two stacked <img> elements crossfade rather than one whose
   src is swapped: changing src on a live element shows a blank frame
   while the new file decodes, and on a slow connection that reads as
   the component breaking.

   The incoming frame also arrives from slightly deeper in the page,
   which is the fly-in feel borrowed from the starter pack rather than
   a flat dissolve.
   ------------------------------------------------------------ */
function gallery() {
  const root = document.querySelector('[data-gallery]');
  if (!root) return;

  const items = [...root.querySelectorAll('[data-gal-item]')];
  const imgs = [...root.querySelectorAll('[data-gal-img]')];
  const media = root.querySelector('.gal__media');
  const idxEl = root.querySelector('[data-gal-index]');
  const titleEl = root.querySelector('[data-gal-title]');
  const bodyEl = root.querySelector('[data-gal-body]');
  if (items.length < 2 || imgs.length < 2 || !media) return;

  let front = 0;
  let current = items[0];
  let busy = false;

  // The column divides the shared height token between however many
  // treatments there actually are, so adding one never overflows.
  root.style.setProperty('--gal-n', items.length);

  // Warm the large frames at init. Without this the first click on each
  // thumbnail waits on a full-size download before anything moves, which
  // measured as multiple seconds of apparently dead UI on a cold load.
  items.forEach(btn => {
    if (btn.classList.contains('is-active')) return;
    const pre = new Image();
    pre.decoding = 'async';
    pre.src = btn.dataset.img;
  });

  const setCopy = btn => {
    idxEl.textContent = btn.dataset.index;
    titleEl.textContent = btn.dataset.title;
    bodyEl.textContent = btn.dataset.body;
  };

  const swapCopy = btn => {
    const copy = [idxEl, bodyEl, titleEl];
    if (REDUCED) { setCopy(btn); gsap.set(copy, { opacity: 1, y: 0 }); return; }
    gsap.to(copy, {
      opacity: 0, y: -8, duration: 0.2, stagger: 0.03, ease: 'none',
      onComplete: () => {
        setCopy(btn);
        gsap.fromTo(copy, { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: EASE });
      }
    });
  };

  const show = btn => {
    if (busy || btn === current) return;
    busy = true;

    items.forEach(b => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', String(on));
    });
    current = btn;
    swapCopy(btn);

    const back = imgs[1 - front];
    const fore = imgs[front];
    back.src = btn.dataset.img;
    back.alt = btn.dataset.title;

    const land = () => {
      gsap.set(back, { opacity: 1 });
      gsap.set(fore, { opacity: 0 });
      front = 1 - front;
      busy = false;
    };

    if (REDUCED) { land(); return; }

    // The thumbnail itself travels: a copy of it lifts off the picker,
    // grows, and flies across into the frame, so the eye follows one
    // object rather than watching two separate images crossfade.
    //
    // Animated through layout rather than transform on purpose. The two
    // boxes share an aspect ratio so a scale would be geometrically
    // fine, but scaling also multiplies the corner radius, and the
    // thumbnail's 6px would land as a ~40px blob at full size.
    const thumbImg = btn.querySelector('img');
    const from = thumbImg.getBoundingClientRect();
    const to = media.getBoundingClientRect();

    const ghost = document.createElement('img');
    ghost.className = 'gal__ghost';
    ghost.src = btn.dataset.img;
    ghost.alt = '';
    gsap.set(ghost, {
      left: from.left, top: from.top, width: from.width, height: from.height,
      borderRadius: 6, opacity: 1
    });
    document.body.appendChild(ghost);

    // Hide the source thumbnail's picture while its copy is in flight, so
    // the same frame is not visibly in two places at once.
    gsap.set(thumbImg, { opacity: 0 });
    gsap.to(fore, { opacity: 0, duration: 0.3, ease: 'none' });

    gsap.timeline({
      onComplete: () => {
        land();
        ghost.remove();
        gsap.set(thumbImg, { opacity: 1 });
      }
    })
      // A small lift first, so it reads as picked up rather than dragged.
      .to(ghost, { scale: 1.06, duration: 0.18, ease: 'power2.out' })
      .to(ghost, {
        left: to.left, top: to.top, width: to.width, height: to.height,
        borderRadius: parseFloat(getComputedStyle(media).borderTopLeftRadius) || 22,
        scale: 1,
        duration: 0.62, ease: 'power3.inOut'
      });
  };

  items.forEach(btn => btn.addEventListener('click', () => show(btn)));

  root.addEventListener('keydown', e => {
    if (!['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key)) return;
    const i = items.indexOf(document.activeElement);
    if (i === -1) return;
    e.preventDefault();
    const step = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1;
    const next = items[(i + step + items.length) % items.length];
    next.focus();
    show(next);
  });
}


/* ------------------------------------------------------------
   Boot. Line splitting needs real line boxes, so it waits for
   the display face rather than for DOMContentLoaded.
   ------------------------------------------------------------ */
/* ------------------------------------------------------------
   VOICES · the clean testimonial
   Ported from the 21st.dev "clean-testimonial" React component.

   Deliberately the only behaviour on this page that touches neither
   GSAP nor ScrollTrigger. It registers no trigger, creates no pin
   spacer, and never transforms its own section. The hero to bath
   handoff measures the whole document when it builds, and nothing
   here is allowed to appear in that measurement.

   What is ported, and what it was in the source:

     the cursor      Framer useSpring, damping 25 stiffness 150, on the
                     pointer position. Integrated here per frame at the
                     same constants, so it lags and settles identically.
                     It opens to 80px on enter and carries "Next".
     the quote       Split into words, each arriving from opacity 0,
                     y 20 and blur 8px on a 30ms stagger over 400ms,
                     easing cubic-bezier(.22, 1, .36, 1).
     the author      Fades in from x -10 while a one pixel rule draws
                     itself downward from the top, 400ms after 100ms.
     the index       The active number swaps with a 10px rise.
     the pips        Three 24px faces, the active one in colour and
                     ringed, the rest grey at half opacity.
     the bar         Fills to (index + 1) / total over 500ms.

   Added because the source is a demo page rather than a section in a
   document: the block answers the keyboard as well as the pointer,
   its entrance runs off an IntersectionObserver rather than on mount,
   and the custom cursor is not built where there is no fine pointer.

   PLACEHOLDER CONTENT. None of these quotes, names or faces belongs to
   a real client. The avatars are the stock images the source component
   shipped with, still served from its own CDN. Replace all of it with
   cleared testimonials before this is shown publicly.
   ------------------------------------------------------------ */
const TV2 = [
  {
    quote: "I came home expecting to cope. Instead someone cooked, held the baby, and told me to go back to bed.",
    author: "Amara O.",
    role: "14 day programme",
    place: "Hackney",
    avatar: "https://cdn.21st.dev/assets/mirror/da/da434276d51c85ff15ac27eabca303c18b8044390be5aad668d18d5fb43cc373.png"
  },
  {
    quote: "The bath was drawn every evening without me asking once. By the second week I had stopped bracing for the day ahead.",
    author: "Priya N.",
    role: "30 day programme",
    place: "Ealing",
    avatar: "https://cdn.21st.dev/assets/mirror/93/93c76c47af7fc3821e1f5d22b087263d5db480b664f5b24a27cbf6ddc0c2c11d.jpg"
  },
  {
    quote: "It is not babysitting. She was there for me, and the baby was part of that. The distinction is the whole service.",
    author: "Yewande M.",
    role: "21 day programme",
    place: "Lewisham",
    avatar: "https://cdn.21st.dev/assets/mirror/db/dbe8ba771425288545e355ee4da179d1c7564860aa6f61e02c3c617695487c11.png"
  }
];

function actVoices() {
  const root = document.querySelector('[data-tv2]');
  if (!root) return;

  const q     = root.querySelector('[data-tv2-quote]');
  const now   = root.querySelector('[data-tv2-now]');
  const total = root.querySelector('[data-tv2-total]');
  const pips  = root.querySelector('[data-tv2-pips]');
  const faces = root.querySelector('[data-tv2-faces]');
  const meta  = root.querySelector('[data-tv2-meta]');
  const name  = root.querySelector('[data-tv2-name]');
  const role  = root.querySelector('[data-tv2-role]');
  const fill  = root.querySelector('[data-tv2-fill]');
  const prev  = root.querySelector('[data-tv2-prev]');
  const nxt   = root.querySelector('[data-tv2-next]');

  const esc = s => String(s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const pad = n => String(n).padStart(2, '0');

  total.textContent = pad(TV2.length);

  // The source preloads every avatar on mount, because the swap is a
  // cross fade between images that are already stacked, and a face that
  // decodes on click arrives after the fade it was meant to be part of.
  TV2.forEach(t => { const i = new window.Image(); i.src = t.avatar; });

  pips.innerHTML = TV2.map((t, i) =>
    `<span class="tv2__pip${i === 0 ? ' is-on' : ''}"><img src="${esc(t.avatar)}" alt="" /></span>`).join('');
  faces.insertAdjacentHTML('beforeend', TV2.map((t, i) =>
    `<img src="${esc(t.avatar)}" alt="" class="${i === 0 ? 'is-on' : ''}" />`).join(''));

  const pipEls  = [...pips.children];
  const faceEls = [...faces.querySelectorAll('img')];

  let index = 0;
  let wordTimers = [];

  const paint = (first) => {
    const t = TV2[index];

    // The quote is rebuilt word by word. Timers are cleared first, or a
    // fast click leaves the previous set still staggering in behind the
    // new one.
    wordTimers.forEach(clearTimeout);
    wordTimers = [];
    q.innerHTML = t.quote.split(' ')
      .map(w => `<span class="tv2__w">${esc(w)}</span>`).join('');
    const words = [...q.children];
    if (REDUCED) {
      words.forEach(w => w.classList.add('is-in'));
    } else {
      words.forEach((w, i) => {
        wordTimers.push(setTimeout(() => w.classList.add('is-in'), i * 30));
      });
    }

    name.textContent = t.author;
    role.textContent = t.role + ' — ' + t.place;
    meta.classList.remove('is-in');
    // Two frames, not one: the class has to be off for a painted frame
    // before it goes back on, or the browser coalesces both into no
    // change at all and the rule never draws.
    requestAnimationFrame(() => requestAnimationFrame(() => meta.classList.add('is-in')));

    faceEls.forEach((el, i) => el.classList.toggle('is-on', i === index));
    pipEls.forEach((el, i) => el.classList.toggle('is-on', i === index));

    if (first) {
      now.textContent = pad(index + 1);
    } else {
      now.classList.add('is-turning');
      setTimeout(() => { now.textContent = pad(index + 1); now.classList.remove('is-turning'); }, 150);
    }

    fill.style.width = ((index + 1) / TV2.length) * 100 + '%';
  };

  // Two buttons rather than the whole block. They are real <button>
  // elements, so focus, Enter and Space are the browser's job rather than
  // a keydown handler of ours, and a screen reader is told what they do.
  const go = step => { index = (index + step + TV2.length) % TV2.length; paint(false); };
  if (nxt)  nxt.addEventListener('click', () => go(1));
  if (prev) prev.addEventListener('click', () => go(-1));

  paint(true);

  // The entrance. An observer, not a ScrollTrigger, on purpose: this
  // block must not exist as far as the document measurement that the
  // hero pin depends on is concerned.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { root.classList.add('is-in'); io.disconnect(); }
      });
    }, { threshold: 0.15 });
    io.observe(root);
  } else {
    root.classList.add('is-in');
  }
}

function boot() {
  // Smooth scrolling is switched off for the whole of boot and put back at
  // the end. The page sets scroll-behavior: smooth on <html>, and that
  // applies to programmatic scrolls as well as clicked links, so both of
  // the scrolls below would otherwise be animations. Building pins while
  // the window is still travelling measures them from wherever the
  // animation happens to be on that frame, which is not the same twice.
  const scrollRoot = document.documentElement;
  const priorBehaviour = scrollRoot.style.scrollBehavior;
  scrollRoot.style.scrollBehavior = 'auto';

  // Before anything measures anything. See the note at the top of this file.
  window.scrollTo(0, 0);

  nav();
  actHero();
  actRest();
  actTreatment();
  actPan();
  actPeak();
  actNight();
  actFlow();
  gallery();
  mistHandoff();
  navTheme();
  meshDrift();
  // Last. See the note in actVoices().
  actVoices();
  ScrollTrigger.refresh();

  // Verification hooks. The scroll-craft harness walks acts by these
  // attributes and waits on this class before it starts shooting. They are
  // read-only markers; nothing on the page behaves differently because of them.
  document.querySelectorAll('[data-act]').forEach(a => {
    const m = a.className.match(/act--([a-z]+)/);
    a.setAttribute('data-sc-act', m ? m[1] : 'act');
  });
  document.documentElement.classList.add('sc-ready');

  // Now the document is its real height and every pin has claimed its
  // spacer, so an anchor in the URL can finally resolve to the right place.
  // Jumped, not scrolled: the page sets scroll-behavior: smooth, and a
  // fifteen viewport-height glide through every pinned act on arrival is
  // not an entrance, it is a fault that looks like one.
  // The anchor is honoured last of all, and only once the window has
  // finished firing load.
  //
  // ScrollTrigger registers its own refresh on window load, and boot() runs
  // earlier than that, on document.fonts.ready. So anything this function
  // measured was being re-measured moments later by ScrollTrigger itself,
  // at whatever scroll position the page was sitting at. With a fragment in
  // the URL that position is the bottom of the document, and the hero pin
  // came back with a start of minus 6811 instead of 0. Its span was always
  // right, 1314 either way, which is what gave it away: the pin was not
  // broken, it was measured from the wrong origin.
  //
  // Running after load means ours is the last word. Zero the scroll, let
  // the pins measure from the top where they are correct, then jump.
  const goToAnchor = () => {
    const target = location.hash.length > 1 && document.querySelector(location.hash);
    const root = document.documentElement;
    const behaviour = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    // Not on trust: scrollRestoration set to manual does not stop Chrome
    // re-applying a fragment once the document has grown.
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
    if (target) {
      window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
      ScrollTrigger.update();
    }
    root.style.scrollBehavior = behaviour;
  };

  if (document.readyState === 'complete') requestAnimationFrame(goToAnchor);
  else window.addEventListener('load', () => requestAnimationFrame(goToAnchor), { once: true });

  scrollRoot.style.scrollBehavior = priorBehaviour;
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(boot);
} else {
  window.addEventListener('load', boot);
}
