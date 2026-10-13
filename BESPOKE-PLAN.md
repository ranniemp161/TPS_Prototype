# Bespoke Programmes: build plan (10 Oct 2026)

For Opus 5.5 to build. Written by Claude (Fable 5.1) from TJ's brief, the developer spec `new md for build your own.md` (project root, "Build 10, 9 October 2026"), the live page `index/build-your-programme.html` and the brand system in `DESIGN.md` sections 1 to 5.

Read this whole file, then the spec, then look at the live page at 1440 and 390 wide before writing anything. Open each chat with "TPS dev skill" so the working rules load.

## What TJ asked for (TJ, 10 Oct 2026)

1. Build the spec's page in the TPS brand: the tokens, the fonts, the glass, the aurora.
2. Take the language from the live Bespoke Programmes page: its copy voice and its styling. The spec supplies the structure and the numbers; the live page supplies how it looks and sounds.
3. A motion graphic ticker for the money, near the top of every screen, that recalculates as she adds or removes things on her way through. The fee is never static when a choice changes; it visibly counts to the new figure.

Everything else below is my recommendation unless marked (TJ) or (spec).

## Sources of truth, in order

1. `TPS Brand Pack.html` and `TPS Brand Fonts.pdf` (project root).
2. `DESIGN.md` sections 1 to 5 (tokens, type, shape, layout, glass and aurora).
3. `new md for build your own.md` for structure, copy, rules and pricing.
4. `index/build-your-programme.html`, `css/build-your-programme.css`, `js/build-your-programme.js` and `js/build-your-programme-pricing.js` for the visual and verbal language, and for the engine pattern.

Not available: the spec names a reference build, `tps-build-your-programme.html` (Build 10), and says it wins over the spec. It is not in the project. Build from the spec. If TJ supplies it later, reconcile against it.

## Where it lives

- Keep the file name `index/build-your-programme.html` and the nav label "Bespoke Programmes". Every menu, footer and the Programmes page already link to it. The spec's `/programme` suggestion is not used; `programmes.html` is the hub.
- Replace the page's body; keep the header and footer partials as they are (both are locked sections; run `python index/partials/sync-header.py --check` after).
- Back up the three current files to `lab/*.before-bespoke-carousel.*.bak` first, and take a 1440 and 390 full page screenshot of the current page for the record.
- Title: "Build your own postpartum care programme" (spec). Meta description from the spec.

## The layout: the spec's carousel, in the live page's clothes

The spec (section 2) asks for one step per screen, swiped sideways, with a fixed top band and a fixed bottom bar. Build that. The live page's single long column with a sticky summary is retired, but its parts are reused inside the steps.

Fixed frame, `100dvh`, top to bottom:

1. **Site header** (the partial, unchanged).
2. **The ticker band** (TJ's ticker; see the next section). Full width, canvas ground with the frosted glass recipe over the aurora that runs behind the whole frame. 64px tall on desktop, 56px on phones. This is where the spec's "indicative fee" moves to. The spec put it in the bottom bar; TJ wants it near the top of every screen.
3. **Progress line.** 2px hairline track, ember fill that grows with the step (spec: 3px; the brand's hairlines are 1 to 2px, use 2).
4. **Crumbs row.** Step number in IBM Plex Mono (badges and section numbers are its job), step name in Montserrat 500, "Step 4 of 7" on the right in Montserrat 400 ink mute. The intro shows nothing on the right; the summary shows "Summary" (spec).
5. **Dots.** One bar per page, 26 by 2px like the live page's `.hd__rail`: current ember, done dusty rose (`#CA8882`, add it to `site.css :root` as `--dusty-rose` if absent), rest haze. Each a `<button>` "Go to [title]" (spec).
6. **The deck.** Horizontal scroller, `scroll-snap-type: x mandatory`, each page 100% wide with `scroll-snap-stop: always`, scrolling vertically on its own (spec). Content column max 720px centred; from 1100px wide, 760px.
7. **Bottom bar.** White, hairline top, Back on the left and Next on the right, the spec's labels per page. iOS safe area padded (spec). No fee here; the ticker carries it.

Desktop (from 1100px): the deck takes the centre and a quiet right rail, 320px, shows the live page's "What you have built" list (`.areas` with the "Change" buttons jumping to the step). This keeps the live page's best device and gives desktop something to do with the width. Phones never show the rail; the summary page carries the same list. Build the rail last; if it fights the carousel, drop it and say so.

Behaviour (spec, section 2): sync crumbs, dots and progress on scroll settle (80ms after the last scroll event); arrow keys move pages unless focus is in an input; each page scrolls to its top when shown; re-snap on resize. Add: the ticker band never scrolls away.

## The ticker (TJ)

The one piece of motion that matters on this page. It must feel like money being counted, not a number being swapped.

**Anatomy, left to right inside the band:**

- Label "Indicative fee" in Montserrat 600, .6rem, .14em tracking, uppercase, ink mute (the live `.feebar__label`).
- The figure: `£` static, then one rolling column per digit, then static commas. Instrument Serif 400, tabular figures, 1.9rem on phones, 2.4rem on desktop, ink. The pound sign and commas do not move.
- A change chip to the right of the figure: "+ £150" or "− £64" in IBM Plex Mono .72rem, ember for up, ink mute for down. It fades in as the roll begins and out 900ms after it ends. Use the minus sign U+2212 in the chip; it is a number sign, not a hyphen in copy. Nothing else on the page uses a dash.
- Far right: "Introductory pricing, held for 2026" in Montserrat 400 .68rem ink mute (the live `.fee__intro` line). Hidden under 480px wide.

**The roll.** Each digit is a strip of 0 to 9 clipped to one glyph; the strip translates vertically to the new digit. Columns run right to left with a 40ms stagger, each over 520ms on the site ease `cubic-bezier(0.23, 1, 0.32, 1)`. A digit that does not change does not move. When the digit count changes (£999 to £1,004), the new column slides in from the left with its comma, over the same time. During the roll a 1px ember line draws under the figure from left to right and fades; when the roll ends the figure lifts 2px and settles, the live page's `settle` keyframe. Transform and opacity only, no layout work per frame.

**Rules:**
- The roll runs on every fee change, from any step, including Back. It never runs on page load; the figure is set directly.
- A second change during a roll retargets the columns from where they are. No queue, no snap.
- `aria-live="polite"` on a visually hidden text copy of the fee (the live page does this); the strips are `aria-hidden`.
- `prefers-reduced-motion`: no roll, no chip animation, no underline; the text swaps and the chip shows for 900ms.
- The fee in the ticker always equals the fee on the summary page (spec rule). One function sets both.
- Write the ticker as its own module, `js/fee-ticker.js`, with one call: `ticker.set(pounds)`. No other file knows how it moves.

**Check it by looking:** screenshot mid roll at 390 and 1440 (Playwright can pause with `page.clock` or by adding a class that sets `animation-play-state: paused` after 200ms). Record a 2 second screen capture at 390 wide for TJ.

## Visual language (from the live page, keep)

- Option tiles: paper, 1px hairline firm border, 10px radius; selected: ember border on blush fill; hover: sand border; disabled: 40 percent on canvas with not allowed cursor; 1px press on `:active`; 2px ember focus ring at 3px offset. Real inputs under the tiles (`.choice input` pattern). The spec's "round radio marker" is not needed: the fill is the state, as on the live page.
- The length tiles (`.length`) with the big Instrument Serif numeral and "DAYS" underneath stay exactly as they are for Step 02, and each gets the spec's mono sub line "Complete programme £1,995".
- Multi choice rows (`.treat`): the ticked square, name in Montserrat 600 .95rem, description in Karla .85rem ink mute, the mono count on the right in ember. The "INCLUDED" rows for herbal bath and belly binding sit on canvas with a haze "INCLUDED" badge (mono, 6px radius) and no tick box (spec).
- Section eyebrows in Montserrat 600 .6rem .14em uppercase (the live `.eyebrow`). Step notes in Karla .9rem ink mute. Bands: rose mist for the intro's "not a quote" note, haze for the night care rule, blush for match and floor notes (spec colours, all brand tokens).
- The intro page keeps the live hero: eyebrow, Instrument Serif capitals headline with the second line in italic ember ("BUILD THE CARE / *you have in mind*"; the spec writes the second line lower case italic, keep the live page's capitals for the first line and italic for the second), the lede in Karla, the photograph `assets/img/s3-rest.webp` in its 16px frame. The three "how it works" cards are paper, hairline, 10px.
- Summary page: five paper cards (spec). The fee card leads with the figure in Instrument Serif ember, 2.8rem, and reuses the ticker module so it rolls when "Change" edits come back.
- Glass: the ticker band and the bottom bar use the 62 percent canvas glass over the aurora. No shadows anywhere. No dark sections.
- The aurora runs behind the whole fixed frame at the live page's settings, so the steps float over weather rather than flat canvas.

## Copy

The spec's copy is the copy. Use it word for word, including the notes, the sub lines, the summary rows, the budget responses, the enquiry text block and the footer line. Where the live page and the spec differ, the spec wins (it is newer and from the founders' side).

Two things to settle with TJ before building, not to decide alone:

1. The spec is full of hyphens ("Live-in", "5-day", "Hands-on", "back-to-back") and two em dashes. The site rule is no em dashes or hyphens in copy. The live page already shows "Live-in care". Ask TJ whether this page keeps the founders' hyphenation or rewrites ("Live in care", "five day programme"). Build nothing until he answers.
2. The spec's titles end without full stops already, as the site rule requires. Keep it so.

## The pricing engine

`js/build-your-programme-pricing.js` stays the single source for the page and the test suite (`lab/programme-check.mjs`). Replace its constants with the spec's section 4 and nothing else:

- `RATE.massage = 70` (massage and hot stone are one treatment; remove `hotstone`), remove `serum` everywhere, `thermal: 25` added.
- `STD` counts per the spec's 4.3 table (scrub 1,1,2,2; reflex 1,1,2,4; facial 1,1,2,4; herbfoot 1,1,2,4; thermal 1,1,2,4).
- Massage options per length (`s3 s2`, `s4 s3 s2`, `w4 w3 w2`, `w4 w3 w2`) with the spec's standards; `wN` is `ceil(N × days / 7)`.
- `RESERVATION` becomes the spec's `{5: 1680.80, 7: 1980.80, 14: 3151.00, 30: 3288.10}`, then re-solve with the check script so every complete programme lands on its introductory price exactly. If the re-solved figure differs from the spec's by more than a pound, stop and report; something else differs.
- Meals are one yes or no (spec), not three ticks. Night care removes breakfast from the sum.
- The daytime supplement is added after the intro factor and raises the floor (spec 4.4).

Rewrite `lab/programme-check.mjs` to assert the spec's section 5 tables: the 24 fees in the first table, the 7 fewer massage fees, the 8 stripped fees, and the four rules (removing never raises, fewer massages never raise, daytime never cheaper than live in, ticker equals summary). The build is not done until that script passes.

## Accessibility and quality (spec section 6, plus site rules)

Radio groups with `role="radiogroup"` and labels; dots as buttons; 2px ember focus; reduced motion honoured; 44px targets; 16px inputs; iOS safe area; works at 360px with no sideways page scroll. Phone text floor 13px (MOBILE-PLAN rule). Header and footer stay locked and in sync.

## Order of work

1. Back up, screenshot the current page, re-read this file.
2. Pricing engine and check script first. Green before any UI.
3. The fixed frame: header, ticker band (static figure), progress, crumbs, dots, deck with nine empty pages, bottom bar. Swipe, keys, dots and resize working.
4. The nine pages' content and the option families, wired to the engine.
5. The ticker's roll, the chip, the underline, reduced motion.
6. The summary page, budget, copy to clipboard, Calendly link.
7. Desktop rail (optional).
8. Screenshots: every page at 1440 and 390, the ticker mid roll, a short capture. Walk every test case through the UI once by hand.
9. DESIGN.md: one dated section, "Bespoke Programmes rebuilt as the spec's carousel (TJ, <date>)", with measurements and backups. No commit unless TJ asks.

## Open questions for TJ

- Hyphens in the founders' copy (above).
- The spec's section 7 items for the founders (body scrub count at 14 days, "1 per week" on 30 days, laundry wording, thermal rate). Build to the spec; list them in the DESIGN.md note.
- Calendly prefill of the enquiry text (spec recommends; needs the Calendly question field name).
