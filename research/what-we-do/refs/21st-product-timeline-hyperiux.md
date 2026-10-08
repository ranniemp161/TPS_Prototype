# Product Timeline (hyperiux, 21st.dev id 26930)

Pulled 8 Oct 2026 with TJ's go ahead (one of the two daily copies). Reference for A Day With Us. Source: https://21st.dev/@hyperiux/components/timeline

## How it works

1. Sticky stage. The section is 200vw tall (400vh on phone); inside it a 100vh stage is position: sticky, so the page scrolls while the stage stays put. No GSAP pin.
2. Track slide. One scrubbed tween moves the whole strip (image card, title, line, all milestones) from xPercent 0 to -65 (phone -57), from section "top top" to "92% bottom". ease none, scrub true (no smoothing lag).
3. Main line. A 1px line between two fixed dots grows width 0 to 98% (phone 65%), scrubbed, from "top 25%" to "92% bottom". It starts slightly after the slide, so the strip moves first and the line chases it.
4. Milestones. Seven timelines, each scrubbed to its own window of the section's scroll (desktop [6,26], [16,36], [26,46], [35,55], [45,65], [55,75], [65,85] percent, overlapping by half). Each one:
   - stem scaleY 0 to 1 (top items grow up from the line, origin bottom; bottom items grow down, origin top)
   - dot scale 0 to 1, at the same time as the stem
   - title, split into masked lines (GSAP SplitText, mask: "lines"), slides up y 100 percent to 0, power2.out, stagger .02, overlapping the stem
   - description, the same, alongside the title
   So the text rises out of an invisible slot under each line, which is the "wipe" seen in the video.
5. Layout. Items above and below the line are separate rows, offset so they interleave (top gap 15vw, bottom gap 20vw with a 7vw indent).
6. Reduced motion: everything set to its end state, only the slide remains.

Notes: the description mentions Lenis but the code does not use it. SplitText's mask option needs GSAP 3.13 or later; the site loads 3.12.5.

## Original component code

```tsx
// (see the 21st.dev listing for the full file; key GSAP logic)
const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: "top top", end: slideEnd, scrub: true }, defaults: { ease: "none" } });
tl.fromTo(wholeSlider, { xPercent: 0 }, { xPercent: slidePercent });
gsap.to(".journey-line", { width: lineWidth, ease: "none", scrollTrigger: { trigger: section, start: lineStart, end: lineEnd, scrub: true } });

// per item
gsap.set(stem, { scaleY: 0, transformOrigin: isTop ? "bottom" : "top" });
gsap.set(dot, { scale: 0 });
const title = new SplitText(titleEl, { type: "chars, words, lines", mask: "lines" });
const desc = new SplitText(descEl, { type: "chars, words, lines", mask: "lines" });
gsap.timeline({ scrollTrigger: { trigger: section, start: `${s}% 30%`, end: `${e}% 50%`, scrub: true } })
  .to(stem, { scaleY: 1, duration: d * 0.4 })
  .to(dot, { scale: 1, duration: d * 0.4 }, "<")
  .fromTo(title.lines, { y: 100 }, { y: 0, delay: -0.8 * d, duration: d, stagger: 0.02, ease: "power2.out" })
  .fromTo(desc.lines, { y: 100 }, { y: 0, duration: d, stagger: 0.02, ease: "power2.out" }, "<");
```
