# The Postpartum Suite: design system

The baseline every new or rebuilt page inherits. Written 5 October 2026 for the
award-site pipeline, extracted from `v1.css`, `care.css`, `HANDOVER.md` and the
Brand Pack. It describes what exists; it does not change anything.

**Order of authority:** `TPS Brand Pack.html` and `TPS Brand Fonts.pdf` (project
root) beat this file. This file beats Aura, 21st.dev and every reference site.
`TPS Design/TPS-DESIGN.md` is stale and is not a source.

Tags: **[TJ]** said by TJ, **[Brand Pack]** from the brand documents,
**[build]** how the live CSS does it today.

---

## 1. Colour [build, from `v1.css :root`]

| Role | Token | Value |
|---|---|---|
| Page ground | `--canvas` | `#F3EFEC` |
| Paper | `--paper` | `#FFFFFF` |
| Blush | `--blush` | `#E2CAC6` |
| Rose mist | `--rose-mist` | `#D7C2C9` |
| Ink | `--ink` | `#0A0A0A` |
| Ink soft | `--ink-soft` | `#2C2C2C` |
| Ink mute | `--ink-mute` | `#5A524F` |
| Coral mid | `--coral-mid` | `#C86D58` |
| Coral deep | `--coral-deep` | `#B95A4B` |
| Ember (action) | `--ember` | `#A64C45` |
| Ember deep (hover) | `--ember-deep` | `#8C362F` |
| Sand (rules) | `--sand` | `#C9B9B5` |
| Haze | `--haze` | `#E3D7D3` |
| Hairline | `--hairline` | `rgba(10,10,10,.08)` |
| Hairline firm | `--hairline-firm` | `rgba(10,10,10,.14)` |

Components point at role aliases (`--action`, `--emphasis`, `--rule`), never
at raw values. New pages load `v1.css` first for these tokens, as
`programme.html` already does.

Photography and film carry the warmer residential range recorded in the Agent
side `PROJECT.md` (ivory, oatmeal, caramel wood, cocoa). That range lives in
imagery, not in UI tokens.

## 2. Type [Brand Pack]

| Job | Face | Notes |
|---|---|---|
| Display, headlines | Instrument Serif | Capitals on the homepage |
| Labels, interface | Montserrat 300 to 600 | |
| Anything read | Karla | Body, paragraphs, quotes |
| One accent line | Quentin | One per page, large |
| Badges, section numbers | IBM Plex Mono | Never prices or dates |

Never a numeral in a title ("Week One"). All caps headings sit at one cap
height. Josefin Slab, TPS Display, Forum and Corinthia are out.

## 3. Shape and depth [Brand Pack]

- Radius: badge 6px, button 8px, card 10px, media 16px.
- **No shadows anywhere.** Depth is hairlines, edges and overlap.
- **No dark sections.** A dark photograph is allowed.

## 4. Layout [build]

Content max 1080px, reading measure 62ch, gutter 24 / 28 / 48px by width,
section rhythm 96px (64px on phones), nav 80px tall.
Ease: `cubic-bezier(0.23, 1, 0.32, 1)`.

## 5. Signature effects, keep on every page [TJ, 5 Oct 2026]

### Frosted glass

TJ wants it maintained throughout the site. The live recipe:

```css
backdrop-filter: blur(14px) saturate(1.2);
-webkit-backdrop-filter: blur(14px) saturate(1.2);
```

Two fills, chosen by what sits behind:

- **Over photographs or film, carrying text** (`.tab`, `.deskcard` on Care):
  `background: rgba(243, 239, 236, .62)`. At 62% ink stays above AA whatever
  the picture does.
- **Over pale grounds, as a chip** (`.tv2__nav`, nav chips): `rgba(140, 127,
  121, .04)`, `.46` on a dark frame. [TJ] chose 0.04 from a rendered ladder.
  **Do not raise it to fix faintness. That is the effect.**

No border on glass. No shadow. The nav also has `.nav--glass` and a lighter
`.veil` at `blur(7px)`.

### Aurora background

The moving coral weather field, adapted from the 21st.dev Aurora Background.
Lives in `v1.css` (`.aurora`, `.aurora__field`), used in the confinement and
programmes acts of `v1.html` and on `programme.html`. TJ wants it kept.

Its recipe is not a taste setting; each value was measured:

- Two layers in brand coral, blush and rose mist over white windows. The moving
  layer runs at 123 degrees with different periods so it never reads as bars.
- `filter: blur(46px)` holds the gradient banding under the visible threshold.
- `opacity: .46` is the strongest it goes while every line of copy clears
  contrast. At .58 it failed.
- A linear mask fades it in and out so no section edge shows; an off centre
  elliptical mask gives the weather a direction.
- `animation: aurora 62s linear infinite`.

Reuse the existing classes. Do not re-import the 21st.dev original, which
bands, uses blues and violets, and relies on `background-attachment: fixed`
that breaks on iOS.

## 6. Locked [TJ]

Never changed by work on another page or section:

- `v1.html` is the homepage and the latest version of the site. Since
  5 Oct 2026 it opens with `hero`, then `bath`, then a straight cut into the
  seven chapter house film (`baby-handover` to `window-exit`), then
  `confinement`, `care`, `programmes`, `treatments`, `dissolve`, `close`.
  `care.html` now opens on `housekeeping-zones`.
- The hero, and the scroll from hero into bath, a fade. Moved back from
  `care.html` to the top of `v1.html` on 5 Oct 2026, exactly as it was [TJ].
  Guarded by `lab/herolock.mjs` and the Stop hook, which watch `v1.html` and
  passed against the saved record after the move.
- Any section TJ has called finished.
- The single Menu chip nav.
- **Components TJ wants kept throughout the build:** _to be listed by TJ._

## 7. Rules that bind every page [TJ]

- No dead scroll.
- Visible transitions between sections are fine and judged case by case.
- No em dashes or hyphens in any copy, titles or metadata.
- Questions are not build orders. Production files change only on "build".
- Never commit or push without asking.
- Never publish an hourly or unit price. Express value as what is delivered.

## 8. Site header [TJ, 5 Oct 2026: every page has the same header]

The header is written once, in `site-header.html`. `sync-site-header.py`
stamps it into every page (v1, what-we-do, care, programmes, single-treatments,
about, specialist, programme). To change the header, edit `site-header.html`
and run `python sync-site-header.py`. `python sync-site-header.py --check`
reports any page that has drifted. Per page differences (the lockup link, the
Enquire link, whether the bar starts compact) live in the PAGES table at the
top of the script. A new page must be added to that table.

The menu's "What We Do" tab still points at care.html until the new page is
approved. The nav behaviour code still exists in three places (v1.js,
programme.js, inner-nav.js). The markup is unified; the behaviour is not yet.

## 9. Design language v2 (5 Oct 2026)

Study: maisonfav.aura.build, a single page architectural template by someone
else. It is a reference for moves, never a source of code. Tags: [TJ] decided by
TJ, [proposal] Claude's, awaiting TJ.

### Decisions
- [TJ] Headlines stay in CAPITALS, Instrument Serif, as the Brand Pack says.
- [TJ] Buttons stay Ember with soft rectangle corners. No black capsules, no
  black blocks. [TJ] chose the option that adds a small round arrow chip on the
  button. [proposal flag] The Brand Pack says an arrow glyph reads as shop
  urgency (for text links). Needs the client's sign off before it ships.
- [TJ] The Aurora background and the frosted glass stay as they are.
- [TJ] No custom mouse cursor, no dot that follows the pointer, anywhere.
- [TJ] One page at a time. Order: What We Do (strong copy exists), About (draft
  exists), Home (verbal plan, to be dictated). The other pages follow.

### What is taken from MaisonFav
1. The label with a short line before it (OUR PERSPECTIVE). Built as a hairline
   rule in CSS, never a typed dash. One per section at most.
2. The statement sentence: one large sentence that carries a section's idea.
   [proposal] Sentence case Instrument Serif, no slanted word unless TJ
   approves it. Headlines above it stay in capitals.
3. The photo stack: big rounded photographs that slide over one another as the
   page scrolls. New device for this site, to be built once and reused.
4. Cards that open wider on touch. Already owned (the treatments accordion).
5. A quiet figures row. Plex Mono figures only, real figures only.
6. The pace: wide spacing, few things on screen at once.

### What is not taken
Cool grey ground, black capsule buttons, black cards, sentence case headlines,
the cursor dot, its fonts, and every line of its code.

### Every page is built the same way
1. Hero. 2. One statement sentence. 3. The page's own sections from the device
list. 4. One signature moment invented for that page and not used elsewhere.
5. Questions if the page needs them. 6. The shared close and footer. The shared
header comes from site-header.html.

### Still to decide
- Whether statement sentences may carry slanted words.
- The arrow chip on buttons (client sign off).

## 10. Header band at the top of the homepage [TJ, 5 Oct 2026]

At the top of the page the tall header sits on a band of the page colour, not on
the photograph. The hero photograph starts below it and its top edge fades into
that colour, so there is no line. The photograph keeps its full width and leans
down (object-position 62% 68%) so the bottom of the picture is kept. The pinned
stage still spans the whole window, so the pin and the steam to bath handoff
are unchanged. Everything from the bath onwards was checked pixel for pixel and
is identical. The bar's frosted strip has no outline, so its edge appears only
as content passes under it. Variable: --hero-top in v1.css.
The hero only guard is retired. See LOCKED.md for how finished sections are
protected now.

## 11. One header, one fold, every page [TJ, 5 Oct 2026]

Every page opens with the tall header (three line wordmark, circle in the
corner) on a band of the page colour, and folds to the short bar with the
circle on scroll, exactly as the homepage does. The animation is pure CSS in
v1.css. The homepage folds after its hero handoff (v1.js). Every other page
folds after 56px of scroll (nav-fold.js, or the header's data-nav-fold value).
Each page's first content starts below the tall bar (--hero-top). The page
specific bar styling the programme builder and the booking page used to carry
is removed so the header really is the same everywhere. The booking page's
photograph now starts below the bar with the same faded top as the homepage.
Open: the booking page still shows its own logo lockup under the photograph, so
the brand now appears twice at the top of that page.

## 12. Housekeeping zones: bathroom removed [TJ, 5 Oct 2026]

The bathroom stop is gone from the zones section on What We Do: the film was
recut (nursery lit, half a second dissolve, whole house lit), the sentence
phrase, the screen reader line, the room button and the poster are removed, and
zones.js has no bathroom leg. Uncut originals: assets/video/zones.with-bathroom.mp4
and zones-m.with-bathroom.mp4. The section is UNLOCKED until TJ approves it,
then record the lock again (see LOCKED.md).

## 13. Titles carry no full stop (TJ, 5 Oct 2026)
No full stop at the end of any title or subtitle (h1, h2, h3, display lines). Exceptions are rare and deliberate. A full stop inside a title between two sentences ("Same care. Longer stay") is left alone. Body copy, ledes and captions keep their normal punctuation. Applied to every live page on 5 Oct 2026.

## 14. Housekeeping zones layout (5 Oct 2026)
No sentence under the rooms. The rooms are an accordion on a fine vertical line: the room in view gets the ember marker and a few small words (Karla) open beneath its name, one open at a time, driven by scroll and by tap. Wide screens: title left, house centred, accordion right, pinned by its top so it never jumps. Phone and tablet (up to 1099px): a sandwich, title above the house, accordion below; the house plays first and the words arrive after it. Description text is Lorem Ipsum until the client supplies it.

Zones film fit (5 Oct 2026): the film is a 1600 by 892 plan filling the stage below the header. In windows wider than that shape it is sized to its own shape, centred, and feathered at the edges (container query in care.css), so the whole house, both floors, is always in view. Checked at 1100 to 2560 wide, heights 600 to 1300.

Zones on phones and tablets (5 Oct 2026, TJ): tap driven, not scroll driven. Up to 1099px wide the section is an ordinary block: title, house, rooms as horizontal tabs on a fine line with a sliding ember marker, the open room's words appearing and expanding beneath. The house plays its arrival once when it comes into view and stops on the living room; a tap lights a room using stills cut from the same film (assets/img/zones-m-*.webp). The tab copy is built from the accordion text in care.html, so real copy goes in one place. Desktop keeps the scroll scrubbed film.

## 15. Site footer (5 Oct 2026, TJ)

One footer on every page, stamped from `site-footer.html` by `sync-site-footer.py`, styled by `site-footer.css`. Ground and motion are band 3 (Charcoal silk) from `Fuchsia-variants.html`, at the study's own strength and 62 second drift: Ink Mute ground, Blush, Rose Mist and Haze drifting over it. The text is Ink, not white, because the study's light glow cannot carry white text. A 22 percent Canvas veil lifts the darkest patches so Ink measures 4.7 to 1 or better at every point of the drift; lowering the veil fails contrast. The logo is the normal black line art.

## 16. The Promise moved to What We Do (5 Oct 2026, TJ)

"Do we offer night care?" (data-section `dissolve`, named The Promise) now lives on `care.html`, after A Day With Us and before Your Postpartum Specialist. It is gone from `v1.html`. Its motion is in `promise.js`, copied from `v1.js` (`actPeak`, `navTheme`); `v1.js` still contains the originals, which return at once when the section is absent.

The header's ink eases through the night frame instead of flipping (5 Oct 2026, TJ). `promise.js` `navTheme()` sets `--nd` (0 day, 1 night) from scroll, blending between 0.20 and 0.49 of the dissolve, and back out as the frame's lower edge sweeps the bar. The CSS is the `[data-nd]` block at the end of `what-we-do.css`; `v1.css` is untouched. `is-dark` is still set past halfway for the mobile open menu rules.

## 17. Tailored To You rebuilt (5 Oct 2026, TJ)

One frame, no scroll inside it: the section is the height of the window below the 80px header (`min-height: max(660px, 100svh - 80px)`, tighter under 780px tall), checked at 1366 by 650, 1280 by 720, 1440 by 900 and 1920 by 1080. Phones and tablets (900px and under) flow: the photograph bleeds off the top and sides and dissolves downward into the heading, then the rows, then the stay. Concepts A, B and C are kept in `lab/tailored-concepts/`; A, Rooms, is built.

Ground is band 5 (Silk on coral) of `Fuchsia-variants.html`, unchanged. TJ's decisions on 5 Oct 2026: Quentin is the heading "Tailored To You" in white (not the bold line under it); no vertical lines anywhere in the section; every visible word is the client's copy, so no "Your stay" label (the only additions are the sentence "In N days, your specialist will have given you:" and the three count labels, which TJ approved); the photograph bleeds off the right edge, top and bottom of the section and dissolves into the ground toward the text (a mask, so the silk shows through), and follows the open paragraph (care-exterior, care-living, hero_night-shift_v1).

Colour roles on the coral: white Quentin heading; Ink bold lead, row openers, paragraphs, ruler numerals and count labels; Canvas cream (`--tl-cream`) for the three counts. Ember and Ember Deep fail on this ground. The drift is calmed in the top and bottom bands where white and cream sit (`--tl-calm`, .16) and the Canvas veil is only in the middle band where the ink is (`--tl-veil`). Worst measured: white heading 3.95, cream counts 3.16 (large type, needs 3), ink 5.3.

The stay: a scale of 30 day ticks with 5, 7, 14 and 30 at their true positions, a dot at each stop, a round marker on the rule at the chosen length. On arrival the marker travels 0 to 5 over 1.4 s and the counts climb with it (default is 5 days). Click a numeral or the rule, press the arrow keys, or drag the marker, which settles on the nearest stop. Count up is the original, 650 ms. Notes in `research/care-tailored/`. Previous versions: `lab/*.before-*.bak`.

Update, later on 5 Oct 2026 (TJ): the bold line under the heading is Instrument Serif in capitals like the zones, with no final full stop (section 13). Every room starts closed on every screen; a tap opens one, a tap on the open one closes it, and the photograph stays on the last opened. Photographs: hero_night-shift_v1 (the specialist at the cot) is the first and the default, then care-living, then care-exterior. The photograph is 52vw wide and dissolves across its whole width with a long eased mask (about 100 percent of its width), starting past the text column; on phones the fade is longer. The progress bar is white: 2px base rule, 5px drawn line, solid white 20px marker with no border, white dots at the stops; the chosen length's number turns white and the others stay Ink; the labels under the three figures are white. To keep a white selected number legible the silk streak now sits behind the rows (full strength) and is held at `--tl-streak` (.3) behind the numbers; a thin Ember Deep tint (`--tl-sink`, .16) sits under the bottom band. Worst measured: selected number 3.16, figures 3.35, labels 4.44 and the sentence 4.38 (both just under 4.5), heading 4.0.

Update 3, 5 Oct 2026 (TJ): the part of the scale not yet reached is black (Ink); the part reached stays white. The rules between the rows and the plus signs are white, and the line above the first row is gone. "In N days, your specialist will have given you:" is white. The rows (opener and opened text) and the labels under the figures use the header's text: Montserrat 500, .02em tracking, mixed case, header size, not Instrument Serif, Karla or tracked capitals. The silk streak is full behind the rows only; it is calm and the Ember Deep tint (`--tl-sink`, .2) starts higher so the white numbers, sentence and labels sit on a darker ground. Worst measured: selected number 3.7, figures 4.0, labels 4.7, sentence 4.5, heading 3.8; ink 4.3 (opened row two opener) to 5.2.

Update 4, 5 Oct 2026 (TJ): the lengths that are not chosen are faded (ink at .34, .8 on hover); the rules between the rows are Ember Deep (`--tl-rule`), not white; the labels under the figures are in title case ("Freshly Cooked Meals") via `text-transform: capitalize`. Four photographs, one per state: all closed is hero_night-shift_v1, then care-kitchen, care-living and care-exterior for the three rows, so every open, switch or close changes the picture.
