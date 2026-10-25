# Batch 2: Bespoke builder copy (Haiku)

Read `briefs/README.md` first. Text only. Every change is inside
`index/build-your-programme.html`. Do not open the JS or CSS. Do not delete any
`<section>`, `<fieldset>`, `<input>` or element carrying a `data-` attribute:
the pricing engine reads those and batch 5 handles them.

Backup first: copy the page to `lab/build-your-programme.before-ami-24oct-copy.html.bak`

Sheet rows covered: 28, 33 (copy part), 35, 36, 37, 39 (title), 40, 41, 42 (copy), 44 (copy), 45 (copy and rename), 46 (names).

## 1. Due date lead (line 175)

Delete this whole line:
`<p class="step__note step__note--lead">So we can hold the right dates for you, and the right price.</p>`
(The title change and child number toggles are batch 3.)

## 2. How long (lines 199 to 205)

Find: `<span class="dk-step__t">How long?</span>`
Replace: `<span class="dk-step__t">Choose your programme length</span>`

Delete the whole line:
`<p class="step__note step__note--lead">Thirty days is the full confinement month. Changing the length resets the massage rhythm to that programme’s standard, so you always start from a complete programme.</p>`

Delete the line: `<p class="tgl__hint" aria-hidden="true">Choose one</p>`
(only the one inside `aria-label="How long"`, line 202; the other steps keep theirs for now).

In the three length labels remove the price span, leaving the sub line:
- `<span class="length__sub">A full week</span><span class="length__price">Complete programme £2,495</span>` becomes `<span class="length__sub">A full week</span>`
- `<span class="length__sub">Two weeks</span><span class="length__price">Complete programme £4,495</span>` becomes `<span class="length__sub">Two weeks</span>`
- `<span class="length__sub">Full confinement</span><span class="length__price">Complete programme £6,399</span>` becomes `<span class="length__sub">Full postpartum month</span>`

## 3. What matters most (lines 218, 236, 238)

Find: `Choose as many as you like. These don’t change the fee. They’re the first thing we read before your call.`
Replace: `Choose as many as you wish. As you continue to build your bespoke programme, recommendations will be highlighted.`

Find: `<span class="tg__s">Confinement meals, cooked for you daily</span>`
Replace: `<span class="tg__s">Authentic meals cooked for the family daily.</span>`

Find: `<span class="tg__s">Meals and calm for partners and older children too</span>`
Replace: `<span class="tg__s">A calmer home for partners and children</span>`

## 4. Live-in or live-out (lines 249 to 254)

Find: `<span class="dk-step__t">Live-in, or daytime?</span>`
Replace: `<span class="dk-step__t">Live-in or live-out?</span>`
(Ami's spelling. The hyphens stay. TJ, 24 Oct 2026.)

Find: `<span class="tg__s" id="dkl-format-in-m">She stays in your home for the whole programme.</span>`
Replace: `<span class="tg__s" id="dkl-format-in-m">Your specialist lives with you throughout your programme.</span>`

Find: `<span class="tg__s" id="dkl-format-out-m">She arrives each morning and leaves in the evening. Adds £30 a day towards her travel and accommodation.</span>`
Replace: `<span class="tg__s" id="dkl-format-out-m">Your specialist arrives each morning and leaves each evening. A daily supplement applies towards her travel and accommodation.</span>`

Leave the option title `Daytime in-home care` as it is. Ami's note referred to
it by that name. TJ to confirm whether it becomes "Live-out care".
Leave the lead sentence on line 250 as it is.

## 5. Daytime or day and night (lines 264 to 269)

Find: `<span class="dk-step__t">Daytime, or day and night?</span>`
Replace: `<span class="dk-step__t">Daytime or day and night care</span>`

Find: `With night care you sleep through while your specialist has your baby. She starts at 1pm, settles at 7pm, takes your baby from 11.30pm and brings her back to you at 6am.`
Replace: `With night care, your specialist cares for your baby through the night while you rest. It covers 12 hours, arranged around your routine, and your baby is back with you by morning.`

Find: `<span class="tg__s" id="dkl-shift-day-m">7am to 7pm</span>`
Replace: `<span class="tg__s" id="dkl-shift-day-m">12 hours of care</span>`

Find: `<span class="tg__s" id="dkl-shift-night-m">From 1pm, with your baby from 11.30pm to 6am</span>`
Replace: `<span class="tg__s" id="dkl-shift-night-m">Day care, and your baby through the night</span>`

## 6. Recovery treatments (lines 297, 300, 320, 326)

Find: `Herbal baths and belly binding are part of every programme. Choose the treatments you’d like alongside them. The number beside each one is how often it runs on the length you’ve chosen.`
Replace: `Herbal rinse and belly binding are part of every programme. Choose the treatments you’d like alongside them.`

Find: `<span class="tg__t">Herbal bath</span><span class="tg__s">Fresh herbs such as lemongrass and pandan, run for you</span>`
Replace: `<span class="tg__t">Herbal rinse</span><span class="tg__s">A traditional herbal rinse, warm and freshly prepared, to finish your bath.</span>`

Find: `<span class="tg__t">Body scrub</span>`
Replace: `<span class="tg__t">Full body scrub</span>`

Find: `<span class="tg__t">Herbal foot treatment</span>`
Replace: `<span class="tg__t">Herbal foot spa</span>`

Leave `Postpartum massage with hot stone therapy` as it is (TJ called it that
on 24 Oct; Ami's note said "stone therapy"; TJ to confirm).
Leave the `data-count` session counts in place; batch 3 removes them.

## Verify

```
node lab/shot.mjs index/build-your-programme.html lab/shots/bespoke-b2-1440.png 1440
node lab/shot.mjs index/build-your-programme.html lab/shots/bespoke-b2-390.png 390
node lab/lockcheck.mjs check
grep -n "7am to 7pm\|Herbal bath\|Choose one\|length__price\|Confinement meals" index/build-your-programme.html
```
The grep should return only the `tgl__hint` Choose one lines for the other
steps (01, 03, 04, 06) and nothing else. If it returns anything from the How
long, Live-in, Day or night or Treatments steps, a change was missed.
Open the page in a browser, step through to Recovery treatments with Next and
read every step once. Report and stop.
