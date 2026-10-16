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
