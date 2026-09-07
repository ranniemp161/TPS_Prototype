# The Postpartum Suite — scroll narrative homepage

**Partially interviewed.** Answers 1, 2, 4, 5, 7 and 8 come from TJ directly in
session. Answers 3 and 6 are inferred from the TPS Brand Pack and marked below.
Confirm the inferred two before this goes past prototype.

---

## The eight answers

**1. Vibe, and references.**
TJ: "premium not generic", "for mother", "tell through imagery with little text
but explain everything through imagery". Reference given: pear.no, for the
scroll mechanic specifically ("as I scroll the scene changes, and it tells
story"). Brand Pack adds the non-web reference: letterpress and foil stamping.

**2. The scroll journey, in their words.**
TJ: "a sequence scene that tells a story of what the carer can do... Like want
every sections has story with it. before showing the pricing."

**3. The energy curve.** *(Inferred, not asked.)* Brand Pack governs: "Calm
before persuasive. Restraint reads as trustworthy; urgency reads as sales."
So the page is quiet throughout, and the peak is a change of light rather than
a change of volume. There is no loud act anywhere on this page.

**4. Feeling, stage by stage, and the one moment.** See the feeling curve below.
The one moment is the sofa holding still while the day goes dark around it.

**5. One thing no other site does.**
Make the *duration* of live-in care legible. Every competitor sells care as a
list of services. This page sells it as a day that someone else is present for,
end to end.

**6. Distance from premium-minimal.** *(Inferred, not asked.)* Editorial, hard
against premium-minimal. The Brand Pack forbids shadows and dark sections
outright, which rules out most of the range on its own.

**7. One unbroken world, or distinct scenes?**
Distinct scenes, one house. The photography is already a single location shot
at different times of day, so the page is chaptered by the clock rather than
flown through.

**8. Assets they already have.**
Everything. Full photography set, five-face type system, seventeen-tone palette,
six logo files, licensed script face. Nothing generated for this build.

---

## The feeling curve

| Act | Time | Feeling | What on screen causes it |
|---|---|---|---|
| 1 | 07:00 | Relief that it has begun | The room resolves out of blur as someone arrives in it |
| 2 | 09:30 | Permission to stop | A wipe up a full-bleed frame of you asleep |
| 3 | 11:00 | Being attended to | Three treatment stills cross-fading, the frame drifting closer |
| 4 | 13:00 | Quiet competence | Four kinds of care travelling sideways past you |
| 5 | 15:00 → 19:00 | **PEAK.** Continuity | The sofa does not move. The daylight leaves it |
| 6 | 22:00 | Safety | A slow wipe into the night frame, then nothing moves |
| 7 | — | Decision | The page stops telling a story and answers a question |

**The peak, as the sentence a visitor would say to a friend:**
"There's a bit where the room just gets dark around her and the carer is still
sitting there, and that's when you get what you're actually paying for."
Lives in act 5, which holds the largest span on the page by a clear margin.

**Authored silence:** act 6 holds still on purpose after the dissolve resolves.
That is the ending landing, not dead scroll.

**Tell-someone sentence:** It's the site where you watch a whole day pass in
someone else's house and realise you were never the one holding the baby.

---

## Grammar and gate

**Grammar: RETIRED 2026-09-05, none currently in its place.**

It was the chaptered day, chosen over seven other grammars because the asset
set is one location at several times of day, which is a cutlist rather than a
flight. TJ abandoned the idea: the site is no longer snapshots taken through
a day, and nothing in a future design should be argued for on the grounds
that it belongs to a particular hour.

**The code will contradict this.** v1 was pulled fresh from GitHub on
2026-09-06 and the retirement, which had only ever been local, came out with
it. So `v1.html` again carries a `data-time` on six acts and seven act
headers written as hours. All of it is inherited and invisible to a visitor.
TJ has asked that the page files be left alone, so it stays for now. Four
lines of visible copy are also leftovers of the day and are listed in
HANDOVER.md section 1, awaiting his words.

The acts the grammar produced are still in the file and several still sit in
the order it gave them, though the order has since changed twice. They are
inherited, not endorsed. A replacement structure should be argued from what
sells the service, not from a time of day.

**Fingerprint gate:** the registry at `scrollcraft/FINGERPRINTS.md` is empty,
this being the first build, so the gate passes with nothing to clear.

**Signature move: REMOVED 2026-09-05, none currently in its place.**

It was the day-clock rail: a hairline down the left edge carrying a time in
IBM Plex Mono that advanced continuously with scroll, 07:00 to 22:00, with a
tick travelling the rule. Bespoke, driven off scroll progress rather than a
kit device, and sanctioned by the brand's own component spec, which allows
mono numbering for "genuinely sequential content: a process, a timeline, the
stages of a programme."

TJ removed it on sight. The markup, styles, `dayClock()` and its verification
tool are gone; the acts keep `data-time`, which now only feeds the audit tool.

This leaves the build without a signature move, which is a standing gap
against the skill's own rule of one bespoke interaction per page. The
chaptered day that would once have supplied a replacement has since been
retired too, so a new signature move has to come from somewhere else
entirely. Not yet decided.

## The score

**This is the original score, kept as a record. It is superseded.** It was
written under the retired chaptered day, it predates the bath handoff rebuild,
the testimonial block, the confinement act and the single chip nav, and the
running order has changed twice since. The page now runs ten acts at about
17.9 viewport heights. HANDOVER.md section 5 has the current list, measured.
Read this table for the device reasoning only.

| Act | Beat | Device | Why this one |
|---|---|---|---|
| 1 | Arrival | `pin` + focus pull + kinetic | The room coming into focus is the reader arriving in the scene |
| 2 | Rest | `reveal` | A wipe is a change of state, and this beat is permission |
| 3 | Treatment | `parallax` + cross-fade | Drifting closer reads as attention being paid |
| 4 | Meals and home | `pan` | Lateral travel reads as breadth, which is what four pillars are |
| 5 | The dissolve | `pin` + cross-dissolve | The frame must not move, or the point is lost |
| 6 | Night | `reveal` | One last state change, then stillness |
| 7 | Programmes | `flow` + in | The story is over. This is the answer to a question |

Five device families. No family twice in a row. No scrub acts, because there is
no footage and none was generated. Total span ~12 viewport-heights, outside the
13.6–13.8 band.

---

## Brand hard rules this build obeys

From `TPS Brand Pack.html`, non-negotiable:

- No shadows anywhere. Depth is hairlines, edges and overlap only.
- No dark section. The night *photograph* is dark; the page ground never is.
- Buttons are soft rectangles at 8px, never pills.
- Hero is left-aligned, never centred.
- Text links carry no arrow glyph.
- Mother is the subject, baby is the context, in every frame.
- Radius scale: 6 badges, 8 buttons and inputs, 10 cards, 16 media.
- Content max 1080px, reading measure 62ch, section gap 96px desktop / 64 mobile.
- Canvas is `#F3EFEC`, not the older `#F6F6F6`. The Brand Pack resolves this
  explicitly and the programmes document has not caught up yet.

---

# Version 2

Rebuilt around the eight narrative frames the client supplied (`TPS images/`),
which cover a full day: arrival, handover, rest, treatment, bath, meal,
household, night.

**What changed from v1**

- **Brand latitude.** The client lifted every constraint except the palette and
  the type. So v2 uses dark grounds (`--umber`, mixed from the palette's own hue
  band rather than a neutral black), real shadow and lift on the tiles, film
  grades under type, and glass on the nav. All of these were forbidden in v1.
- **Navigation** moved to White Desert's centred arrangement: tab group left,
  lockup centre, tab group right. Transparent over the opening frame, solid
  once the page moves under it.
- **The sequence replaced the seven separate acts.** One pinned frame holds all
  eight scenes; scroll cross-dissolves them while a caption, a clock and a
  progress bar change beneath. That is much closer to the pear.no mechanic the
  client asked for than v1's chaptered acts were.
- v1 is preserved at `/v1.html` for comparison.

**Verified**

- 40 dense samples across the sequence: zero frames caught mid-dissolve, zero
  frames with no caption lit.
- Four widths (1600, 1180, 834, 390): no horizontal overflow, no clipped text,
  no console errors.
- scroll-craft harness: **no dead scroll detected**.
- Reduced motion: the pin and the dissolves are dropped and the eight scenes
  become a plain stacked sequence, all beats readable.
- Not verified: a real phone.
