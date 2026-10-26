# PALETTE PLAN: making the site's colour switchable

Written 26 Oct 2026 for a fresh chat. Read this whole file, then `DESIGN.md` (the last dated sections) and `memory.md` before doing anything. Run the TPS dev skill first if it is available (`tps-dev`).

## 1. Why this exists

Ami (the client, Amidat Olowu) no longer likes the coral accent. She says it looks generic and AI. She does not like the button colour. Earlier she chose sage from a mock-up, but when TJ tried to convert the site to sage it failed twice over: sage sat at the same lightness as the grey text so nothing popped, and the coral kept leaking through in places (the footer, among others) because many colours were typed in by hand rather than read from the tokens.

TJ's dream outcome: Ami opens the prototype and toggles between 20 to 30 complete colour schemes in one click, every part of the site changing together, nothing clashing, nothing left behind in coral. She picks one, we bake it in.

Constraints TJ and Ami have set:

- Not pink. Not coral.
- Not black buttons. A rival uses black buttons with a two tone site; neither TJ nor Ami want that look.
- Bronze is allowed only if a shade is found that Ami likes. She rejected the orange bronze on the earlier sample page.
- Sage is allowed only in a form that pops. The failure before was lightness, not hue.
- One wild card must exist: a two tone site (cream plus ink) where the button alone carries colour and everything else stays in the two tones.
- Photographs and the film cannot change. The specialist's pink uniform is in nearly every image. Every palette must sit with pink whether or not it is pink. Small discrepancies outside the changeable scope are accepted, but every palette offered must be one Claude would stand behind.
- The Check your dates logic, copy and forms are finished. Do not touch their behaviour. Colour only.
- The bespoke builder's pricing engine (`index/js/build-your-programme-pricing.js`) is never touched.

## 2. Where the site is

- Site root: `G:\My Drive\Rannie and Tj's Projects\The Post Partum Suit\postpartum-prototype\`. Live files are in `index/` (`index.html` is the home page). Old versions in `archive/`, never edit those.
- GitHub: `subishop/TPS_Prototype`, branch main. Last push was `ce47a24`. Everything since 25 Oct 2026 (the Check your dates rework, the sales brochure build on Programmes and the home page, the pop-up calendar, the CTA background) is NOT committed. Before starting this plan, ask TJ whether to commit and push the current state first. Recommend yes, so the palette work has a clean base to return to.
- Revisions sheet: "TPS Website Revisions from Ami", Google Sheet ID `1ziiIahEREwUCC_YBXI0KGEzlDOFR1rjPCgSuPa_GxVg`, tab `Revisions`, columns Page, Section, Change, Status, Notes, Mobile Responsive. New work is logged as rows set to `Amber (In Progress)`; TJ sets Green himself. Rows 80 to 90 are the 25 and 26 Oct work.
- Lock tool: `node lab/lockcheck.mjs check`. All locks are currently open. Run it anyway before editing.
- Header and footer are stamped from partials: `python index/partials/sync-header.py --check` and `sync-footer.py --check` must report every page `ok` before finishing any step that touches them.
- Playwright tools live in `lab/*.mjs`. They use `import { chromium } from 'playwright-core'` and `chromium.launch({ channel: 'chrome' })`, open pages with `pathToFileURL`, and wait for `document.fonts.ready`. Screenshots go in `lab/shots/<batch>/`. For this plan use `lab/shots/palette/`.
- Backups before edits go in `lab/<name>.before-<reason>.<ext>.bak`. Keep doing that.
- Decisions get a dated section at the end of `DESIGN.md`. Add one for this plan when the system is built, and one when Ami picks.

## 3. How colour is wired today

Top of `index/css/site.css` (`:root`):

```
--canvas #F3EFEC   --paper #FFFFFF   --blush #E2CAC6   --rose-mist #D7C2C9
--ink #0A0A0A      --ink-soft #2C2C2C   --ink-mute #5A524F
--coral-mid #C86D58   --coral-deep #B95A4B   --ember #A64C45   --ember-deep #8C362F
--sand #C9B9B5     --haze #E3D7D3
roles: --action (ember)  --action-hover (ember-deep)  --emphasis (ember)  --rule (sand)
       --hairline rgba(10,10,10,.08)   --hairline-firm rgba(10,10,10,.14)
```

Counted on 26 Oct 2026, roughly: about 200 token uses across the stylesheets, and about 35 raw hex or rgba colour values that bypass the tokens. The leak lives in: `css/footer.css` (4), `css/what-we-do-timeline.css` (6), `css/what-we-do.css` (6), `css/site.css` (13), `css/programmes.css` (3), `css/booking.css` (1), one in the HTML or JS, plus `index/gifts.html` which carries an inline background recipe in raw hex, and the moving light ("aurora") recipes in `site.css` which use tokens for colour but were tuned by eye. The 26 Oct call to action ribbons use three sampled hexes (#C39A9D, #CFAAAE, #D8C1C8) on purpose; those must become derived values in this plan.

Things that carry the accent colour and are easy to forget: the Programmes card's border and shadow tint, the moving light ribbons on the home page, Programmes, Check your dates and the builder, the selected day and today marker in all three calendars (single treatments booking, the builder, the Check your dates pop-up), the slider dots and fills on the testimonials and Programmes lines, the header's Check your dates button, the footer's ground and its light, the Quentin script lines, the `.cta-link` and `.text-link` underlines and hovers, the focus rings, the "Recommended" tags and toggles in the builder, the price figures on Programmes and in the builder, the glass card borders, the error and status text colours on the forms, and the `aria-pressed` state on calendar days.

## 4. The principle

Nothing in the site may know a colour. It may only know a job. Every coloured thing reads a role token. Roles read from a palette. A palette is a small set of seeds, and every other value is derived from the seeds by fixed rules. Because the relationships are fixed and only the seeds move, every palette is cohesive by construction. Taste is then applied per palette on top of that floor.

## 5. The role layer (what Opus decides first)

Replace the current role list with a complete one. Suggested names; adjust if the code reads better another way, but every coloured declaration in the site must point at one of these:

Grounds: `--g-canvas` (cream page), `--g-paper` (white), `--g-soft` (the rose ground under the testimonials and the Programmes top), `--g-tint` (the blush used in panels and tints), `--g-dark` (the footer and the Four Kinds of Care silk ground, today Ink Mute).

Ink: `--t-ink`, `--t-soft`, `--t-mute`, `--t-on-dark` (text on dark grounds, white today), `--t-on-accent` (text on the button, white today).

Accent: `--a` (the action colour: buttons, selected states), `--a-hover`, `--a-deep` (the Quentin script lines, the darkest accent), `--a-emphasis` (links and "Recommended" tags), `--a-tint` (accent mixed into cream for soft fills), `--a-shadow` (the accent at low alpha for card shadows and borders).

Light (the moving ribbons): `--rib-1`, `--rib-2`, `--rib-3`, `--rib-4` (four stops the aurora recipes read; today ember, ember deep, coral deep, blush), `--rib-light` (the white or cream stripe layer).

Lines: `--line` (hairline), `--line-firm`, `--rule`.

States: `--err` (form errors and the service area refusal, today ember deep), `--ok`, `--focus` (focus ring, today ember).

Reach dial (section 7): `--reach-script`, `--reach-link`, `--reach-rib`, each resolved to either the accent or the ink or the ground depending on the reach setting.

## 6. The seed and derivation layer

A palette is defined by at most five seeds:

1. `hue` of the accent (an oklch hue angle).
2. `chroma` of the accent (how saturated; a fixed default, overridable per palette).
3. `warmth` of the cream (a small hue shift for the canvas, so olive palettes can cool the cream a touch and bronze palettes warm it).
4. `soft` relationship: whether the soft ground is a tint of the accent, or stays a neutral warm stone, or stays rose. Three named options, not a free value.
5. `dark` relationship: the dark ground as a neutral, or as a very deep version of the accent.

Derivation rules, written once in CSS using `oklch()` and `color-mix()` so they run in the browser (Chrome, Safari 16.4 plus, Firefox 113 plus all support these):

- `--a` is always `oklch(L C hue)` with L fixed in a narrow band (about 0.45 to 0.50) and C at the seed chroma. This is what guarantees the pop: the accent is always darker and richer than `--t-mute`, so a grey sage cannot exist.
- `--a-hover` is `--a` with L lowered by a fixed step.
- `--a-deep` is `--a` with L lowered by a larger fixed step and C slightly reduced.
- `--a-emphasis` equals `--a` by default.
- `--a-tint` is `color-mix(in oklch, var(--a) 12%, var(--g-canvas))`.
- `--a-shadow` is `--a` at alpha .18 for borders and .28 for the shadow.
- `--rib-1` to `--rib-4` are four fixed L and C steps around the accent hue; the fourth is the soft ground tint so the ribbons always land in the family. For the "button only" reach they resolve to cream and the soft ground.
- `--g-soft` is either `color-mix` of the accent into the canvas at about 22 percent, or the neutral stone, or the existing rose, per seed 4.
- `--g-dark` is either the current Ink Mute or `oklch(0.30 C*0.5 hue)`, per seed 5.
- `--err` is derived from the accent only if the accent is in the red to orange band; otherwise it is a fixed deep red that still sits with the palette. Form errors must always read as errors.
- `--focus` equals `--a`.

Keep the derivation in one block at the top of `site.css`, under a comment that says these are the only lines a palette changes. The current coral must be expressible as a palette through the same rules and must render within a hair of today's site. That is the first acceptance test: palette `coral` on, screenshots match the current site.

## 7. The reach dial

A second switch, independent of the palette: how far the accent reaches.

- `full`: today's behaviour. Button, Quentin script lines, links, ribbons, prices, selected states all carry the accent.
- `button`: the wild card. Only `--a` (buttons and selected states) carries colour. Script lines and prices go to `--t-ink` or `--a-deep` resolved to ink, links go to ink with an underline, ribbons resolve to cream and the soft ground only. Everything else is the two tones.

Implemented as a `data-reach` attribute on `<html>` that remaps the three reach roles. Every palette works with either reach, so 15 palettes become 30 options at no extra cost.

## 8. The panel

The prototype already loads `lab/devpanel-loader.js` on every page. Add a palette panel to it, prototype only:

- A list of palettes by name with a small swatch of the accent and the soft ground.
- The reach switch.
- The choice is remembered in `localStorage` and applied before first paint (a tiny inline script in `<head>` reads it and sets `data-palette` and `data-reach` on `<html>`, so there is no flash of coral).
- A shareable link form: `?palette=olive&reach=button` sets and remembers the choice, so Ami can send TJ the exact one she means.
- The panel never ships. When Ami picks, the chosen seeds are written into `:root`, the panel code is removed, and the inline head script goes.

## 9. Guardrails that run before Ami sees anything

A contrast script, `lab/palette-contrast.mjs`, loads each page under each palette and reach, reads the computed colours, and checks at least: button text on the button (4.5:1), accent on canvas (4.5:1), accent deep on the soft ground (4.5:1), mute text on the ribbons at their strongest (4.5:1), text on dark on the dark ground (4.5:1), link on canvas (4.5:1), error text on paper (4.5:1). A palette that fails any check is marked failed and hidden from the panel until fixed.

A screenshot script, `lab/palette-shots.mjs`, shoots home, Programmes, Check your dates, the builder's opening and summary screens, Who comes into your home, Gifts and the footer at 1440 by 900 and 390 by 844 for each palette and reach into `lab/shots/palette/<palette>-<reach>-<page>-<width>.png`. Opus looks at every set. Nothing goes to Ami unseen.

A leak check, `lab/palette-leak.mjs` or a grep: after the audit, a search of `index/**/*.css`, `index/*.html` and `index/js/*.js` for `#[0-9a-fA-F]{3,8}` and `rgba?(` outside the `:root` block and the derivation block must return only the handful of neutral alphas that are allowed (the hairlines, pure white and black shadows). List those allowed lines explicitly in the script so the check is exact.

## 10. Candidate palettes to build first

Opus chooses the exact seeds by eye against the real pages, with the photographs in frame. Starting list, in the order to show Ami:

1. `olive`: deep olive, sage's dark sibling, around #3E4F3A. The direct answer to "you chose sage; here it is with the contrast it was missing". Soft ground as warm stone.
2. `teal`: deep teal or petrol, around #2F5F5B. The complement of the blush grounds, so it pops hardest. Watch it against the pink uniform.
3. `brass`: a deep, un-orange bronze, around #8A6A3D. Only because Ami left the door open. Show last of the three.
4. Several more once the system exists: a deep forest, a slate blue, a dark moss, a warm charcoal with the wild card reach, a deep aubergine (likely rejected as coral's cousin, include only if TJ asks).
5. `coral`: the current site, kept as a palette so comparison and rollback are one click.

Do not offer plum or burgundy as leads; they read as coral's cousins. Do not offer any palette whose accent lightness is above the band in section 6.

## 11. Who does what

TJ's instruction: Opus 5.5 leads, hands simple work to Sonnet 5.5 and Haiku 5.5, and never does mechanical work itself. Each helper gets a written brief with the files, the rule, and the acceptance test, because it cannot see the chat. Never run two helpers on the same file at once. Opus checks every result by looking at screenshots and running the scripts, not by redoing the work. Report mistakes rather than patching quietly.

Phase 1, inventory (Haiku 5.5): list every raw colour in `index/css/*.css`, `index/*.html` (including inline styles and scripts) and `index/js/*.js`, with file, line, the value, and a one line note of what it colours. Output as `lab/palette-inventory.md`. No edits.

Phase 2, roles (Opus): write the role layer and the derivation block into `site.css` expressing today's coral exactly. Assign each inventory line to a role in `lab/palette-inventory.md`. Acceptance: screenshots of all key pages before and after match (a pixel diff script, Haiku can run it).

Phase 3, audit (Sonnet 5.5): replace every raw colour with its assigned role, file by file, from the inventory. Includes rebuilding the gifts page recipe and the aurora ribbons from the `--rib-*` roles. Acceptance: the leak check passes, the before and after screenshots match, header and footer sync checks pass, every existing `lab/*-check.mjs` still passes.

Phase 4, reach and panel (Sonnet 5.5): the `data-reach` remap, the head script, the panel in the dev panel loader, the query string, localStorage. Acceptance: toggling in the browser changes every page with no flash, the link form works, `coral` plus `full` is pixel identical to today.

Phase 5, palettes (Opus, with Haiku running the scripts): define each candidate's seeds, run contrast and shots, look at every image, tune by eye, drop anything that does not hold. Log each palette's seeds and a one line verdict in `DESIGN.md`.

Phase 6, hand over: TJ sends Ami the prototype link with the panel. When she picks, bake the seeds into `:root`, remove the panel, run every check and the full screenshot set once more, log the decision in `DESIGN.md` and the sheet, commit and push on TJ's say so.

## 12. Effort, in the right units

Nothing here waits on compute. The cost is tokens and rounds of conversation. Expect four to six rounds with TJ: one to agree the roles and see coral re-expressed through them, one or two for the audit and panel, two or three for the palettes where screenshots are the heavy part. Helpers keep most reading out of the main context. Each new palette after the system exists is three to five numbers plus one screenshot pass.

## 13. Rules that always apply

- No em dashes or hyphens as punctuation anywhere in copy or comments; grep for `—` and `&mdash;` before finishing.
- Comments in the code say who asked and the date (TJ, 26 Oct 2026, and Ami where it is hers).
- Titles end without a full stop.
- TJ reads in plain language. No bullet lists in chat replies unless he asks, 10th grade reading level, short.
- Confirm with TJ before any commit or push, and before anything irreversible.
- Log every delivered step as a sheet row at Amber. TJ sets Green.
- Verify visual work by looking at the rendered result, never by reasoning about it.
