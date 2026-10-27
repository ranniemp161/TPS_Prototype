# Palette Phase 3 brief (Opus, 26 Oct 2026)

Project: G:\My Drive\Rannie and Tj's Projects\The Post Partum Suit\postpartum-prototype\
Read first: PALETTE-PLAN.md sections 4, 5, 7 and 13; the PALETTE LAYER and PALETTE DERIVATION blocks at the top of index/css/site.css; lab/palette-inventory.md, especially "Role assignment rules" at its end.

## The job
Make every colour in your files read a role token. Two kinds of edit:
1. Raw colours: replace each raw value in your files with its role, using the table in "Role assignment rules". The "Leave as is" list stays raw.
2. Old token names: retarget every `var(--ember)`, `var(--ember-deep)`, `var(--coral-mid)`, `var(--coral-deep)`, `var(--blush)`, `var(--rose-mist)`, `var(--sand)`, `var(--haze)`, `var(--canvas)`, `var(--paper)`, `var(--ink)`, `var(--ink-soft)`, `var(--ink-mute)`, `var(--action)`, `var(--action-hover)`, `var(--hairline)`, `var(--hairline-firm)` to its role, judged by what the rule colours, per the "Old token names inside rules" list. Plain mapping where the job is just a ground or text: canvas to --g-canvas, paper to --g-paper, blush to --g-tint, rose-mist to --g-soft, sand to --g-stone, haze to --g-haze, ink to --t-ink, ink-soft to --t-soft, ink-mute to --t-mute (or --g-dark when it is a background), hairline to --line, hairline-firm to --line-firm. Accent names depend on the job: --acc, --acc-hover, --reach-script, --reach-link, --reach-price, --focus, --err, --rib-1 to --rib-4.
   Rule of thumb for the accent: a filled button, a selected state, a toggle, a slider dot or fill is --acc. Text set in the Quentin font (--f-script) is --reach-script. An underline or link colour is --reach-link. A price figure is --reach-price. A gradient stop inside an aurora or ribbon recipe is a --rib role.
Do NOT edit the PALETTE LAYER or PALETTE DERIVATION blocks or the alias list in site.css. Do not edit index/js/build-your-programme-pricing.js ever. Do not change behaviour, layout, copy or anything that is not a colour.
In JS files, colours set from script: replace hex with `getComputedStyle(document.documentElement).getPropertyValue('--role').trim()` only where it is simple; if a colour is used in arithmetic (rgb maths), leave it and list it in your report.
In HTML inline styles (gifts.html has a background recipe in raw hex), replace with var() roles.
If a value is not covered by the rules, do not guess: leave it and list it in your report with file, line and context.

## Before you start
Back up each file you will edit: copy to lab/<name>.before-palette-roles.<ext>.bak (site.css already has a backup; skip it).

## Acceptance (all must pass before you report)
1. `node lab/palette-shots.mjs --set <yourset>` then `node lab/palette-diff.mjs before <yourset>`: every file must be "same" (0 px). The coral values are the same colours, so any difference means a wrong role. Find and fix it. Note: a run where only home-1440 differs by about 3242 px in the "What is Postpartum Care?" heading area is a known flake of the shot tool; re-run once to clear it.
2. `python index/partials/sync-header.py --check` and `python index/partials/sync-footer.py --check` all ok. If you edit a header or footer colour, edit the partial in index/partials/ and run the sync script without --check.
3. No em dashes added: grep your edited files for the em dash character.
4. Report: files edited, counts of raw values replaced and old token uses retargeted per file, every value left and why, and the diff result. Keep it short.
