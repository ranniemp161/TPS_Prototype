# Batch 1: Home page copy (Haiku)

Read `briefs/README.md` first. This batch is text only. No CSS or JS changes
except the one font size rule in step 6. Nothing here touches the header,
footer, scroll engine or the film.

File: `index/index.html`
Backup first: copy it to `lab/index.before-ami-24oct-copy.html.bak`

Sheet rows covered: 61, 64, 69, and the Home part of 60.

## 1. Section name and heading (line 335 and 349)

Find:
`data-section="confinement" data-section-name="What Is Confinement"`
Replace with:
`data-section="confinement" data-section-name="What Is Postpartum Care"`
(Leave `data-section="confinement"` and `id="confinement-heading"` as they are.
They are internal hooks, not visible words.)

Find:
`<h2 class="display display--lg" id="confinement-heading" data-kinetic>What is Confinement?</h2>`
Replace with:
`<h2 class="display display--lg" id="confinement-heading" data-kinetic>What is Postpartum Care?</h2>`

## 2. Body copy under it (lines 350 and 351)

TJ, 24 Oct 2026: the text is good, tweak it so postpartum care is traced to the
Malaysian confinement tradition. Confinement stays only as the name of the origin.

Find:
`<p class="turn__standfirst">In Malaysian and Southeast Asian traditions, the first month after birth, known as the confinement period, is a sacred window dedicated entirely to maternal rest, healing, and bonding.</p>`
Replace with:
`<p class="turn__standfirst">Our postpartum care comes from the Malaysian and Southeast Asian tradition of confinement, where the first month after birth is a sacred window dedicated entirely to maternal rest, healing, and bonding.</p>`

Find:
`<p class="body">Rather than expecting a mother to navigate the postpartum transition alone, confinement surrounds her with skilled daily support, nourishing food, and restorative bodywork.</p>`
Replace with:
`<p class="body">Rather than expecting a mother to navigate the postpartum transition alone, this care surrounds her with skilled daily support, nourishing food, and restorative bodywork.</p>`

Leave the third paragraph (`turn__trail`) unchanged.

## 3. Programmes heading (line 506)

Find: `<h2 class="display display--lg">However long you need</h2>`
Replace with: `<h2 class="display display--lg">However long you need with us</h2>`

## 4. Thirty day picker copy (line 562)

Find: `data-body="The full confinement period, kept the way tradition intends.`
Replace with: `data-body="The full postpartum month, kept the way tradition intends.`
(Rest of the attribute unchanged.)

## 5. Single treatments link (line 702)

Find:
`<p class="treatments-addon">Want the full details? <a class="cta-link" href="single-treatments.html">Learn more.</a></p>`
Replace with:
`<p class="treatments-addon treatments-addon--sm"><a class="cta-link" href="single-treatments.html">Explore full details</a></p>`

## 6. The smaller size for that line

File: `index/css/site.css`. Backup to `lab/site.before-ami-24oct-copy.css.bak`.
Find the rule that starts `.treatments-addon {`. Directly after that whole rule
add one line:

`.treatments-addon--sm { font-size: .85em; }`

Nothing else in the CSS changes.

## Leave alone (they are the origin, or belong to a later batch)

- Line 175, hero lede: "Rooted in Malaysian confinement traditions" stays.
- Line 602 "Book a consultation", line 109 header "Enquire": batch 6 changes
  every button in one sweep once the form exists.
- The Request a place button for this section: batch 6.

## Verify

```
node lab/shot.mjs index/index.html lab/shots/home-b1-1440.png 1440
node lab/shot.mjs index/index.html lab/shots/home-b1-390.png 390
node lab/lockcheck.mjs check
grep -n "Confinement?" index/index.html      (expect no output)
grep -n "Want the full details" index/index.html   (expect no output)
```
Open both screenshots. Check the What is Postpartum Care heading fits on two
lines at 1440 as the old one did, and the Explore full details line is visibly
smaller than the body text above it. Report and stop.
