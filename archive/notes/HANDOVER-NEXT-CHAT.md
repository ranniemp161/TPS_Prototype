# Handover to the next chat, written 6 Oct 2026

## Update, 7 Oct 2026 (TJ): the current files are the source of truth
TJ kept working after this handover was written. Whatever is in the files now is the source of truth. Where this handover disagrees, the files win. The changes since it was written are DESIGN.md sections 22 to 27:
- Tailored To You is now one section (`data-section="tailored-for-you"`). On desktop it enters sideways and holds while the stay runs 5, 7, 14, 30. Phones are tap only. That consolidation replaced the original section, so the "fuchsia question" below is likely moot (inferred, not confirmed by TJ).
- The header menu order is Home, What We Do, Our Offering, About Us, Faqs.
- The FAQ moved from care.html to a dedicated `faqs.html` (with `faqs-theme.js`), linked from the shared header on every page. Its scroll colour arc is a trial awaiting TJ's approval.
- Header and footer are in sync on every page, faqs.html included (checked 7 Oct).
- The `care.html:faq` lock is stale. Once TJ approves the FAQ page, release it and record `faqs.html:faq`.
- The housekeeping zones still carry placeholder copy and are still unlocked.

Read this after `HANDOVER.md` (the standing rules) and before touching anything. It covers one long session on 5 and 6 Oct 2026. Claims here were true when written. If a file disagrees, trust the file and tell TJ.

## Key file locations
Project root (everything below is relative to it unless it starts with a drive letter):
`G:\My Drive\Rannie and Tj's Projects\The Post Partum Suit\`
Prototype folder, where all the site work happens: `postpartum-prototype\`

Pages (in the prototype folder)
- `v1.html` with `v1.css`, `v1.js`, `home-flight.js`: the homepage.
- `care.html` with `care.css`, `care.js`, `what-we-do.css`, `what-we-do.js`, `zones.js`: the What We Do page. The housekeeping zones section is in care.html (data section housekeeping-zones) and styled at the end of care.css. The tailored section is styled in what-we-do.css under "9. Tailored to you".
- `programme.html`, `about.html`, `specialist.html`, `single-treatments.html`, plus `booking.css`, `booking.js`: the other pages. Shared styles are `styles.css` and `inner.css`.
- Shared header: `site-header.html`, stamped into every page by `sync-site-header.py` (run with `--check` to find drift), behaviour in `inner-nav.js` and `nav-fold.js`. Shared footer: `site-footer.html`, `site-footer.css`, `sync-site-footer.py`.

Assets: `assets\img\` (stills and photos, including `zones-m-*.webp` and the desktop `zones-*.webp`), `assets\video\` (`zones.mp4`, `zones-m.mp4`, the `.with-bathroom.mp4` originals, the flight films), `assets\font\`.

Docs in the prototype folder: `HANDOVER.md` (standing rules), `HANDOVER-NEXT-CHAT.md` (this file), `DESIGN.md` (tokens, recipes, decisions, numbered sections), `LOCKED.md`, `SITE-PLAN.md`, `BRIEF.md`, `STATE.md` (stale).

Tools: `lab\lockcheck.mjs` (section locks, registry in `lab\locks\`), `lab\state.mjs`, the older `lab\*.mjs` check scripts, and many `.bak` page backups in `lab\`.

Research: `research\what-we-do\` holds `copy.json` (the client's verified What We Do copy, build from it, never retype), `copy-verification.md`, `brief.md`, `structure.md`, `references.md`, `maison-design-dna.json`, `old-care.html.bak` and `preview\` screenshots. `research\care-tailored\` (components.md, references.md, structure.md) is not mine. `research\header-band\` holds the header band studies.

Colour studies: `aurora-variants.html` and `aurora-variants-2.html` in the prototype folder, and a copy of the second at the project root as `Fuchsia-variants.html`.

Client and brand material at the project root: `what we do copy.png` (the client's copy screenshot, the source for copy.json), `landing-page-copy.md`, `TPS Brand Fonts.pdf` (type rules, the canonical source), `TPS Brand Pack.html` and `.pdf`, `TPS Color pallet v1.pdf`, `TPS Client Service Agreement.pdf`, `Quentin.otf`, the logo PNGs, `Program Pricing V1.html` and `V2.html`. `TPS Design\TPS-DESIGN.md` is stale on fonts, do not build from it.

On the Agent side (`G:\My Drive\Agent\`): `CLAUDE.md`, `shared-skills\award-site\SKILL.md` (the design pipeline skill, edit the canonical copy here, not the mirrors), `ai-system\SKILL-DECISIONS.md`, `.claude\hooks\tps-lock-guard.sh` (the Stop hook), `.claude\settings.json` (holds secrets, do not print), and the memory folder `C:\Users\LenoVo\.claude\projects\g--My-Drive-Agent\memory\`.

## Read in this order
1. `G:\My Drive\Agent\CLAUDE.md` and the memory index (the Postpartum Suite entries, especially `project_postpartum_suite_client`, `feedback_hero_lock_guard`, `feedback_no_full_stop_in_titles`, `feedback_existing_site_language_first`, `feedback_questions_are_not_build_orders`).
2. `postpartum-prototype/HANDOVER.md`, `LOCKED.md`, `DESIGN.md` (sections 12 to 14 and the notes added at its end).
3. This file.

## What TJ just told me, unverified
TJ tidied the folder themselves, removing obsolete HTML, and is "now working with the v1 version". I did not see those changes. When this was written the folder still held index.html, programmes.html, v1-ruined.*, the site structure pages and the two aurora study pages, so check what is actually there first. Also confirm which page "v1" means: v1.html is the homepage, and care.html is the What We Do page that is live in the menu. Ask TJ one short question if it matters to the task.

## Who TJ is on this project (short)
TJ is the developer and designer for the client, Amidat Olowu (TJ calls her Ami, they are friends). TJ wants direct, short replies, no em dashes or hyphens in written output, no endless permission questions, no jargon. TJ does not want to open things inside the IDE, so always give the folder path and a `file:///` link that can be pasted into Chrome. A question from TJ is not a build order: answer and stop unless TJ says build. Never present an inferred rule as TJ's rule.

## Decisions TJ made this session (all attributed to TJ)
- Site wide: no full stop at the end of any title or subtitle, rare exceptions. Applied to 12 titles across live pages. Recorded in DESIGN.md section 13.
- Site wide: delicate text and fine lines in the style of the header tabs, no pill buttons unless it is a real action (Enquire, Book a consultation). Only applied so far to the housekeeping zones.
- The tall to short header fold is universal on every page (nav-fold.js, shared header in `site-header.html`, stamped by `sync-site-header.py`).
- Bathroom removed from the housekeeping zones.
- Zones title reads "While you rest" in Quentin, then "the rooms you live in are looked after" in Instrument Serif capitals, no comma, no full stop.
- The old "She will tidy your living room" sentence is removed.

## Housekeeping zones (care.html, section housekeeping-zones), current state
Status: UNLOCKED, awaiting TJ's review. Do not record a lock until TJ says it is settled.

Desktop (1100px and wider): scroll scrubbed film, unchanged logic in `zones.js`. Title on the left, set a short gap off the house. House centred. Rooms on the right as an accordion on a fine vertical line, the ember marker sliding between rooms, the open room's few words appearing beneath its name. In windows wider than the film's 1600 by 892 shape the picture is sized to its own shape and feathered so both floors always show (container query in care.css).

Phones and tablets (up to 1099px): tap driven, NOT scroll driven (TJ approved this after I explained that scroll scrubbing of video is rough on touch screens). Ordinary block: title, house, three tabs spread left, centre and right on a horizontal fine line, copy centred beneath. The house plays its arrival once when it scrolls into view and stops on the living room. Tapping a tab swaps the words and fades in that room's lit still (`assets/img/zones-m-living.webp`, `zones-m-kitchen.webp`, `zones-m-nursery.webp`, `zones-m-intro.webp`, cut from `zones-m.mp4`). The tab copy is built by `zones.js` from the accordion text in care.html, so real copy goes in ONE place. Rotating across 1099px reloads the page. I tested with touch emulation only. I could NOT test on a real iPhone.

Copy: the three paragraphs are Lorem Ipsum placeholders. Amidat has written nothing for the zones. Her verified copy (`research/what-we-do/copy.json`) has close material in Home Support, A Day With Us and the FAQ (kitchen and household tasks), and almost nothing specific for the nursery. TJ was about to ask her for a short paragraph for each of the three rooms and whether she approves the title line, which came from the old Care page, not from her.

## The "Tailored To You" section and the fuchsia question (open)
TJ asked why its fuchsia is much stronger than elsewhere. Answer given: the site's Aurora normally runs at opacity .46 (homepage confinement act .38) with an oval weighting mask. In `what-we-do.css` under "9. Tailored to you" I overrode it to opacity .78 and replaced the mask with a plain top and bottom fade, so it is several times stronger. I did that without measuring contrast against the glass copy block. NOT changed yet. Recommended fix if TJ wants consistency: delete that override. Wait for TJ's choice.

TJ then asked for colour studies with no copy:
- `aurora-variants.html`: eight variants on the original construction (pale ground), numbered.
- `aurora-variants-2.html`: the reverse construction, dark brand colour as the ground and light colour as the movement, eight variants, each followed by a calm twin (sixteen bands, labelled "1", "1 calm" and so on). A copy sits at the project root as `Fuchsia-variants.html` (a plain copy, not synced).
TJ has not chosen. Note the Brand Pack says no dark sections, so choosing a dark variant needs TJ to say it is an exception. Next step: TJ names the numbers they like, then try them in context on the tailored section.

There is also a folder `research/care-tailored` that I did not make. Look at it before assuming anything about the tailored section.

## Client situation
Amidat asked for the build to be pushed to production so she can look at the copy. TJ suspects she wants to critique unfinished design. TJ chose a short WhatsApp message saying it is live, the design is still being tinkered with, and no design notes yet. Nothing has been pushed by me. I do not know where production is hosted. Ask TJ before any deploy, and say plainly what will go live.

## Locks
`node lab/lockcheck.mjs list` shows the live list. When this was written: care.html faq locked, care.html site-header locked, v1.html site-header locked, care.html site-footer, v1.html site-footer and care.html housekeeping-zones all marked UNLOCKED for editing. Some of those lock entries were made outside this chat, so check `LOCKED.md` and the list before editing. The Stop hook `G:\My Drive\Agent\.claude\hooks\tps-lock-guard.sh` runs the check and blocks a turn if a locked section changed. It can be slow (one check ran past two minutes). Never record a lock to silence a failure.

## Still open from earlier
- Remove the booking page's duplicate logo lockup? (TJ has not answered.)
- Which other sections to lock, and whether to lock the homepage hero with its header band.
- Statement sentence, arrow chip, client sign offs on What We Do.
- Real photos for the placeholders (herbal teas, lactation drinks, outings, grocery collection).
- Not yet run: a taste skill and frontend design critique pass on the What We Do page.
- The quiet text and fine line language is not yet applied outside the zones.
- STATE.md is stale (21 Sep). Regenerate with `node lab/state.mjs > STATE.md` if you need it.

## Practical gotchas
- Long bash heredocs with quotes fail ("unexpected EOF"). Write files with the Write tool, then run them.
- Verify visually, not by reasoning: Playwright with Chrome, `export PATH="/c/Program Files/nodejs:$PATH"`, run from the prototype folder, import `playwright-core` with `channel: 'chrome'`. Desktop zones debug API: `window.__zones` (`T`, `legs`, `state()`, `scrollToT()`), scrub mode only. Save temporary test scripts in `lab/` as `_name.mjs` and delete them after.
- Do not print `G:\My Drive\Agent\.claude\settings.json`. It contains API keys.
- The Aura MCP failed to connect this session (DNS). The magic, awwwards and wavespeed MCPs are available.
- Preview screenshots for TJ go in the project, not only in the scratchpad.
