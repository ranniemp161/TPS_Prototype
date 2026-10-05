/* The Promise ("Do we offer night care?"), for the What We Do page.
   Moved from the homepage on 5 Oct 2026. actPeak() and navTheme() below are
   copied from v1.js with their constants. Two differences: the plumbing at the
   top and bottom is new, and the pin's refreshPriority is -1 instead of 1 so it
   measures after the pinned sections above it on this page, and the header's
   dark flip is -2 so it measures after that pin. */

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const PEAK_PIN_VH = 1.92;
const PEAK_HOLD_VH = 0.6;

function actPeak() {
  const act = document.querySelector('.act--peak');
  if (!act) return;

  const frame = act.querySelector('[data-reveal]');
  const stage = act.querySelector('[data-stage]');
  const night = act.querySelector('.dissolve__night');
  const ask = act.querySelector('[data-peak-ask]');
  const clock = act.querySelector('[data-peak-clock]');
  const sun = act.querySelector('[data-peak-sun]');
  const states = [...act.querySelectorAll('[data-peak-states] span')];
  const answer = act.querySelector('[data-peak-answer]');

  if (REDUCED) {
    // The resolved end state: night fallen, the clock gone, the question
    // and the answer both present and readable without any motion. The
    // question reads white here, matching the fallen night it sits over.
    gsap.set(night, { opacity: 1 });
    gsap.set(ask, { opacity: 1, color: '#FFFFFF' });
    gsap.set(answer, { opacity: 1, y: 0 });
    gsap.set(clock, { opacity: 0 });
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
  // (see v1.html and the .peak__ask rule in v1.css), because it used to be
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
  gsap.set(ask, { opacity: 0, color: inkAt(0) });
  ScrollTrigger.create({
    trigger: act,
    start: 'top bottom',
    end: 'top top',
    onEnter: () => gsap.set(ask, { opacity: 1 }),
    onLeaveBack: () => gsap.set(ask, { opacity: 0 })
  });

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
      end: 'top top',
      scrub: 0.5,
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
        const askTop = ask.getBoundingClientRect().top;
        const rect = frame.getBoundingClientRect();
        const clipPct = 100 - self.progress * 100; // inset() top value, decreasing as it opens
        const visibleTop = rect.top + rect.height * (clipPct / 100);
        ask.style.color = inkAt(visibleTop <= askTop ? 1 : 0);
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
  gsap.set(answer, { opacity: 0, y: 16 });

  // The pin's total scroll range now carries the motion (PEAK_PIN_VH) and,
  // after it, a hold (PEAK_HOLD_VH) where nothing moves, added 2026-09-17 so
  // the answer has real dwell time before the page lets the reader
  // continue. MOTION_FRAC is what fraction of the combined range the motion
  // occupies; every beat below is defined against 0 to 1 of the motion
  // itself and then remapped onto that fraction, so the beats' relative
  // timing to each other is untouched by adding the hold.
  const TOTAL_VH = PEAK_PIN_VH + PEAK_HOLD_VH;
  const MOTION_FRAC = PEAK_PIN_VH / TOTAL_VH;

  // Where each beat sits on the motion's own 0 to 1, before the hold is
  // added. Named because the order is the whole design and it has to be
  // readable here: the clock owns the middle, and it is gone before the
  // answer starts, so the frame is never carrying both at once.
  const CLOCK_IN   = 0.04;
  const CLOCK_OUT  = 0.74;   // fully gone by GONE, below
  const GONE       = 0.82;
  const ANSWER_IN  = 0.86;

  const between = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));

  gsap.to(night, {
    opacity: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: frame,
      start: 'top top',
      end: () => '+=' + window.innerHeight * TOTAL_VH,
      pin: stage,
      scrub: 0.9,
      // Pins are refreshed highest priority first. Giving them explicit
      // descending values in document order means each one measures its own
      // start after every pin above it has already claimed its spacer.
      refreshPriority: -1,
      invalidateOnRefresh: true,

      // The question hides once this pin releases, since it has nothing
      // left to sit on top of past this point. This trigger's own end is
      // guaranteed reachable, unlike the earlier attempt that measured
      // .act--peak's bottom separately and got a scroll position past what
      // the document could actually reach.
      onLeave: () => gsap.set(ask, { opacity: 0 }),
      onLeaveBack: () => gsap.set(ask, { opacity: 0 }),

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

        // The clock arrives, holds, and clears before the answer.
        clock.style.opacity = m < GONE
          ? between(m, 0, CLOCK_IN) * (1 - between(m, CLOCK_OUT, GONE))
          : 0;

        // The sun falls through its own sky box, so the horizon line cuts
        // the disc as it sets instead of the disc sliding under a rule.
        // Measured against the box rather than a fixed pixel count so it
        // lands exactly on the line at whatever size the clamp resolves to.
        const sky = sun.parentElement.offsetHeight;
        const travel = between(m, CLOCK_IN, CLOCK_OUT);
        sun.style.transform = `translateY(${travel * sky}px)`;

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
        answer.style.opacity = a;
        answer.style.transform = `translateY(${(1 - a) * 16}px)`;

        // The question's colour is already settled to white by the wipe's
        // own trigger above before this pin ever engages, so nothing here
        // touches it again.
      }
    }
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
  // v1.css that key off it keep working.
  //
  // The blend is centred on 0.345 of the dissolve, the measured point where
  // dark and white ink both clear 4.5 on the glass, and spreads either side.
  const FROM = 0.20, TO = 0.49;
  const smooth = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };

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

  // The pinned dissolve as a fraction of the whole peak act, from the real
  // measured height, re-read on every refresh.
  let dissolveSpan = 1;
  const measure = () => {
    dissolveSpan = (window.innerHeight * PEAK_PIN_VH) / peak.offsetHeight;
  };
  measure();

  ScrollTrigger.create({
    trigger: peak,
    start: 'top top',
    end: 'bottom top',
    invalidateOnRefresh: true,
    // After the pin (-1), so it measures the section with the pin spacer in it.
    refreshPriority: -2,
    onRefresh: measure,
    onUpdate: self => {
      tIn = smooth((self.progress / dissolveSpan - FROM) / (TO - FROM));
      apply();
    },
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
    refreshPriority: -2,
    onUpdate: self => { tOut = 1 - self.progress; apply(); },
    onLeave: () => { tOut = 0; apply(); },
    onLeaveBack: () => { tOut = 1; apply(); }
  });
}

actPeak();
navTheme();
window.addEventListener('load', () => ScrollTrigger.refresh());
