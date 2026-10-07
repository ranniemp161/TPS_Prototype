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

Footer update, 6 Oct 2026 (TJ): the logo is the stacked lockup (circle with the three line wordmark under it, `the-postpartum-suite-logo.webp`, turned white) filling the left third of the footer; the three columns are equal. The tagline "The care mothers deserve, at home" has no full stop, is set in Quentin in white, and runs the full width of the footer, centred above the closing line. The footer locks for `care.html` and `v1.html` are UNLOCKED until TJ approves; then run `node lab/lockcheck.mjs record care.html:site-footer "note"` and the same for `v1.html`.

Footer update 2, 6 Oct 2026 (TJ): the stacked logo is 9rem tall, centred vertically in the row and shorter than the Explore column beside it (144px against 230px at desktop, about 42px of air above and below). Explore and Contact are the higher level: .92rem, 600, capitals, white; the items under them are .84rem, 400. Footer locks stay UNLOCKED until TJ approves.

Footer update 3, 6 Oct 2026 (TJ): the stacked logo is 10.8rem tall (20 percent larger, 173px at desktop, still shorter than the 230px Explore column, 29px of air above and below). On desktop the logo, Explore and Contact are spread across the footer's width with equal gaps between their visible edges (278px each at 1440 wide), so the logo's left edge and Contact's right edge line up with the copyright and Privacy Policy text. Phones and tablets keep the stacked grid. Footer locks stay UNLOCKED until TJ approves.

Footer update 4, 6 Oct 2026 (TJ): on phones and tablets (760px and under) the logo is the inline lockup (circle with the one line wordmark beside it, `logo-inline.webp`, white) centred at the top, via a `<picture>` that keeps the stacked logo for desktop. Explore and Contact sit side by side under it; at 460px and under the first column takes its natural width and the email breaks after the @ (a `<wbr>`) rather than squeezing the list. The Quentin tagline never wraps: on phones it is sized from the window width (`calc((100vw - 3rem) / 15)`), and `white-space: nowrap` applies at every width. Footer locks stay UNLOCKED until TJ approves.

Footer update 5, 6 Oct 2026 (TJ): on desktop the logo, Explore and Contact are grouped in the middle with equal gaps (101px at 1440 wide, measured between the visible artwork and text, not the image box), and the top of the logo's artwork is level with the column headings (434 against 435). The logo file has clear space round the artwork, so it is pulled in with negative margins on the link (`.sf__brand a`). Phones are unchanged. Footer locks stay UNLOCKED until TJ approves.

Footer logo loads eagerly (the `loading="lazy"` was removed, 6 Oct 2026): both logo files are 5 to 12 KB, and lazy loading made it start fetching only as the footer scrolled into view, so it appeared after the text.

Footer logo nudged 1.75rem (28px) left on desktop for optical balance (TJ, 6 Oct 2026); `transform: translateX(-1.75rem)` on `.sf__brand a`, off on phones. The gap from logo to Explore is now about 115px against about 101px between Explore and Contact, on purpose.

Footer logo nudge increased to 2.75rem (44px) left on desktop (TJ, 6 Oct 2026).

## 18. v1.html is the homepage source of truth (TJ, 6 Oct 2026)

`v1.html` is the homepage and the source of truth for the complete multi page website. `care.html` remains the What We Do page. These pages are parts of one website, not competing versions of the same page.

## 19. Full website restored from GitHub (TJ, 6 Oct 2026)

The mistaken consolidation was reversed from GitHub `main` at `b20239f`. The full mockup website is restored: `v1.html` is the homepage, `care.html` is What We Do, and the secondary pages remain separate. `index.html` and `v1-ruined.html` are restored as historical versions. The Fuchsia, Aurora, structure, component and lab references remain.

## 20. Tailored To You comparison (6 Oct 2026, proposal awaiting TJ)

A second Tailored To You section sits directly beneath the original in `care.html` for comparison. The original remains unchanged. The proposal now uses the original Tailored To You moving Silk on Coral background and the original contrast safe colour roles instead of the flat Coral Deep field.

The programme day selector and result sentence and figures now sit above the accordion rows, making the accordion the final part of the section. The proposal photograph remains 44 percent of the window on desktop, with a short fade over the first 36 percent of the photograph so most of the image remains crisp. The programme scale drops the thirty minor ticks, uses a thinner reached line and smaller result figures. On phones the photograph remains first and the copy flows beneath it, with body copy held at .88rem. Both accordions, photographs and stay scales operate independently. In the proposal, the progress bar has no ruler ticks, uses a 3px translucent white base and a 6px white reached line, and animates from zero to day five when the scale enters view. The proposal accordion uses one continuous frosted veil rather than separate cards: no divider lines or drawn border, and the existing glass background and blur continue fully to the left and right sides instead of dissolving through a side mask. All accordion text is white, and the white disclosure control is a plus when closed and a minus when open. The existing cream to blush focus gradient remains behind the open row. The homepage scrolling video panel glass treatment was tested and rejected by TJ because it looked worse; do not reapply it. The proposal lead No two recoveries are the same, so no two stays are either is set as two deliberate lines. Its type size scales from the proposal column so the visible first line, not merely its container, matches the full frosted accordion width edge to edge. Measured at 1440px: 649.91px text against a 650px panel. At 390px: 341.84px text against a 342px panel. Two copies of the current proposal sit beneath the original Tailored To You section so TJ can develop a separate idea without disturbing the current proposal. The newest copy, `tailored-proposal-2`, is the dynamic photograph palette experiment. Its default photograph remains `hero_night-shift_v1.webp`; the third accordion photograph is `mother-and-carer-on-sofa-with-baby-no-hijab.webp`, replacing the house exterior. Each state changes only `--tl-ground` over 900ms: closed clay `#885136`, kitchen taupe `#A37E62`, living terracotta `#956548`, sofa taupe `#A27E64`. Closing the open row returns to the closed clay base. In this newest copy only, the lead No two recoveries are the same, so no two stays are either is one continuous line sized to the full frosted-box width: 650.13px at 1440px and 341.98px against a 342px box at 390px. Its colour is Ink Soft `#2C2C2C`, verified directly in `TPS Brand Pack.html`. TJ rejected Ember Deep `#8C362F` for this line and found full Ink `#0A0A0A` too severe; Ink Soft is the approved trial between them. In this newest copy only, the summary “In N days, your specialist will have given you:” is more prominent at Montserrat 600 and `clamp(.95rem, .82rem + .35vw, 1.12rem)`; its changing day figure is also 600. A single visible “Days” label sits above the 5, 7, 14 and 30 values so the scale communicates its unit immediately; the radiogroup retains its accessible name, “Length of stay in days”. The smaller Days label sits at the far left of the scale, 16px above the progression line. It clears the moving marker throughout its opening animation and does not occupy a separate layout row. The number size, number spacing and progression bar geometry inherit the proposal directly above without overrides, matching exactly at 1440px and 390px. In this newest copy only, closed accordion questions and plus signs use Montserrat 300 for a slimmer state. The open question and revealed paragraph return to the existing Montserrat 500, and the minus uses the existing 400 weight. The existing Canvas, Haze, Blush and Rose Mist silk highlights, masks, opacity, 44px blur and 62 second motion remain identical to the proposal above; interactions remain independent. The accordion focus gradient is clipped to the glass box and driven by a ResizeObserver, so its top and full height continuously match the open row throughout expansion and it cannot sit below the copy or escape the box. In the newest copy only, the three accordion rows are replaced by one continuous passage with paragraph spacing. The opening portion is visible, Read more reveals the remaining copy, Read less closes it, and the existing highlight covers the full expanded panel. The closed state shows `hero_night-shift_v1.webp` on clay `#885136`; expansion changes to `care-kitchen.webp` and kitchen taupe `#A37E62`, and closing returns both to their original state. All passage and toggle text remains Montserrat 300 in both states. The earlier original and proposal accordions remain unchanged. This comparison is not approved or locked.

## 21. Multi page preservation process (TJ, 6 Oct 2026)

This prototype is one multi page website. Never classify a page as a disposable variant merely because another page is becoming the current focus. Before any rename, replacement or deletion, inventory the complete route list, identify each file as a live page, shared fragment, reference, experiment or backup, and show TJ the exact proposed file operations. Preserve the current files in `lab` before any approved destructive operation. Restore or replace only the named files. Afterward, verify every live page, shared header and footer synchronization, internal links and section locks. Never commit or push unless TJ asks.
## 22. Tailored For You consolidation (TJ, 6 Oct 2026)

The original `tailored` section and `tailored-proposal` comparison were removed from `care.html` at TJ's request. The former `tailored-proposal-2` is now the only Tailored section, using `id="tailored"`, `data-section="tailored-for-you"`, the section panel name “Tailored For You”, while the visible Quentin heading remains the client copy “Tailored To You”. When TJ identifies sections by the numbered dev panel, a rename request applies to `data-section-name`, not visible page copy, unless he explicitly asks to change the heading. Its dynamic photograph palette, day scale, lightweight unified Read more passage and kitchen expansion state remain intact. On phones, the photograph fades into the current dynamic ground and ends before the title begins, leaving 24px of clear separation at 390px. Its mobile frame is 250px tall at 390px and both retained photograph states use a 58 percent vertical focal position, trimming a little from the top to reduce the section height. Desktop image geometry remains unchanged. The three changing specialist result groups remain in one horizontal row rather than stacking vertically. Whichever day is selected, 5, 7, 14 or 30, its number becomes fully opaque white to match the thick completed portion of the progression line. The unified Tailored glass panel uses `var(--r-card)`, resolving to the same 10px radius as the homepage Nursery glass panel. Only the radius is matched; its existing fill, blur and highlight treatment remain unchanged. The pre-consolidation page is preserved at `lab/care.before-tailored-consolidation.html.bak`.
## 23. Tailored To You horizontal scroll choreography (TJ, 6 Oct 2026)

TJ approved a horizontal entrance and exit for the consolidated Tailored section after consultation with Scrollcraft, taste skill, Design DNA and 21st.dev. On desktop, the Tailored section first rises naturally from beneath the Specialist section. During that normal vertical entrance, the copy begins nearer the centre and moves left into its final position while the masked photograph glides in from the right. There is no desktop pin. Specialist and Tailored remain connected in normal document flow, divided only by their section boundary and colours. The horizontal entrance runs from the first pixel of Tailored reaching the viewport bottom until the complete 920px section sits beneath the 80px header. The heading leads the movement, followed separately by the day scale, result figures and glass panel. The photograph begins later, travels farther and settles more slowly through the existing fade, so the layers are triggered together without appearing anchored together. Desktop uses a 1.15 second scrub and mobile uses a lighter .85 second scrub. The middle composition settles with only a subtle photographic scale change, keeping the day selector and Read more passage interactive while the section continues moving vertically. On exit, the photograph returns right and fades while the copy moves back toward the centre before the FAQ enters. On mobile, the same directional sequence runs without pinning and over a shorter distance; normal vertical scrolling remains in control. Reduced motion receives no pin or added transforms. Expanding or closing Read more refreshes ScrollTrigger after the height transition so the exit remains aligned. The section is clipped horizontally to prevent transformed media from creating page overflow.
## 24. Tailored To You scroll controlled day sequence (TJ, 7 Oct 2026)

This decision supersedes the no desktop pin sentence in section 23. On screens wider than 900px, Tailored still enters through the approved differential horizontal choreography. During that natural entrance the existing scale and results travel from 0 to 5. Once the complete section reaches 80px below the fixed header, it holds for 1.5 viewport heights while the marker moves through 5, 7, 14 and 30. The marker uses eased travel between the real scale positions. The selected number and the three results change together at the nearest programme state. The section then releases normally, and its differential exit begins only after the hold finishes.

The existing controls and scroll are one system on desktop. Clicking a programme number, clicking the scale or settling a drag moves the page to that programme's scroll position instead of competing with the current scroll state. Opening Read more remains independent and preserves the active programme when ScrollTrigger refreshes after the panel height changes.

Screens 900px wide and under remain tap controlled with no pin and no scroll controlled programme changes. Reduced motion also has no pin and keeps direct programme selection. Verified at 1440 by 900 and 390 by 844 with no browser errors. The desktop section top remained at 79.98px through the full hold, click seeking landed with a zero pixel difference, mobile registered zero Tailored pins, and the expanded glass remained inside the section. Verification images are `lab/tailored-scroll-days-desktop.png` and `lab/tailored-scroll-days-mobile.png`. The prior JavaScript is preserved at `lab/what-we-do.before-tailored-scroll-days.js.bak`.

## 25. Main header menu order (TJ, 7 Oct 2026)

The shared main header menu order is Home, What We Do, Our Offering, About Us, Faqs. Home and What We Do remain page links. Our Offering and About Us retain their existing submenu panels. Faqs links to the dedicated `faqs.html` page. The five item row uses the existing compact Menu control at 1100px and under, because the full row begins overlapping the centred wordmark below that measured cutoff. The header locks for `care.html` and `v1.html` remain unlocked until TJ approves the result.

## 26. FAQ moved to a dedicated page (TJ, 7 Oct 2026)

The approved Frequently Asked Questions section was moved intact from `care.html` to `faqs.html`. Its eight question groups, 42 questions, copy, native details behaviour, sticky group navigation and scroll spy remain unchanged. The shared header Faqs item now links to this page across the full website. `faqs.html` is included in both shared header and footer synchronization. The former `care.html:faq` lock remains unlocked while TJ reviews the moved page; record the section under its new page only after approval.


## 27. FAQ scroll colour arc (TJ, 7 Oct 2026, trial awaiting approval)

The dedicated FAQ page now carries one calm, symmetrical scroll controlled colour arc using only Brand Pack colours. It begins and ends on the standard light Aurora over Canvas, warming through Blush and Warm Rose, reaching Ember and the Charcoal Silk Ink Mute ground across the central question groups, then reversing through the same colours. The eight FAQ groups are the anchors rather than total page progress, so opening an answer and changing the page height does not make the palette jump. FAQ text, fine rules, active group colour and the shared header theme move from Ink to Canvas with the same eased theme value. The day Aurora and Charcoal Silk layers crossfade behind the page and drift over 140 seconds; reduced motion keeps the colour journey but stops the automatic silk drift. The FAQ layout and copy are unchanged. Testing showed that directly scrubbing the copy colour produced a long low contrast grey interval, so the background remains continuously scrubbed while the copy makes a short 360ms eased handoff at the measured day to night threshold. The dark reading veil is 24 percent at full night; rendered sampling measured a 4.6 to 1 minimum against Canvas copy across the brightest silk streaks. The FAQ page also overrides the older scrubbed grey midpoint in the fixed header: its ink and logo now use the same short day to night handoff as the FAQ copy, while the glass background continues to blend with scroll. Backups are `lab/faqs.before-scroll-colour-arc.html.bak` and `lab/what-we-do.before-faq-scroll-colour-arc.css.bak`.

## 28. FAQ page: header edge, clay ground, soft text, one text colour (TJ, 7 Oct 2026)

Header edge: at the top of the FAQ page the header glass strip is invisible, so header and page are one surface with no line; the strip fades in (320ms) when the header folds on scroll (`.is-scrolled`), and shows when the menu is open. FAQ page only, in `what-we-do.css`.

Ground: the two coral steps of the arc (#CD8E81, #A64C45) are replaced by the Tailored To You clay #885136. The arc is now pale, blush, clay, clay, charcoal, clay, clay, blush, pale (`faqs-theme.js` states). Aurora layers unchanged; over clay only the night field shows, which carries the same Canvas, Haze, Blush and Rose Mist highlights as Tailored.

Text: one colour for every word, rule, header tab and the logo, from `--faq-ink` (0 Ink, 1 Canvas). No coral or white accent: the active group in the side list is marked by weight (700 against 400). The change from Ink to Canvas is no longer a 360ms switch: `faqs-theme.js` eases `--faq-ink` over 1.4s (sine) when the ground, with its reading veil, crosses relative luminance .165 going dark or .19 going light. Settled contrast measured: 17.3 at the top, 12.7 on blush, 6.8 on clay, 7.7 on charcoal, at 1440 by 900 and 390 by 844. Mid dissolve the copy passes through grey and is briefly low contrast (well under 3 to 1 for roughly half a second); that is the cost of the soft change TJ asked for. Backups: `lab/faqs-theme.before-clay-softtext.js.bak`, `lab/what-we-do.before-faq-clay-softtext.css.bak`. Trial, not locked.

## 29. FAQ page: one drift, scroll tied text (TJ, 7 Oct 2026)

Superseding parts of section 28. One drift layer for the whole page, built exactly as the footer's (`.sf__field`: stops, sizes, angles, 44px blur, mask, 62 second travel). Scroll changes only its colours, strength and ground, through three palettes in `faqs-theme.js`: light (Canvas with coral accents, .46), clay (#885136 with Tailored's cream accents, .70), charcoal (the footer: Ink Mute with blush, rose mist and haze, .55). Order: light, light, clay, clay, charcoal, clay, clay, light, light. The old dark reading veil is gone.

Text: no timer. Like The Promise's header (promise.js navTheme), the copy colour is tied to scroll and blended with the same eased amount as the palettes; the header tabs and logo follow with their own transitions removed. TJ (7 Oct 2026): the copy stays Ink through light and clay and only moves toward Canvas as clay turns to charcoal (palette `ink` values 0, 0, 1). Measured at 1440 by 900: the blend runs over 660px of scroll going down (Our Specialists) and 260px coming back (Treatments is a short group). Worst rendered contrast: Ink on clay 3.7 (passes for the large question titles, under 4.5 for the small side list); Canvas on charcoal 2.1 at the brightest streak, which waits on the drift strength decision below. Preview `lab/faq-text-dark-on-clay.png`. Backup `lab/faqs-theme.before-ink-at-charcoal.js.bak`.

Backups: `lab/*.before-one-drift.*`.

## 30. FAQ page: two tones, one text colour (TJ, 7 Oct 2026)

Supersedes the palettes and text colour in sections 27 to 29. TJ dropped the charcoal and the change to white text: grey text did not sit well on charcoal and the change to white did not work. Two tones only on the footer's drift. LIGHT (Canvas, coral accents, .46) at the top; PEAK, the soft clay that sat behind Programmes and Personalisation in the previous version, sampled from the page (ground #CAB2A6, 38.5% of the way from light to the Tailored clay #885136, .552), is the darkest point. The arc is even over the whole scroll (TJ, 7 Oct 2026): LIGHT at the top, PEAK at exactly 50% of the scroll, LIGHT at the bottom, each half eased (`faqs-theme.js`). Measured symmetric at 1440 by 900 and 390 by 844 (the same colour at 40% and 60%, 25% and 75%, 10% and 90%).

Deeper peak with silk (TJ, 7 Oct 2026, options 1 and 2): PEAK is now Tailored's taupe clay #A37E62, the deepest ground Ink still reads on, and the drift turns from coral streaks at the top to Tailored's cream silk at the peak (Canvas, Haze, Blush, Rose Mist, strength .70). Worst rendered Ink contrast at the peak 6.0 (1440) and 6.4 (390), 9.8 at a quarter. Backup `lab/faqs-theme.before-taupe-silk.js.bak`.

Light base (TJ, 7 Oct 2026), replacing the taupe ground: the ground stays Canvas #F3EFEC the whole way, the key base note. Only the drift's streaks morph, from coral and blush at the top into the clay family at 50%: still layer #885136, #A37E62, #E2CAC6; moving layer #A37E62, #956548, #D7C2C9; strength .46 rising to .58. Same footer drift, same even arc. Worst rendered Ink contrast: 10.3 at the top, 9.2 at a quarter, 7.8 at the peak (1440 by 900; 8.0 on a 390 phone). Previews `lab/faq-lightbase-*.png`. Backup `lab/faqs-theme.before-light-base.js.bak`. Trial, not locked.

Pushed toward charcoal (TJ, 7 Oct 2026): at the peak the whole background had read as one colour, so the drift lost its sense of motion. The peak streaks now run to charcoal and deep clay (still layer #5A524F, #885136, #A37E62; moving layer #885136, #5A524F, #D7C2C9) with the cream gaps kept open, at strength .74, the edge for Ink. Measured over many drift frames at the peak: worst Ink 4.8 (1440) and 4.85 (390); light to dark spread inside the drift 3.2 (it was about 2 at a quarter). Tested .78 and .84: Ink fell to 4.4 and 3.9, so .74 is the limit while the copy stays Ink. Previews `lab/faq-charcoal-streaks-*.png`. Backup `lab/faqs-theme.before-charcoal-streaks.js.bak`.

Clay instead of charcoal (TJ, 7 Oct 2026): charcoal dominated and the clay read as gone. Peak streaks are now the clay family only: still layer #885136, #956548, #E2CAC6; moving layer #A37E62, #885136, #E2CAC6. The light streaks (a3, b3) stay blush #E2CAC6 the whole way and the gaps are the Canvas ground, so the light areas keep one light colour top to bottom; only the darks deepen. Strength .81 at the peak, the edge for Ink: worst 4.6 (1440) and 4.9 (390), spread 3.2. At .86 Ink fell to 4.2. Backup `lab/faqs-theme.before-clay-streaks.js.bak`.

## 31. FAQ page: one constant palette, scroll driven motion (TJ, 7 Oct 2026)

Supersedes every colour arc in sections 27 to 30. TJ: the colour morphs did not look appealing; the page must be light, airy and calm. The colours never change: the light top palette (Canvas ground, coral and blush streaks at .46, the defaults in `what-we-do.css`) holds the whole page and the copy stays Ink (worst rendered contrast 10.3 to 10.7). Scroll drives the drift's motion instead, on top of its own 62 second travel (`faqs-theme.js`): the two streak layers turn in opposite senses (still layer +38 degrees over the page, moving layer 1.4 times that the other way), the field wanders on a slow curve (up to 9% of the window across, 6% up and down), breathes (up to 16% larger at mid page) and its bright centre moves from 70% to 30% across and dips to 58% down at mid page. All smooth functions of scroll, still when the reader stops, reversed on the way up; reduced motion keeps it still. The field is oversized (inset -12vmax, mask ellipse 80% by 66%) so it never shows an edge. Measured 60 frames a second while scrolling at 1440 and 390. Previews `lab/faq-motion-*.png`. Backups `lab/*.before-motion-drift.*`. Trial, not locked. The copy is Ink the whole way and never changes colour; the header is untouched by the arc. Measured worst Ink contrast over the drift: 10.3 at the top, 8.9 at the peak, 9.2 mid page (1440 by 900; 9.0 at the peak on a 390 phone). The drift strength question from section 29 no longer applies. Previews `lab/faq-two-tone-*.png`. Backup `lab/faqs-theme.before-two-tones.js.bak`. Trial, not locked.

## 32. What We Do hero, proposal (7 Oct 2026, awaiting TJ)

A second hero (`data-section="hero-proposal"`) sits under the placeholder hero in `care.html` for comparison; the placeholder and the old intro are untouched. Files: `hero-wwd.css`, `hero-wwd.js`. One pinned stage (4.2 windows of scroll, scrub .8), beats in order: the question alone on Canvas in Instrument Serif capitals; the first photograph rises column by column in a stepped skyline as the question lifts away (the mechanic of the 21st.dev Stepped Morph Image Slider, reference saved at `research/what-we-do/ref-stepped-morph-21st.png`, code ours, scroll is the timing); "We do." lands in Quentin, white; it gives way to a glass panel (the site's .glass recipe) with "We do." small, the kind of care as a label and its claim; three more photographs rise through the last with the claim turning each time; a short hold. 14 columns on desktop, 8 on phones, each a full size copy clipped to its strip with .15% overlap so no seam shows, started in a fixed scattered order. Four fine ticks mark the claim in view, weight and length, no counter. After the stage: her paragraph folded to three lines with Read more, the at a glance figures and Book a consultation.

Copy is the client's only: her hero question, answer and paragraph; the four claims are her promise lines for Mother and Baby Care, Treatments, Meals and Home Support. Photographs: s2-handoff, s4-massage, s6-meal, s7-home. Reduced motion gets the resolved page with every claim listed. Verified at 1440 by 900 and 390 by 844, no errors. Previews `lab/hero-proposal-*.png`. Backup `lab/care.before-hero-proposal.html.bak`. Not approved, not locked.

Client copy received the same day is filed verbatim at `research/what-we-do/copy-zones-and-day-night.md`. The three housekeeping zones paragraphs are on the page (TJ, 7 Oct 2026: copy only, no change to mechanics or graphics); her room headings ("A living room that stays calm" and so on) are not used, the room names on the fine line stand. "After l meals" in the kitchen paragraph is as received and needs checking with the client. The Day and Night Care copy is not yet on the page.
