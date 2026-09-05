# The Postpartum Suite prototype: read this first

You are picking up a build in progress. This file exists so a fresh session
can carry on without the conversation that produced it. Read it before
touching anything.

---

## 1. What this is

A scroll driven homepage prototype for **The Postpartum Suite**, a London
business providing live in postpartum care. A trained specialist stays in the
client's home, from five days to thirty, rooted in Malaysian confinement
tradition. The founder is Amidat Olowu.

The page is a **chaptered day**: one house, photographed at different hours,
told as a sequence from morning to night. That framing governs everything.

**Who you are working for.** TJ is the one giving direction. He is not the
client, he is building this for the client. He is highly specific and reviews
by eye against real references, chiefly `white-desert.com`. When he says
something looks wrong, it is wrong; measure it rather than explain why it is
fine.

---

## 2. The repository

```
https://github.com/subishop/TPS_Prototype     branch: main     PUBLIC
```

The working copy is at:

```
G:\My Drive\Rannie and Tj's Projects\The Post Partum Suit\postpartum-prototype
```

There is at least one other collaborator pushing to this repo, via feature
branches and pull requests. **Always fetch before you start and before you
push.** Merge their work, never rebase over it, and never force push.

```bash
git fetch origin
git rev-list --left-right --count origin/main...main    # theirs / ours
git merge --no-ff origin/main
```

Credentials are already stored in Windows Credential Manager for the user
`subishop`. Git needs the helper named explicitly in this environment:

```bash
git -c credential.helper=manager push origin main
```

**Do not push without asking TJ.** He asks for pushes explicitly.

---

## 3. Running and verifying

No build step. `v1.html` opens directly in a browser.

Node is installed but **not on PATH by default**:

```bash
export PATH="/c/Program Files/nodejs:$PATH"
```

`playwright-core` is in `node_modules`. Chrome is used via `executablePath`.

Everything in `lab/` is a measurement tool. Their output defaults to the
system temp folder, never the project, because the project lives in a synced
Drive folder.

| tool | what it answers |
|---|---|
| `audit.mjs` | where every act actually sits, plus a 61 frame walk of the page |
| `deadscroll.py` | reads that walk, reports the share of pixels that moved per step |
| `edges.py` | finds visible bands by isolating rows that are flat field |
| `shoot-handoff.mjs` | dense frame capture across a scroll range, `--freeze` for comparison |
| `contrast.mjs` + `contrast.py` | worst contrast each line meets against the ground it lands on |
| `probe.mjs`, `bisect.mjs`, `zoom.py` | which element owns an edge, layer isolation, contrast stretch |

**The working method on this project is measure, then decide.** Two early
attempts failed because they reasoned about pixels instead of looking at
them. Screenshot it, put a number on it, then report.

---

## 4. The page

Nine acts in document order:

```
hero  bath  rest  treatment  pan  peak  night  gallery  programmes
```

About 16.3 viewport heights at 1600 by 900. GSAP and ScrollTrigger from a CDN.
`v1.html`, `v1.css`, `v1.js`. `index.html` is an earlier direction, kept for
reference, sharing the same assets.

---

## 5. Rules that govern every decision

**TJ's, stated repeatedly and non negotiable:**

- **No visible transitional edge, anywhere, at any scroll position.** This is
  the governing rule of the whole build. Every band the page ever showed came
  from a CSS gradient, because a gradient changes slope somewhere and the eye
  finds that somewhere as a line. Prefer real photographic feathering.
- **No dead scroll.** No stretch where the wheel turns and the picture does
  not change. There is one authored exception, a short beat at the end of the
  bath, documented below.
- **Never fade the hero to reveal something.** Arrival by movement, not by
  opacity.
- **No em dashes or hyphens in written output.** This is a global rule for
  everything you write, including documents and commit messages. Commas,
  periods, or restructure.

**From the Brand Pack:**

- No shadows anywhere. Depth is hairlines, edges and overlap.
- No dark sections. The night photograph is dark; the page is not.
- Radius scale is fixed. `--r-badge` 6px, `--r-button` 8px, `--r-card` 10px,
  `--r-media` 16px. TJ chose to keep nav chips on the brand radius even where
  the reference is squarer.

---

## 6. Decisions already made, and why

These cost many iterations. Do not silently revert them.

**The hero to bath handoff.** One photograph, `assets/img/bath-steam.webp`,
carries the steam and the bath together with a real alpha channel:
transparent for its top 15%, steam feathering in to 60% down, opaque bath
below. It replaced a separate fog plate over a separate bath photo plus two
CSS gradient masks. The image is set to the width of the window, rests its
bottom on the bottom of the section, and its surplus steam overflows above
and is clipped. It travels exactly its own height.

The arithmetic that governs it: the bath is the bottom 40% of the asset and
the on screen scale is set by the width, so bath height equals
`(window width / asset width) x asset height x 0.4`. Cropping the asset's
**top** changes nothing. Only cropping its **width** makes the bath taller.

The previous mechanic is kept whole in `lab/revert/` in case it is wanted.

**The nav.** The row belongs to the window, not the article column, with its
cap in the padding: `--nav-inset` 24px, `--nav-max` 2100px. Chips carry
`rgba(140,127,121,.04)` on light grounds and `.46` on the dark frame, with no
border at all.

0.04 is deliberate, chosen off a rendered ladder from 0.46 down to zero. On a
photograph the backdrop blur does the defining; on flat pale grounds the chip
is close to invisible on purpose. **Do not raise it to fix that.**

The mechanism worth understanding: alpha compositing pulls the ground toward
the overlay, so a **mid** tone lands below a light ground and above a dark one
and adapts by itself. A white fill cannot do this here, because the grounds
sit around 232 of 255 and even solid white only reaches 1.19 to 1.

Below 900px the three section tabs become one "Menu" chip and Enquire never
leaves.

**Instrument Serif is set in capitals** everywhere it appears, via
`text-transform` so the DOM keeps sentence case. Tracking is added and scaled
inversely to size, because capitals are drawn to sit further apart than
lowercase.

**The mesh drift field** under `rest` and `treatment` is one fixed WebGL
canvas, not a background painted into each act, because two painted
backgrounds meet at a join and that meeting is a line. It runs the Warm Paper
preset. Blush Drift was tried and failed on measurement: it met the coral band
below as warm pink against duller mauve, and it halved contrast.

**The day clock rail was removed** at TJ's request. It was registered as this
build's signature move in `BRIEF.md` and the fingerprint log, and both now
record that the slot is empty. No replacement has been chosen.

---

## 7. Traps that have already cost time

**Google Drive writes `desktop.ini` into `.git`.** Git reads the ones in
`refs/` as branch names and fails with `fatal: bad object refs/desktop.ini`.
There were 89 of them. Clear before any git operation:

```bash
find .git -name "desktop.ini" -type f -delete
```

They come back whenever Drive touches the folder. The durable fix is to move
the repo out of Drive now that a remote exists, which is TJ's call.

**Two progress scales in the peak act.** `navTheme()` spans the whole act,
4.2 viewport heights, while the pinned dissolve is only 3.2 of that. A
position measured on the dissolve must be multiplied by `DISSOLVE_SPAN`
before comparing against `self.progress`. Mixing them put the ink flip in the
wrong place once already.

**Flex items ignore aspect ratio without `min-height: 0`.** One portrait
source in the care rail grew to 1083px and dragged every other card with it
through `align-items: stretch`.

**Declared image dimensions were wrong on eight images**, three claiming
landscape for portrait files. That is what the browser uses to reserve space
before loading. If you add images, check the attributes against the files.

**Contrast measurement traps.** The fixed nav paints over text boxes that have
scrolled under it, so sampling a raw bounding box reports the "Enquire" button
as the ground. And a single antialiased pixel decides the answer unless the
metric uses a percentile.

---

## 8. Open items

- The hero lede repeats the new headline word for word. The fix is to drop its
  first sentence. TJ has been told and has not decided.
- The collaborator's `gallery` act loads placeholder imagery from a third
  party CDN, sports stock photography. Their markup labels it as placeholder,
  to be swapped.
- The build has no signature move since the clock was removed.
- The `pan` act now ties the `peak` act at about 4.2 viewport heights. The
  peak is meant to be the longest by a clear margin. It can be shortened by
  making the rail travel faster than the scroll rather than one pixel per
  pixel.
- Page length is 16.3 viewport heights, above the 8 to 14 the scroll-craft
  skill recommends.
- A remote branch `feat/new-design` exists and has not been reviewed.

---

## 9. Skills installed

`scroll-craft`, `design-dna` and `taste-skill` are installed at
`~/.claude/skills/`. `scroll-craft` is the one that shaped this build; its
fingerprint registry is at `scrollcraft/FINGERPRINTS.md` and the interview
answers are in `BRIEF.md`.
