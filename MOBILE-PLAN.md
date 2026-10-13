# What We Do, phone plan (9 Oct 2026)

A plan for fixing the phone experience of `index/what-we-do.html`, one item per chat. Written by Claude (Fable 5.1) from a full walk of the page at 390 wide, approved by TJ to build. TJ has not reviewed every detail and will correct after seeing the result, so every item must be easy to revert on its own.

Read this whole file before starting an item. Then do only the item you were given.

**Status, 9 Oct 2026:** all seven items built by Opus 5.5 in one session at TJ's request, each recorded in DESIGN.md as "Phone plan item N". The page went from 28.9 to 19.7 screens at 390x844, with no horizontal overflow and no console errors; the desktop guard (lab/desktop-diff.mjs and lab/desktop-compare.py) showed no desktop change apart from the removed "One person" label. Uncommitted, awaiting TJ's review. TJ's corrections go into DESIGN.md.

## Rules for every item

These are TJ's rules unless marked otherwise.

1. **Do not touch the desktop version.** Every change lives inside the `@media (max-width: 860px)` block of a stylesheet, or inside the phone branch of a script (the `mm.add('(max-width: 860px)', ...)` block, or the `phone` flag). If a change cannot be made that way, stop and say so.
2. **Every visible word is the client's copy.** Do not add, reword or invent any label, heading or line. Removing an invented label is fine; adding one is not.
3. **No em dashes or hyphens** in copy, titles, alt text or notes. Titles end without a full stop.
4. **Verify by looking.** Before the change, screenshot the section at 390x844 and at 1440x900. After, screenshot both again. The 1440 screenshots must be identical. Use `node lab/opening-shots.mjs <dir>`, `node lab/hands-shots.mjs <dir>`, `node lab/mobile-walk.mjs <dir>` (whole page at 390, one shot per 0.85 screen) and `node lab/mobile-probe.mjs <dir>` (close ups and font measurements). Open every screenshot and look at it; do not describe pixels you have not seen.
5. **Back up before editing:** copy each file you will change to `lab/<name>.before-<item>.<ext>.bak`.
6. **Record the result** as a dated section at the end of `DESIGN.md`: `## <What> (TJ, <date>)`, with what changed, the measurements, and the backup names.
7. **No spending.** No image or video generation is needed for any item here.
8. **Commit only if TJ asks.** Leave changes uncommitted and report.
9. Locked sections (header, footer) are not part of this plan. Leave them.

## How to revert

Three ways, from smallest to largest.

- **One file:** copy it back from `lab/snapshot-2026-10-09-before-mobile-plan/` (a full copy of `index/` as it was when this plan was written: pages, css, js, partials).
- **One section:** the file list per item below says which files it touches. Restore those from the snapshot.
- **Everything:** `git checkout before-mobile-plan -- index/` restores the whole site folder to the tagged commit. The tag `before-mobile-plan` marks the commit made when this plan was written.

The snapshot includes one interim change that this plan replaces: the phone block at the end of `index/css/what-we-do-opening.css` (the comment "Phones, centred") that puts the four kinds on one line at about 10px. Item 3 replaces it.

## Where the page stood (390x844, 9 Oct 2026)

- 24374px tall, 28.9 screens. Sections: Hero 3.4 screens, Introduction 0.6, Specialist 1.9, Four Kinds of Care 4.1, Housekeeping Zones 1.2, Tailored 1.8, Day and Night 6.5, A Day With Us 9, Footer 0.9.
- No horizontal overflow, no console errors.
- Tap targets: accordion rows 42 to 44px, zone tabs 44px, Tailored "Read more" 34px.
- Text under 13px: hero kinds 9.8px, Day and Night sunset labels 8px, specialist checks 11.2px, Tailored "Days" 10.6px and figure labels 11.8px, zone tabs 11.5px, A Day With Us times 12.8px, "One person" label 11.5px.
- Target after the plan: about 18 screens, nothing of the client's copy removed.

## The items, in order

### Item 1. Housekeeping Zones: the words never appear (bug)

**Model:** Sonnet 5.5.
**Files:** `index/js/what-we-do-zones.js`, `index/css/house-flight.css` (phone rules from line 794 on), `index/what-we-do.html` lines 558 to 610.

What happens: on phones the section shows the title and the house drawing, then a blank screen. The room tabs (Living room, Kitchen, Nursery) and the three paragraphs are at page y 8589 to 8907 but invisible. Cause: `.zones__line` and `.zones__title` get `opacity: 0; visibility: hidden` under `.zones--tap` (house-flight.css about line 821) and only get `.is-in` when the intro video has played past one second (`what-we-do-zones.js` lines 122, 123 and 143, inside `startIntro`, triggered by an IntersectionObserver at line 175). If the video does not autoplay (Low Power Mode, data saver, slow connection, headless browsers) the words never show.

Fix: on phones, add `.is-in` to the title and the line when the section arrives (the same IntersectionObserver, or a short timer from arrival), whether or not the video plays. The video stays as a bonus if it plays. Also raise the tab text (`.zones__tab`, 11.5px) to 13px.

Optional, only if TJ agrees later: replace the three tabs with the same accordion rows the Four Kinds use. Not part of this item.

Check: at 390 the title, tabs and the living room paragraph are visible within one second of the section arriving, with the video blocked (set `video.autoplay` off or throttle in DevTools). Desktop unchanged.

### Item 2. Labels, text floor and tap sizes

**Model:** Haiku 5.5.
**Files:** `index/what-we-do.html`, `index/css/what-we-do.css` (`.wlabel`, lines 26 to 31 and 117), `index/css/what-we-do-specialist.css` (`.spec__checks`, lines 33 to 61), `index/css/what-we-do-tailored.css` (`.ty__unit` line 126 and 242, the figure labels inside the phone block from line 221), `index/css/what-we-do-timeline.css` (`.vt__body time` line 113), `index/css/what-we-do-day-night.css` and `index/js/what-we-do-promise.js` (the sunset labels Morning, Afternoon, Evening, Night; grep "Morning" to find where they are built and styled).

- Remove the `<p class="wlabel">One person</p>` (html line 184). Also delete the other five `.wlabel` lines (457, 477, 512, 537, 906); they sit in hidden retired sections but must not come back. Then remove the `.wlabel` rules from what-we-do.css. TJ: the small label with a coral dash is an invented eyebrow and a recognisable AI pattern.
- Phone text floor of 13px (my recommendation, TJ agreed): specialist checks 11.2 to 13px, Tailored "Days" 10.6 to 13px and figure labels 11.8 to 13px, zone tabs 11.5 to 13px (if not done in item 1), A Day With Us times 12.8 to 13.6px (the desktop value, .85rem), sunset labels 8 to 13px. Only inside the phone media query.
- Specialist checks: on phones set the six items in two columns (they are short phrases; two columns at 390 wide halves the 300px height).
- Tailored "Read more" button: 44px tall on phones (it is 34px).

Check: `node lab/mobile-walk.mjs` reports no text under 13px except the header tabs (locked). Desktop unchanged.

### Item 3. Hero rebuild on phones

**Model:** Opus 5.5.
**Files:** `index/css/what-we-do-opening.css` (phone block from line 134, and the interim block from line 163 which this item replaces), `index/js/what-we-do-opening.js` (phone branch from line 263; FOCUS at line 98), `index/what-we-do.html` lines 137 to 170.

TJ's brief:
- The statement is centred: "What we do", the two headline lines, the rows.
- The four kinds on two lines: "Home Support" and "Fresh Meals" on the first, "Baby Care" and "Restorative Treatments" on the second, centred, with the desktop's fine coral dash between the two on each line (the `::before` rule on `span + span`, the dash removed from the third span).
- Text larger. The rows and kinds go from 16px to about 18 or 19px. The headline stays as it is ("LIVE IN POSTPARTUM CARE" already spans 27px to 363px at 390 wide; larger would clip). "What we do" may grow a little.
- The photograph fills from under the text to the bottom of the first screen. The frame's top is the copy's bottom plus a gap; its height is whatever is left to the bottom edge minus 16px, using the small viewport height (`100svh`) so the browser bar never hides it. The image covers the frame (object-fit cover), centred on the hands. Floor of 160px frame height; below that the text steps down a size rather than the photo shrinking further.
- On scroll (one scrub): the frame grows to full screen; the copy fades up and out; "Who is it for?" fades in over the photo, cream on the scrim, as the only thing on screen; then the section releases into the introduction paragraphs. Use the introduction's existing `.op__who` heading as the one that lands on the photo, so the question is not shown twice. Drop the travelling cream copy (`.op__copy--light` on phones) and the dark flash (`dim`, lines 284 and 285), which existed to cover the text changing colour.
- Pin length from 1.8 screens (line 290) to about 1.2.

Not TJ's, mine: keep the question's arrival inside the same scrub as the photo's growth, so there is no empty beat.

Check: at 390 and at 360 and 430, the photo reaches the bottom of the first screen; the kinds are on two lines at 18px or more; the question appears alone over the full screen photo; the introduction paragraphs follow once. Desktop screenshots identical.

### Item 4. A Day With Us: unpin on phones

**Model:** Opus 5.5.
**Files:** `index/css/what-we-do-timeline.css` (phone block from line 124; `.vt.is-live { height: 900vh }` at line 126), `index/js/what-we-do-timeline.js` (the `phone` flag at line 87 and every branch on it), `index/what-we-do.html` lines 825 to 900.

On phones the pinned, sliding track makes 11 hours into nine screens. Change: on phones do not pin. Let the section flow as a normal page. Keep the arrival photograph closing into its slot above the card as a short scrub while it is in view (it works without a pin). Then the hours sit in the page in flow, and the axis line draws down beside them as they enter (a scroll linked ScrollTrigger on the section, no pin), with the dots and stems appearing as the tip of the line reaches each one, and the words rising as now. Same words, same line, same circle at the tip. Desktop keeps the held stage exactly as it is.

Expected height: about four screens.

Check: at 390 the whole section scrolls like a page; every hour's words appear by the time it is in the middle of the screen; nothing is pinned; the line's tip never runs ahead of the words. Desktop identical.

### Item 5. Day and Night: a shorter pin on phones

**Model:** Sonnet 5.5.
**Files:** `index/js/what-we-do-promise.js` (`PEAK_PIN_VH` line 14, `DN_BEAT_VH` line 18, the TOTAL and fractions at lines 210 to 220, and any phone branches), `index/css/what-we-do-day-night.css`.

The sun as the clock stays; it is the one pin on the page that tells its story in one screen. But the pin is 6.5 screens on a phone, and three consecutive screenshots show the same night frame. On phones only: cut the total to about 3 screens by shortening the night hold and the beat before the glass, keeping the order of beats (title glides, sun falls, cream change, night falls, note lifts in, glass cards). The desktop constants stay; use the existing phone detection or add a phone set of the constants.

Check: at 390 the full journey takes about 3 screens of scrolling; every beat still happens in order; the glass cards still read in full with their "Read more". Desktop identical.

### Item 6. Tailored For You: figures, hold, label

**Model:** Sonnet 5.5.
**Files:** `index/js/what-we-do-tailored.js` (phone branch `flow()` from line 251; `HOLD`, `toStart` at line 189), `index/js/what-we-do.js` (the ledger that counts the figures), `index/css/what-we-do-tailored.css` (phone block from line 221).

- The figures read "In 0 days ... 0 Freshly Cooked Meals" when they first come into view, because they only count as the line draws below them. On phones start them at the first stop (5 days: 15, 5, 5) so they never show zero, and count up from there as the line reaches 7, 14 and 30.
- After the 30 stop there is nearly a full screen of empty ground holding the circle for the sun handoff. Cut that hold to about a third of a screen on phones.
- "Days" and the figure labels to 13px if item 2 has not done it.

Check: at 390 the first figures the user sees are 15, 5 and 5 with "In 5 days"; the empty ground after 30 is about a third of a screen; the circle still drops into the Day and Night sun. Desktop identical.

### Item 7. Specialist and Four Kinds tidy

**Model:** Haiku 5.5.
**Files:** `index/css/what-we-do-specialist.css`, `index/css/what-we-do-hands.css` (lines 48 and 90, the 4:3 phone frames), `index/css/what-we-do.css`.

- About 70px of empty canvas sits between the end of the specialist checks and the start of the Four Kinds. Remove it (check the section paddings in the phone rules).
- Four Kinds on phones: the per kind picture is 4:3; make it 16:10 to save about 60px per kind, keeping `object-position` on the hands. Only if the hands and the object stay fully in frame on all four; if any crops badly, leave 4:3 and say so.

Check: screenshots of all four kinds at 390 show the hands and the object whole. Desktop identical.

## Open question for TJ (not an item)

DESIGN.md says IBM Plex Mono is for badges and section numbers only, never prices or dates. The glass cards use it for "7am to 7pm" and "12pm to 6pm, then 12am to 6am", and A Day With Us uses it for every hour. Times are close to dates. My suggestion is Montserrat small spaced capitals for them, but it is TJ's rule and his call. Do nothing until he decides.

## Which model for which item (my recommendation)

- **Opus 5.5** for items 3 and 4. Both rewrite motion across a script and a stylesheet, with judgement calls about timing and what to keep. They are the two items most likely to need a second look.
- **Sonnet 5.5** for items 1, 5 and 6. Each is bounded, has a clear cause and a measurable check, and touches one script plus one stylesheet.
- **Haiku 5.5** for items 2 and 7. Mechanical CSS and markup changes with exact line references and a numeric check.

Run one item per chat. Open each with "TPS dev skill", then "read MOBILE-PLAN.md and do item N". Do items 1 and 2 first; they are quick and make the later screenshots cleaner. Item 3 before item 4, so the long one is checked on a page whose top already behaves.

After each item, TJ looks at the phone and corrects. Corrections go into the item's DESIGN.md note, not into this file, unless TJ changes the plan itself.
