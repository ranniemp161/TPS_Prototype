# Batch 4: Home page structure (Sonnet)

Read `briefs/README.md` first. Batch 1 must have landed. This batch moves
sections on the home page and replaces one scroll device with a carousel.

Files: `index/index.html`, `index/css/site.css`, `index/js/home.js`.
Backups to `lab/<name>.before-ami-24oct-home.<ext>.bak` before editing.
Also run `node lab/shot.mjs index/index.html lab/shots/home-b4-before-1440.png 1440`
before any edit, so there is a reference.

Sheet rows covered: 63, 65, 66, 67, 68.

## STOP POINT before step 4

The new order Ami asked for is Hero, Bath, What is Postpartum Care, Film, Four
Kinds of Care, However long you need with us, Testimonials, CTA, Single
Treatments. Today the film sits directly under the bath on purpose: the bath
lifts off the film through the steam (`home.js` filmHandoff and homeFilm, CSS
`.film` pulled up under `.act--bath`, comments at HTML line 292 and JS line
1343). Putting What is Postpartum Care between them breaks that handoff.
Do steps 1 to 3, screenshot, then stop and ask TJ which he wants:
(a) keep Bath then Film, and place What is Postpartum Care after the film, or
(b) rebuild the handoff so the bath lifts onto What is Postpartum Care, and the
film follows it in plain flow. (b) is engine work and goes to Opus, not this chat.
Do not move the film in this chat without that answer.

## 1. Testimonials out of the confinement act (row 68, part)

Testimonials (`<div class="voices">`, lines 401 to 443, plus its aurora on 402)
live inside `<section class="act act--turn">`. Cut that whole `voices` div and
make it its own section after the programmes section (`</section>` at line 608):

```html
<section class="act act--voices" data-act data-section="voices" data-section-name="Testimonials" aria-labelledby="voices-heading">
  ...the voices div exactly as cut...
</section>
```
`actVoices()` in home.js finds its elements with `[data-tv2]` and runs on an
IntersectionObserver, so it is position independent. Confirm by reading
`actVoices()` (line 1814) before moving. In site.css find the rules for
`.voices` and `.aurora--voices` and make sure the new section gets the same
background and vertical padding the join used to give it; copy the padding the
`.act--turn` gave below its stage if the testimonials now sit tight against the
section above. Keep the comment block (lines 370 to 399) with the markup.

## 2. The CTA as its own section in a card (rows 66, 67)

Cut `<div class="cta" ...>` (lines 598 to 605) out of the programmes section and
make it a section after Testimonials:

```html
<section class="act act--cta" data-act data-section="book-consultation" data-section-name="Book a Consultation">
  <div class="aurora" aria-hidden="true"><span class="aurora__field"></span></div>
  <div class="wrap">
    <div class="cta cta--card" data-in>
      ...heading, script, lead, button, meta, bespoke line unchanged...
    </div>
  </div>
</section>
```
Style `.cta--card` from the Programmes price card: read `.pg-card` in
`index/css/programmes.css` (line 131) and reuse its glass surface, border,
radius 16px, padding and max width. Put that in site.css as `.cta--card`,
do not import programmes.css into the home page. No shadow. Text centred as
before. Button copy stays "Book a consultation" until batch 6.
Remove the old `.cta` margin rules that assumed it sat at the foot of the
programmes act if they now leave a gap.

## 3. Four Kinds of Care as a carousel (row 65)

Current: `.act--pan` with `[data-rail]`, driven by `actPan()` in home.js (line
155), which pins the section and pans sideways on scroll. Ami, 24 Oct 2026:
sideways scroll is unintuitive. Wanted: normal page scrolling before and after;
title centred; the same line device; one card in view with chevrons either side.

Use the device that already exists on the Programmes page: `.pg-stage` with
`.pg-nav--prev` and `.pg-nav--next` (programmes.html lines 157 to 163) and the
`tv2__car` line (lines 146 to 154) driven by `programmes.js`. Read programmes.js
fully first. Then:
- Change the section to `class="act act--care"` (drop `act--pan`), keep
  `id="care"`, aurora and `data-section`.
- Move the `<h2>` out of the rail into a centred `<header class="sec-head">`.
- Wrap the four `<article class="card">` in a `.care-stage` with prev and next
  buttons (copy the SVG chevrons) and a `tv2__car` line above with four stops.
- Write `actCare()` in home.js modelled on programmes.js: an index, prev and
  next, the line fill and stops, keyboard arrows, swipe on touch. Cards swap
  with a short fade and slide using gsap, no pin, no ScrollTrigger.
- In `home.js` where `actPan()` is called (line 1992) call `actCare()` instead.
  Leave `actPan()` defined; nothing else calls it. Comment it as retired
  (Ami, 24 Oct 2026).
- Delete or neutralise the `.act--pan` pin spacing CSS so the section is its
  natural height. The refreshPriority comment in `actTurn()` (line 812 to 817)
  mentions the rail's pin; the pin no longer exists, that is fine, leave it.

## 4. Reorder (row 68)

Only after TJ answers the stop point. Target order of `<section>` elements
inside `<main>`:
hero, bath, [film or postpartum care per TJ], [the other], care, programmes,
voices, cta, standalone-treatments.
Move whole sections with their leading comment blocks. Nothing inside a section
changes in this step.

## Verify

```
node lab/shot.mjs index/index.html lab/shots/home-b4-1440.png 1440
node lab/shot.mjs index/index.html lab/shots/home-b4-390.png 390
node lab/lockcheck.mjs check
```
Then in a real browser with a real wheel (TJ's rule): scroll the whole page top
to bottom at 1440 and 390. No section should pin unexpectedly, the care
chevrons must move the cards and the line, Testimonials must still advance on
click, the CTA card must show glass over the aurora with no shadow. Report with
screenshots and the stop point question if not yet answered. Stop.
