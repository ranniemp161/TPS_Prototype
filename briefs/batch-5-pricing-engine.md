# Batch 5: Bespoke pricing engine (Opus)

Read `briefs/README.md` first. Batches 2 and 3 must have landed. This batch
changes what the builder prices and shows. Read both engine files end to end
before editing anything:
`index/js/build-your-programme-pricing.js` (the maths, about 160 lines) and
`index/js/build-your-programme.js` (the deck and painting, about 1400 lines).
Also read `FUNNEL-PLAN.md` and DESIGN.md's bespoke sections for the decisions
already taken.

Backups to `lab/<name>.before-ami-24oct-engine.<ext>.bak`.

Sheet rows covered: 29, 43, 47, 38, 48, 44 (counts in JS), 42 (summary line).

## Decisions from TJ, 24 Oct 2026

1. Every price shown is a daily figure, never a programme total (row 29).
2. Meals are always in the fee. The customer cannot opt out. Use the current
   "with meals" figures as the fixed price for now. TJ: "do what you think is
   correct with the maths for now, we will tighten that up at another stage."
   Flag the resulting daily figures in the report (row 43).
3. The Massage rhythm step is removed. Every length runs its standard rhythm
   (`standardRhythm(days)`), no fewer (row 47).
4. Session counts are no longer shown anywhere (row 44).
5. What matters most adds a "Recommended" note on later options (row 38). Two
   rules for now: Sleep and rest recommends Day and night care; My own recovery
   recommends Postpartum massage with hot stone. Tag only, nothing preselected.
6. The Ready to talk screen shows a short summary of what was selected instead
   of the days chart (row 48).
7. No clock times anywhere on the page: "7am to 7pm" becomes "12 hours of care"
   wherever the script writes it (row 42).

## Work

### Daily price
`calculate(sel)` returns a programme total. Add a `perDay` to its result
(`Math.round(total / sel.days)`) and paint that in the bar (`.dk-fee__amount`)
and the summary (`.dk-sumfee`) with a "per day" unit in the same style the
Programmes page uses (`.pg-price__per`, Montserrat caps). The `counter()`
rollers animate the number; keep them, feed them perDay. The fee chip
(`chip(delta)`) shows the change on toggles; it must show the daily delta.
The capture form hidden `fee` field keeps the total; add `fee_per_day`.
Check `programmes.js` reads the same engine (`figures(d)`); its cards already
show per day. The two must agree to the pound for the complete programme.

### Meals fixed
In `completeSelection()` and `read()`, meals is always true. Remove the meals
branch from `read()` (the Meals step is gone from the HTML, so
`el.mealsNote`, `el.mealsSub` and the meals radios are null). Delete or guard
every reference: `mealsLine()`, the `meals` area in `paintSummary()`, the
Change link `data-goto="5"` for meals in the retired block. Keep `rawSum()`'s
meals cost in the total so the price does not drop.

### Rhythm removed
Delete the `#step-06` section from the HTML (`data-step-rhythm`). In the JS,
`drawRhythms()`, `el.rhythms`, `el.rhythmNote` and the length change rule in
`applyRules()` that resets rhythm become dead. Set `sel.rhythm =
standardRhythm(sel.days)` in `read()` and remove the UI code. The
`rhythm` hidden capture field stays and carries the standard.
Re-solve: `solveReservation(days)` exists because the published prices were
solved against the standard rhythm (comment at line 14). With the rhythm fixed
nothing changes in the four published prices; assert that in the console on
load (complete 7, 14, 30 must equal the Programmes page figures) and remove
the assertion before finishing.

### Recommendations
After `read()` in `update()`, compute the two rules from the priority
checkboxes (`p-sleep`, `p-recovery`). Add a `<span class="tg__rec">Recommended</span>`
inside `.tg__body` of `#dkl-shift-night`'s label and the massage label, hidden
by default, shown when the rule holds. Style `.tg__rec` in
build-your-programme.css: Montserrat 600, .62rem, uppercase, letter spacing
.12em, ember text, no background. Live region not needed.

### Summary instead of the chart
In the decide screen (HTML line 350 onward) remove `.dk-decide__more` with the
shape grid and key. Replace with a `<ul class="dk-decide__list">` the script
fills from the same data `briefFor()` uses: length and format, day or night,
treatments chosen, what matters most. One line each, Karla, no counts. Keep
`paintShape()` in the JS but stop calling it, or delete it with its CSS
(`.shape*`); either, say which.
The 7 day price hold wording on the close screen is batch 6.

### Strings
`formatLine()` line 320: `'7am to 7pm'` becomes `'12 hours of care'`.
`treatmentsLine()` line 324: `'Herbal baths and belly binding daily'` becomes
`'Herbal rinse and belly binding daily'`. Search the JS for `bath` and
`confinement` and fix any other visible string the same way.

## Verify

Run the four published prices check above. Then in a real browser: walk every
step at 1440 and 390; the fee must be a per day figure from the first screen,
move when live-out or night is chosen, move when a treatment is toggled, and
never show NaN. Tick Sleep and rest and confirm Recommended appears on Day and
night care; untick and it goes. Reach Ready to talk and confirm the list
matches what was chosen. Send the form once with a test email and confirm the
hidden fields carry fee, fee_per_day and rhythm.

```
node lab/shot.mjs index/build-your-programme.html lab/shots/bespoke-b5-1440.png 1440
node lab/shot.mjs index/build-your-programme.html lab/shots/bespoke-b5-390.png 390
node lab/lockcheck.mjs check
```
Record the decisions in DESIGN.md as `## Bespoke engine after Ami's 24 Oct notes (TJ, <date>)`
with the resulting daily prices for 7, 14 and 30. Report and stop.
