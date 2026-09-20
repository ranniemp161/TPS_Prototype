# The Postpartum Suite prototype: read this first

Rewritten 2026-09-16. Everything in it was checked against the files that day.

**This file holds only what a machine cannot work out.** Positions, heights,
section names, page length, git state and the hero lock all live in `STATE.md`,
which is generated. Never trust a number typed into this file, and never type
one in.

```bash
export PATH="/c/Program Files/nodejs:$PATH"
node lab/state.mjs > STATE.md
```

The previous version of this file was 421 lines and was wrong about the number
of sections, the name of one that does not exist, every act position, the page
length, the ScrollTrigger count, the git state, whether the stylesheet carries a
cache token, and whether the WebGL background still exists. That is why the
volatile half is now generated.

---

## 1. What this is

A scroll driven homepage for **The Postpartum Suite**, a London business
providing live in postpartum care. A trained specialist stays in the client's
home, from five days to thirty, rooted in Malaysian confinement tradition.
Founder is Amidat Olowu.

**Who you work for.** TJ gives direction. He is not the client, he is building
this for the client. He reviews by eye against real references, chiefly
`white-desert.com`, and he reads them accurately. Twice he was right about their
treatment when an argument from our own stylesheet said otherwise. When he says
something looks wrong, measure it rather than explain why it is fine.

**There is no day timeline.** The build was originally a "chaptered day", one
house photographed hour by hour. TJ abandoned it on 2026-09-05. The machinery
was finally deleted on 2026-09-16, so the code no longer argues otherwise.

Still waiting on TJ's words, not on a decision you can make: "Three in the
afternoon." and "Seven in the evening." in the dissolve, which are that act's
entire content, plus "She takes the morning." and "And in the morning, she is
still here." Not a leftover: "dedicated live in care from morning to evening" is
TJ's own copy describing a working day.

---

## 2. Files

| File | What it is |
|---|---|
| `v1.html` / `v1.css` / `v1.js` | **Production.** The live direction |
| `STATE.md` | Generated. The current facts. Do not edit |
| `v1-ruined.*` | A real working version, not damaged goods. See below |
| `programme.html` / `programme.css` / `programme.js` | **The programme builder.** A second page, linked from the programmes act and the nav. It loads `v1.css` first for the tokens, the type, the buttons and the nav, then adds its own. Not driven by `v1.js` |
| `programme-pricing.js` | The builder's arithmetic, loaded by the page and required by the suite. See below |
| `lab/programme-check.mjs` | The builder's arithmetic. Run it after touching any rate |
| `lab/programme-panel.mjs` | The builder's summary panel, driven in a real browser at five window sizes |
| `lab/programme-budget.mjs` | The budget field's recommendation, and the panel scrollbar |
| `lab/programme-strip.mjs` | The day strip at seven widths. One line on a laptop, weeks on a phone |
| `lab/programme-shot.mjs` | Full page shot of the builder with every scroll entrance triggered first |
| `index.html` | An earlier direction, kept for reference |
| `lab/` | About sixty measurement tools. The real leverage here |
| `lab/baseline/v1.*` | A control copy for the comparison tools. Not for editing |
| `lab/revert/` | The pre 2026-09-05 bath handoff, kept in case it is wanted |

**The builder prices from one file.** `programme-pricing.js` loads as a classic
script in the browser and as a CommonJS module in node, so the page and the
acceptance suite cannot disagree. Its `RESERVATION` table is a solved plug and
not a rate: it is whatever remains once every other line is priced, so that a
complete programme lands exactly on the published price. Change any unit rate,
treatment count or standard rhythm and all four published prices drift silently.
`lab/programme-check.mjs` re-solves the reservation, replays the twenty scenarios
from the client's spec, and sweeps every reachable combination for the nine
invariants. It needs nothing running. The other two drive the real page, so
serve it first:

```bash
export PATH="/c/Program Files/nodejs:$PATH"
node lab/programme-check.mjs

npx -y http-server -p 4321 -c-1 &
node lab/programme-panel.mjs
node lab/programme-budget.mjs
node lab/programme-strip.mjs
```

**The panel suite holds one rule that has broken twice:** a fee is on screen,
somewhere, at every control, at every window size. The panel carries it while
the panel is in view and the fixed bar carries it when the panel is not, never
both and never neither. It broke once when the panel was sticky inside only one
of three sections, and again when the fee sat in a 368px foot that fell below
the fold on a 1280 by 720 laptop.

**Two placeholders in the builder need real work before this ships.** Herbal
foot treatment and hair serum therapy have no photograph in `assets/img` and
carry the generic treatment frame in step 06. And the eight one line treatment
descriptions on that step are placeholder copy written to the brand voice, kept
deliberately to what happens rather than what it achieves, because the page
should not make a clinical claim the business has not written itself. They need
Amidat's approval.

**`v1-ruined` is not damaged.** On 2026-09-05 TJ believed v1 was broken and
asked for it to be set aside under that name. It was not broken; Chrome was
serving a cached stylesheet. The name stuck. It still holds work that has not
been moved across, and it opens on its own.

No build step. `v1.html` opens directly. Node is installed but not on PATH.

---

## 3. Sections, and how to talk about one

Each section carries `data-section`, a permanent name for what it holds. **That
name is the identity.** Use it in locks, commits and notes. Position numbers
shift the moment a section is inserted, so they are for conversation only and
must never be written down.

The `act--x` class names are historical and several are now misleading:
`act--turn` holds the confinement explainer, `act--peak` holds the dissolve.
They stay as styling hooks. Do not reason from them.

**The dev panel.** Open `v1.html?dev` and a small dot appears in the bottom left.
Click it and it lists every section in order, highlights whichever one is
filling the frame as you scroll, and copies a name when you click it. Escape
closes it, and it remembers whether it was open.

It reads the sections out of the page each time it opens, so adding, renaming or
reordering a section needs no edit to the panel. It lives in `lab/devpanel.js`,
inside a shadow root, loaded only when the URL carries `?dev`, so it cannot
reach a visitor. Verified adding zero pixels to the document with
`lab/panelcheck.mjs`, which matters because a block that merely existed has
previously disturbed the hero pin measurement.

---

## 4. Rules

Tagged by who said it. **Only the [TJ] lines are law.** Earlier versions of this
file presented all three as his, which is how a single local decision became a
constraint that blocked correct work elsewhere.

**[TJ]**

- **The hero into the bath is a fade, and it is settled.** Do not change it. A
  hard edge there is wrong. This is specific to that handoff.
- **Visible transitions between other sections are fine, and often wanted.** The
  question is only whether a given one is executed well. Judge case by case, and
  ask rather than assuming. Do not generalise the hero rule into a global ban.
- **No dead scroll.** No stretch where you turn the wheel and nothing on screen
  changes. One authored exception, a short beat at the end of the bath.
- **Do not touch the hero, or the scroll between hero and bath**, unless he asks
  in those words.
- **Once a section is finished, it stays finished** until he returns to it
  deliberately. Work elsewhere must not disturb it.
- **Questions are not build orders.** He asks a lot of questions that look like
  instructions. Answer them and stop. Wait for "go".
- **Never commit or push without asking.** Both are explicit every time.
- **No em dashes or hyphens in written output.** Global, including documents and
  commit messages. Commas, periods, or restructure.

**[Brand Pack]**, from `TPS Brand Pack.html`, the governing brand document

Five confirmed type roles: Instrument Serif for headlines, set in capitals on
this page; Montserrat 300 to 600 for labels and interface; Karla for anything
anyone actually reads; Quentin for one large accent line; IBM Plex Mono for
figures and badges. No shadows anywhere, depth is hairlines, edges and overlap.
No dark sections, though a dark photograph is allowed. Radius: `--r-badge` 6px,
`--r-button` 8px, `--r-card` 10px, `--r-media` 16px.

`TPS Design/TPS-DESIGN.md` contradicts this and is stale. The prototype follows
the Brand Pack. Root source is `TPS Brand Fonts.pdf`.

**[scroll-craft skill]**, installed at `~/.claude/skills/`

Worth consulting, and has repeatedly found real things. Bans em dashes in
visible copy, "01 / 06" counters, an eyebrow above every heading, centred copy
in every act, and the same device family twice running. The build knowingly
breaks two: the testimonial block carries a counter and uses an em dash between
name and role.

**[inferred, unconfirmed]**

"Never fade the hero to reveal something." Recorded as TJ's law by an earlier
session. Asked on 2026-09-16, he did not recognise it as his. Treat as a
suggestion until he confirms it.

---

## 5. Decisions that still bind

**The hero to bath handoff.** One photograph, `assets/img/bath-steam.webp`,
carries steam and bath together with a real alpha channel: transparent for its
top 15%, feathering in to 60% down, opaque below. It replaced a fog plate plus
two CSS gradient masks, and every band the page ever showed came from those
gradients. Set to window width, bottom resting on the section bottom, surplus
steam overflowing above and clipped, travelling exactly its own height.

The arithmetic: bath height equals `(window width / asset width) x asset height
x 0.4`. Cropping the asset's **top** changes nothing. Only cropping its **width**
makes the bath taller.

**Nav chips are `rgba(140,127,121,.04)` with no border**, `.46` on the dark
frame via `.nav.is-dark`. TJ chose 0.04 off a rendered ladder from 0.46 down to
zero. On a photograph the backdrop blur does the defining; on pale grounds the
chip is nearly invisible on purpose. **Do not raise it to fix that.** Measured
cost: worst chip label contrast is 1.45 to 1. Why a mid tone and not white:
alpha compositing pulls the ground toward the overlay, so a mid tone sits below
a light ground and above a dark one and adapts by itself. White cannot, because
the grounds sit near 232 of 255.

**The nav is one chip.** A single Menu chip at every width since 2026-09-07,
opening one drop down three columns wide, two at tablet, one on a phone. Capped
to the window below the bar and scrolls inside itself; uncapped it ran 428px
past the fold with seven links unreachable.

**The testimonial block uses no GSAP and registers no ScrollTrigger.** Its
entrance runs on an IntersectionObserver and it never transforms its own
section, because the hero pin measures the whole document when it builds and an
earlier version of this block disturbed that measurement. It is a `div.voices`
nested inside the confinement section, not a section of its own.

**The confinement heading is centred** at `display--lg`, the one centred heading
on a left lead page, as the anchor variation rather than a breach. Top padding
has a floor of 104px, not a proportion: at 10vh a 670px window gave 67px under
an 80px bar and the heading sat behind it.

**The WebGL mesh drift field was removed on 2026-09-07** and a CSS aurora took
over the act it served. Any instruction you find about Warm Paper, Blush Drift
or shader uniforms is describing code that is gone.

---

## 6. Traps that have already cost time

**The fixed nav poisons contrast samples.** It paints over anything scrolled
under it, so a raw bounding box reports the Enquire button as the ground. This
gave 3.53 where the truth was 13.4, three times identically. Exclude any sample
whose box reaches above the nav, and use a percentile, not a mean, or one
antialiased pixel decides the answer.

**Chrome caches `file://` subresources.** New markup plus a stale stylesheet
renders as a catastrophically broken page and cost most of a day. There is **no**
cache token on the CSS or JS despite what earlier notes claimed, so hard reload
before believing a page is broken.

**ScrollTrigger must be refreshed at scroll position zero.** Refreshing deep in
the document gives pins a start measured from the wrong origin; the hero pin came
back with a start of minus 6811 instead of 0. ScrollTrigger also refreshes on
window load, later than `boot()` which runs on `document.fonts.ready`. **The fix
lives in `v1-ruined.js` and is not in `v1.js`.** TJ chose not to bring it across.
It matters the moment anyone opens a URL ending in `#programmes`.

**Google Drive writes `desktop.ini` into `.git`**, and git reads the ones in
`refs/` as branch names: `fatal: bad object refs/desktop.ini`. Clear first:

```bash
find .git -name "desktop.ini" -type f -delete
```

**Two progress scales in the dissolve.** `navTheme()` spans the whole act while
the pinned dissolve is a shorter part of it. A position measured on the dissolve
must be multiplied by `DISSOLVE_SPAN` before comparing against `self.progress`.

**Flex items ignore aspect ratio without `min-height: 0`.** One portrait source
in the care rail grew to 1083px and dragged every other card with it.

**`clip-path` masks shear descenders** on type set tight. No static audit catches
it, only a rendered screenshot. `standfirst.mjs` checks for it.

**Line splitting must re-measure after fonts load** and on width change, because
line boxes move when the face swaps in. Ignore height changes: that is an address
bar, not a reflow, and rebuilding on it replays the animation.

---

## 7. The hero guard

`lab/herolock.mjs` records the hero to bath geometry at three viewport sizes,
every 0.1 of a viewport height, down and back up, and re-checks at a 2 pixel
tolerance. Every value is read only once the frame has stopped changing, which
is what allows a tolerance that tight. A Stop hook at
`~/.claude/hooks/tps-hero-guard.sh` runs it whenever `v1.html`, `v1.css` or
`v1.js` change and blocks the turn if the handoff moved.

```bash
node lab/herolock.mjs            # check
node lab/herolock.mjs --record   # re-record. See the warning
```

**Never re-record to make a failure go away.** If it fails, the handoff moved and
the change is wrong. Re-record only after TJ has accepted a deliberate change to
the handoff itself.

**Run it before you start**, so a failure afterwards is provably yours.

**Why it exists.** TJ reported the hero as broken four times. Three I could not
reproduce and wrongly implied were environmental; the real causes were a URL
anchor moving the window before pins were measured, then a smooth scroll I
introduced while fixing that. The guard exists because my judgement about what
to test was the weak link.

---

## 8. Working method

Measure, then decide. Screenshot it, put a number on it, then report. Several
failures here came from reasoning about pixels instead of looking at them.

Two habits worth copying from the existing tools: establish a noise floor before
calling a difference a difference, by running a control against itself; and
settle scrubbed values by reading until two consecutive samples agree rather
than guessing a delay.

`shoot-handoff.mjs --freeze` kills CSS animation, which is what makes before and
after comparison possible: frozen, two runs are byte identical, so any later
difference is provably the edit. Diff by bounding box, not equality, so a change
can be located rather than merely detected.

---

## 9. Open items

- **All testimonial content is placeholder.** Quotes, names and avatars still
  served from `cdn.21st.dev`. None of it can go public.
- **All menu links are placeholder** until the client settles a sitemap.
- **The programmes pricing line is a placeholder.**
- **The `<title>` and `og:title` contain an em dash**, against TJ's global rule.
- **The page ends on its worst edge.** The dissolve runs into the close at a hard
  step of 38 of 255 in four frames of four. TJ knows and has deferred it.
- **The grey line under each testimonial name** measures 2.06 to 1 where body
  text needs 4.5. Imported neutral grey, not a brand colour.
- **The testimonial quote is Montserrat** where the Brand Pack assigns Karla.
- **`rest` needs a better name.** It is a leftover of the day framing.
- **The build has no signature move.** The day clock rail was it.
- **Section locking is designed but not built.** See below.
- **A remote branch `feat/new-design` and others** have not been reviewed.

**Section locking**, agreed 2026-09-16 and not yet built: generalise the hero
guard so any finished section can be locked by name, and the Stop hook checks
all of them. That is the mechanical form of TJ's rule that finished work stays
finished. Until it exists, that rule is enforced only by whoever is reading this.
