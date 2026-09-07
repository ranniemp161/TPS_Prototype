# The Postpartum Suite prototype: read this first

You are picking up a build in progress. This file exists so a fresh session can
carry on without the conversation that produced it. Read it before touching
anything. Rewritten 2026-09-07; everything in it was checked against the files
on that date rather than remembered.

---

## 1. What this is

A scroll driven homepage prototype for **The Postpartum Suite**, a London
business providing live in postpartum care. A trained specialist stays in the
client's home, from five days to thirty, rooted in Malaysian confinement
tradition. The founder is Amidat Olowu.

**There is no day timeline. The page is not a morning to night sequence.**

This matters more than anything else in this section, because the code will
tell you otherwise. The build was originally a "chaptered day": one house
photographed at different hours, read from morning to night, and that idea
governed the act order, the act names and a clock rail down the side. TJ
abandoned it on 2026-09-05. Do not reason from it, do not reintroduce it, and
never justify a section by where it would fall in a day.

**What is still in the code, and why it is not an instruction:**

- Six `data-time` attributes on acts, running 07:00 to 22:00
- Seven act comment headers written as hours, "ACT 1 · 07:00 · ARRIVAL" and so on
- The act numbers in those headers, which are also wrong: the order has changed
  twice since they were written

All of that is inherited. It came back into the file when v1 was pulled from
GitHub on 2026-09-06, because the retirement was only ever a local change and
was never pushed. It is invisible to a visitor. TJ has asked that the page files
be left alone for now, so it stays until he says otherwise.

**Four lines of visible copy are also leftovers of the day**, and they are
waiting on TJ's words rather than on a decision you can make:

- "Three in the afternoon." and "Seven in the evening.", in the dissolve. These
  two are the entire content of that act, so removing them without a replacement
  leaves it silent.
- "She takes the morning."
- "And in the morning, she is still here.", now sitting on the photograph inside
  the confinement act, where it refers to a night the page no longer shows. TJ
  has called this one a placeholder.

Not a leftover: "dedicated live in care from morning to evening" in the
confinement claim is TJ's own new copy describing a working day, not the
retired framing.

**Who you are working for.** TJ is the one giving direction. He is not the
client, he is building this for the client. He is highly specific and reviews by
eye against real references, chiefly `white-desert.com`. When he says something
looks wrong, it is wrong; measure it rather than explain why it is fine.

---

## 2. The files

| File | What it is |
|---|---|
| `v1.html` / `v1.css` / `v1.js` | **Production.** The live direction. Everything below describes this |
| `v1-ruined.*` | A real working version, not damaged goods. See below |
| `index.html` | An earlier direction, kept for reference, shares the same assets |
| `lab/baseline/v1.*` | A copy of `origin/main` used as a control by the comparison tools. Not for editing |
| `lab/revert/` | The pre-2026-09-05 bath handoff mechanic, kept whole in case it is wanted |

**About the name `v1-ruined`.** On 2026-09-05 TJ believed v1 was broken beyond
use and asked for it to be set aside under that name while a clean copy was
pulled from GitHub. It turned out not to be broken; the fault was Chrome serving
a cached stylesheet against new markup. By then the name had stuck. It contains
a large amount of work that was later moved into v1 piece by piece, and it is
still the reference for anything that has not been moved across yet. It opens on
its own: its HTML points at its own CSS and JS.

---

## 3. The repository

```
https://github.com/subishop/TPS_Prototype     branch: main     PUBLIC
```

**The local checkout has diverged and nothing has been pushed.** As of
2026-09-07: `origin/main` is 10 commits ahead of the commit this work branched
from, and there is 1 local commit origin does not have, plus uncommitted changes
to `v1.html`, `v1.css`, `v1.js`, `BRIEF.md`, `HANDOVER.md` and
`scrollcraft/FINGERPRINTS.md`, plus the untracked `v1-ruined.*`.

There is at least one other collaborator actively pushing, via feature branches
and pull requests. Their work so far includes real treatment photography, a
mobile hero that fills its screen, a UI polish pass, folding the treatments
gallery into the programmes act, and the "turn" act. **Always fetch before you
start and before you push.** Merge their work, never rebase over it, and never
force push.

```bash
git fetch origin
git rev-list --left-right --count origin/main...HEAD    # theirs / ours
```

Credentials are in Windows Credential Manager for `subishop`. Git needs the
helper named explicitly here:

```bash
git -c credential.helper=manager push origin main
```

**Do not push, and do not commit, without asking TJ.** He asks for both
explicitly.

**Three of the collaborator's changes were deliberately removed** when TJ asked
for the nav, hero and bath to be made identical to `v1-ruined`. He was warned
about the first and chose it. Any of them can go back on its own:

- their mobile hero, which filled the screen as a flex column
- their 44px touch targets on the nav chips under `@media (pointer: coarse)`
- their bordered 62% chip fill, replaced by TJ's borderless 0.04 taupe

---

## 4. Running and verifying

No build step. `v1.html` opens directly in a browser.

Node is installed but **not on PATH by default**:

```bash
export PATH="/c/Program Files/nodejs:$PATH"
```

`playwright-core` is in `node_modules`. Chrome is used via `executablePath`.

Everything in `lab/` is a measurement tool. There are about sixty of them and
they are the real leverage on this project. Their output defaults to the system
temp folder, never the project, because the project lives in a synced Drive
folder.

**The working method here is measure, then decide.** Screenshot it, put a number
on it, then report. Several failures on this build came from reasoning about
pixels instead of looking at them.

### The ones you will use most

| tool | what it answers |
|---|---|
| `audit.mjs` | where every act sits, plus a 61 frame walk of the page |
| `deadscroll.py` | reads that walk, reports the share of pixels that moved per step |
| `edges.py` | finds visible bands by isolating rows that are flat field |
| `shot.mjs` | N frames across any scroll range, any viewport |
| `herolock.mjs` | the hero guard. See section 6 |
| `humanhash.mjs` | opens the page at `#programmes` and wheels back up, the way a person does |
| `navcheck.mjs` | nav collisions and overflow across 23 window sizes |
| `menucheck.mjs` | opens, reads and closes the menu at five widths |

### Written for one job, useful again

`vsbaseline.mjs` and `ruineddiff.mjs` diff the live file against a control at
identical scroll positions. `driftstate.mjs` reports the WebGL field's opacity
down the page. `chipcontrast.mjs`, `tvcontrast.mjs` and `turncontrast.mjs` hide
the type, photograph the ground behind it and read a percentile.
`standfirst.mjs` checks a masked line reveal actually lands and is not shearing
descenders. `tvcollide.mjs`, `headclear.mjs` and `framewidth.mjs` are geometry
checks. `nightcheck.mjs` drives the framed photograph's wipe.

**Two habits worth copying from them.** Establish a noise floor before calling a
difference a difference: run the control against itself and see what two runs of
the identical page disagree by. And settle scrubbed values by reading until two
consecutive samples agree, rather than guessing a delay.

---

## 5. The page

Ten acts in document order, measured at 1600 by 900 on 2026-09-07:

| act | top | height | what it is |
|---|---|---|---|
| `hero` | 0 | 2.46 | pinned, focus pull, kinetic headline |
| `bath` | 0.5 | 2.30 | the handoff. Overlaps the hero by 1.96 on purpose |
| `turn` | 2.80 | 1.56 | **What is Confinement?** plus the framed photograph |
| `voices` | 4.36 | 0.60 | the testimonials |
| `pan` | 4.96 | 4.17 | four kinds of care, the horizontal rail |
| `programmes` | 9.13 | 1.84 | heading, treatments gallery, the duration bars |
| `rest` | 10.97 | 1.11 | "You go back to bed" |
| `treatment` | 12.08 | 0.90 | "The care turns toward you" |
| `peak` | 12.98 | 4.20 | the dissolve. The longest act, and the peak |
| `close` | 17.18 | 0.43 | "Ready to talk it through?" and the Calendly button |

About **17.94 viewport heights**, 30 ScrollTriggers. GSAP and ScrollTrigger from
a CDN.

**The act class names no longer describe what the acts are.** `turn` holds the
confinement explainer, not a turn from story to answer. `voices` holds a single
quote switcher, not the three column wall it was named for. Renaming them would
touch the page files, which TJ has asked to leave alone.

---

## 6. Rules that govern every decision

**TJ's, stated repeatedly and non negotiable:**

- **No visible transitional edge, anywhere, at any scroll position.** The
  governing rule of the build. Every band the page ever showed came from a CSS
  gradient, because a gradient changes slope somewhere and the eye finds that
  somewhere as a line. Prefer real photographic feathering. A deliberate ground
  change at a section boundary is a cut and is a different thing; the page has
  several and they are fine.
- **No dead scroll.** No stretch where the wheel turns and the picture does not
  change. One authored exception, a short beat at the end of the bath.
- **Never fade the hero to reveal something.** Arrival by movement, not opacity.
- **Do not touch the hero, or the scroll between the hero and the bath**, unless
  he has asked for it in those words. See the guard below.
- **Questions are not build orders.** He asks a lot of questions that look like
  instructions. Answer them and stop. Wait for "go".
- **No em dashes or hyphens in written output.** Global, including documents and
  commit messages. Commas, periods, or restructure.

**From `TPS Brand Pack.html`, which is the governing brand document:**

Five type roles, all confirmed: Instrument Serif for headlines, set in capitals
everywhere on this page; Montserrat 300 to 600 for labels and the interface
layer; Karla for anything anyone actually reads; Quentin for one large accent
line; IBM Plex Mono for figures and badges.

No shadows anywhere; depth is hairlines, edges and overlap. No dark sections,
though a dark photograph is allowed. Radius scale is fixed: `--r-badge` 6px,
`--r-button` 8px, `--r-card` 10px, `--r-media` 16px.

**Note that a second type document disagrees.** `TPS Design/TPS-DESIGN.md`
specifies TPS Display, Forum, Josefin Slab and Corinthia, and says only Josefin
Slab should be treated as final. The prototype follows the Brand Pack. If TJ
asks about fonts, tell him the two files contradict each other.

**The skills.** `scroll-craft`, `design-dna` and `taste-skill` are installed at
`~/.claude/skills/`. TJ expects them consulted, and checking them has repeatedly
found real things. Its hard rules ban, among others: em dashes anywhere visible,
"01 / 06" section counters, an eyebrow above every heading, centred copy in every
act, and the same device family twice in a row.

**Two of its rules the build currently breaks**, both introduced by a ported
component and both known to TJ: the testimonial block carries a 01 of 03 counter,
and the line under each name uses an em dash as a separator.

---

## 7. Decisions already made, and why

These cost many iterations. Do not silently revert them.

**The hero to bath handoff.** One photograph, `assets/img/bath-steam.webp`,
carries the steam and the bath together with a real alpha channel: transparent
for its top 15%, steam feathering in to 60% down, opaque bath below. It replaced
a fog plate over a separate bath photo plus two CSS gradient masks. The image is
set to the width of the window, rests its bottom on the bottom of the section,
and its surplus steam overflows above and is clipped. It travels exactly its own
height.

The arithmetic: the bath is the bottom 40% of the asset and the on screen scale
is set by the width, so bath height equals `(window width / asset width) x asset
height x 0.4`. Cropping the asset's **top** changes nothing. Only cropping its
**width** makes the bath taller.

**The nav is one chip.** Care, Programmes and About used to be three chips each
opening their own panel. Since 2026-09-07 there is a single Menu chip at every
width, and those three words are the headings inside one drop down, three
columns wide, two at tablet, one on a phone. The drawer is capped to what is
left of the window under the bar and scrolls inside itself: uncapped, it ran 428
pixels past the fold on a phone with seven links unreachable.

**The chips carry `rgba(140,127,121,.04)` and no border**, `.46` on the dark
frame. 0.04 is deliberate and TJ chose it off a rendered ladder from 0.46 down
to zero. On a photograph the backdrop blur does the defining; on flat pale
grounds the chip is close to invisible on purpose. **Do not raise it to fix
that.** The mechanism worth understanding: alpha compositing pulls the ground
toward the overlay, so a mid tone lands below a light ground and above a dark one
and adapts by itself. A white fill cannot, because the grounds sit around 232 of
255. Measured cost: the worst chip label contrast on the page is 1.45 to 1.

**The mesh drift field** is one fixed WebGL canvas behind the whole document,
running the Warm Paper preset, `#F6F6F6 #E3D7D3 #E2CAC6 #C9B9B5`. It is one
canvas on purpose: two painted backgrounds meet at a join and that meeting is a
line. It currently serves the confinement act, "You go back to bed" and "The care
turns toward you"; the testimonials, the rail and the programmes sit inside its
span, are opaque, and simply hide it.

Blush Drift was tried and failed on measurement: it drew from the same corner of
the palette as the coral band below, so the join read as a fault, and it halved
contrast, taking a caption to 3.22 where body text needs 4.5. Cursor reactivity
is wired in the shader and deliberately switched off, because it is a ground
behind reading copy.

**Its fade in is timed, not guessed.** It comes up between 1.55 and 1.78 viewport
heights, which is behind the bath at full strength. An earlier attempt starting a
full viewport sooner tinted the bath by up to 50 levels at 1.3, because the bath
scene arrives carrying a single opacity and everything behind it shows through
faintly until it is at full.

**The testimonial block uses no GSAP and registers no ScrollTrigger.** Its
entrance runs off an IntersectionObserver and it never transforms its own
section. That is deliberate: the hero pin measures the whole document when it
builds, and an earlier version of this section disturbed that measurement.

**The confinement act.** The heading is centred and at `display--lg`, the one
centred heading on an otherwise left lead page, which is the anchor variation the
skill asks for rather than a breach of it. Its top padding has a floor of 104px
rather than a proportion of the window: at 10vh alone a 670px window gives 67px
under an 80px bar and the heading sat behind it. The opening sentence is a
standfirst, one step up in size, and it is the only element in that act that
assembles rather than fades.

---

## 8. Traps that have already cost time

**The fixed nav poisons contrast samples.** It paints over anything that has
scrolled under it, so a raw bounding box reports the Enquire button as the
ground. This produced a reading of 3.53 where the true figure was 13.4, three
times identically, which is what made it look real. Exclude any sample whose box
reaches above the nav. Also use a percentile, not a mean: one antialiased pixel
otherwise decides the answer.

**Chrome caches `file://` subresources.** New markup plus a stale stylesheet
renders as a catastrophically broken page and it cost most of a day. `v1.html`
now loads its CSS and JS with a version token and the Stop hook bumps it on every
change, so it cannot happen again. If a page still looks impossible, hard reload
before believing it.

**ScrollTrigger must be refreshed at scroll position zero.** Refreshing while
the window is deep in the document gives pins a start measured from the wrong
origin: the hero pin came back with a start of minus 6811 instead of 0, its span
correct at 1314 either way, which is what gave it away. ScrollTrigger also
registers its own refresh on window load, and `boot()` runs earlier than that on
`document.fonts.ready`, so anything measured in boot is re-measured afterwards at
whatever position the page is sitting at. **This fix lives in `v1-ruined.js` and
is not in `v1.js`.** TJ chose not to bring it across. It matters the moment
anyone opens the page on a URL ending in `#programmes`.

**Google Drive writes `desktop.ini` into `.git`.** Git reads the ones in `refs/`
as branch names and fails with `fatal: bad object refs/desktop.ini`. Clear before
any git operation:

```bash
find .git -name "desktop.ini" -type f -delete
```

**Two progress scales in the peak act.** `navTheme()` spans the whole act, 4.2
viewport heights, while the pinned dissolve is only 3.2 of that. A position
measured on the dissolve must be multiplied by `DISSOLVE_SPAN` before comparing
against `self.progress`.

**Flex items ignore aspect ratio without `min-height: 0`.** One portrait source
in the care rail grew to 1083px and dragged every other card with it.

**`clip-path` masks shear descenders.** A masked line reveal on type set tight
clips the tails off g, y, p and j. No static audit catches it; only a rendered
screenshot does. `standfirst.mjs` checks for it.

**Line splitting must re-measure after fonts load**, and again on a width change,
because line boxes move when the face swaps in. Ignore height changes: that is an
address bar, not a reflow, and rebuilding on it replays the animation.

---

## 9. The hero guard

`lab/herolock.mjs` records the hero to bath handoff geometry at three viewport
sizes, every 0.1 of a viewport height, down and back up, and re-checks the live
file against it at a 2 pixel tolerance. Every value is read only once the frame
has stopped changing, which is what allows a tolerance that tight.

A **Stop hook** at `~/.claude/hooks/tps-hero-guard.sh` runs it whenever
`v1.html`, `v1.css` or `v1.js` change, plus `humanhash.mjs` for the entry path,
and blocks the turn if the handoff moved. It also bumps the cache token.

```bash
node lab/herolock.mjs            # check
node lab/herolock.mjs --record   # re-record, see the warning below
TPS_TARGET=v1-ruined.html node lab/herolock.mjs   # point it elsewhere
```

**Never re-record the lock to make a failure go away.** If it fails, the handoff
moved and the change is wrong. Re-record only after TJ has accepted a deliberate
change to the handoff itself.

**Why this exists.** TJ reported the hero as broken four separate times. Three
of those I could not reproduce and wrongly implied were environmental; the real
causes were a URL anchor moving the window before the pins were measured, and
then a smooth scroll I introduced while fixing it. The guard exists because my
judgement about what to test was the weak link, not because the code is fragile.

---

## 10. Open items

- **The day leftovers**, section 1. Machinery and four lines of copy.
- **All testimonial content is placeholder.** Quotes, names, and avatars still
  served from `cdn.21st.dev`. None of it can go public.
- **All menu links are placeholder** until the client settles a sitemap.
- **The programmes pricing line is a placeholder.**
- **The page ends on its worst edge.** The dissolve runs straight into the close,
  measured at a hard step of 38 out of 255 in four frames out of four. The act
  that used to sit between them was moved. TJ knows and has deferred it.
- **The small grey line under each testimonial name** measures 2.06 to 1 against
  the darkest parts of the field where body text needs 4.5. It is the imported
  neutral grey, not a brand colour.
- **The testimonial quote is set in Montserrat** where the Brand Pack assigns
  Karla to reading copy.
- **Page length is 17.94 viewport heights** against the 8 to 14 the scroll-craft
  skill recommends.
- **The build has no signature move.** The day clock rail was it, and both
  `BRIEF.md` and the fingerprint log record the slot as empty.
- **The WebGL field draws across about eleven viewport heights**, most of them
  behind opaque sections where it cannot be seen. Splitting it into two visits
  is roughly twenty lines and would stop it costing battery for nothing.
- **A remote branch `feat/new-design` and several others exist** and have not
  been reviewed.
