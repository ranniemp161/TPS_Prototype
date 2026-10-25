# Batch 3: Bespoke builder structure (Sonnet)

Read `briefs/README.md` first. Batches 1 and 2 must have landed. This batch
changes markup and CSS on the builder and one word map on the Programmes page.
It does not touch the pricing engine (`build-your-programme-pricing.js`) and
makes only the named edits in `build-your-programme.js`.

Files: `index/build-your-programme.html`, `index/css/build-your-programme.css`,
`index/js/build-your-programme.js`, `index/js/programmes.js`, `index/css/programmes.css`.
Backups to `lab/<name>.before-ami-24oct-structure.<ext>.bak` for each before editing.

Sheet rows covered: 27 (child number), 30, 31, 32, 39 (body size), 44 (merge and counts), 45 and 46 (toggle set), 52, 53.

## 1. Child number toggles (row 27)

Line 174: `<span class="dk-step__t">When is your baby due?</span>` becomes
`<span class="dk-step__t">When is your baby due? What child number is this?</span>`.
Check the 390 screenshot: if the title no longer fits one screen with the
calendar, split it so "What child number is this?" is a second `.dk-step` legend
above the toggles rather than shrinking the type.

After the closing `</div>` of `<div class="due">` (line 188) and inside the
fieldset, add a radio group in the same pattern as the Live-in step:

```html
<div class="tgl" role="radiogroup" aria-label="Which child">
  <label class="tg"><input class="sr-only" type="radio" name="child" value="first" id="dkd-child-1" /><span class="tg__body"><span class="tg__t">First baby</span></span><span class="tg__sw" aria-hidden="true"></span></label>
  <label class="tg"><input class="sr-only" type="radio" name="child" value="second" id="dkd-child-2" /><span class="tg__body"><span class="tg__t">Second baby</span></span><span class="tg__sw" aria-hidden="true"></span></label>
  <label class="tg"><input class="sr-only" type="radio" name="child" value="third-or-more" id="dkd-child-3" /><span class="tg__body"><span class="tg__t">Third baby or more</span></span><span class="tg__sw" aria-hidden="true"></span></label>
</div>
```
No default checked. Information only: the engine ignores it. Add
`<input type="hidden" name="child" />` to the capture form (line 406) and, in
`build-your-programme.js` `fillCapture()`, copy the checked value into it the
same way the other hidden fields are filled. Nothing else in the JS.

## 2. Back and Next as bold, larger buttons (row 31)

CSS around lines 1590 to 1600. `Back` is `.dk-link.dk-back`; `Next` is
`.btn.btn--primary.dk-next`. Make Back a button in the same family as Next:
give `.dk-back` the `.btn` look (same min height 44px, padding, radius 8px,
1px ember border, transparent fill, ember text) and both `font-weight: 600`
and one step larger (`font-size: .95rem` if they are smaller). Keep Next as the
filled ember button. Do not change the comment at line 522 about when Next is
ember; keep the "Begin" and "Book a call" behaviour.

## 3. Numbered steps instead of the progress bar (row 32)

Current: `.dk-line` is a sliding track with a tip (HTML lines 538 to 547, CSS
1609 onward, JS `buildStops()`, `paint()`, `label()` in `deckController()`).
Wanted (Ami, 24 Oct 2026): a row of step numbers.

Approach, do not over build: keep `[data-line]` and `[data-step-name]` so the
JS hooks survive. Inside `.dk-line__win` replace the track with an ordered row of
stops the JS already builds (`buildStops()` creates one `.dk-line__stop` per
screen). Restyle:
- `.dk-line__win`: no sliding window, no fade mask; `display: flex; gap` spaced
  to fit the bar width; overflow visible.
- `.dk-line__track`: static, `position: static; width: auto; display: contents`.
- `.dk-line__rail`, `.dk-line__fill`, `.dk-line__tip`: `display: none`.
- `.dk-line__stop`: a 28px circle, `--f-body` 600 at .72rem, the step number as
  text; past steps filled ember with canvas text, current ember outline with
  ember text, future `--ink-mute` outline. All stops visible (remove the
  `.is-near` visibility gating in CSS, not in JS).
- Keep `.dk-bar__name` above the row.
Read `buildStops()` and `paint(i)` before touching CSS: the stop's number is
screen index plus one, and whichever class the JS sets for the current stop is
the one to style. If the JS does not write the number into the stop, add
`stop.textContent = String(k + 1)` where the stop is created, and nothing else.
On 390 wide, if nine circles do not fit, show the number only on the current
stop and 8px dots for the rest.

## 4. Merge the two treatment screens, remove the counts (row 44)

HTML lines 291 to 332. Move the five `<label class="tg">` blocks from
`#step-05b` (scrub, reflex, facial, herbfoot, thermal) into the `.tgl` group in
`#step-05`, after the massage label. Delete the whole `#step-05b` `<section>`.
In every treatment label delete the `<span class="tg__aside" data-count="...">…</span>`
span. Delete the `<p class="tgl__hint" aria-hidden="true">Choose any</p>` in
the merged group.

JS: `paintSteps()` (around line 276 to 290) writes into `[data-count]` and
already null checks (`if (out)`), so it keeps working with none present. Confirm
by reading it; change nothing in the JS for this step.
One screen must hold the lead, two included rows and six toggles at 390 wide.
If it does not, reduce `.tg` vertical padding by 2px on this step via a class
on the fieldset, not globally.

## 5. Fonts (rows 30, 39, 52, 53)

- Prices in Karla: in `build-your-programme.css` change `font-family: var(--f-display)`
  to `font-family: var(--f-read)` on `.dk-fee__amount` (line 1439) and
  `.dk-sumfee` (line 1512). In `programmes.css` `.pg-price__fee` (line 145 to 148)
  change its `font-family: var(--f-display)` to `var(--f-read)`. Keep
  `tabular-nums`. Check the fee still fits its grid cell at 390; if Karla runs
  wider, reduce the clamp max by 10 percent.
- Step 1 (due date) standardised and smaller: set `.dk-step__t` on `#step-due`
  only to the size the other steps use (it already uses the shared rule, so
  confirm nothing overrides it) and ensure `.due__note` and `.due-cal__month`
  use `--f-read` at .9rem. If they already do, no change.
- Live-in step body smaller: add `#step-01 .tg__s { font-size: .75rem; }`.

## 6. Programmes page lengths as numerals (row 52)

`index/js/programmes.js` line 20:
`var WORDS = { 7: 'Seven days', 14: 'Fourteen days', 30: 'Thirty days' };`
becomes
`var WORDS = { 7: '7 Days', 14: '14 Days', 30: '30 Days' };`
Ami's directive, 24 Oct 2026, overrides the no numerals in titles rule for
these three cards.

## Verify

```
node lab/shot.mjs index/build-your-programme.html lab/shots/bespoke-b3-1440.png 1440
node lab/shot.mjs index/build-your-programme.html lab/shots/bespoke-b3-390.png 390
node lab/shot.mjs index/programmes.html lab/shots/programmes-b3-1440.png 1440
node lab/shot.mjs index/programmes.html lab/shots/programmes-b3-390.png 390
node lab/lockcheck.mjs check
```
Then in a real browser (not headless only; TJ's rule after the fonts.ready
race): walk every step with Next and Back, choose a child number, toggle a
treatment off and on and watch the fee change, reach Ready to talk. The step
numbers must advance and the fee must never show NaN or blank. Report and stop.
