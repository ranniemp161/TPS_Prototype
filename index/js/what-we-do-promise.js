/* The Promise ("Do we offer night care?"), for the What We Do page.
   Moved from the homepage on 5 Oct 2026. actPeak() and navTheme() below are
   copied from home.js with their constants. Two differences: the plumbing at the
   top and bottom is new, and the pin's refreshPriority is -11 instead of 1 (it now sits below Tailored For You, whose pins are -10) so it
   measures after the pinned sections above it on this page, and the header's
   dark flip is -2 so it measures after that pin. */

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// The sunset (TJ, 9 Oct 2026): the descent is longer (was 1.92) and the beat
// held on full night after it shorter (was 1.3), the total unchanged, because
// night now falls during the descent rather than after it.
// Phones (TJ, 9 Oct 2026, MOBILE-PLAN item 5): the same beats in the same order,
// over about 3 screens instead of 5.5. The descent 2.4 to 1.5, the beat on full
// night .82 to .35, the glass 1.3 to .8, the hold 1.0 to .45. Desktop unchanged.
// Shorter again (TJ, 12 Oct 2026): swiping a long scrub is hard work on a phone,
// so the whole hold is about 1.8 screens instead of 3.1, the sunset itself 0.9.
const DN_PHONE = window.matchMedia('(max-width: 860px)').matches;
const PEAK_PIN_VH = DN_PHONE ? 0.9 : 2.4;
// Day and Night Care (TJ, 8 Oct 2026): after the two options land, a glass
// phase (DN_GLASS_VH) frosts and splits the frame and opens both columns, then
// the hold lets them be read. The hold was .6 before the merge.
const DN_BEAT_VH = DN_PHONE ? 0.2 : 0.82;
const DN_GLASS_VH = DN_PHONE ? 0.5 : 1.3;
const PEAK_HOLD_VH = DN_PHONE ? 0.2 : 1.0;
// The sun is the clock (TJ, 9 Oct 2026). Night, and the one change from dark to
// cream for everything on the frame and the header's menu, are worked out from
// where the sun is, not from scroll, so the three can never drift apart: night
// has fully fallen when the sun's lower edge touches the horizon line, the
// change to cream runs from half way to nine tenths of the way there, so the sun
// is already cream when it touches the line, and the dip under it is the last
// beat. creamNow is that change, 0 to 1, read by the header (navTheme).
const ndSmooth = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
let creamNow = 0, navSync = null;

function actPeak() {
  const act = document.querySelector('.act--peak');
  if (!act) return;

  const frame = act.querySelector('[data-reveal]');
  const stage = act.querySelector('[data-stage]');
  const night = act.querySelector('.dissolve__night');
  const heads = [...act.querySelectorAll('[data-dn-heads]')];
  const clock = act.querySelector('[data-peak-clock]');
  const sun = act.querySelector('[data-peak-sun]');
  const states = [...act.querySelectorAll('[data-peak-states] span')];
  const answer = act.querySelector('[data-peak-answer]');
  const wrap = act.closest('.dn-wrap');
  const bodies = [...act.querySelectorAll('[data-dn-body]')];

  /* Phones: Day to Night on one line (TJ, 12 Oct 2026). The sun and the four
     times of day give way to the site's progression line: Day at the left,
     Night at the right, the circle travelling between them as the scrub runs,
     reaching Night as night has fully fallen. The sunset sits on the line's
     middle (TJ, 12 Oct 2026): a sun that arrives with the line, sets into it on
     the way to Night and rises again on the way back to Day. A tap on either end scrolls the
     page there slowly, so scroll stays the one thing driving the light and the
     change reads as a fade, not a switch; a swipe takes over at any moment. */
  let dnl = null, dnlEnds = [], dnlRail = null, dnlSun = null, dnTitle = null, dnlSkyH = 0;
  if (DN_PHONE && clock) {
    dnl = document.createElement('div');
    dnl.className = 'dnl';
    dnl.innerHTML = '<div class="dnl__ends"><button type="button" class="dnl__end" data-dnl="0">Day</button><button type="button" class="dnl__end" data-dnl="1">Night</button></div>' +
      '<div class="dnl__rail" aria-hidden="true"><span class="dnl__sky"><span class="dnl__sun"></span></span><span class="dnl__fill"></span><span class="dnl__stop dnl__stop--a"></span><span class="dnl__stop dnl__stop--b"></span><span class="dnl__tip"></span></div>';
    clock.appendChild(dnl);
    dnlEnds = [...dnl.querySelectorAll('.dnl__end')];
    dnlRail = dnl.querySelector('.dnl__rail');
    dnlSun = dnl.querySelector('.dnl__sun');
    dnTitle = act.querySelector('.dn-title--ink');
  }

  /* The glass, 0 to 1: frosting and split over the frame, the intro gives
     way, both bodies open to the same closed height, and the day column's
     text turns from cream to ink as its side lightens. */
  const DN_CREAM = [243, 239, 236], DN_INK = [10, 10, 10];
  const frameImgs = [...act.querySelectorAll('.peak__frame img')];
  const setGlass = g => {
    if (!wrap) return;
    // The room drifts slowly behind the glass (TJ, 8 Oct 2026): a gentle push
    // in and a slight sideways travel, so the blurred shapes move as you
    // scroll and the glass reads as glass rather than paint.
    frameImgs.forEach(img => { img.style.transform = `scale(${(1 + 0.07 * g).toFixed(4)}) translateX(${(-1.6 * g).toFixed(3)}%)`; });
    wrap.style.setProperty('--dn-g', g.toFixed(3));
    wrap.style.setProperty('--dn-b', Math.pow(g, 2.4).toFixed(4));
    const t = Math.min(1, Math.max(0, (g - 0.25) / 0.6));
    const c = DN_CREAM.map((v, i) => Math.round(v + (DN_INK[i] - v) * t));
    wrap.style.setProperty('--dn-ink', c.join(', '));
    wrap.classList.toggle('is-glass', g > 0.85);
    bodies.forEach(b => {
      if (b.closest('.dnf__opt').classList.contains('is-open')) return;
      const closed = parseFloat(getComputedStyle(b).getPropertyValue('--dn-closed')) || 0;
      b.style.maxHeight = (closed * Math.min(1, Math.max(0, (g - 0.3) / 0.7))) + 'px';
    });
    const intro = act.querySelector('[data-dn-intro]');
    if (intro) intro.style.display = g > 0.6 ? 'none' : '';
  };
  // The closed height is in em, resolve it to px once the fonts are in.
  bodies.forEach(b => {
    const lines = parseFloat(getComputedStyle(wrap || b).getPropertyValue('--dn-lines')) || 7;
    b.style.setProperty('--dn-closed', (lines * parseFloat(getComputedStyle(b).lineHeight)) + 'px');
  });

  /* The clay under the gap (TJ, 8 Oct 2026): Tailored For You's ground is a
     palette that follows its open row, so the colour is read live and mixed
     with the Ember Deep tint (at .2) that Tailored lays over its own foot. */
  const tail = document.querySelector('[data-section="tailored-for-you"]');
  const setClay = () => {
    if (!tail || !wrap) return;
    const c = (getComputedStyle(tail).backgroundColor.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    if (c.length < 3) return;
    // Tailored For You's grey ground carries no tint (TJ, 9 Oct 2026), so the
    // gap the sun falls into is the same grey: data-ground-sink="0".
    const sink = [140, 54, 47], a = tail.dataset.groundSink != null ? parseFloat(tail.dataset.groundSink) : 0.2;
    wrap.style.setProperty('--dn-clay', 'rgb(' + c.map((v, i) => Math.round(v * (1 - a) + sink[i] * a)).join(', ') + ')');
  };
  setClay();
  ScrollTrigger.create({ trigger: act, start: 'top bottom', end: 'top top', onUpdate: setClay, onRefresh: setClay, refreshPriority: -11 });

  /* Read more: opens one column fully (scrolling inside if it is long);
     Read less closes it to the even height again. */
  act.querySelectorAll('[data-dn-more]').forEach(btn => {
    btn.addEventListener('click', () => {
      const opt = btn.closest('.dnf__opt');
      const open = !opt.classList.contains('is-open');
      opt.classList.toggle('is-open', open);
      btn.textContent = open ? 'Read less' : 'Read more';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      const b = opt.querySelector('[data-dn-body]');
      if (!open) { b.scrollTop = 0; b.style.maxHeight = getComputedStyle(b).getPropertyValue('--dn-closed'); }
    });
  });

  if (REDUCED) {
    // The resolved end state: night fallen, the clock gone, the question
    // and the answer both present and readable without any motion. The
    // question reads white here, matching the fallen night it sits over.
    gsap.set(night, { opacity: 1 });
    gsap.set(answer, { opacity: 1, y: 0 });
    gsap.set(clock, { opacity: 0 });
    setGlass(1);
    return;
  }

  // Ink for the question: dark grey against daylight, easing to white as
  // the room darkens. A continuous interpolation rather than the nav's
  // is-dark class flip, because it has to track the crossfade's own
  // opacity exactly rather than switch at one threshold. Read by both
  // drivers below, since the question's colour has to keep updating across
  // the wipe and the pin, one continuous journey, while its opacity and
  // the rest of the frame's furniture only start once the pin engages.
  const INK = [10, 10, 10];    // --ink   #0A0A0A
  const PAPER = [255, 255, 255]; // --paper #FFFFFF
  const inkAt = t => {
    const c = INK.map((v, i) => Math.round(v + (PAPER[i] - v) * t));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  };

  // The question is now `position: fixed`, outside the figure entirely
  // (see index.html and the .peak__ask rule in site.css), because it used to be
  // a child of the element the wipe clips: before the wipe started, the
  // figure was clipped to nothing and so was the title inside it. TJ wanted
  // the opposite, the title established on the plain ground before the
  // photograph arrives, so it needed to exist outside the clipped subtree.
  //
  // Being fixed means it is no longer scoped to this section just by
  // living inside it, so a dedicated trigger shows it on entry. The exit
  // side is handled separately, below, off the pin itself: a first attempt
  // used a second trigger spanning 'top bottom' to 'bottom top' on the act,
  // and its own 'bottom top' measured a scroll position past what the
  // document can actually reach, off by the same amount the pin adds to
  // the page, so onLeave could never fire and the title never hid again.
  // The pin trigger's own onLeave is reachable by definition, since it is
  // the thing setting the page's scroll length at that point.
  // (The title now lives inside the pinned frame, so it needs no trigger of its
  // own to appear: it scrolls into the cream gap with the page.)

  // The photograph's entrance. This is v1-ruined's actRest() wipe copied
  // verbatim, trigger points included: the figure starts fully clipped and
  // un-clips upward across its own crossing of the viewport. Nothing else
  // animates but the wipe itself; the two earlier attempts at this merge
  // added a parallax drift inside the frame and pinned the wiped element
  // itself, and neither is in the original.
  gsap.set(frame, { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.to(frame, {
    clipPath: 'inset(0% 0% 0% 0%)',
    ease: 'none',
    scrollTrigger: {
      trigger: frame,
      start: 'top 88%',
      // v1-ruined ends this at 'top 32%', where its boxed frame came to rest
      // mid screen. This frame is the height of the screen and has to come to
      // rest filling it, so the wipe finishes at the moment its top reaches
      // the top of the viewport, which is also where the pin takes over.
      // Phones (MOBILE-PLAN item 6): the wipe finishes with the frame's top at 40
      // percent of the screen, so the grey ground after Tailored's last stop is a
      // short beat, not a screen.
      end: DN_PHONE ? 'top 40%' : 'top top',
      scrub: 0.5,
      // As above: measured after Tailored For You's pins (-10).
      refreshPriority: -11,
      onUpdate: self => {
        // The flip is a hard cut, not a fade: TJ wanted the swipe itself to
        // look like it is what changes the colour. That only reads if the
        // flip happens at the instant the photograph's own leading edge
        // physically reaches the title's position on screen, not at an
        // arbitrary fraction of the wipe's travel. A first version used
        // 0.55, chosen without measuring, and it fired while the photograph
        // was still hundreds of pixels below the title, on plain cream
        // ground, so the colour changed for no visible reason.
        //
        // Measured directly instead: the wipe's visible top edge (the
        // clip's percentage translated into an actual screen position) was
        // walked frame by frame against the title's own fixed y (107px at
        // 1600x900) and crossed it at progress 0.94, not 0.55. That
        // measurement is viewport-height dependent, since both the clip
        // percentage and the title's offset scale differently, so it is
        // recomputed here rather than pinned to the one viewport it was
        // measured at.
        // (The title no longer takes part in the wipe: it rises once the
        // photograph is in position, see the pin below.)
      }
    }
  });

  // The crossfade. Pinned on .peak__hold, which is a wrapper around the
  // figure rather than the figure itself, so the element being wiped is
  // never also the element being pulled out of flow by the pin.
  //
  // It starts where the wipe ends, at the same coordinate against the same
  // element, so the light begins leaving the room at the exact scroll
  // position the image finishes arriving, with no gap and no overlap.
  gsap.set(night, { opacity: 0 });
  gsap.set(clock, { opacity: 0 });
  // The answer slot is always in place now: the small title and the paragraph
  // live in it and are lifted in by the pin below. Only the names and hours
  // (the heads) wait for the end of the clock.
  gsap.set(answer, { opacity: 1, y: 0 });

  // The pin's total scroll range now carries the motion (PEAK_PIN_VH) and,
  // after it, a hold (PEAK_HOLD_VH) where nothing moves, added 2026-09-17 so
  // the answer has real dwell time before the page lets the reader
  // continue. MOTION_FRAC is what fraction of the combined range the motion
  // occupies; every beat below is defined against 0 to 1 of the motion
  // itself and then remapped onto that fraction, so the beats' relative
  // timing to each other is untouched by adding the hold.
  const TOTAL_VH = PEAK_PIN_VH + DN_BEAT_VH + DN_GLASS_VH + PEAK_HOLD_VH;
  const MOTION_FRAC = PEAK_PIN_VH / TOTAL_VH;
  const GLASS_FROM = (PEAK_PIN_VH + DN_BEAT_VH) / TOTAL_VH;
  const GLASS_TO = (PEAK_PIN_VH + DN_BEAT_VH + DN_GLASS_VH) / TOTAL_VH;

  // Where each beat sits on the motion's own 0 to 1, before the hold is
  // added. Named because the order is the whole design and it has to be
  // readable here: the clock owns the middle, and it is gone before the
  // answer starts, so the frame is never carrying both at once.
  const CLOCK_IN   = 0.04;
  const CLOCK_OUT  = 0.74;   // fully gone by GONE, below
  const GONE       = 0.82;
  const ANSWER_IN  = 0.86;

  const between = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));

  // The pin. Its tween carries nothing of its own: night, like everything else
  // on the frame, is set from the sun in onUpdate below, so it all runs on one
  // clock (TJ, 9 Oct 2026).
  const pinTween = gsap.to({ v: 0 }, {
    v: 1,
    scrollTrigger: {
      trigger: frame,
      start: 'top top',
      end: () => '+=' + window.innerHeight * TOTAL_VH,
      pin: stage,
      scrub: 0.9,
      // Pins are refreshed highest priority first. Giving them explicit
      // descending values in document order means each one measures its own
      // start after every pin above it has already claimed its spacer.
      refreshPriority: -11,
      invalidateOnRefresh: true,

      // The question hides once this pin releases, since it has nothing
      // left to sit on top of past this point. This trigger's own end is
      // guaranteed reachable, unlike the earlier attempt that measured
      // .act--peak's bottom separately and got a scroll position past what
      // the document could actually reach.

      // Everything the frame carries is driven from this one trigger's
      // progress rather than from triggers of its own. Separate triggers
      // on overlay elements inside a pinned stage read the stage's frozen
      // position, not the reader's travel, which is the same mistake the
      // care rail's per item entrances made before they were pointed at
      // the rail tween.
      onUpdate: self => {
        // Remapped onto the motion portion and clamped, so once scroll
        // enters the hold, m sits at 1 and every beat below simply stays
        // at its finished state rather than continuing to move.
        const m = Math.min(1, self.progress / MOTION_FRAC);

        // The clock arrives, holds, and clears before the answer. On phones the
        // line stays through the note, so Day is still a tap away at night, and
        // goes as the glass builds (set below, once the glass is known).
        if (!dnl) clock.style.opacity = m < GONE
          ? between(m, 0, CLOCK_IN) * (1 - between(m, CLOCK_OUT, GONE))
          : 0;

        // The sun falls through its own sky box, so the horizon line cuts
        // the disc as it sets instead of the disc sliding under a rule.
        // Measured against the box rather than a fixed pixel count so it
        // lands exactly on the line at whatever size the clamp resolves to.
        const sky = sun.parentElement.offsetHeight;
        const travel = between(m, CLOCK_IN, CLOCK_OUT);
        sun.style.transform = `translateY(${travel * sky}px)`;
        // Where the sun's lower edge touches the line, as a share of its travel.
        // Phones have no sun: night is complete at the end of the travel, as the
        // circle reaches Night.
        const touch = dnl ? 1 : sky > 0 ? Math.max(0.3, (sky - sun.offsetHeight) / sky) : 0.6;
        const N = ndSmooth(travel / touch);
        const C = ndSmooth((travel - 0.5 * touch) / (0.4 * touch));
        night.style.opacity = N.toFixed(3);
        creamNow = C;
        if (navSync) navSync();

        // Four states across the same travel. Each peaks as its own quarter
        // passes and falls away either side, so attention slides along the
        // row rather than snapping between them.
        const pos = travel * (states.length - 1);
        states.forEach((s, i) => {
          const lit = Math.max(0, 1 - Math.abs(pos - i));
          s.style.opacity = 0.24 + lit * 0.76;
        });

        // The answer, last, on an otherwise clear frame. Once m reaches 1
        // (motion finished, whether that is exactly at the boundary or
        // because scroll is now inside the hold) this stays at fully in.
        const a = between(m, ANSWER_IN, 1);
        // The glass, after a short beat on the two options. The question
        // gives way as the frame frosts, since it would sit on the light half.
        const gl = between(self.progress, GLASS_FROM, GLASS_TO);
        const g = gl * gl * (3 - 2 * gl);
        // The names and hours belong to the glass: they stay out until the small
        // title and the paragraph have gone (those are fully out by g 0.625), then
        // fade up and take their room as part of the transition.
        const ha = Math.min(1, Math.max(0, (g - 0.62) / 0.33));
        heads.forEach(h => {
          const nat = h.firstElementChild ? h.scrollHeight : 0;
          if (!h._nat || ha === 0) h._nat = Math.max(h._nat || 0, nat);
          h.style.setProperty('--dn-hh', (ha * (h._nat || 0)).toFixed(1));
          h.style.setProperty('--dn-ha', ha.toFixed(3));
        });
        setGlass(g);
        if (dnl) {
          // The sun starts half way between the title and the line (TJ, 12 Oct
          // 2026), so its sky reaches from the line up to that point plus half
          // the sun; measured live (the two sit in the same pinned frame).
          const tb = dnTitle ? dnTitle.getBoundingClientRect().bottom : 0;
          const rr = dnlRail.getBoundingClientRect(), lineY = rr.top + rr.height / 2;
          const sunH = dnlSun.offsetHeight || 35;
          const skyH = Math.max(sunH + 8, Math.round((lineY - tb) / 2 + sunH / 2));
          if (skyH !== dnlSkyH) { dnl.style.setProperty('--dnl-sky', skyH + 'px'); dnlSkyH = skyH; }
          const co = between(m, 0, CLOCK_IN) * (1 - between(g, 0, 0.45));
          clock.style.opacity = co.toFixed(3);
          dnl.style.setProperty('--dnl-t', travel.toFixed(4));
          dnl.classList.toggle('is-live', co > 0.15);
          dnlEnds[0].style.opacity = (1 - 0.5 * travel).toFixed(3);
          dnlEnds[1].style.opacity = (0.5 + 0.5 * travel).toFixed(3);
        }

        // The small title and the paragraph (TJ, 8 Oct 2026). They lift in (a
        // short rise and fade) once the photograph is in position, dark over the
        // afternoon room; they ease to cream as night falls (quick, not
        // lingering: black until about 15 percent of the pin, cream by about 21,
        // the measured crossover where black and cream are equally hard to
        // read), and give way as the glass arrives (see the stylesheet, which
        // reads --dn-g). The foot band behind them follows the night: light in
        // the afternoon so dark type reads, deep at night so cream does.
        const n = N, ne = C;
        const bt = Math.min(1, Math.max(0, (n - 0.04) / 0.18));
        // The small title and the paragraph wait for the dark (TJ, 9 Oct 2026):
        // they lift in once the sun has gone under the line and the clock has
        // cleared.
        const it = between(m, GONE, GONE + 0.1), ie = 1 - Math.pow(1 - it, 3);
        if (wrap) {
          wrap.style.setProperty('--dn-in', ie.toFixed(3));
          wrap.style.setProperty('--dn-nv', n.toFixed(3));
          wrap.style.setProperty('--dnt-c', [10, 10, 10].map((v, i) => Math.round(v + ([243, 239, 236][i] - v) * ne)).join(', '));
          wrap.style.setProperty('--dn-bb', (0.12 + 0.46 * bt * bt * (3 - 2 * bt)).toFixed(3));
        }

        // The question's colour is already settled to white by the wipe's
        // own trigger above before this pin ever engages, so nothing here
        // touches it again.
      }
    }
  });
  // Day rests just after the line arrives, Night where the night has fully fallen.
  if (dnl) dnLineTaps(pinTween.scrollTrigger, [CLOCK_IN * MOTION_FRAC + 0.004, CLOCK_OUT * MOTION_FRAC]);
}

/* Phones: a tap on Day or Night scrolls the page, over about two and a half
   seconds, to the point in the pin where the circle rests at that end. Any touch,
   wheel or key by the reader cancels it and hands back to the swipe. */
function dnLineTaps(st, at) {
  const dnl = document.querySelector('.act--peak .dnl');
  if (!dnl || !st) return;
  let raf = 0;
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };
  ['touchstart', 'wheel', 'keydown'].forEach(ev => window.addEventListener(ev, stop, { passive: true }));
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  dnl.querySelectorAll('[data-dnl]').forEach(btn => {
    btn.addEventListener('click', () => {
      stop();
      const y0 = window.scrollY, y1 = st.start + at[+btn.dataset.dnl] * (st.end - st.start);
      if (Math.abs(y1 - y0) < 2) return;
      if (REDUCED) { window.scrollTo(0, y1); return; }
      const t0 = performance.now(), dur = 2500;
      const step = now => {
        const k = Math.min(1, (now - t0) / dur);
        // instant: the page's own smooth scrolling would restart every frame and stall
        window.scrollTo({ top: y0 + (y1 - y0) * ease(k), behavior: 'instant' });
        raf = k < 1 ? requestAnimationFrame(step) : 0;
      };
      // The click came from a touch, whose touchstart already fired; start next frame.
      raf = requestAnimationFrame(step);
    });
  });
}

function navTheme() {
  const bar = document.querySelector('[data-nav]');
  const peak = document.querySelector('.act--peak');
  if (!bar || !peak) return;

  // The header's ink used to flip with a class (is-dark), which reads as a
  // light switch. It is now a value, --nd, 0 on the day ground to 1 on the
  // night one, set from scroll so the ink, logo and glass blend as the light
  // goes. The CSS that reads it is the [data-nd] block in what-we-do.css.
  // is-dark is still set past halfway, so the mobile open-menu rules in
  // site.css that key off it keep working.
  //
  // The blend is centred on 0.345 of the dissolve, the measured point where
  // dark and white ink both clear 4.5 on the glass, and spreads either side.

  let tIn = 0;   // rising through the dissolve
  let tOut = 1;  // falling as the night frame's lower edge sweeps past the bar
  const apply = () => {
    const t = Math.min(tIn, tOut);
    if (t <= 0.001) {
      bar.removeAttribute('data-nd');
      bar.style.removeProperty('--nd');
      bar.classList.remove('is-dark');
      return;
    }
    bar.setAttribute('data-nd', '');
    bar.style.setProperty('--nd', t.toFixed(3));
    bar.classList.toggle('is-dark', t > 0.5);
  };

  // In: the same change to cream as everything on the frame, from the sun
  // (creamNow, set by the pin in actPeak), so the menu and the frame turn together.
  navSync = () => { tIn = creamNow; apply(); };
  ScrollTrigger.create({
    trigger: peak,
    start: 'top top',
    end: 'bottom top',
    invalidateOnRefresh: true,
    // After the pin (-11), so it measures the section with the pin spacer in it.
    refreshPriority: -12,
    onUpdate: () => { tIn = creamNow; apply(); },
    onLeave: () => { tIn = 1; apply(); },
    onLeaveBack: () => { tIn = 0; apply(); }
  });

  // Out: the night frame's lower edge crosses the 80px bar. Over that short
  // sweep the bar is half photograph, half cream, so the ink eases back to
  // dark with it instead of cutting.
  ScrollTrigger.create({
    trigger: peak,
    start: 'bottom 90px',
    end: 'bottom 10px',
    invalidateOnRefresh: true,
    refreshPriority: -12,
    onUpdate: self => { tOut = 1 - self.progress; apply(); },
    onLeave: () => { tOut = 0; apply(); },
    onLeaveBack: () => { tOut = 1; apply(); }
  });
}

actPeak();
navTheme();
window.addEventListener('load', () => ScrollTrigger.refresh());
