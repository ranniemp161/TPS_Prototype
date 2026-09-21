/* ============================================================
   THE POSTPARTUM SUITE — scroll narrative
   GSAP + ScrollTrigger. Seven acts, five device families,
   no family twice in a row.

   Motion rule inherited from the brand: calm before persuasive.
   Nothing here bounces, overshoots, or asks for attention.
   ============================================================ */

document.documentElement.classList.add('js');

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

// The dissolve's pin span, in viewport-heights. Halved from 3.2 to 1.6 at
// TJ's request 2026-09-17, then slowed 20% the same day once the halved
// version felt too fast to actually experience the light changing: 1.6 to
// 1.92. Shared with navTheme() below so its own span-conversion constant
// can never drift out of sync with this one the way it did before, when
// 3.2 was typed here and 4.2 was typed there as a separately hand-measured,
// already slightly stale guess.
const PEAK_PIN_VH = 1.92;

// A hold added after the answer has fully arrived, 2026-09-17: TJ wants
// real dwell time on the button before the page lets the reader continue,
// not the pin releasing the moment the answer finishes fading in. This is
// additional scroll distance, separate from PEAK_PIN_VH above: the motion
// (wipe into crossfade into clock into answer) is unaffected, and this much
// more scrolling has to happen after progress 1 on that motion before the
// pin actually lets go.
const PEAK_HOLD_VH = 0.6;

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
   ACT 1 · 07:00 · Arrival
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

/* actRest() removed 2026-09-16: the rest act was merged into the dissolve
   at TJ's direction. See actPeak() below. */

/* ------------------------------------------------------------
   ACT 4 · 13:00 · Four kinds of care
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

  // Two builds, chosen by width, because below 700px the CSS stacks this
  // rail into an ordinary vertical column and there is nothing to pin and
  // nothing to travel sideways. gsap.matchMedia rather than reading the
  // width once at boot: a phone rotated to landscape crosses this
  // breakpoint, and the pinned build has to be able to construct itself at
  // that point and tear itself down again on the way back.
  const mm = gsap.matchMedia();

  mm.add('(min-width: 701px)', () => {
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
    // This used to be keyed to 'top 92%', a vertical position, on elements
    // that only ever move horizontally inside a pinned stage. Their tops
    // barely change, so all four fired within a frame of each other the
    // moment the act arrived, and the stagger the code was written for never
    // happened. The empty `containerAnimation: null` was the hook for exactly
    // this and was left unset. Pointing it at the rail tween makes the
    // trigger read horizontal progress along the rail instead, so a card
    // animates when it actually enters the frame, at whatever pace the
    // reader is scrolling.
    //
    // The intro block is exempt: it carries the heading and has to be present
    // the moment the act lands. Card one is not exempt, but it starts on
    // screen on desktop, so it settles immediately and reads as simply being
    // there.
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

    // Lateral parallax. The rail travels sideways, so the depth cue has to
    // travel sideways too: each photograph slides inside its own frame at a
    // rate slightly off the card's, and the card's text stays at the card's
    // rate. Read against the rail tween rather than against scroll position,
    // for the same reason the entrances above are: inside a pinned stage the
    // cards' vertical position barely changes, so a vertical trigger would fire
    // all four at once and none of them would be tracking the actual travel.
    //
    // The four rates differ by roughly a tenth. Identical rates would move the
    // row as one sheet, which is the thing this is here to stop, and anything
    // wider stops reading as distance and starts reading as slippage.
    const RATES = [7.2, 6.4, 7.8, 6.8];
    gsap.utils.toArray('.rail__item .card__media img', rail).forEach((img, i) => {
      const r = RATES[i % RATES.length];
      gsap.fromTo(img,
        { xPercent: -r },
        {
          xPercent: r, ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.rail__item'),
            containerAnimation: railTween,
            start: 'left right',
            end: 'right left',
            scrub: true,
            invalidateOnRefresh: true
          }
        }
      );
    });
  });

  mm.add('(max-width: 700px)', () => {
    // Stacked. The cards travel vertically with the page now, so they take
    // the ordinary flow reveal the rest of the page uses: opacity from zero
    // and a small rise, fired once on entry. No floor on the opacity here,
    // unlike the pinned build: a card that is arriving from the bottom of
    // the screen is not half cropped by a frame edge the way one entering
    // sideways is, so there is nothing for a partial state to explain.
    //
    // The intro is included rather than exempt. Sideways it had to be
    // present the instant the act landed because it was already on screen;
    // stacked, it enters like everything else.
    gsap.utils.toArray('.rail__item', rail).forEach(item => {
      gsap.fromTo(item,
        { opacity: 0, y: 18 },
        {
          opacity: 1, y: 0, duration: 0.62, ease: EASE,
          scrollTrigger: { trigger: item, start: 'top 88%', once: true }
        }
      );
    });
  });


}

/* ------------------------------------------------------------
   ACT 5 · 15:00 to 19:00 · The dissolve. THE PEAK.
   pin + cross-dissolve. The frame does not move. The light leaves it.
   Largest span on the page.
   ------------------------------------------------------------ */
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
      refreshPriority: 1,
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

/* The night act was removed 2026-09-05; its frame lived in the confinement
   act as a stacked figure until 2026-09-07, when the confinement act was
   redesigned onto the split-stage device and actTurn() below took over
   animating it. This function no longer has a home to run in. */

/* ------------------------------------------------------------
   PROGRAMMES · duration, drawn
   The bars grow from the same origin the scale is measured from, so the
   row reads as a length being laid down rather than four objects fading
   in. Width is already correct in CSS; this only scales it, so there is
   no layout being animated and nothing to reflow.
   ------------------------------------------------------------ */
function durations() {
  const dur = document.querySelector('.dur');
  if (!dur) return;
  const bars = dur.querySelectorAll('.dur__bar');
  if (!bars.length) return;

  if (REDUCED) { gsap.set(bars, { scaleX: 1 }); return; }

  gsap.set(bars, { scaleX: 0 });
  gsap.to(bars, {
    scaleX: 1,
    duration: 1.0,
    stagger: 0.11,
    ease: EASE,
    scrollTrigger: { trigger: dur, start: 'top 76%', once: true }
  });

  const media = act.querySelector('[data-night-reveal]');
  const line = act.querySelector('[data-night-line]');
  if (!media || !line) return;

  // Reduced motion gets the frame and the line as they finally are. The
  // CSS already neutralises the clip path and the offset; this only makes
  // sure nothing is left sitting at zero opacity.
  if (REDUCED) {
    gsap.set(line, { opacity: 1, y: 0 });
    return;
  }

  // The same wipe act 2 uses, deliberately: this is the page's second and
  // last reveal, and the ending answering the first beat with the same
  // gesture is the point. Scrubbed, so the frame opens at the speed the
  // reader opens it.
  gsap.set(media, { clipPath: 'inset(100% 0% 0% 0%)' });
  gsap.to(media, {
    clipPath: 'inset(0% 0% 0% 0%)',
    ease: 'none',
    scrollTrigger: { trigger: media, start: 'top 90%', end: 'top 26%', scrub: 0.5 }
  });

  // The line waits for the frame, arrives once, slowly, and then the act
  // holds: this is the authored silence the brief asks for, and it is only
  // silent if nothing is still moving when the reader gets here.
  gsap.set(line, { opacity: 0, y: 26 });
  gsap.to(line, {
    opacity: 1, y: 0, duration: 1.4, ease: EASE,
    scrollTrigger: { trigger: media, start: 'top 34%', once: true }
  });

  // The same plane act 2 gets, for the same reason the wipe is the same:
  // the ending answers the opening with the gesture the opening used. Kept a
  // shade smaller than act 2's, because this act is the one that has to come
  // to rest, and it does: the drift ends with the frame, and after that
  // nothing on this screen is moving.
  const plane = media.querySelector('img');
  if (plane) {
    gsap.fromTo(plane,
      { yPercent: -5 },
      {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      }
    );
  }
}

/* ------------------------------------------------------------
   PROGRAMMES · duration, drawn
   The bars grow from the same origin the scale is measured from, so the
   row reads as a length being laid down rather than four objects fading
   in. Width is already correct in CSS; this only scales it, so there is
   no layout being animated and nothing to reflow.
   ------------------------------------------------------------ */
function durations() {
  const dur = document.querySelector('.dur');
  if (!dur) return;
  const bars = dur.querySelectorAll('.dur__bar');
  if (!bars.length) return;

  if (REDUCED) { gsap.set(bars, { scaleX: 1 }); return; }

  gsap.set(bars, { scaleX: 0 });
  gsap.to(bars, {
    scaleX: 1,
    duration: 1.0,
    stagger: 0.11,
    ease: EASE,
    scrollTrigger: { trigger: dur, start: 'top 76%', once: true }
  });
}

/* ------------------------------------------------------------
   ACT 7 · Programmes
   flow + in. Fires once on entry, never re-hides.
   ------------------------------------------------------------ */
/* ------------------------------------------------------------
   THE CONFINEMENT ACT
   Redesigned 2026-09-07 onto the split-stage device the treatment act
   used to own (see HANDOVER.md): text and photograph in one row instead
   of a text block with the photograph waiting below it, closing the
   scroll gap that sat between them.

   The heading now carries the kinetic line-assembly that used to belong
   to the standfirst. devices.md section 5 caps a kinetic headline at one
   per act; moving the device onto the heading, to match what the
   treatment act did, means the standfirst goes back to a plain fade with
   the rest of the copy rather than competing with it.

   Split after fonts have loaded, because line boxes move when the face
   swaps in, and re-split on resize for the same reason.
   ------------------------------------------------------------ */
function actTurn() {
  const act = document.querySelector('.act--turn');
  if (!act) return;

  const heading = act.querySelector('.stage__side [data-kinetic]');
  const copy = act.querySelectorAll('.stage__side .turn__standfirst, .stage__side .body');
  const img = act.querySelector('.stage__frame img');

  if (heading) {
    const source = heading.textContent;
    const build = () => {
      heading.textContent = source;
      const lines = splitLines(heading);
      if (REDUCED) { gsap.set(lines, { yPercent: 0, opacity: 1 }); return; }
      gsap.set(lines, { yPercent: 108, opacity: 0 });
      gsap.to(lines, {
        yPercent: 0, opacity: 1,
        duration: 0.9,
        stagger: 0.08,
        ease: EASE,
        scrollTrigger: { trigger: heading, start: 'top 86%', once: true }
      });
    };
    build();

    // Re-measure on a width change only. A height change is an address bar,
    // not a reflow, and rebuilding on it would replay the animation.
    let w = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      ScrollTrigger.getAll().forEach(t => { if (t.trigger === heading) t.kill(); });
      build();
    });
  }

  gsap.set(copy, { opacity: 0, y: REDUCED ? 0 : 16 });
  gsap.to(copy, {
    opacity: 1, y: 0, duration: 0.75, stagger: 0.12, ease: EASE,
    scrollTrigger: { trigger: act, start: 'top 70%', once: true }
  });

  if (REDUCED || !img) return;

  // Subtle differential parallax & settling scale adhering to scroll-craft and taste-skill:
  // The image drifts smoothly inside its masked frame while settling from 1.06 to 1.0.
  gsap.fromTo(img,
    { scale: 1.06, yPercent: -4 },
    {
      scale: 1, yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: act, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
    }
  );
}

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
function navTheme() {
  const bar = document.querySelector('[data-nav]');
  const peak = document.querySelector('.act--peak');
  if (!bar || !peak) return;

  // The pinned dissolve as a fraction of the whole peak act, computed from
  // the real measured height rather than a second hand-typed constant.
  // Two hardcoded numbers, 3.2 here and 4.2 for the act, were previously
  // kept in sync by hand and had already drifted: the act measured 4.43vh
  // once the title above the figure grew, not the 4.2 the comment claimed.
  // Reading peak.offsetHeight directly means this can only ever be correct,
  // whatever the title's height or the pin span happen to be. Read inside
  // onRefresh so it re-measures whenever ScrollTrigger does, same as the
  // trigger's own 'bottom top' end.
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
    onRefresh: measure,
    // Where the wordmark and the tab ink flip to white together.
    //
    // Two different scales meet here and they are easy to confuse. This
    // trigger spans the whole peak act, because a toggle driven off the pin
    // alone stops updating while the dark frame is still sliding up past
    // the bar. The dissolve itself is only the pinned PEAK_PIN_VH portion
    // of that. So a position measured on the dissolve has to be converted
    // before it can be compared against self.progress, which is what
    // dissolveSpan does. Getting this wrong put the flip at 0.50 of the
    // dissolve rather than 0.34, and left a stretch where dark ink sat at
    // 3.4 to 1 waiting for a switch that had not come yet.
    //
    // 0.345 is the crossover: measured on the chip surface the text
    // actually sits on, dark ink reads 4.60 and white reads 4.57 at that
    // point, so both clear 4.5 and the 180ms cross fade cannot be caught
    // in an unreadable state either side of it.
    onUpdate: self => bar.classList.toggle('is-dark', self.progress > 0.345 * dissolveSpan),
    onLeave: () => bar.classList.remove('is-dark'),
    onLeaveBack: () => bar.classList.remove('is-dark')
  });
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

  // Every frame is cropped to 4:5 in the picker and the stage, and 4:3 on
  // a phone, from sources that run from 4:5 to 16:9. Centre-cropping the
  // wide ones cuts the mother out of her own photograph, which is the one
  // imagery rule the Brand Pack states outright. So each treatment carries
  // its own focal point and both the thumbnail and the large frame are
  // positioned from it.
  const posOf = btn => btn.dataset.pos || '50% 50%';
  items.forEach(btn => { btn.querySelector('img').style.objectPosition = posOf(btn); });
  imgs[0].style.objectPosition = posOf(items[0]);

  // Warm the large frames at init. Without this the first click on each
  // thumbnail waits on a full-size download before anything moves, which
  // measured as multiple seconds of apparently dead UI on a cold load.
  items.forEach(btn => {
    if (btn.classList.contains('is-active')) return;
    const pre = new Image();
    pre.decoding = 'async';
    pre.src = btn.dataset.img;
  });

  // idxEl is optional as of 2026-09-07: the 01 / 06 counter came off when
  // this became the programme picker, and a section counter is a hard rule
  // ban. data-index is still on the buttons because the rest of the
  // component reads it, so this only has to survive the element being gone.
  const setCopy = btn => {
    if (idxEl) idxEl.textContent = btn.dataset.index;
    titleEl.textContent = btn.dataset.title;
    bodyEl.textContent = btn.dataset.body;
  };

  const swapCopy = btn => {
    const copy = [idxEl, bodyEl, titleEl].filter(Boolean);
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
    back.alt = btn.dataset.alt || btn.dataset.title;
    back.style.objectPosition = posOf(btn);

    const land = () => {
      gsap.set(back, { opacity: 1 });
      gsap.set(fore, { opacity: 0 });
      // Only the visible frame is described. The one waiting underneath is
      // decoration, and announcing both reads as a duplicate to a screen
      // reader, whichever of the pair happens to be in front.
      back.removeAttribute('aria-hidden');
      fore.setAttribute('aria-hidden', 'true');
      fore.alt = '';
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
    ghost.style.objectPosition = posOf(btn);
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



/* ============================================================
   ACT: STANDALONE TREATMENTS (IN-HOME CARE)
   True Horizontal Concertina on Canvas + Scrubber Slider (No Arrows)
   ============================================================ */
/* actTreatments() removed 2026-09-21: it drove the old stepped concertina
   (.act--treatments, [data-pleat]), which was deleted from v1.html and
   v1.css the same day in favour of the horizontal accordion below. See
   actTreatmentsB(). */

/* ------------------------------------------------------------
   SECTION · Treatments, horizontal accordion
   Click to open one panel at a time. No ScrollTrigger of its own: the
   mechanic is just a width transition with overflow: hidden doing the
   cropping (see .tb-acc__panel in v1.css), so it needs nothing scroll
   driven, only a click handler swapping which panel carries .is-open.

   On desktop that width change never touches page height, so nothing
   downstream is affected. On mobile the panel instead changes HEIGHT (see
   the @media block in v1.css), growing from about 72px to as much as
   70vh, which pushes every section below it up the page. Caught live: the
   dissolve act's own title, .peak__ask, is fixed and shows itself via a
   ScrollTrigger watching when .act--peak's top crosses the viewport's
   bottom edge (see actPeak() above). That trigger's cached boundary goes
   stale the instant this accordion's height changes, so without a refresh
   the title could read as already on screen while the reader is still
   inside this section, hundreds of pixels above where .act--peak actually
   sits. ScrollTrigger.refresh() after the transition ends fixes it for
   every downstream trigger at once, not just this one case.
   ------------------------------------------------------------ */
function actTreatmentsB() {
  const acc = document.querySelector('[data-tb-acc]');
  if (!acc) return;

  const panels = [...acc.querySelectorAll('.tb-acc__panel')];
  panels.forEach(panel => {
    panel.addEventListener('click', () => {
      if (panel.classList.contains('is-open')) return;
      panels.forEach(p => {
        const open = p === panel;
        p.classList.toggle('is-open', open);
        p.setAttribute('aria-expanded', String(open));
      });
      // 550ms matches the panel's own transition-duration in v1.css. Timed
      // to the animation's end rather than fired immediately, so the
      // refresh measures the settled layout, not a mid-transition one.
      window.setTimeout(() => ScrollTrigger.refresh(), 560);
    });
  });
}

function boot() {
  actTreatmentsB();
  nav();
  actHero();
  actPan();
  actPeak();
  actTurn();
  durations();
  actFlow();
  gallery();
  mistHandoff();
  navTheme();
  // Last. It registers no ScrollTrigger and never transforms its own
  // section, so it stays out of the measurement the hero pin depends on.
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

  // ScrollTrigger registers its own refresh on window load, and boot() runs
  // earlier than that, on document.fonts.ready. So anything measured above
  // was being re-measured moments later by ScrollTrigger itself, at whatever
  // scroll position the page was sitting at. With a fragment in the URL that
  // position is wherever the browser has already jumped to, and the hero
  // pin comes back measured from that wrong origin instead of 0. Its span
  // is still right either way, which is what makes this easy to miss: the
  // pin is not broken, it is measured from the wrong place, so it looks
  // fine until someone opens the page on a URL ending in an anchor.
  //
  // This exact fix already existed in v1-ruined.js and was deliberately not
  // carried across while it cost nothing to leave out. It started costing
  // something 2026-09-19, when an unrelated change elsewhere on the page
  // added one more entrance trigger and the hero guard caught the fault for
  // the first time. Copied in now, unchanged from v1-ruined.js: zero the
  // scroll, refresh from there so every pin measures from the true origin,
  // then jump to the anchor.
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
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(boot);
} else {
  window.addEventListener('load', boot);
}
