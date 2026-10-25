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
  // The copy enters in one order: the two headline lines, then the script,
  // then the lede. The fades carry on from the lines' indexes so nothing
  // enters on top of another (TJ, 14 Oct 2026).
  fades.forEach((el, i) => el.style.setProperty('--i', i + lines.length));
  act.classList.add('is-ready');
}

/* actRest() removed 2026-09-16: the rest act was merged into the dissolve
   at TJ's direction. See actPeak() below. */

/* ------------------------------------------------------------
   ACT 4 · 13:00 · Four kinds of care
   pan. Vertical scroll, lateral travel.
   ------------------------------------------------------------ */
/* ------------------------------------------------------------
   FOUR KINDS OF CARE, a carousel on the line (Ami, 24 Oct 2026)
   Replaces actPan(), the sideways rail pinned to the scroll, which Ami found
   unintuitive. The page scrolls past it normally. One card shows at a time;
   the arrows, a tap on a name on the line, the arrow keys or a sideways
   swipe move one kind of care. The line is the Programmes page's
   (programmes.js): stops at a fixed spacing on a track that slides under the
   centre circle, looping without a jump. The card leaves the way the track
   moves and the next comes in from the other side.
   ------------------------------------------------------------ */
function actCare() {
  const act = document.querySelector('.act--care');
  if (!act) return;
  const cards = [...act.querySelectorAll('[data-care-card]')];
  const track = act.querySelector('[data-care-track]');
  const live = act.querySelector('[data-care-live]');
  const prev = act.querySelector('[data-care-prev]');
  const next = act.querySelector('[data-care-next]');
  if (!cards.length || !track) return;

  const names = cards.map(c => c.querySelector('.card__title').textContent.trim());
  const n = cards.length;
  const mod = k => ((k % n) + n) % n;
  const WINDOW = 3;
  const items = {};
  let p = 0;

  const makeItem = k => {
    const el = document.createElement('div');
    el.className = 'tv2__item';
    el.style.setProperty('--q', k);
    el.innerHTML = '<span class="tv2__dot" aria-hidden="true"></span>'
      + '<button class="tv2__stop" type="button">' + names[mod(k)] + '</button>';
    el.querySelector('button').addEventListener('click', () => { if (k !== p) move(k - p); });
    return el;
  };
  const sync = () => {
    for (let k = p - WINDOW; k <= p + WINDOW; k++) {
      if (!items[k]) { items[k] = makeItem(k); track.appendChild(items[k]); }
    }
    Object.keys(items).forEach(key => {
      if (Math.abs(+key - p) > WINDOW) { items[key].remove(); delete items[key]; }
    });
  };
  const paint = () => {
    track.style.transform = 'translateX(calc(' + (-p) + ' * var(--tv-s)))';
    Object.keys(items).forEach(key => {
      const b = items[key].querySelector('button');
      if (+key === p) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  };
  const show = (dir) => {
    const now = mod(p);
    cards.forEach((c, i) => {
      const on = i === now;
      if (on && dir && !REDUCED) {
        // Start the arriving card on the side it comes in from.
        c.style.transition = 'none';
        c.style.transform = 'translateX(' + (dir * 40) + 'px)';
        void c.offsetWidth;
        c.style.removeProperty('transition');
        c.style.removeProperty('transform');
      }
      c.classList.toggle('is-current', on);
      c.setAttribute('aria-hidden', String(!on));
      c.inert = !on;
    });
    if (live) live.textContent = names[now];
  };
  const move = step => {
    p += step;
    act.style.setProperty('--care-dir', step > 0 ? 1 : -1);
    sync(); paint(); show(step > 0 ? 1 : -1);
  };

  sync(); paint(); show(0);
  if (prev) prev.addEventListener('click', () => move(-1));
  if (next) next.addEventListener('click', () => move(1));
  act.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
  });
  const box = act.querySelector('[data-care-cards]');
  let sx = 0, sy = 0;
  box.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  box.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
  }, { passive: true });
}

/* Retired (Ami, 24 Oct 2026): the sideways rail. Nothing calls it; kept for
   reference until TJ approves the carousel. */
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

    // The line (TJ, 15 Oct 2026): the site's progression line across the
    // whole width under the rail, in the house film's manner. The circle
    // holds the centre of the screen and the fill runs from the left edge
    // to it; a dot sits under each card and travels with the rail, so each
    // card's dot passes the circle as the card reaches the centre, and the
    // card's title rides beneath its dot. Dots behind the circle are cards
    // passed. A tap on a name carries the page to that card. Built here so
    // it exists only where the rail is pinned; the stacked phone rail has
    // no travel to show.
    const cards = gsap.utils.toArray('.rail__item.card', rail);
    const line = document.createElement('nav');
    line.className = 'care-line';
    line.setAttribute('aria-label', 'Four kinds of care');
    line.innerHTML = '<span class="care-line__track" aria-hidden="true"></span>'
      + '<span class="care-line__fill" aria-hidden="true"></span>'
      + '<ol class="care-line__stops"></ol>'
      + '<span class="care-line__tip" aria-hidden="true"></span>';
    const lineList = line.querySelector('.care-line__stops');
    const stops = cards.map(card => {
      const li = document.createElement('li');
      li.className = 'care-line__stop';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = card.querySelector('.card__title').textContent;
      li.appendChild(btn);
      lineList.appendChild(li);
      return { li, btn, card };
    });
    stage.appendChild(line);

    // Each card's centre in the rail's own coordinates; the rail sits at the
    // stage's left edge, so on screen it is that plus the rail's x.
    let centres = [];
    const layoutLine = () => {
      centres = cards.map(c => c.offsetLeft + c.offsetWidth / 2);
      stops.forEach((s, i) => { s.li.style.left = centres[i].toFixed(1) + 'px'; });
    };
    let lastX = null;
    const paintLine = () => {
      const x = gsap.getProperty(rail, 'x');
      if (lastX !== null && Math.abs(x - lastX) < 0.25) return;
      lastX = x;
      lineList.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
      const mid = stage.clientWidth / 2;
      let cur = -1;
      centres.forEach((c, i) => { if (c + x <= mid + 1) cur = i; });
      stops.forEach((s, i) => {
        s.li.classList.toggle('is-past', i <= cur);
        s.li.classList.toggle('is-current', i === cur);
        if (i === cur) s.btn.setAttribute('aria-current', 'step'); else s.btn.removeAttribute('aria-current');
      });
    };

    const st = ScrollTrigger.create({
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
      animation: railTween,
      onRefresh: () => { layoutLine(); lastX = null; }
    });
    layoutLine();
    gsap.ticker.add(paintLine);

    // A tap on a name carries the page to where that card's centre has just
    // passed the circle. The rail tween spans the whole trigger, so the
    // rail's position maps straight onto the trigger's scroll range.
    stops.forEach((s, i) => {
      s.btn.addEventListener('click', () => {
        const travel = measure();
        const want = Math.min(travel, Math.max(0, centres[i] - stage.clientWidth / 2 + 4));
        const p = travel ? want / travel : 0;
        window.scrollTo({ top: st.start + p * (st.end - st.start), behavior: 'smooth' });
      });
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

    return () => { gsap.ticker.remove(paintLine); line.remove(); };
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

    // The line on phones (TJ, 16 Oct 2026): the desktop progression line
    // turned upright, in a lane down the right of the narrowed cards. A dot
    // sits level with each card's photograph; the fill and the circle run to
    // the middle of the screen, so a card's dot fills as its photograph
    // reaches the middle, as the desktop dots do sideways. No names: each
    // card's own title sits beside its dot.
    const vline = document.createElement('div');
    vline.className = 'care-vline';
    vline.setAttribute('aria-hidden', 'true');
    vline.innerHTML = '<span class="care-vline__track"></span><span class="care-vline__fill"></span>';
    const cards = gsap.utils.toArray('.rail__item.card', rail);
    const vdots = cards.map(() => {
      const d = document.createElement('span');
      d.className = 'care-vline__dot';
      vline.appendChild(d);
      return d;
    });
    const vtip = document.createElement('span');
    vtip.className = 'care-vline__tip';
    vline.appendChild(vtip);
    stage.appendChild(vline);

    // Equal tails above the first dot and below the last, as on the house route.
    const TAIL = 40;
    let vTop = 0, vLen = 0, ys = [];
    const measureV = () => {
      // Layout positions, not screen boxes: the cards rise 18px as they
      // enter, and a box read mid rise would put the dot off its photograph.
      const within = el => { let y = 0; for (let n = el; n && n !== stage; n = n.offsetParent) y += n.offsetTop; return y; };
      ys = cards.map(c => {
        const m = c.querySelector('.card__media') || c;
        return within(m) + m.offsetHeight / 2;
      });
      vTop = ys[0] - TAIL;
      vLen = ys[ys.length - 1] + TAIL - vTop;
      vline.style.top = vTop.toFixed(1) + 'px';
      vline.style.height = vLen.toFixed(1) + 'px';
      vdots.forEach((d, i) => { d.style.top = (ys[i] - vTop).toFixed(1) + 'px'; });
    };
    const paintV = () => {
      const sr = stage.getBoundingClientRect();
      const at = Math.max(0, Math.min(vLen, window.innerHeight / 2 - sr.top - vTop));
      vline.style.setProperty('--at', at.toFixed(1) + 'px');
      vdots.forEach((d, i) => d.classList.toggle('is-past', ys[i] - vTop <= at + 2));
    };
    const remeasureV = () => { measureV(); paintV(); };
    remeasureV();
    window.addEventListener('scroll', paintV, { passive: true });
    window.addEventListener('resize', remeasureV);
    window.addEventListener('load', remeasureV);
    ScrollTrigger.addEventListener('refresh', remeasureV);

    return () => {
      window.removeEventListener('scroll', paintV);
      window.removeEventListener('resize', remeasureV);
      window.removeEventListener('load', remeasureV);
      ScrollTrigger.removeEventListener('refresh', remeasureV);
      vline.remove();
    };
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

  // The hand over from the house film (TJ, 14 Oct 2026). home-flight.js lays
  // the act over the film from the moment the house and trees have left the
  // frame (.is-handover); here it is pinned to the window from there for two
  // beats, each its own stretch of scroll: the emerge, a steady linear
  // opacity 0 to 1 over BEAT_EMERGE windows (the film's last stretch still
  // plays and dissolves to white underneath its start), then a hold, fully
  // in, before the pin lets go. The fade is a scrubbed timeline on the pin
  // itself (scrub 0.7, the page's standard), so it always catches up with
  // the scroll, and nothing below the act can come up while it is pinned. If
  // a very fast scroll carries past the end before the scrub has caught up,
  // the pin's onLeave finishes it, so the act is always fully in when the
  // page moves on. The heading's assembly and the copy's entrance start
  // almost at once (about 0.05 opacity) and run long, so they rise with the
  // fade rather than switching on part way through it.
  // Decided here, not read from a class, because home-flight.js (which also
  // marks the act) loads after this file and boot() runs on fonts.ready,
  // which can resolve before it has run when the fonts are cached: the pin
  // was then never created and the act scrolled up at full opacity (TJ's
  // screenshots, 14 and 15 Oct 2026). Both scripts now decide from the same
  // facts, in either order.
  const held = !REDUCED && !!document.querySelector('[data-flight]');
  if (held) act.classList.add('is-handover');
  const BEAT_EMERGE = 1.0, BEAT_HOLD = 1.2;
  const BEATS = BEAT_EMERGE + BEAT_HOLD;
  const entrances = [];
  let entered = false;
  const enter = () => { if (entered) return; entered = true; entrances.forEach(t => t.play()); };

  if (held) {
    // The route runs on to this question (TJ, 15 Oct 2026): across the emerge
    // the pin's scrubbed timeline carries its fill to the last stop (e, to
    // home-flight.js), and once the pin lets go a second scrub dissolves the
    // whole route travels off with the act (below), it no longer fades.
    const pinTl = gsap.timeline({
      scrollTrigger: {
        trigger: act,
        start: 'top top',
        end: () => '+=' + window.innerHeight * BEATS,
        pin: true,
        pinSpacing: true,
        scrub: 0.7,
        // Refreshed before the care rail's pin (priority 2, below this on
        // the page): triggers are measured in priority order, and this pin's
        // spacer moves everything after it. Measured after the rail, the
        // rail's start was 2.2 windows stale and the two pins overlapped by
        // about 500px, so the rail was already panning while the
        // testimonials were still on screen (TJ's screenshot, 15 Oct 2026).
        refreshPriority: 2,
        invalidateOnRefresh: true,
        onUpdate: self => {
          // about 0.05 opacity on the linear emerge
          if (self.progress > (BEAT_EMERGE * 0.05) / BEATS) enter();
        },
        onLeave: self => { const t = self.getTween(); if (t) t.progress(1); enter(); },
        onLeaveBack: self => { const t = self.getTween(); if (t) t.progress(1); }
      }
    })
      .fromTo(act, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', duration: BEAT_EMERGE, immediateRender: true }, 0)
      .to({}, { duration: BEAT_HOLD });

    // Phones (TJ, 16 Oct 2026): the photograph opens like the specialist's
    // portrait on What We Do, from a narrow slot to the full frame. Here it
    // rides the pin's own emerge, so it opens as the act arrives, whatever
    // the scroll speed, and is fully open early in the hold.
    const turnFrame = act.querySelector('.stage__frame--turn');
    if (turnFrame && window.matchMedia('(max-width: 767px)').matches) {
      pinTl.fromTo(turnFrame,
        { clipPath: 'inset(0% 36% 0% 36% round 16px)' },
        { clipPath: 'inset(0% 0% 0% 0% round 16px)', ease: 'power2.inOut', duration: BEAT_EMERGE * 0.9, immediateRender: true },
        BEAT_EMERGE * 0.35);
    }

    // The line belongs to the act once it is complete (TJ, 15 Oct 2026): it
    // does not fade over the testimonials, it leaves with the act. The route
    // lives in a fixed layer (home-flight.js), so after the pin lets go the
    // layer is shifted by exactly the act's own offset each frame: 0 while
    // the act is below or pinned, then the act's negative top as it scrolls
    // up, so the line travels off the top with the text and the photograph.
    // Looked up each frame, not once: home-flight.js creates the layer and
    // can run after this (the fonts.ready race, see DESIGN.md 15 Oct).
    {
      let layer = null, lastY = null, lastShift = null, naturalLineY = null, layoutW = 0, layoutH = 0;
      const phoneQ = window.matchMedia('(max-width: 767px)');
      const lastPara = act.querySelector('.stage__side .body:last-of-type, .stage__side p:last-of-type');
      const frame = act.querySelector('.stage__frame');
      gsap.ticker.add(() => {
        if (!layer) { layer = document.querySelector('[data-route-layer]'); if (!layer) return; }
        const r = act.getBoundingClientRect();
        const y = Math.min(0, Math.round(r.top));
        if (y !== lastY) {
          lastY = y;
          layer.style.transform = y ? 'translate3d(0,' + y + 'px,0)' : '';
        }
        // While the act holds (16 Oct 2026), the line's fixed height can run
        // through the act's content: on a phone through its last paragraph,
        // on a short desktop window through the photograph. So once the act
        // is at the top, the line is shifted into the clear band beneath the
        // content: on phones the gap between the last paragraph and the
        // photograph, on desktop below the lower of the two. The natural
        // (unshifted) line height is read once per layout, so the maths never
        // feeds on its own output.
        let shift = 0;
        if (lastPara && frame && r.top <= 1) {
          const line = layer.querySelector('.route__line') || layer.querySelector('[data-route]');
          if (naturalLineY === null || layoutW !== innerWidth || layoutH !== innerHeight) {
            const prev = layer.style.getPropertyValue('--route-phone-shift');
            layer.style.setProperty('--route-phone-shift', '0px');
            const lr0 = line.getBoundingClientRect();
            naturalLineY = lr0.top + lr0.height / 2 - (lastY || 0);
            layoutW = innerWidth; layoutH = innerHeight;
            layer.style.setProperty('--route-phone-shift', prev || '0px');
          }
          const lineY = naturalLineY + (lastY || 0);
          const pr = lastPara.getBoundingClientRect(), fr = frame.getBoundingClientRect();
          let target;
          if (phoneQ.matches) {
            if (fr.top - pr.bottom > 24) target = (pr.bottom + fr.top) / 2;
          } else {
            const contentBottom = Math.max(pr.bottom, fr.bottom);
            const room = innerHeight - contentBottom;
            if (room > 40) target = contentBottom + Math.min(room / 2, 60);
          }
          if (target !== undefined && lineY < Math.max(pr.bottom, phoneQ.matches ? pr.bottom : fr.bottom) + 8) shift = Math.round(target - lineY);
        }
        if (shift !== lastShift) {
          lastShift = shift;
          layer.style.setProperty('--route-phone-shift', shift + 'px');
        }
      });
    }
  }

  if (heading) {
    const source = heading.textContent;
    let headTween = null;
    const build = () => {
      heading.textContent = source;
      const lines = splitLines(heading);
      if (REDUCED) { gsap.set(lines, { yPercent: 0, opacity: 1 }); return; }
      gsap.set(lines, { yPercent: 108, opacity: 0 });
      // run long when it rides the hand over's fade, so it rises with it
      const vars = { yPercent: 0, opacity: 1, duration: held ? 1.2 : 0.9, stagger: 0.08, ease: EASE };
      if (held) {
        headTween = gsap.to(lines, { ...vars, paused: true });
        const i = entrances.indexOf(build.last);
        if (i >= 0) entrances.splice(i, 1);
        entrances.push(headTween);
        build.last = headTween;
        if (entered) headTween.play();
      } else {
        headTween = gsap.to(lines, { ...vars, scrollTrigger: { trigger: heading, start: 'top 86%', once: true } });
      }
    };
    build();

    // Re-measure on a width change only. A height change is an address bar,
    // not a reflow, and rebuilding on it would replay the animation.
    let w = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      ScrollTrigger.getAll().forEach(t => { if (t.trigger === heading) t.kill(); });
      if (headTween) headTween.kill();
      build();
    });
  }

  gsap.set(copy, { opacity: 0, y: REDUCED ? 0 : 16 });
  const copyVars = { opacity: 1, y: 0, duration: held ? 1.2 : 0.75, stagger: 0.12, ease: EASE };
  if (held) entrances.push(gsap.to(copy, { ...copyVars, paused: true }));
  else gsap.to(copy, { ...copyVars, scrollTrigger: { trigger: act, start: 'top 70%', once: true } });

  if (REDUCED || !img) return;

  // Subtle differential parallax & settling scale adhering to scroll-craft and taste-skill:
  // The image drifts smoothly inside its masked frame while settling from 1.06 to 1.0.
  // Created after the pin, so it measures with the pin's spacing in place.
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

  // The three figures start from zero and count up after the lines land.
  // The HTML carries the real totals, so this only runs when they are about
  // to be shown.
  const figBlock = bath.querySelector('[data-bath-figures]');
  const counts = figBlock ? [...figBlock.querySelectorAll('[data-bath-count]')] : [];
  if (figBlock) gsap.set(figBlock, { opacity: 0, y: 14 });
  counts.forEach((el) => { el.textContent = '0'; });

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

  // The figures (TJ, 14 Oct 2026). They ride the same pinned timeline as the
  // steam, added as tweens inside its 0 to 0.98 span, so they reverse with
  // the scroll and finish while the bath still fills the screen. The block
  // rises in as the steam thins, then each count runs as an integer tween
  // that rounds during the count and writes the exact total on completion.
  if (figBlock) {
    tl.fromTo(figBlock,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.12, ease: EASE }, 0.50);
    counts.forEach((el) => {
      const target = Number(el.dataset.bathCount);
      const count = { v: 0 };
      tl.fromTo(count,
        { v: 0 },
        {
          v: target,
          duration: 0.37,
          ease: 'none',
          onUpdate: () => { el.textContent = String(Math.round(count.v)); },
          onComplete: () => { el.textContent = String(target); },
          onReverseComplete: () => { el.textContent = '0'; }
        }, 0.55);
    });
  }
}

/* ------------------------------------------------------------
   DOOR HANDOFF (TJ, 14 Oct 2026)
   The house film is pulled up underneath the bath (site.css, .flight--home; since 21 Oct 2026 the home film, .film)
   so its stage is already held on the top of the window, on the closed
   front door, by the time the bath lets go. The bath is layered above it
   and simply rises out under the header, lifting off the door like a
   curtain. A band of smoke trails the bath's bottom edge, so the door
   dissolves in through it. There is no white screen: what is behind the
   smoke is the door, which is meant to be seen. home-flight.js holds the
   door closed until the bath has gone (LEAD_VH), then scrolling opens it.

   The order of things, keyed to the bath's bottom edge (in windows from
   the top): a pause on the finished frame with the figures; from 1.8 the
   smoke rises from below over the still held bath; at 1.0 the bath lets go
   and the smoke rides its edge; "From the moment we arrive" dissolves in
   from 0.7 while "Your recovery: Well deserved", which stays above the
   smoke throughout, dissolves as her head leaves the top (0.45 to 0.3).
   ------------------------------------------------------------ */
const DOOR_LEAD_VH = 1;     // the same as LEAD_VH in home-flight.js

function doorHandoff() {
  // Since 21 Oct 2026 (TJ) the bath lifts off the home film, not the house
  // flight's door (the flight moved to What We Do), and "From the moment we
  // arrive" is gone. The smoke, the feather and the floating copy are as
  // they were.
  const arrive = document.querySelector('[data-arrive]');
  const bank = arrive && arrive.querySelector('[data-arrive-bank]');
  const bathAct = document.querySelector('.act--bath');
  const bathEl = document.querySelector('[data-bath]');
  if (!arrive || !bank || !bathAct || !bathEl || REDUCED) return;

  const vh = () => window.innerHeight;

  // "Your recovery: Well deserved" never goes under the smoke (TJ). The
  // bath is sticky, so it is its own stacking layer and nothing in it can
  // sit above the fixed smoke. The copy is moved into a fixed layer above
  // the smoke instead, shifted by the bath's own offset every frame.
  const copy = bathEl.querySelector('.bath__copy');
  let float = null;
  if (copy) {
    float = document.createElement('div');
    float.className = 'bath__float';
    document.body.appendChild(float);
    float.appendChild(copy);
  }

  // Where the band's dense middle sits, as windows below the bath's bottom
  // edge. It starts well below (out of sight while the bath is held), rises
  // to just above the edge by the time the bath lets go, and then rides it.
  const lift = { off: 0.7, away: 0 };
  gsap.fromTo(lift, { off: 0.7 }, {
    off: -0.06,
    ease: 'none',
    immediateRender: false,
    scrollTrigger: {
      trigger: bathAct,
      start: 'bottom 180%',
      end: 'bottom 100%',
      scrub: 0.7,
      invalidateOnRefresh: true
    }
  });

  // Over the last stretch, as the bath's edge goes from 0.4 of a window
  // to the top, the smoke pulls ahead of it and away, so by the time the
  // bath has gone the band is clear of the door. A phone settles on the
  // door at exactly that point, so nothing may be left lying over it. A
  // second property, so the two tweens never share one.
  gsap.fromTo(lift, { away: 0 }, {
    away: -0.7,
    ease: 'none',
    immediateRender: false,
    scrollTrigger: {
      trigger: bathAct,
      start: 'bottom 40%',
      end: 'bottom 0%',
      scrub: 0.7,
      invalidateOnRefresh: true
    }
  });

  // The bath's bottom edge feathers out as it lets go (site.css), so it
  // dissolves off the door instead of showing a hard line across it.
  gsap.fromTo(bathEl, { '--bath-feather': '0px' }, {
    '--bath-feather': () => Math.round(vh() * 0.35) + 'px',
    ease: 'none',
    immediateRender: false,
    scrollTrigger: {
      trigger: bathAct,
      start: 'bottom 102%',
      end: 'bottom 80%',
      scrub: 0.7,
      invalidateOnRefresh: true
    }
  });

  // One frame loop places both the copy and the smoke from the bath's
  // measured position, so neither can drift from the photograph.
  let lastTop = null, lastY = null;
  gsap.ticker.add(() => {
    const r = bathEl.getBoundingClientRect();
    const top = Math.round(r.top);
    if (float && top !== lastTop) {
      lastTop = top;
      float.style.transform = 'translate3d(0,' + top + 'px,0)';
    }
    const y = Math.round(r.bottom + (lift.off + lift.away) * vh() - bank.offsetHeight / 2);
    if (y !== lastY) {
      lastY = y;
      bank.style.transform = 'translate3d(0,' + y + 'px,0)';
    }
  });

  // "Well deserved" dissolves as her head leaves the top of the window.
  if (float) {
    gsap.timeline({
      scrollTrigger: {
        trigger: bathAct,
        start: 'bottom 45%',
        end: 'bottom 30%',
        scrub: 0.7,
        invalidateOnRefresh: true
      }
    }).fromTo(float, { opacity: 1 }, { opacity: 0, ease: 'none', duration: 1, immediateRender: false }, 0);
  }
}

/* ------------------------------------------------------------
   THE HOME FILM (TJ, 21 Oct 2026; moved 25 Oct 2026)
   After What is Postpartum Care, in a rounded frame on its section's
   aurora (TJ, 25 Oct 2026: not full screen). Until then it sat under the
   bath, which lifted off it through the smoke; now the bath lifts away and
   What is Postpartum Care follows in plain flow.

   It plays silent and loops while it is on screen, and pauses off screen.
   Play runs it from the top with sound; on a phone it also goes full
   screen.
   When it ends, or when the reader scrolls it away or leaves full screen,
   it goes back to the silent loop and the prompt returns.
   ------------------------------------------------------------ */
function homeFilm() {
  const section = document.querySelector('[data-film-section]');
  if (!section) return;
  const stage = section.querySelector('[data-film-stage]');
  const video = section.querySelector('[data-film-video]');
  const sound = section.querySelector('[data-film-sound]');
  if (!stage || !video) return;

  const phoneQ = window.matchMedia('(max-width: 767px)');
  const fine = window.matchMedia('(pointer: fine)').matches;
  video.src = (phoneQ.matches || !fine) ? video.dataset.srcMobile : video.dataset.src;
  video.preload = 'auto';

  let inView = false;
  let withSound = false;

  const playSilent = () => {
    if (!inView || REDUCED) return;
    const p = video.play();
    if (p && p.catch) p.catch(() => {});
  };

  const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  const exitFull = () => {
    if (fsElement()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else if (video.webkitDisplayingFullscreen && video.webkitExitFullscreen) video.webkitExitFullscreen();
  };

  // The timeline (TJ, 21 Oct 2026): shown only while the film plays with
  // sound. The fill follows the film every frame; tapping or dragging the
  // line moves the film there, arrows step five seconds.
  const bar = section.querySelector('[data-film-bar]');
  const pauseBtn = section.querySelector('[data-film-pause]');
  const track = section.querySelector('[data-film-track]');
  let lastP = -1;
  const paintBar = () => {
    if (!bar) return;
    const p = video.duration ? Math.min(1, video.currentTime / video.duration) : 0;
    if (Math.abs(p - lastP) > 0.0005) {
      lastP = p;
      bar.style.setProperty('--film-p', p.toFixed(4));
      if (track) track.setAttribute('aria-valuenow', String(Math.round(p * 100)));
    }
  };
  const barLoop = () => { if (!withSound) return; paintBar(); requestAnimationFrame(barLoop); };
  const setPaused = (paused) => {
    section.classList.toggle('is-paused', paused);
    if (pauseBtn) pauseBtn.setAttribute('aria-label', paused ? 'Play' : 'Pause');
  };

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      if (video.paused) { const p = video.play(); if (p && p.catch) p.catch(() => {}); setPaused(false); }
      else { video.pause(); setPaused(true); }
    });
  }

  if (track) {
    let dragging = false;
    const seekTo = (clientX) => {
      const r = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      if (video.duration) video.currentTime = x * video.duration;
      paintBar();
    };
    track.addEventListener('pointerdown', (e) => {
      dragging = true;
      track.setPointerCapture(e.pointerId);
      seekTo(e.clientX);
    });
    track.addEventListener('pointermove', (e) => { if (dragging) seekTo(e.clientX); });
    track.addEventListener('pointerup', () => { dragging = false; });
    track.addEventListener('pointercancel', () => { dragging = false; });
    track.addEventListener('keydown', (e) => {
      const step = e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0;
      if (!step || !video.duration) return;
      e.preventDefault();
      video.currentTime = Math.max(0, Math.min(video.duration - 0.1, video.currentTime + step));
      paintBar();
    });
  }

  const backToLoop = () => {
    if (!withSound) return;
    withSound = false;
    video.muted = true;
    video.loop = true;
    section.classList.remove('is-sound');
    setPaused(false);
    exitFull();
    if (inView) playSilent(); else video.pause();
  };

  if (sound) {
    sound.addEventListener('click', () => {
      withSound = true;
      video.loop = false;
      video.muted = false;
      video.currentTime = 0;
      section.classList.add('is-sound');
      setPaused(false);
      lastP = -1;
      requestAnimationFrame(barLoop);
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
      // A phone goes full screen. The stage itself where the browser allows
      // it, so the timeline comes too; an iPhone only lets the video go full
      // screen, with its own controls.
      if (phoneQ.matches) {
        if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {});
        else if (stage.webkitRequestFullscreen) stage.webkitRequestFullscreen();
        else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      }
    });
  }

  video.addEventListener('ended', backToLoop);
  video.addEventListener('webkitendfullscreen', backToLoop);
  document.addEventListener('fullscreenchange', () => { if (!fsElement()) backToLoop(); });
  document.addEventListener('webkitfullscreenchange', () => { if (!fsElement()) backToLoop(); });

  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView) playSilent();
    else if (withSound && !fsElement()) backToLoop();
    else if (!withSound) video.pause();
  }, { threshold: 0.15 }).observe(stage);

  // No hold and no feather since 25 Oct 2026 (TJ): the film is an ordinary
  // section in a rounded frame, after What is Postpartum Care.
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

  // The description box keeps the height of the longest of the four
  // (TJ, 16 Oct 2026), so choosing a length never moves the photograph
  // below it; on a phone the whole section is sized to fit one screen.
  const reserveBody = () => {
    const now = bodyEl.textContent;
    bodyEl.style.minHeight = '';
    let tallest = 0;
    items.forEach(b => { bodyEl.textContent = b.dataset.body; tallest = Math.max(tallest, bodyEl.offsetHeight); });
    bodyEl.textContent = now;
    bodyEl.style.minHeight = tallest + 'px';
  };
  reserveBody();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(reserveBody);
  let reserveW = window.innerWidth;
  window.addEventListener('resize', () => { if (window.innerWidth === reserveW) return; reserveW = window.innerWidth; reserveBody(); });

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
      // the thumbnail's own corners (square on desktop but for the outer
      // ones, TJ 21 Oct 2026), so the copy lifts off exactly as it sits
      borderRadius: getComputedStyle(btn).borderRadius || '6px', opacity: 1
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
        borderRadius: getComputedStyle(media).borderRadius || '22px',
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
     the line        A fixed circle at the centre of an endless hairline.
                     The stops slide under it, one per testimonial, and
                     the current name sits at the centre. Each name is a
                     button.

   Added because the source is a demo page rather than a section in a
   document: the block answers the keyboard as well as the pointer,
   its entrance runs off an IntersectionObserver rather than on mount,
   and the custom cursor is not built where there is no fine pointer.

   PLACEHOLDER CONTENT. None of these quotes, names or programmes belongs
   to a real client. Replace all of it with cleared testimonials before
   this is shown publicly.
   ------------------------------------------------------------ */
const TV2 = [
  {
    quote: "I came home expecting to cope. Instead someone cooked, held the baby, and told me to go back to bed.",
    author: "Amara O.",
    role: "14 day programme",
    place: "Hackney"
  },
  {
    quote: "The bath was drawn every evening without me asking once. By the second week I had stopped bracing for the day ahead.",
    author: "Priya N.",
    role: "30 day programme",
    place: "Ealing"
  },
  {
    quote: "It is not babysitting. She was there for me, and the baby was part of that. The distinction is the whole service.",
    author: "Yewande M.",
    role: "21 day programme",
    place: "Lewisham"
  }
];

function actVoices() {
  const root = document.querySelector('[data-tv2]');
  if (!root) return;

  const q     = root.querySelector('[data-tv2-quote]');
  const name  = root.querySelector('[data-tv2-name]');
  const role  = root.querySelector('[data-tv2-role]');
  const meta  = root.querySelector('[data-tv2-meta]');
  const track = root.querySelector('[data-tv2-track]');
  const live  = root.querySelector('[data-tv2-live]');
  const prev  = root.querySelector('[data-tv2-prev]');
  const nxt   = root.querySelector('[data-tv2-next]');
  if (!q || !name || !role || !meta || !track) return;

  const esc = s => String(s).replace(/[&<>"]/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const n = TV2.length;
  const mod = k => ((k % n) + n) % n;

  // p is the virtual position: the stop under the centre circle. It goes up
  // or down one step at a time and is never wrapped, so the track can run on
  // past the last testimonial and the first comes in from the right with no
  // jump. Stop k is laid out k spacings along the track, and the track moves
  // to -p spacings. Stop k always shows testimonial mod(k), so a stop keeps
  // its name for its whole life.
  let p = 0;
  let wordTimers = [];
  const WINDOW = 3;            // stops kept either side of the centre
  const items = new Map();     // virtual stop -> element

  const makeItem = k => {
    const t = TV2[mod(k)];
    const el = document.createElement('div');
    el.className = 'tv2__item';
    el.style.setProperty('--q', k);
    el.innerHTML =
      `<span class="tv2__dot" aria-hidden="true"></span>` +
      `<button class="tv2__stop" type="button" aria-label="Show testimonial from ${esc(t.author)}">${esc(t.author)}</button>`;
    el.querySelector('button').addEventListener('click', () => {
      if (k !== p) move(k - p);
    });
    return el;
  };

  // Keep the stops either side of the centre, and drop the ones well past
  // the mask, which are already off the line.
  const sync = () => {
    for (let k = p - WINDOW; k <= p + WINDOW; k++) {
      if (!items.has(k)) {
        const el = makeItem(k);
        items.set(k, el);
        track.appendChild(el);
      }
    }
    items.forEach((el, k) => {
      if (Math.abs(k - p) > WINDOW) { el.remove(); items.delete(k); }
    });
  };

  const paint = () => {
    const t = TV2[mod(p)];

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
    role.textContent = t.role + ' · ' + t.place;
    meta.classList.remove('is-in');
    // Two frames, not one: the class has to be off for a painted frame
    // before it goes back on, or the browser coalesces both into no
    // change at all and the rule never draws.
    requestAnimationFrame(() => requestAnimationFrame(() => meta.classList.add('is-in')));

    track.style.transform = `translateX(calc(${-p} * var(--tv-s)))`;
    items.forEach((el, k) => {
      const btn = el.querySelector('button');
      if (k === p) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });

    if (live) live.textContent = `Testimonial ${mod(p) + 1} of ${n}, ${t.author}: ${t.quote}`;
  };

  // The chevrons and the names are real <button> elements, so focus, Enter
  // and Space are the browser's job. Nothing here runs on a timer: the
  // quote only moves when the reader asks for it.
  const move = step => { p += step; sync(); paint(); };
  if (nxt)  nxt.addEventListener('click', () => move(1));
  if (prev) prev.addEventListener('click', () => move(-1));

  sync();
  paint();

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
   (.act--treatments, [data-pleat]), which was deleted from index.html and
   site.css the same day in favour of the horizontal accordion below. See
   actTreatmentsB(). */

/* ------------------------------------------------------------
   SECTION · Treatments, horizontal accordion
   Click to open one panel at a time. No ScrollTrigger of its own: the
   mechanic is just a width transition with overflow: hidden doing the
   cropping (see .tb-acc__panel in site.css), so it needs nothing scroll
   driven, only a click handler swapping which panel carries .is-open.

   On desktop that width change never touches page height, so nothing
   downstream is affected. On mobile the panel instead changes HEIGHT (see
   the @media block in site.css), growing from about 72px to as much as
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
      // 550ms matches the panel's own transition-duration in site.css. Timed
      // to the animation's end rather than fired immediately, so the
      // refresh measures the settled layout, not a mid-transition one.
      window.setTimeout(() => ScrollTrigger.refresh(), 560);
    });
  });
}

/* ------------------------------------------------------------
   THE GAP ABOVE THE FILM (TJ, 25 Oct 2026: close it by half)
   What is Postpartum Care fills the window with its content centred, so
   the space between its last line or photograph and the film frame
   depends on the window. Measured with no pull, then the film section is
   pulled up by half of it. Runs at boot, before any ScrollTrigger measures
   the page, and again at the start of every refresh (a resize).
   ------------------------------------------------------------ */
function filmGap() {
  const turn = document.querySelector('.act--turn');
  const film = document.querySelector('.film');
  const frame = film && film.querySelector('.film__stage');
  if (!turn || !film || !frame) return;
  const set = () => {
    film.style.marginTop = '0px';
    const low = Math.max(...[...turn.querySelectorAll('.stage__side > *, .stage__frame')].map(e => e.getBoundingClientRect().bottom));
    const gap = frame.getBoundingClientRect().top - low;
    film.style.marginTop = gap > 0 ? (-Math.round(gap / 2)) + 'px' : '0px';
  };
  set();
  ScrollTrigger.addEventListener('refreshInit', set);
}

function boot() {
  filmGap();
  actTreatmentsB();
  nav();
  actHero();
  actCare();
  actPeak();
  actTurn();
  durations();
  actFlow();
  gallery();
  mistHandoff();
  doorHandoff();
  homeFilm();
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
  // Late loads (16 Oct 2026). On TJ's machine the site loads from Google
  // Drive, so 'load' (every image in) can fire seconds after the reader has
  // started scrolling. This routine used to scroll to 0 and re-measure at
  // that point, throwing the page to the top or re-measuring the pins under
  // the reader mid scroll, which skipped the testimonials straight to the
  // grey section until a few scrolls back and forth re-measured it. Now, if
  // the reader has already scrolled, it only refreshes in place
  // (ScrollTrigger keeps the scroll position), and any later change in the
  // document's height (an image arriving late) triggers one debounced
  // in place refresh, so the pins are never measured against a stale page.
  let readerMoved = false;
  const moved = () => { readerMoved = true; };
  ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(ev => window.addEventListener(ev, moved, { passive: true, capture: true, once: true }));
  let lastH = document.documentElement.scrollHeight, heightTimer = 0, touching = false;
  window.addEventListener('touchstart', () => { touching = true; }, { passive: true });
  window.addEventListener('touchend', () => { touching = false; }, { passive: true });
  const watchHeight = () => {
    clearTimeout(heightTimer);
    heightTimer = setTimeout(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) < 2) return;
      if (touching) { watchHeight(); return; }
      lastH = h;
      ScrollTrigger.refresh();
      lastH = document.documentElement.scrollHeight;
    }, 250);
  };
  if (window.ResizeObserver) new ResizeObserver(watchHeight).observe(document.body);
  document.querySelectorAll('img').forEach(img => { if (!img.complete) img.addEventListener('load', watchHeight, { once: true }); });

  const goToAnchor = () => {
    if (readerMoved) { ScrollTrigger.refresh(); lastH = document.documentElement.scrollHeight; return; }
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
    lastH = document.documentElement.scrollHeight;
  };

  if (document.readyState === 'complete') requestAnimationFrame(goToAnchor);
  else window.addEventListener('load', () => requestAnimationFrame(goToAnchor), { once: true });
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(boot);
} else {
  window.addEventListener('load', boot);
}
