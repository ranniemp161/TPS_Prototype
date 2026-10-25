# Ami's 24 October 2026 revisions, in six batches

Source: TPS Website Revisions from Ami (Google Sheet), rows 26 to 69, logged 24 Oct 2026.
Written by Claude for TJ. Each batch is one chat. Run them in order; a later batch
assumes the earlier ones landed.

| Batch | Model | File | What | Risk |
|---|---|---|---|---|
| 1 | Haiku | batch-1-home-copy.md | Home page copy swaps | Low |
| 2 | Haiku | batch-2-bespoke-copy.md | Bespoke builder copy swaps, no engine | Low |
| 3 | Sonnet | batch-3-bespoke-structure.md | Buttons, numbered steps, treatments merge, fonts, child number | Medium |
| 4 | Sonnet | batch-4-home-structure.md | Care carousel, CTA card, testimonials move, reorder | Medium, one stop point |
| 5 | Opus | batch-5-pricing-engine.md | Daily price, meals fixed, rhythm gone, recommendations, summary | High |
| 6 | Opus | batch-6-request-a-place.md | Universal button, form, postcode gate, 7 day hold, programmes cards | High, two open decisions |

## Rules that apply to every batch (TJ's, from the tps-dev skill)

- Read `LOCKED.md` first. Header and footer are locked on every page. If a batch
  needs the header, unlock it first and lock it again only after TJ approves.
- Back up before editing: copy the file to `lab/<name>.before-<change>.<ext>.bak`.
- Edit `index/partials/site-header.html` for header changes, then run
  `python index/partials/sync-header.py`. Never edit the header inside a page.
- No em dashes or hyphens in copy. Exception: "Live-in" and "live-out" are Ami's
  own spelling and stay hyphenated (TJ, 24 Oct 2026).
- Titles end without a full stop. Every visible word is the client's copy as
  given in the brief; invent nothing.
- Use CSS tokens from `index/css/site.css`, never raw colour values. Fonts:
  `--f-display` Instrument Serif, `--f-body` Montserrat, `--f-read` Karla,
  `--f-script` Quentin, `--f-mono` IBM Plex Mono.
- Verify by looking. After the edits run, from `postpartum-prototype/`:
  `node lab/shot.mjs index/<page>.html lab/shots/<page>-<batch>-1440.png 1440`
  and the same at `390`. Open both and check the section you changed.
- Run `node lab/lockcheck.mjs check` and `python index/partials/sync-header.py --check`
  before reporting. Both must pass.
- Do not commit or push. Do not touch files the brief does not name.
- Report: what changed, the two screenshot paths, anything that did not match
  the brief. Then stop. TJ flips the sheet rows to Green after he has looked.

## Paths

Project: `G:\My Drive\Rannie and Tj's Projects\The Post Partum Suit\postpartum-prototype\`
Pages: `index/*.html`. Styles: `index/css/`. Scripts: `index/js/`.
Sheet: https://docs.google.com/spreadsheets/d/1ziiIahEREwUCC_YBXI0KGEzlDOFR1rjPCgSuPa_GxVg/edit
