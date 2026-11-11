# Screen size check plan

Written 11 Nov 2026 for TJ. Tracker line: TPS-0073.
Run this only when TJ says so. He wants every other TPS request finished first.

## Why this exists

Parts of the site work out their size from only the window width, or only the
window height. At some window shapes two things that each look fine end up
bumping into each other. Two known cases:

1. What We Do, the house plan section ("While you rest"). At a window about
   1210 wide by 980 tall the house is so large that it runs under the room
   list on the right (TJ's screenshot, 11 Nov 2026).
2. Build Your Programme. At some window heights or shapes all of the steps
   showed at once as one page.

TJ does not want to resize his browser on every section to find these. A test
does the looking, the fixes go in at the cause, and the test stays as a guard.

## How to work (TJ's rules for this job)

1. Start with the TPS dev skill so the usual rules load (locks, backups,
   plain language replies, nothing pushed without asking).
2. Keep token use low. The main chat makes the decisions. Hand the running of
   the sweep, and the reading of its long output, to a helper agent on a
   cheaper model (Haiku or Sonnet). Use Fable only where a hard judgement
   call needs it.
3. One heavy job at a time on this laptop. Run the sweeps one after another,
   never side by side.
4. Never change a locked section without unlocking it first (see LOCKED.md).
5. Desktop and tablet first. Phones are a separate pass that TJ will review
   all at once later.

## Step 1: build the checker

Make `lab/screencheck.mjs` (Playwright, the same way `lab/lockcheck.mjs`
works). For every page in `index/` and every screen size below, it opens the
page, waits for fonts, then scrolls from top to bottom with real wheel steps
of about a third of a screen, pausing at each stop. A headless jump to a
scroll position is not enough: pinned sections and lazy pictures only behave
properly under a real wheel.

Pages: index.html, what-we-do.html, programmes.html,
build-your-programme.html, single-treatments.html,
who-comes-into-your-home.html, about.html, faqs.html, gifts.html,
request-a-place.html.

Screen sizes (width by height):

| Kind | Sizes |
| --- | --- |
| Small laptop | 1280 by 720, 1366 by 768 |
| Laptop | 1440 by 900, 1536 by 864 |
| Short wide window | 1536 by 730 |
| Tall narrow window | 1210 by 980 |
| Desktop | 1680 by 1050, 1920 by 1080 |
| Large monitor | 2560 by 1440 |
| Tablet | 1024 by 768, 1180 by 820, 861 by 1000 |

At every stop it measures what is on screen and flags:

1. Overlap. Two visible blocks of text, or text and a picture that is not
   meant to sit behind it, whose boxes cross. Sections that layer on purpose
   (hero text on a photograph, the Four Kinds of Care words over the room)
   go on a short allow list inside the script, each with a note saying why.
2. Cut off text. Any text element whose content is larger than its box while
   overflow is hidden, or that runs past the edge of the window.
3. Sideways scroll. The page is wider than the window.
4. Too tall for the window. A pinned or sticky stage whose content is taller
   than the window, so some of it can never be seen.
5. Steps collapsed. On Build Your Programme, more than one step visible at
   once.
6. Empty screens. A stop where almost the whole window is the plain page
   colour, which means dead scroll.
7. Tiny or huge text. Body text that computes below 13px or headings that
   compute wider than their container.

Output, all under `lab/screencheck/`:

1. `report.md`: one line per finding with page, section name (from
   `data-section-name`), screen size, what is wrong, and the measured numbers.
2. `sheets/<page>.jpg`: one contact sheet per page, a grid of small
   screenshots across all the sizes, so TJ can glance over the whole site.
3. `shots/`: the full size screenshot for each finding only.

## Step 2: first sweep and triage

Run the sweep. Then sort the findings into three piles and show TJ the list
in plain words before fixing anything:

1. Real breakage (overlap, cut off, collapsed steps). Fix these.
2. Allowed on purpose. Add to the allow list with a note.
3. Taste calls (looks a bit off but nothing is broken). List them for TJ and
   Ami to decide; do not fix without a yes.

## Step 3: fix at the cause

Fix one section at a time and rerun only that page after each fix. Prefer a
rule that is right at every size over a patch for one size:

1. Size from both width and height, for example
   `min(60vw, 80vh * ratio)`, never from one alone.
2. Give a picture or film the space that is actually left between its
   neighbours. For the house plan: its width may be at most the gap between
   the words on the left and the room list on the right, less a margin.
3. Text columns get a minimum and a maximum width, not a share of the window.
4. Pinned stages take their height from their content when the window is too
   short, and fall back to the plain stacked layout below a set height.
5. For Build Your Programme, the step switching must not depend on the
   window height; check the breakpoint that turned the steps into one page.

Back up each file to `lab/` before a big edit, and run
`node lab/lockcheck.mjs check` after every fix.

## Step 4: keep it as a guard

1. Add a short "Screen check" section to DESIGN.md with the command and the
   allow list rule.
2. From then on, run `node lab/screencheck.mjs` after any layout change and
   before any push. A new finding means the change broke something.
3. Log the hours against TPS-0073 on the tracker. Set desktop to Amber when
   the fixes are built. Green and the sign off boxes are TJ's and Ami's.

## Honest limits

The checker finds things that are measurably broken. It cannot tell whether a
layout simply looks awkward. The contact sheets are for that, and that
judgement stays with TJ.
