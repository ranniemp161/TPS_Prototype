# Bespoke Programmes: restyle plan (12 Oct 2026)

Instructions for restyling `index/build-your-programme.html` so it speaks the design language of the What We Do page. Written by Claude (Fable 5.1) from TJ's brief of 12 Oct 2026, for smaller models to execute one chat at a time.

**The functionality is finished and approved (TJ). Do not change what the page does: the nine page deck, the swipe and snap, the pricing engine, the rules, the copy, the fee ticker, the summary's Change links, the budget recommender, the enquiry brief.** Only the surface changes: how things look, and how the user reaches the next step.

Open every chat with "TPS dev skill", wait for the status report, then say "Read BESPOKE-RESTYLE-PLAN.md and do chat N." Do one chat per session. Do not start the next chat's work in the same session.

---

## 0. Why (TJ, 12 Oct 2026, in his words where quoted)

- The page "is too closely resembling the example experience without taking into consideration enough what we've built, particularly on the What We Do page, which is the design language that I think we've settled into."
- The bottom bar "should follow the same design language as the other progress bars, particularly on the What We Do page."
- The Back, Begin and Next buttons: "I find them particularly ugly." They must be "more artistic."
- The small spaced capitals label BESPOKE PROGRAMMES above the title: "I don't like this small title text and the client themselves has spoken against this styling." Quentin instead (TJ's first instinct; see chat 1).
- The cards: the tinted "It isn't a quote or a booking" box, the "01 to 03 / 04 to 06" cards, and all the choice cards (Live-in / Daytime, 5 / 7 / 14 / 30, Yes cook for us / No meals, the six What matters most cards): "I don't like them at all. The text should be on the background or there should be a different way for us to figure out how to display the text. And we should be using the glass panelling where we can." "Selections should be like checkboxes, radio boxes, or fields to enter information, but it shouldn't be cards. Cards look less premium and more AI slop."

Everything below that is not quoted or marked (TJ) is Claude's recommendation. If TJ changes a recommendation in a chat, follow TJ, and record it in DESIGN.md with his name on it.

---

## 1. Sources of truth, in order

1. `TPS Brand Pack.html` and `TPS Brand Fonts.pdf` (project root).
2. `DESIGN.md` sections 1 to 9 (tokens, type, shape, glass, aurora, rules), then its dated sections from 9 Oct 2026 on, which record every What We Do decision.
3. The What We Do page itself: `index/what-we-do.html` and its stylesheets and scripts. **When in doubt, open What We Do in the browser at 1440 by 900 and copy what it does.**
4. This plan.

Never build from `archive/`, from the Build 10 reference file, or from the developer spec's look. Those are where the card styling came from.

---

## 2. The five devices of What We Do

Every element on the Bespoke page must be one of these five, or plain text on the ground. Nothing else. The exact rules to copy are listed so you do not invent values.

### Device A: the progression line
A hairline track, an ember fill that grows, a circle at the tip, a small dot at each stop once reached.

- Tokens (`css/site.css` `:root`): `--tline: 1px`, `--tline-track: rgba(10,10,10,.12)`, `--tline-ink: var(--ember-deep)`, `--tdot: 11px`, `--ttip: 15px`, `--tease: cubic-bezier(.215,.61,.355,1)`, movement 650ms.
- Reference rules: `css/what-we-do-tailored.css` lines 118 to 160 (`.ty__days`, `.ty__rail`, `.ty__fill`, `.ty__stop`, `.ty__tip`, `.ty__day`). The stop numerals above the line are Instrument Serif at `clamp(1.8rem, min(3.4vw, 5vh), 3.1rem)`, opacity .38 at rest, 1 when current. The unit label (DAYS) is Montserrat 500, .66rem, .18em tracking, uppercase, opacity .7.
- Phones variant with stops shown faint and reached stops solid: `.ty.is-flow .ty__stop` in the same file (opacity `clamp(.45, calc((var(--sel) - var(--at)) * 3 + .45), 1)`).
- A tappable "next" dot (greyed, 44px target): `.vt__go` in `css/what-we-do-timeline.css` (phones block at the end of the file) and its script in `js/what-we-do-timeline.js` (the `goBtns` code).
- Two stop version with the circle sliding between two labels: `.dnl` in `css/what-we-do-day-night.css` (end of file) and the `dnl` code in `js/what-we-do-promise.js`.

### Device B: Quentin above Instrument Serif capitals
One script line per page, then the capitals title.

- Quentin: `font-family: var(--f-script)`, weight 400, no letter spacing, `text-transform: none`. Colour `var(--coral-deep)` on light grounds (as "What we do" in `css/what-we-do-opening.css` `.op__kicker`) or ink inside a photograph.
- Size on a page title: `clamp(3.6rem, min(7.6vw, 12.4vh), 7rem)` desktop (`.op__kicker`); on phones `clamp(2.8rem, min(15vw, 7vh), 4rem)`.
- The capitals under it: Instrument Serif 400 uppercase, `.wh2` in `css/what-we-do.css` (`clamp(2.4rem, 5.2vw, 4.6rem)`, line height .98).
- One Quentin line per page, never more (DESIGN.md section 2).

### Device C: glass merged into a photograph
The frosted card whose frost fades into the picture with no edge.

- The glass recipe: `.glass` in `css/what-we-do.css` (canvas at 70 percent, 1px white border at 60 percent, `blur(14px) saturate(1.2)`, radius `var(--r-card)` 10px).
- The merge (frost fading upward into the photograph above it): `.vt.is-flow .vt__card::before` in `css/what-we-do-timeline.css`, with its nine stop eased mask over `--vt-fade: 130px` and the card lifted `--vt-up: 120px` over the picture. Copy this block exactly; change only the variable values.
- The sideways version (frost fading rightward into a photograph beside it): `.ty__card::before` in `css/what-we-do-tailored.css`.
- The photograph's frame: 10px radius, no shadow, an even gutter of ground around it.

### Device D: hairline rows with spaced capitals
The list device from Your Postpartum Specialist.

- `.spec__checks li` in `css/what-we-do-specialist.css`: a 1px vertical hairline (`--hairline-firm`) on the left of each row, 20px of padding beside it, Montserrat 500, .7rem, .16em tracking, uppercase, `var(--ink-soft)`. The hairline draws in ember and cools to the hairline colour (the `.is-in` rules).
- For rows that need more than a label, keep the hairline and put the detail under the label in Karla (`var(--f-read)`, `var(--ink-soft)`).
- A row's control is **a dot, not a box**: an 11px circle (`--tdot`) that is a faint ring at rest and fills ember when selected (chat 4 defines it).

### Device E: the underlined spaced capitals link
The Read more device.

- `.ty .tl-readmore__toggle` in `css/what-we-do-tailored.css`: Montserrat 500, .72rem (phones .8125rem), .16em tracking, uppercase, ink, 1px underline, 5px offset, 44px tall tap target on phones. No box, no fill, no border.

### The ground
- The light aurora of A Day With Us behind every page: `.vt__aurora` and `.vt__field` in `css/what-we-do-timeline.css`, with the `.vt` colour variables (`--vt-a1` to `--vt-b3`, `--vt-op: .40`, `--vt-veil: .16`). The page already has a `.dk-aurora` element on each page; make it use these exact values.
- Canvas `#F3EFEC` under it. No white panels (`var(--paper)` backgrounds) anywhere on this page. No borders around content. No shadows (brand rule).

### The one button
- `.btn.btn--primary` in `css/site.css` (the ember Enquire button). It appears exactly twice on this page: "Begin" (start page) and "Book a call" (summary). Nowhere else. `.btn--outline` is not used on this page at all.

---

## 3. The chats

Each chat: back up first, build, verify at 1440 by 900 and 390 by 844 by screenshot and by measurement, record a dated section in DESIGN.md (`## Bespoke restyle, chat N: <what> (TJ, <date>)`), stop. Commit only if TJ asks.

Backups go in `lab/` as `<file>.before-restyle-N.<ext>.bak`. Before chat 1, also take a full page screenshot of the current page at both widths into `lab/bespoke-before-restyle/` for the record.

Keep the header and footer partials untouched; after any HTML edit run `python index/partials/sync-header.py --check` and `python index/partials/sync-footer.py --check` and do not finish until both report `ok` for every page.

The engine (`js/build-your-programme-pricing.js`) and the rules in `js/build-your-programme.js` must not change. After every chat run `node lab/programme-check.mjs` (49 checks) and `node lab/deck-check.mjs`; both must pass. If a restyle needs a markup change, keep every `name`, `value`, `data-*` attribute and `id` that the script reads (section 5 lists them).

### Chat 1: the frame (bottom line, links, title)

**The bottom bar becomes Device A.**
- Replace the contents of `.dk-bar` with: the step name on the left in the DAYS style (Montserrat 500, .66rem, .18em, uppercase, opacity .7; the current page's `data-title`), the line across the middle, Back and Next as Device E links at the two ends.
- The line: track full width between the links, fill in `--tline-ink`, circle `--ttip` at the tip, a `--tdot` stop for each of the nine pages once reached (reached solid, unreached faint at .45 as `.ty.is-flow .ty__stop`). Above each stop, its number `00` to `07` and `08` for the summary in Instrument Serif numerals, `clamp(1.1rem, 1.6vw, 1.5rem)`, opacity .38, the current page's 1. The fill and circle move on `--tease` over 650ms when the page changes.
- Every stop is a `<button>` (the current `data-goto` dots become these). Add the greyed next dot behaviour from `.vt__go`: the next unreached stop is tappable with a 44px target; reached stops are tappable too (that is Back). Tapping a stop goes to that page through the existing deck code (`goTo` or whatever `data-goto` calls today; find it, do not rewrite it).
- Remove "Step 2 of 7" (`.dk-crumbs__of`) and the crumbs row; the numerals say it.
- Remove the `.dk-hint` arrow line on the start page ("Swipe, or tap Next, to begin").

**The buttons become Device E, except two.**
- `.dk-back` and `.dk-next` lose `.btn .btn--outline .btn--primary`; style them as `.tl-readmore__toggle`. Keep `data-back`, `data-next`, `disabled` behaviour and the label changes per page (the script sets them).
- On the start page, Next is labelled "Begin" and on the summary "Book a call" (the script already does this). On those two pages only, render it as `.btn.btn--primary` (add a class when the label is one of those two; the script knows the page index). Everywhere else it is the underlined link.
- Back is hidden on the start page (it is disabled there today; hide it instead so no greyed box remains).

**The eyebrow becomes Device B (TJ).**
- Delete the BESPOKE PROGRAMMES label above the title. Put "Bespoke Programmes" in Quentin, coral, above BUILD THE CARE / YOU HAVE IN MIND, sized as `.op__kicker`. That is the page's one Quentin line. Do not add Quentin anywhere else on the page.
- The step titles (`.dk-step__t`) stay Instrument Serif capitals. The mono step number beside them (`.dk-step__n`) stays: mono for section numbers is allowed (DESIGN.md section 2).

Verify: at both widths, screenshot every page; measure that the fill reaches the current stop's centre on each page; tap a reached stop and the next dot and confirm the page changes; confirm only two ember buttons exist on the whole page (`document.querySelectorAll('.btn--primary').length` across all pages equals 2) and no `.btn--outline` is visible.

### Chat 2: the start page (Device C) and its cards

- The photograph (`.dk-start__frame`) and the copy become one block: the photograph on the right at 4:5 as now, and the title, Quentin line and paragraph on a glass card merged sideways into the photograph (Device C, the Tailored `.ty__card::before` recipe, frost fading rightward into the picture). On phones the photograph is above and the card merges upward into its foot (the A Day With Us recipe). Copy the two existing `::before` blocks; change only sizes.
- The tinted box "It isn't a quote or a booking…" becomes plain Karla text under the paragraph, `var(--ink-soft)`, no background.
- The "01 to 03" and "04 to 06" cards become two Device D rows: the range in mono (`var(--f-mono)`, .8125rem, `var(--ember-deep)`) as the row's label, the sentence under it in Karla.

Verify: no element on the start page has a `var(--paper)` background or a border; the glass fades into the photograph with no visible edge at 1440 and 390 (zoom the screenshot on the seam).

### Chat 3: the three two way steps (Device A, two stops)

Steps 01 (Live-in or daytime), 03 (Daytime or day and night) and 04 (Meals) each offer exactly two options. All three use the `.dnl` two stop line.

- Keep the two `<input type="radio">` elements and their `name` and `value`; the line is a visual control over them. Visually hide the radios (not `display: none`; use the `.sr-only` pattern so keyboard and screen readers keep them).
- The line: the two option titles as the end labels (Montserrat 500, .8125rem, .16em, uppercase), the track between them, the circle sliding to the chosen end over 650ms on `--tease`. The end stops are `--tdot`; the chosen end's label at opacity 1, the other at .5 (as `.dnl__end`).
- The chosen option's second line (`.choice__meta`, for example "Adds £30 a day towards her travel and accommodation") fades in under the line in Karla, `var(--ink-soft)`, over 300ms; the other's fades out. Keep `data-meals-sub` and `data-night-choice` on the elements the script updates.
- Tapping a label or the line's half moves the circle and checks that radio; the engine then recalculates as it does now. The disabled state (night care is disabled with daytime in-home care; see `applyRules`) must still read: the disabled end at opacity .3 and not tappable, and the script's existing note (`data-night-band`) still shown.
- Risk (Claude): a line for a yes or no question (Meals) may feel forced. Build it, look at it, and if it reads wrong say so to TJ and offer the fallback: two Device D rows with the filling dot.

Verify: for each of the three steps, tap both ends and read `form.querySelector('input[name=…]:checked').value`; confirm the fee in the ticker changes as before (`lab/bespoke-check.mjs` cases cover this); arrow keys on the focused radio still move the choice and the circle follows.

### Chat 4: How long (Device A, four stops) and the dot control

**How long** is Tailored's day line.
- Keep the four radios (`name="days"`, values 5, 7, 14, 30) visually hidden as in chat 3.
- Build the line exactly as `.ty__days` on desktop: 5, 7, 14, 30 as Instrument Serif numerals above the stops (same sizes and opacities as `.ty__day`), DAYS as the unit label at the left, the circle sliding to the chosen stop, reached stops solid. The 14 at the exact middle is a Tailored rule about the sun and does not apply here; space the four stops evenly.
- Under each numeral, nothing. Under the line, one row in Karla that reads for the chosen stay: "The first week home · Complete programme £1,995" (the existing `.length__sub` and `.length__price` text), fading between stays. The pound figure counts to the new value with the ticker's roll if easy; otherwise it fades. Do not duplicate the big fee; the ticker is the fee.

**The dot control** (used by chats 4, 5 and 6): define `.dk-dot` once in `css/build-your-programme.css`.
- An 11px circle (`--tdot`), 1px ring in `var(--tline-track)` at rest; selected: filled `var(--ember)`, ring gone, over 200ms `var(--ease-out)`; 44px tap target around it; focus ring per `:focus-visible` in `site.css`.
- It sits at the start of a Device D row, on the row's hairline, replacing the hairline for that row (the dot is the row's mark).

Verify: each stay's numeral and stop; the row text and fee under the line match `P.STD` for that stay; the ticker counts.

### Chat 5: Recovery treatments and Massage rhythm (Device D)

- **Recovery treatments:** the rows already exist (`.treat`). Remove the thumbnails (`.treat__thumb`), the row backgrounds and borders. Each row: the `.dk-dot` on the left (checked state from the checkbox, which stays and is visually hidden), the treatment name in Montserrat 500 .8125rem (not uppercase here; the names are sentences), the count (`data-count`) in mono on the right, the description in Karla under the name. Herbal bath and Belly binding (always included) show INCLUDED in mono where the count would be and no dot. Hairline between rows (`var(--hairline)` 1px), none above the first.
- **Massage rhythm:** the `[data-rhythms]` rows the script draws: same row recipe, radio behind a `.dk-dot`, STANDARD in mono beside the standard option. The script builds these rows (`drawRhythms`); change the markup it emits to the row recipe, nothing else in it.

Verify: tick and untick each treatment and read the ticker; `programme-check.mjs` passes; no row has a background.

### Chat 6: What matters most (Device D, two columns)

- The six `.prio` cards become Device D rows with the `.dk-dot`, in two columns on desktop (`grid-template-columns: repeat(2, minmax(0, 1fr))`, gap 0 48px) and one on phones, as `.spec__checks` does. Title in Montserrat 500, the line under it in Karla. The `data-prio-count` note stays.

Verify: select three and read `priorities()` through the summary's "What matters most" row.

### Chat 7: the summary page (Devices C and D)

- The fee card (`.dk-card--fee`) becomes glass merged into the start page's photograph used again at the top of the summary (Device C), holding "Indicative fee", the figure (`.dk-sumfee`, Instrument Serif, ember) and the two notes (`data-complete-notice`, `data-reserve-note`) as plain text, no tinted boxes.
- Every other `.dk-card` on the summary loses its background, border and padding; its contents sit on the ground, separated by one hairline and the existing `.dk-h2` capitals. "What you have built" (`.areas`) is already Device D in spirit; keep its rows and Change links (the links become Device E). The day strip (`.shape`), Always included, the budget and Ready to talk follow the same treatment.
- "Request my consultation" stays `.btn--primary` only if it is the same action as "Book a call" in the bar; if both exist, keep one (Claude: keep the bar's "Book a call", make the in page one a Device E link).
- "Copy my programme summary" becomes a Device E link.

Verify: `deck-check.mjs` passes; the brief text still copies; no `.dk-card` background remains (`getComputedStyle(el).backgroundColor` is transparent for every former card).

### Chat 8: phones pass and the short window pass

- Walk all nine pages at 390 by 844 and 360 by 640: nothing overflows sideways, every tap target is 44px, the two stop lines and the How long line fit their labels (tighten tracking before shrinking type), the merged glass reads at phone width.
- Walk at 1835 by 605 and 1280 by 640 (short desktop windows; see the Tailored decision of 12 Oct 2026 in DESIGN.md): the fixed frame (ticker, deck, bar) must leave the deck at least 320px tall; if it does not, reduce the ticker band's height before anything else.
- Run the full `lab/bespoke-check.mjs` and `lab/bespoke-phone.mjs`.

---

## 4. Rules that bind every chat

- No em dashes anywhere. Hyphens only inside code identifiers and file names, never in copy (TJ, 10 Oct 2026).
- Titles end without a full stop. No numerals in titles.
- Every visible word is the client's or the approved Build 10 copy. Do not write new copy. If a device needs a label that does not exist (for example an end label for a two stop line), use the option's existing title.
- No `var(--paper)` backgrounds, no borders around content, no shadows, no small spaced capitals eyebrow above a title.
- Mono (`--f-mono`) only for section numbers, counts, INCLUDED, STANDARD and the change chip. Never for a price in body copy; the fee figure is Instrument Serif.
- One Quentin line on the page: "Bespoke Programmes" on the start page.
- Verify by looking: screenshot at 1440 by 900 and 390 by 844 before reporting any visual change done. Never describe pixels you have not seen.
- Record every decision in DESIGN.md with who made it. Never present a recommendation as TJ's rule.
- Do not commit or push. Do not touch locked sections (header, footer).
- If a step cannot be done without changing the engine or the rules, stop and ask TJ. Do not work around it.

---

## 5. What the script reads (do not rename or remove)

Inputs: `input[name="format"]` (in, out), `input[name="days"]` (5, 7, 14, 30), `input[name="shift"]` (day, night), `input[name="meals"]` (yes, no), `input[name="rhythm"]`, the treatment checkboxes `massage, scrub, reflex, facial, herbfoot, thermal`, the priority checkboxes `.prio input`.

Hooks: `[data-builder-scope]`, `[data-summary]`, `[data-fee]`, `[data-count-fee]`, `[data-fee-chip]`, `[data-floor-notice]`, `[data-complete-notice]`, `[data-reserve-note]`, `[data-built-title]`, `[data-meals-note]`, `[data-meals-sub]`, `[data-night-band]`, `[data-night-choice]`, `[data-rhythms]`, `[data-rhythm-note]`, `[data-step-rhythm]`, `[data-shape-title]`, `[data-shape-grid]`, `[data-shape-empty]`, `.shape__key .key`, `[data-brief-text]`, `[data-brief-toggle]`, `[data-brief-copy]`, `[data-budget-answer]`, `[data-budget-fit]`, `[data-fit-apply]`, `[data-prio-count]`, `[data-restore]`, `[data-area]`, `[data-area-body]`, `[data-goto]`, `[data-back]`, `[data-next]`, `[data-count="…"]`, the deck `.dk-deck` and pages `.dk-page` with `data-title`.

If you need to wrap or move one of these, keep the attribute on an element the same selector still finds.

---

## 6. Open decisions (defaults until TJ says otherwise)

1. Meals as a two stop line: build it in chat 3; if it reads wrong, offer the two row fallback. (Claude)
2. "Begin" and "Book a call" keep the ember button; everything else is a link. (Claude; TJ asked only that the current buttons go.)
3. Each stop on the bottom line is tappable, including going back. (Claude, from TJ's wish for a tappable progression bar on What We Do.)
