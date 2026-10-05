# The Postpartum Suite: site plan

Draft one, 2026-09-17. Written from TJ's brain dump of the same date, read
against `v1.html` as it stands.

**This file holds intent.** What the site argues, who it argues to, and how that
argument is distributed across pages. `HANDOVER.md` holds the rules for touching
the code and `STATE.md` holds the generated facts. Those two stay as they are.

Nothing here is built. Nothing here is agreed. It is a draft for TJ to correct,
and the corrections are the point.

---

## 1. The organising principle

Two jobs, and they fight each other on one page.

**Seduce.** Photographic, atmospheric, felt rather than read. It is what closed
the client and it is what the current homepage already does well. Audience: the
mother.

**Justify.** Numeric, comparative, exhaustive, printable, shareable. Audience:
the partner, and the mother on her fourth visit at two in the morning.

A visitor spending between two thousand and seven thousand pounds does not decide
in one session. They come back. They bring someone. The person they bring did not
see the scroll story and will not sit through it.

So: **the homepage stays the seduction and becomes a router. The justification
gets its own pages and its own devices.** Every deep page is reachable without
travelling the scroll story, which the skip link already half admits by existing.

---

## 2. Who is reading

Three readers, not one. The current site is written entirely for the first.

**The mother.** Usually third trimester, sometimes days postpartum. Tired,
overwhelmed, looking for permission to be looked after. Responds to the
photographs and to "because mum needs looking after too". She is the one who
wants the service.

**The partner.** Often not the one who found the site. Numbers driven, by TJ's
direct account. Arrives via a link she sent, lands cold, with no context.

**What he is asking is not "why does this cost so much".** This household has
money and the fee is not the obstacle. He is asking whether it is real, whether
it is the best available, and whether a stranger living in his house for a month
is a good idea. Those are quality and risk questions wearing a numbers question's
clothes, and answering them with a discount argument misreads him completely.

He still needs something itemised, because numbers driven people trust things
that are itemised. The itemisation should be of what arrives, not of what it
costs per unit.

**The researcher.** The same mother, visits four to nine, reading everything.
Wants the edge cases: caesarean, premature, overdue, complications, second child.
Currently has nothing to read. This reader is why the site needs depth rather
than polish.

**Open question.** A fourth reader may exist and TJ did not mention one: the
person buying it for someone else. Parents, in laws, a group of friends
contributing, an employer benefit. At these prices a gift purchase is plausible
and it needs different copy and a different checkout. Worth asking Amidat whether
this has happened.

---

## 3. Sitemap

Six areas. The nav already carries three of them as tabs, which is why the tabs
survive this plan unchanged.

| Area | Purpose | In nav |
|---|---|---|
| Home | Seduce, then route | Logo |
| Care | What you actually get | Tab: Care |
| Programmes | What it costs and why it is worth it | Tab: Programmes |
| About | Whether to trust us | Tab: About |
| Guides | The research the decision needs | Under Care and About |
| Book | The transaction | Enquire chip |

### Full page list

```
HOME

CARE
  The four kinds of care          (hub)
  Mother and baby
  Treatments in your programme
  Meals and nutrition
  Your home, and the four rooms
  A day, hour by hour
  Night care

PROGRAMMES
  Compare every programme         (hub)
  What is included
  Live in or live out
  Build your own                  (the configurator)
  What this costs elsewhere       (the value case)
  Single treatments               (existing booking system)

ABOUT
  Amidat's story
  Meet your specialist            (the carer profiles)
  Training, vetting and safety
  Areas we cover
  Frequently asked
  Contact

GUIDES
  What confinement is, and why forty days
  Confinement carer, doula, maternity nurse or night nanny
  After a caesarean
  If your baby comes early
  If you go past your due date
  When the birth was complicated
  When you already have children
  Postpartum nutrition explained
  Preparing your home before the birth
```

Twenty four pages. That is deliberate. A seven thousand pound decision that gets
researched over weeks is starved by a five page site, and every page above
answers a question a real visitor will actually type.

---

## 4. Page by page

### HOME

Keep the eight sections. They work and several are locked. Three changes.

**Add one section: the hours.** The value moment, compressed. Full version lives
on its own page. Placed after the four kinds of care and before programmes,
because a reader cannot value what they do not yet understand, and must feel the
value before meeting the price. This is the new signature move the build has been
missing since the day clock was cut.

**Add routes out.** The page is currently a closed loop that ends in one
Calendly link. Every section should offer a door: the care rail into the four
care pages, programmes into compare and into the configurator, the night care
dissolve into the night care page.

**Replace the testimonials.** Placeholder quotes, names and faces still served
from `cdn.21st.dev`. Nothing goes public with those on it.

Not changing: hero, bath, and the handoff between them. Locked and settled.

### CARE

**The four kinds of care.** Hub. The care rail from the homepage, expanded, each
of the four opening into its own page. This is also where the maid service
correction belongs, as a stated position rather than a defensive note.

**Mother and baby.** The care that is the actual product. Feeding support,
settling, bathing, cord and nappy care, accompanying on outings, and crucially
what the specialist does *for the mother* rather than the baby, because that is
the differentiator and it is the thing the name of the business is about.

**Treatments in your programme.** Belly binding, herbal baths, thermal blanket,
massage, hot stone, reflexology, herbal foot spa. What each one is, what it does,
and how often it repeats on each programme length. The repeat frequency is a
value argument hiding in a service description.

**Meals and nutrition.** The biggest single page on the site. Three meals a day
cooked in the client's kitchen, herbal teas, lactation drinks. Needs: a sample
week of menus, what postpartum nutrition is actually for, how meals are tailored
to allergies, culture and preference, and what happens to the rest of the family.
See the claims warning in section 8 before a word of this is written.

**Your home, and the four rooms.** Kitchen, living room, wherever the baby
sleeps, one bathroom. Name them, show them, and state the boundary plainly. The
boundary is the selling point, not an apology: a specialist who is cleaning the
whole house all day is not caring for the mother, and the four room limit is what
protects the care. Say that out loud and the objection becomes a feature.

**A day, hour by hour.** What actually happens between arrival and evening. This
is the page the researcher reads most and it is the cheapest page to make
persuasive, because the detail is inherently reassuring. It also quietly answers
the hours argument in narrative form for readers who bounce off numbers.

**Night care.** The homepage dissolve answers "do we offer night care" with "yes
we do" and then offers no detail anywhere. What the night option is, what it
costs, how sleep works for the specialist, and what live in means overnight when
no night care is booked.

### PROGRAMMES

**Compare every programme.** The hub, and the page the partner is sent to. Every
programme, total price, price per day, price per hour, what changes between them.
The existing duration drawing on the homepage is the right device: it already
draws length against a shared thirty day scale. Extend it to draw price per day
falling as length rises, because that fall is the strongest number in the entire
business and it is currently invisible.

**What is included.** The exhaustive list. Boring, long, and one of the most
visited pages on any high ticket site. Everything, with nothing implied.

**Live in or live out.** Its own page because the pricing is counterintuitive and
will be read as an error. See section 7.

**Build your own.** The configurator. Detailed in section 6.

**What this costs elsewhere.** The value case. Detailed in section 5. This is
the partner's landing page whether or not he arrives there first.

**Single treatments.** The existing booking system, already built and already
priced. Folded into the site rather than sitting beside it.

### ABOUT

**Amidat's story.** She started the company after her own experience of the
service. That is the strongest trust asset the business owns and it appears
nowhere on the site. A founder who was the customer first is the whole answer to
"why should I believe you", and it costs nothing to publish.

**Meet your specialist.** Profiles with qualifications, training, languages,
years of experience, and personality. The personality part is the idea worth
protecting: at this price the visitor is not buying a service, they are letting a
stranger live in their house during the most vulnerable month of their life. What
she is like matters as much as what she is certified in. No competitor does this
well.

**Training, vetting and safety.** DBS, insurance, references, first aid,
qualifications, hygiene protocol. Dry, necessary, and load bearing.

**Areas we cover.** London boundaries, travel, whether outside London is
possible.

**Frequently asked.** The overflow. Anything that does not earn a page.

**Contact.**

### GUIDES

Every page here exists because a real person types that exact question into
Google at three in the morning. They are the research the decision needs, and
they are the only part of this site that will ever bring traffic on its own.

The one that earns its place commercially is **confinement carer, doula,
maternity nurse or night nanny**. It is the comparison the buyer is already
making privately. Making it openly, fairly, and including cases where the answer
is a different service, is the most credible thing a high ticket site can do.

---

## 5. The value arguments

**Revised 2026-09-17 after TJ described the clientele.** High end, high
disposable income, London, accustomed to buying quality. Price is not the
obstacle. They buy on what is delivered, on time returned, and on what the thing
is worth rather than what it costs.

That correction invalidates the version of this section written earlier the same
day, which was built on the assumption that the fee was the objection. It was
not. The retraction is kept below rather than deleted, because the reasoning
matters.

### Retracted: price per hour

The earlier draft recommended publishing a price per hour, headlined on £19.39
for the thirty day live in. **Do not do this.** Three reasons, in order of
severity.

**It files the service next to domestic labour.** London domestic hourly rates
sit in the same band. Publishing an hourly figure invites that comparison
silently and automatically, in exactly the place the business is already working
hardest to escape. The maid service problem gets worse, not better.

**Every unit price makes this look cheap, and cheap is off brand.** £213 a day is
less than a good private chef in London commands. For a buyer who is not price
sensitive, a low unit rate does not read as good value. It reads as a reason to
wonder what is missing.

**Hourly is how labour is priced. Fees are how professionals are priced.** The
act of dividing is itself a positioning decision, before anyone reads the number
it produces.

The per day and per hour arithmetic still has one legitimate use: internal sales
conversation, and possibly the consultation call, where a specific partner is
doing specific maths out loud. It does not belong on a public page.

### The rule that replaces it

**Express the value gradient in what she receives, never in what it costs per
unit.**

Five days against thirty days is **six times the care for 3.2 times the fee**.
Both numbers are true, both derive from Amidat's own list, and neither divides
anything. That is the upsell, stated in a way that raises the service instead of
discounting it.

The same move works everywhere the site needs to show value. Do not say what an
hour costs. Say what arrives.

### Argument one: magnitude delivered

The counterweight to a large fee is not a small unit price. It is a large
delivery, itemised until the volume becomes physical.

A thirty day programme, at the hours and inclusions the current homepage already
describes:

- Three hundred and thirty hours of trained care
- Ninety meals, cooked in your kitchen
- Thirty herbal baths, drawn for you
- Thirty belly bindings
- Massages, hot stone, reflexology, foot spa, repeating throughout

Set that stack against £6,399 and the fee stops being the biggest number on the
page, which is the entire objective. **Confirm every line against the
configurator's breakdown file before publishing**, since the inclusions above are
read off homepage copy rather than off the price model.

### Argument two: the unpriced line

TJ's reference is the Mastercard campaign. The structure is right and it is worth
being precise about why it works: the tangible items are **not** presented as
cheap. They are stated flatly, in order, as evidence that real things were
bought. The final line then withholds a figure, and the withholding is the whole
device.

Applied here, three or four countable lines with figures, then one line with no
figure at all. Do not label that last line. The absence of a number is more
elegant than any word you could put there, and it is more TPS than a punchline.

**Trademark note.** "Priceless" is Mastercard's registered mark and the campaign
is strongly associated with it. Borrow the structure, not the word. Leaving the
last line unlabelled solves this for free.

Candidate unpriced lines, for TJ to cut down and Amidat to approve. The ones that
work are small, specific and universally recognised by anyone who has been
through it:

- The first shower where you are not listening for crying
- Eating a meal while it is still hot
- Waking at seven instead of at three
- Your own mother visiting as a guest rather than as help
- Meeting your baby without also running a household
- Being looked after by someone who is not also frightened for you
- The week you stop counting the days

The last two are the strongest. The sixth names something real that no family
member can provide, because a partner's care is anxious and a professional's is
calm, and that is a genuine product difference rather than a sentiment.

### Argument three: the one window

The core of the whole site, and the only argument that is genuinely about
scarcity for a buyer who has money.

A holiday can be rebooked. A house can be bought later. **You get one first month
with this baby, and it is happening now whether or not it is protected.** Money
cannot buy a second one, and it cannot buy the month back once it has been spent
exhausted.

That is the luxury argument. Everything else on the site supports it.

### Argument four: one person, not four

To replicate the scope, a household hires four: someone for the baby, someone for
the house, someone for the food, someone for the bodywork.

**For this clientele the argument is not the combined cost. It is the
coordination.** A wealthy London household may already have a cleaner and a
nanny, which means the hours saved framing partly misses: she is not doing her own
laundry either way. What she is doing is managing people, in the month she is
least able to. One specialist who handles all four is one relationship, not four
rotas.

Worth checking with Amidat whether her actual clients already have domestic
staff, because it decides how hard this argument works and whether the hours
graphic in argument five needs recalibrating.

### Argument five: the hours reclaimed

TJ's original idea, still worth building, with one caution now attached.

Shape: a newborn day drawn as twenty four hours, showing what the day actually
consumes, then the same day with a specialist in it.

**The caution.** Laundry and cooking hours land hard on a reader who does her own
laundry and cooking. They land softly on one who already outsources both. If the
client base is the latter, rebuild the graphic around the things money genuinely
cannot buy back: sleep, physical healing, and unbroken time with the baby. Those
are scarce at every income.

**Every external number here needs sourcing before it is written.** Candidate
sources: ONS Time Use Survey for UK household labour hours, NCT and the Lullaby
Trust for infant feeding and sleep, peer reviewed postpartum literature for
recovery timelines. One unsourceable figure discredits the whole graphic, and
this graphic is prominent.

### One correction that still stands

**Do not benchmark against midwives or nurses.** Both are protected clinical
titles in the UK. A price or scope comparison implies clinical equivalence the
service does not claim and cannot support.

This matters more under the new positioning, not less: a luxury buyer checking
credentials will notice the overreach faster than a price sensitive one, and it
is the kind of error that ends a sale silently.

### Argument three: the per day price falls as the stay lengthens

£399 a day at five days. £213.30 a day at thirty. A fall of just under half.

Currently invisible, and it is the whole upsell. The duration drawing on the
homepage already puts the four lengths on one shared scale. Adding a falling
price line to that same scale turns a picture of duration into a picture of value
with almost no new invention, and it reuses a device that already works rather
than introducing a second one.

### Argument four: the unbundling

To replicate what one specialist does, a family hires four people: someone for
the baby, someone for the house, someone for the food, someone for the bodywork.

This is the most differentiating argument in the set, because it reframes the
comparison. The visitor arrives comparing The Postpartum Suite to a maternity
nurse, which is a comparison on price. The unbundling moves it to a comparison on
scope, which is a comparison the business wins.

It is also the most dangerous to write, because every input is a claim about
someone else's pricing. See section 8.

### One correction, and it matters

**Do not benchmark against midwives or nurses.** TJ's dump used both words.
Midwives and nurses are registered clinical professionals on protected titles in
the UK. Drawing a price comparison to them implies clinical equivalence that the
service does not claim and cannot support, and the specialists are trained
postpartum carers and beauty therapists rather than clinicians.

The honest and still highly favourable comparison set is maternity nurses,
maternity practitioners, night nannies, postnatal doulas, and private
housekeeping. Those are the real alternatives a buyer is weighing anyway, so
nothing persuasive is lost and a genuine liability is avoided.

---

## 6. The configurator

**It already exists.** Built by someone on Amidat's team with AI, the pricing
model works, and a breakdown of the front end and back end is owed to TJ as a
markdown file. Reviewed here from a full page screenshot dated 2026-09-17. We
redesign it at minimum on style, possibly on function, and it should end up
feeling like the booking page that is already built.

### What it already gets right

Eight steps: care format, length, daytime or day and night, meals, herbal baths,
recovery treatments, massage rhythm, and what matters most. That is genuinely
good coverage and more thorough than expected.

The language is close to correct already. "Explore the care you may want",
"indicative programme", "nothing here is a quote" are all the right register. The
sticky summary panel itemises clearly. The always included block at the foot is
the right idea. Step eight, what matters most, is the best step on the page,
because it collects motivation rather than specification and that is what the
consultation actually needs.

### What I would change, in order of impact

**One. The fee is the climax of the summary panel. It should not be.** The panel
builds a beautiful itemised list and then resolves on £2,271 in large display
type. That makes the fee the answer to the question. Invert it: lead the panel
with magnitude, the hours, the meals, the treatments, and let the fee sit below
in a quieter register. Same information, opposite positioning, and it puts
argument one from section 5 to work at the exact moment of decision.

**Two. The page apologises for its pricing model three times.** The note about
the specialist being reserved exclusively and removals not reducing the fee
appears in the top banner, again in the summary panel, and again in the footer.
Three statements of the same defensive point read as anxiety. A luxury brand
explains its terms once, quietly, and does not argue with the reader. Once, in
the summary panel, is enough.

**Three. It is a subtraction tool dressed as a build tool.** Everything starts
ticked and the visitor removes what she does not want, while being told that
removing does not much change the fee. That is a frustrating loop: the interface
offers a lever and then explains that the lever is not connected.

Two honest ways out. Either removal genuinely moves the fee, or removals stop
being priced line items and become preferences. The herbal baths step already
does the second thing well with its "Not for me" option, which reads as taste
rather than as trimming cost. Extending that pattern to the treatments list would
resolve most of the tension.

**Four. The budget field.** "Have a care budget in mind?" with a figure box is a
discount shopping cue, and it sits directly under the fee. For a buyer who is not
price led it invites a frame she was not in. It also duplicates step eight, which
gathers the same steering information in a much better way.

Commercially the client's team may want the budget capture, so this is a
judgement call rather than a clear cut. If it stays, it should move off the fee
panel and be phrased around fit rather than affordability.

**Five. Style, against the Brand Pack.** From the screenshot it uses filled tint
blocks and what look like elevated cards. The Brand Pack specifies no shadows
anywhere, with depth carried by hairlines, edges and overlap, plus the five
confirmed type roles. This is the redesign TJ already expects and the rules are
settled, so it is execution rather than decision.

One thing it gets right already and should keep: the fee is set in the display
serif, not in mono. The type rules exclude mono for prices and dates.

**Six. The nav does not match.** It carries Care, Programmes and Book a
consultation, where `v1.html` carries Care, Programmes and About. One of them is
wrong and the sitemap in section 3 should settle it.

### The feature still missing, and it is the most valuable one

**Send this plan.** She builds the configuration, then sends it to herself or to
her partner as a clean itemised summary. The page currently offers "See my
programme summary", which is close, but the thing that matters is that the
summary leaves the site and arrives somewhere he will read it.

That solves TJ's stated problem exactly. She currently has to reconstruct the
case from memory for someone who never saw the site. This hands it to him
itemised, led by what arrives rather than by what it costs, and it hands the
business a lead with full intent data attached before anyone has spoken.

### What the breakdown file needs to answer

- Is the published price list the base the configurator computes from, or does
  introductory pricing replace it? The panel shows £2,271 against a £2,495 list
  price for seven days, and it is not clear how much of that gap is removed
  items and how much is the 2026 introductory rate.
- Which elements are priced, which are fixed, and which are preference only
- How the £30 a day live out supplement is applied, given section 7
- Where submissions currently go, and whether it can reach the booking system

---

## 7. The pricing

**Standing rule, TJ, 2026-09-17: the numbers are Amidat's and none of them
change.** Nothing in this plan proposes altering a figure. The entire question is
how they are displayed.

### Why live out costs more, answered

Live out is dearer because the business carries a hotel and transport cost every
single day. The specialist has to be very close to the client's home, so she is
accommodated nearby at the company's expense. Live in removes that cost, and the
saving is passed on. The configurator states it as a £30 a day supplement.

**This is a trust asset, not an awkward fact.** A visitor working out that the
business houses her specialist within reach of the door every night learns
something real about how seriously the service is run. Said plainly it converts
the most confusing line in the price list into proof of operational rigour.

It does have to be said, though. Unexplained, a higher price for apparently less
service still reads as an error, and an error in the pricing makes a reader
doubt everything else on the page. That is what earns "Live in or live out" its
own page in section 4.

**One consistency check for the breakdown file.** At thirty days the differential
is exactly £30 a day, £900 across £6,399 and £7,299. At fourteen days it is
£355 across the pair, which is £25.36 a day. The configurator's flat "£30 a day"
therefore describes one programme and not the other. No number needs changing.
The explanation needs to be phrased so it is true of both, or stated per
programme.

### Still open

**Five and seven day have no live in or live out option.** The list gives one
price for each. Are they live in by default, live out by default, or does the
distinction not apply below fourteen days? Not answerable from the material.

**The hours are not published anywhere.** The configurator says daytime care
runs 7am to 7pm, that night care starts at 1pm and settles at 7pm, takes the baby
from 11.30pm and hands back at 6am. TJ's working figure elsewhere is eleven hours
against twelve to twelve less a lunch break. Those do not obviously agree, and
the hours underpin the magnitude argument in section 5, so they need confirming
for live in and live out separately.

Note this is now a magnitude question rather than a pricing question. Nothing
gets divided, but "three hundred and thirty hours of care" still has to be true.

**Introductory pricing.** The configurator holds introductory rates for bookings
taken in 2026. Whether the published list is the introductory price or the
standard one decides how every figure on the site is captioned, and whether any
of it carries an expiry.

---

## 8. What must be verified before it is written

Standing rule: stats get verified against a primary source during research, not
at the end. A published figure that turns out to be wrong is worse than no figure.

**Needs an external source and cannot be written until it has one:**

- Hours a new mother spends on laundry, cooking, feeding and settling
- Typical London day rates for maternity nurses, night nannies and postnatal doulas
- Any recovery timeline for caesarean or complicated birth
- Any claim about confinement practice beyond describing the tradition

**Needs no source, publishable immediately:**

- Every price per day and price per hour in section 5, since they are arithmetic
  on the client's own price list
- The fall in per day price across programme lengths
- Everything in the scope and unbundling argument, which is a description of the
  service rather than a claim about the market

### Two claims risks on the nutrition page

The nutrition page is the one most likely to create a regulatory problem, and the
current homepage already touches it.

**Health claims on food and drink are regulated.** The live homepage says
lactation drinks are "designed to assist feeding". In the UK, nutrition and health
claims on foods are restricted to an authorised register, and a claim that a
product supports lactation is a health claim. The safe form describes the
tradition and the ingredients rather than asserting a physiological effect.

**Recovery claims drift medical.** Anything stating that a treatment speeds
healing, reduces diastasis recti, or aids uterine involution is a medical claim
from a provider who is not a clinician. Describe what is done and how it feels.
Do not state what it cures.

Worth a short conversation with Amidat about what she is comfortable claiming,
because she may already have guidance, and worth noting that competitors breaking
this rule is not a reason to break it.

---

## 9. Questions for Amidat

Grouped so they can go over in one message.

**Pricing**
1. Are the five and seven day programmes live in, live out, or neither?
2. What are the contracted hours, for live in and live out separately?
3. Is the published list the introductory price or the standard one, and does
   introductory pricing end?
4. Is there a deposit, a payment plan, or a cancellation policy?

**The clientele**, which decides how arguments four and five in section 5 are built
5. Do her clients typically already have a cleaner, a nanny or a housekeeper?
6. What do they say in the consultation when they explain why they want this?
   Their own words are worth more than anything we can write.
7. Has anyone booked and then extended, and what made them extend?

**Service**
6. Is the four room boundary firm, and what happens if a client asks for more?
7. What happens if the baby arrives early, or late, against a booked date?
8. Is care for older siblings included, extra, or refused?
9. What is the night care option, and what does it cost?
10. What happens to meals for the rest of the family?

**People**
11. How many specialists are there, and will they agree to be profiled by name?
12. What qualifications, training and checks can be listed?
13. Is the specialist matched to the client, and does the client get a choice?

**Trust**
14. Are there real testimonials that can be used, with names and permission?
15. How many families have been served? A number, if it is a good one.
16. What is she willing to claim about nutrition and recovery?

**Positioning**
17. Who does she lose deals to, and what do those competitors charge?
18. Has anyone bought this as a gift for someone else?

---

## 10. Risks worth naming now

**The homepage is already fourteen viewport heights before the programmes.** Every
new section makes the distance worse, and the partner will never travel it. The
router job is not optional.

**Twenty four pages is a lot of copy.** None of it is written and most of it
needs the client's input. The writing, not the building, is the critical path.

**Numbers in headings collide with a type rule.** TPS style spells numbers out in
titles, and the current build already breaks this with "5 days of care" set as a
display heading. A site built on a numeric value argument will hit this
constantly. The boundary needs settling: my read is that titles spell out and
data figures stay as numerals, but that is a guess and TJ set the rule.

**Prices must not be set in IBM Plex Mono.** The type rules reserve it for badges
and section numbers and explicitly exclude prices and dates. Worth flagging early,
since a pricing heavy site will reach for a mono face by instinct. Note that
`HANDOVER.md` and the brand memory disagree slightly on this and the more recent
correction is the one excluding prices.

**Some of the scroll story becomes a page.** The confinement explainer, night
care and the treatments concertina all have obvious homes as pages of their own.
That would mean lifting finished work out of a finished page, which runs into the
rule that finished sections stay finished. Worth a deliberate decision rather than
a drift.

---

## 11. What I would build first

Order by what unblocks the most and risks the least.

1. **Settle the sitemap.** Every menu link in the build is a placeholder waiting
   on it, so this unblocks the nav immediately. It also settles the nav mismatch
   between `v1.html` and the configurator.
2. **Get the configurator breakdown file.** Already owed. It blocks the restyle,
   and it is the only source that can confirm the magnitude figures in section 5
   are true.
3. **Send the questions to Amidat.** Longest lead time, blocks the most pages.
4. **Write the magnitude block.** The itemised stack from argument one, set
   against the fee. Needs the breakdown file to be accurate but nothing external,
   and it is the piece that carries the new positioning.
5. **Write Amidat's story.** Free, no dependencies, biggest trust gain per word.
6. **Restyle the configurator** to the Brand Pack, with the summary panel
   inverted to lead on magnitude and the triple caveat cut to one.
7. **Then the care pages, then the guides, then send this plan.**

Note the reordering against the first draft. The configurator was scheduled last
on the assumption it did not exist. It does exist and it works, so it moves up,
and the extension to the duration drawing that used to sit at position four is
gone: it was going to carry price per day, which section 5 now retracts. If that
device gets extended it should carry magnitude instead, six times the care for
3.2 times the fee, which is the same picture without the unit rate.
