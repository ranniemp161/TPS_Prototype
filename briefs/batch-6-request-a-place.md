# Batch 6: Request a place (Opus)

Read `briefs/README.md` first. Batches 1 to 5 must have landed. This batch
builds the one front door and swaps every button to it.

Decision (TJ and Ami, 24 Oct 2026): one universal button everywhere,
"Request a place". It replaces Enquire, Book a call, Book a consultation and
the waitlist. Every path lands on one form. A call can only be chosen after
the form is submitted. Supply is genuinely limited (one specialist per family),
so the gate is honest, not theatre.

Sheet rows covered: 26, 49, 50, 51, 54, 55, 56, 57, 58, 59, 62.

## Two decisions still open. Ask TJ before building the parts they touch.

A. After submitting, does the confirmation screen offer Calendly immediately
   ("Choose a time to talk"), or does Ami review each request and send the link
   herself? Build the form either way; the confirmation copy depends on this.
B. The programmes card counts (row 54): the numbers for treatments and the four
   kinds of care per length. Take them from `figures(d)` in programmes.js if
   the engine has them; if not, ask.

## 1. The form

One new section, `index/request-a-place.html`, built from the builder's close
screen pattern (`form.capture`, HTML line 398 onward) and the inner page
chrome of `programmes.html`. Fields: name, email, due date (the builder's
calendar is too much here; a date input styled with the tokens), postcode,
and a hidden `programme` field the builder fills when the visitor arrives from
it. Heading in Instrument Serif caps, one Quentin line, Karla body. Add the
page to the PAGES table in both `index/partials/sync-header.py` and
`sync-footer.py`, run both.

Incentives on the form (TJ, 24 Oct 2026), three short lines above the button:
- We send you the full summary of your programme.
- We hold your indicative price for 7 days.
- A free postpartum guide to prepare for your baby's arrival. (The guide does
  not exist yet, so this line is holding copy; mark it in DESIGN.md.)

Confirmation screen: "You're on our list." Then, per decision A, either the
Calendly link (`https://calendly.com/thepostpartumsuite/30min`) under "Choose
a time to talk", or "We'll be in touch within one working day."

Form submission is UI only, as the builder's is (FUNNEL-PLAN.md 9: TJ's
colleague wires it to the CRM and Resend). Keep `method="post" action="#"` and
the same hidden field names so the wiring is one job.

## 2. Postcode gate on the bespoke builder (row 26)

The single treatments page already does this: `booking-m25.js` holds the M25
ring, `booking.js` looks the postcode up on postcodes.io and ray casts it,
and `single-treatments.html` line 230 onward holds the refusal copy. Read all
three. Then add a first screen to the builder before the due date
(`data-block="postcode"`): one input, the Begin button checks it, inside goes
on, outside shows the same refusal copy as single treatments (client's words,
copy them exactly) and does not continue. Include `booking-m25.js` on the
builder page. The deck controller already blocks forward movement on the due
screen (`blocked()`); add the same gate for the postcode screen.

## 3. Seven day hold replaces the two close versions (row 49)

Builder close screen (HTML lines 388 to 411) and JS `closeKind()`,
`duePhrase()`, `data-close`. Remove the hold or dates split: one version only.
Heading "Hold this price". Copy: the indicative price is held for 7 days from
today. Remove every "three months" and "twelve months" string, including
`.dk-legal` line 409 and the Done screen line 417. The close screen's form is
replaced by the Request a place form fields (same component), submitting from
inside the builder with the `programme` field filled from `briefFor()`.

## 4. The universal button sweep (rows 59, 51, 62, 55)

Every CTA becomes `Request a place` linking to `request-a-place.html` (or the
in builder close screen where the builder already holds the summary):
- Header: unlock `site-header` on every page (`node lab/lockcheck.mjs unlock
  index/<page>.html:site-header` for each), edit
  `index/partials/site-header.html` line 54 `Enquire` to `Request a place`
  and the `{{ENQUIRE}}` target to the new page, run `sync-header.py`, screenshot,
  and re-lock only after TJ approves.
- Home: `.cta` button (was Book a consultation) and its `.cta__meta` line
  ("Thirty minutes, by phone or video. Nothing is booked on the call." comes off;
  the call is offered after the form now). Add a `Request a place` button at
  the end of the What is Postpartum Care copy (row 62), `btn btn--primary`,
  below `turn__trail`.
- Programmes page: both `Book a free consultation` buttons on the card and the
  `pg-cta` button. Rewrite `pg-cta__p` to drop the call description and point
  the sentence at requesting a place; keep the bespoke and single treatment
  links inside it.
- Builder: `Book a call` on the decide screen and the Done screen link.
- What We Do, About, FAQs, Who Comes, Gifts, Single treatments: grep each for
  `calendly` and `Enquire` and swap. Single treatments keeps its own booking
  flow for treatments; only a generic enquiry button changes.
`grep -rn "calendly\|Enquire\|Book a call\|Book a consultation\|Book a free consultation" index/*.html`
must return only the confirmation screen's Calendly link when done.

## 5. Programmes cards (rows 54, 55, 58)

On each `.pg-card` add a short line of counts under the price: treatments
across the stay and the four kinds of care, with numbers (decision B). Then a
`pg-card__more` anchor "See the full breakdown" that scrolls to the
`#what-is-included` section (give `.pg-same` that id). Row 58 "Add waitlist" is
resolved by this batch: the Request a place button is the waitlist. Note that
in the sheet row.

## Verify

```
for p in index/*.html; do node lab/shot.mjs $p lab/shots/$(basename $p .html)-b6-1440.png 1440; done
node lab/shot.mjs index/request-a-place.html lab/shots/request-b6-390.png 390
node lab/shot.mjs index/build-your-programme.html lab/shots/bespoke-b6-390.png 390
node lab/lockcheck.mjs check
python index/partials/sync-header.py --check
python index/partials/sync-footer.py --check
```
Real browser: enter an outside postcode (e.g. `M1 1AE`) on the builder and
confirm it refuses; enter `SW1A 1AA` and confirm it continues. Submit the form
from the builder and from the standalone page; both reach the confirmation.
Every header on every page reads Request a place. Record the whole decision in
DESIGN.md: `## Request a place, the one front door (TJ and Ami, 24 Oct 2026)`.
Report and stop. TJ re-locks the header after he has looked.
