# Palette inventory: The Postpartum Suite index folder

Scope: `index/css/*.css`, `index/*.html` (inline `<style>`, `style` attributes, SVG colour attributes, theme-colour meta tags and inline `<script>`), `index/js/*.js`, and `index/partials/*.html` (listed as source; its markup is stamped into each page). Raw values only: `var(--...)` uses are not listed. Named colours are listed only where they are colour values (`white`, `black`, `transparent`). Colour values inside comments are included and marked `comment (not rendered)`. Runtime-built colour strings (rgb built from variables in JS) are not raw values and are not listed.

## Token definitions in site.css :root

| token | value | line |
|---|---|---|
| `--canvas` | `#F3EFEC` | 19 |
| `--paper` | `#FFFFFF` | 20 |
| `--blush` | `#E2CAC6` | 21 |
| `--rose-mist` | `#D7C2C9` | 22 |
| `--ink` | `#0A0A0A` | 25 |
| `--ink-soft` | `#2C2C2C` | 26 |
| `--ink-mute` | `#5A524F` | 27 |
| `--coral-mid` | `#C86D58` | 30 |
| `--coral-deep` | `#B95A4B` | 31 |
| `--ember` | `#A64C45` | 32 |
| `--ember-deep` | `#8C362F` | 33 |
| `--sand` | `#C9B9B5` | 36 |
| `--haze` | `#E3D7D3` | 37 |
| `--action` | `var(--ember)` | 40 |
| `--action-hover` | `var(--ember-deep)` | 41 |
| `--emphasis` | `var(--ember)` | 42 |
| `--rule` | `var(--sand)` | 43 |
| `--hairline` | `rgba(10, 10, 10, .08)` | 44 |
| `--hairline-firm` | `rgba(10, 10, 10, .14)` | 45 |
| `--tline-track` | `rgba(10, 10, 10, .12)` | 91 |
| `--tline-ink` | `var(--ember-deep)` | 92 |

The `:root` block starts at line 17. Raw values in these lines are also listed in the site.css section below.

## css/about.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 75 | `rgba(226, 202, 198, .35)` | `.os-founders` | background gradient stop | background gradient stop in os founders | |
| 96 | `rgba(243, 239, 236, .6)` | `.os-trad__band::after` | background gradient stop | background gradient stop in os trad band after | |
| 96 | `rgba(243, 239, 236, 0)` | `.os-trad__band::after` | background gradient stop | background gradient stop in os trad band after | |
| 97 | `rgba(243, 239, 236, .62)` | `.os-trad__card` | background | background on os trad card | |

## css/booking.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 10 | `#f5f5f5` | `(top level)` | comment (not rendered) | comment only, not rendered | |
| 11 | `#F3EFEC` | `(top level)` | comment (not rendered) | comment only, not rendered | |
| 11 | `#fefefe` | `(top level)` | comment (not rendered) | comment only, not rendered | |
| 11 | `#FFFFFF` | `(top level)` | comment (not rendered) | comment only, not rendered | |
| 63 | `#CA8882` | `.bk-aurora` | --aurora-soft | custom property --aurora-soft defined on bk aurora | |
| 64 | `#D66F4E` | `.bk-aurora` | --aurora-warm | custom property --aurora-warm defined on bk aurora | |
| 70 | `transparent` | `.bk-aurora` | --aurora-comb gradient stop | custom property --aurora-comb gradient stop defined on bk aurora | |
| 71 | `transparent` | `.bk-aurora` | --aurora-comb gradient stop | custom property --aurora-comb gradient stop defined on bk aurora | |
| 95 | `black` | `.bk-aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in bk aurora | |
| 95 | `transparent` | `.bk-aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in bk aurora | |
| 96 | `black` | `.bk-aurora` | mask-image gradient stop | mask-image gradient stop in bk aurora | |
| 96 | `transparent` | `.bk-aurora` | mask-image gradient stop | mask-image gradient stop in bk aurora | |
| 209 | `transparent` | `.bk-hero__strip` | --notch gradient stop | custom property --notch gradient stop defined on bk hero strip | |
| 210 | `transparent` | `.bk-hero__strip` | --notch gradient stop | custom property --notch gradient stop defined on bk hero strip | |
| 211 | `#000` | `.bk-hero__strip` | --notch gradient stop | custom property --notch gradient stop defined on bk hero strip | |
| 549 | `rgba(226, 202, 198, .35)` | `.bk-pick input:checked ~ .bk-card` | background | background on bk pick input checked ~ bk card | |
| 574 | `rgba(226, 202, 198, .4)` | `.bk-tile` | background | background on bk tile | |
| 651 | `rgba(166, 76, 69, .25)` | `.bk-pick input:checked ~ .bk-card .bk-card__desc` | border-top-color | border-top-color on bk pick input checked ~ bk card bk card desc | |
| 721 | `transparent` | `.bk-tick` | color | text colour on bk tick | |
| 830 | `transparent` | `.bk-day:disabled` | border-color | border-color on bk day disabled | |
| 832 | `rgba(90, 82, 79, .35)` | `.bk-day:disabled` | color | text colour on bk day disabled | |
| 960 | `transparent` | `.bk-shell input` | background | background on bk shell input | |
| 1012 | `rgba(226, 202, 198, .35)` | `.bk-refusal` | background | background on bk refusal | |
| 1092 | `rgba(226, 202, 198, .35)` | `.bk-submit-error` | background | background on bk submit error | |
| 1131 | `transparent` | `.bk-btn` | border | border on bk btn | |
| 1241 | `rgba(10, 10, 10, .45)` | `.bk-dialog::backdrop` | background | background on bk dialog backdrop | |
| 1328 | `rgba(226, 202, 198, .4)` | `.bk-dialog__x:hover` | background | background on bk dialog x (hover) | |
| 1451 | `rgba(90, 82, 79, .7)` | `.bk-done__terms` | color | text colour on bk done terms | |
| 1477 | `rgba(243, 239, 236, .78)` | `.bk-hero__strip::after` | background gradient stop | background gradient stop in bk hero strip after | |
| 1477 | `rgba(243, 239, 236, 0)` | `.bk-hero__strip::after` | background gradient stop | background gradient stop in bk hero strip after | |

## css/build-your-programme.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 457 | `rgba(255, 255, 255, 0)` | `.summary__body` | background gradient stop | background gradient stop in summary body | |
| 458 | `rgba(255, 255, 255, 0)` | `.summary__body` | background gradient stop | background gradient stop in summary body | |
| 470 | `transparent` | `.summary__body` | scrollbar-color | scrollbar-color on summary body | |
| 474 | `transparent` | `.summary__body::-webkit-scrollbar-track` | background | background on summary body webkit scrollbar track | |
| 480 | `transparent` | `.summary__body::-webkit-scrollbar-thumb` | border | border on summary body webkit scrollbar thumb | |
| 535 | `transparent` | `.summary__tab` | border-bottom | border-bottom on summary tab | |
| 645 | `rgba(226, 202, 198, 0)` | `0%, 100%` | background-color | background-color on 0%, 100% | |
| 646 | `rgba(226, 202, 198, .5)` | `15%, 55%` | background-color | background-color on 15%, 55% | |
| 787 | `transparent` | `.budget__input` | background | background on budget input | |
| 899 | `transparent` | `.shape__grid` | --day-rule | custom property --day-rule defined on shape grid | |
| 1170 | `transparent` | `.act--close-builder .close` | background | background on act close builder close | |
| 1308 | `rgba(243, 239, 236, .62)` | `.ticker` | background | background on ticker | |
| 1486 | `rgba(243, 239, 236, .70)` | `.dk-start__copy::before` | background | background on dk start copy before | |
| 1488 | `rgba(0,0,0,1.000)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1488 | `rgba(0,0,0,0.957)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1488 | `rgba(0,0,0,0.844)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1488 | `rgba(0,0,0,0.684)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1488 | `rgba(0,0,0,0.500)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1488 | `rgba(0,0,0,0.316)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1488 | `rgba(0,0,0,0.156)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1488 | `rgba(0,0,0,0.043)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1488 | `rgba(0,0,0,0.000)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1489 | `rgba(0,0,0,1.000)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1489 | `rgba(0,0,0,0.957)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1489 | `rgba(0,0,0,0.844)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1489 | `rgba(0,0,0,0.684)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1489 | `rgba(0,0,0,0.500)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1489 | `rgba(0,0,0,0.316)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1489 | `rgba(0,0,0,0.156)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1489 | `rgba(0,0,0,0.043)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1489 | `rgba(0,0,0,0.000)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1529 | `transparent` | `.dk-sum .area__jump` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on dk sum area jump | |
| 1562 | `rgba(243, 239, 236, .62)` | `.dk-bar` | background | background on dk bar | |
| 1585 | `transparent` | `.dk-link` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on dk link | |
| 1614 | `transparent` | `.dk-line__win` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk line win | |
| 1614 | `#000` | `.dk-line__win` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk line win | |
| 1615 | `transparent` | `.dk-line__win` | mask-image gradient stop | mask-image gradient stop in dk line win | |
| 1615 | `#000` | `.dk-line__win` | mask-image gradient stop | mask-image gradient stop in dk line win | |
| 1630 | `transparent` | `.dk-line__stop` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on dk line stop | |
| 1656 | `rgba(0,0,0,0.000)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1656 | `rgba(0,0,0,0.043)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1656 | `rgba(0,0,0,0.156)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1656 | `rgba(0,0,0,0.316)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1656 | `rgba(0,0,0,0.500)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1656 | `rgba(0,0,0,0.684)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1656 | `rgba(0,0,0,0.844)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1656 | `rgba(0,0,0,0.957)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1656 | `rgba(0,0,0,1.000)` | `.dk-start__copy::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dk start copy before | |
| 1657 | `rgba(0,0,0,0.000)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1657 | `rgba(0,0,0,0.043)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1657 | `rgba(0,0,0,0.156)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1657 | `rgba(0,0,0,0.316)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1657 | `rgba(0,0,0,0.500)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1657 | `rgba(0,0,0,0.684)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1657 | `rgba(0,0,0,0.844)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1657 | `rgba(0,0,0,0.957)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1657 | `rgba(0,0,0,1.000)` | `.dk-start__copy::before` | mask-image gradient stop | mask-image gradient stop in dk start copy before | |
| 1728 | `transparent` | `.dkl__end` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on dkl end | |
| 1749 | `transparent` | `.dkl__half` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on dkl half | |
| 1799 | `transparent` | `.dkd__day` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on dkd day | |
| 1816 | `transparent` | `.dkd__zone` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on dkd zone | |
| 1848 | `transparent` | `.dk-dot` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on dk dot | |
| 1851 | `transparent` | `.dk-dot::before` | background | background on dk dot before | |
| 1854 | `transparent` | `.dk-dot:has(input:checked)::before, input:checked + .dk-dot::before, .dk-dot[aria-checked="true"]::before` | border-color | border-color on dk dot has(input checked) before, input checked + dk dot before, dk dot[aria checked="true"] before | |
| 2157 | `#8F8480` | `.tgl` | --tg-off | custom property --tg-off defined on tgl | |
| 2163 | `transparent` | `.tg` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on tg | |
| 2184 | `transparent` | `.tg__sw` | background | background on tg sw | |
| 2293 | `transparent` | `.dk-next.btn[aria-disabled="true"]` | background | background on dk next btn[aria disabled="true"] | |
| 2340 | `transparent` | `.capture__email` | background | background on capture email | |
| 2524 | `transparent` | `.dk-decide__no` | background | background on dk decide no | |
| 2524 | `#8F8480` | `.dk-decide__no` | border | border on dk decide no | |
| 2675 | `rgba(10, 10, 10, .14)` | `.rq-phone__cc` | border | border on rq phone cc | |
| 2675 | `rgba(255, 255, 255, .6)` | `.rq-phone__cc` | background | background on rq phone cc | |

## css/footer.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 8 | `#5A524F` | `.sf` | --sf-ground | custom property --sf-ground defined on sf | |
| 9 | `#FFFFFF` | `.sf` | --sf-text | custom property --sf-text defined on sf | |
| 10 | `#FFFFFF` | `.sf` | --sf-soft | custom property --sf-soft defined on sf | |
| 11 | `#FFFFFF` | `.sf` | --sf-mute | custom property --sf-mute defined on sf | |
| 12 | `rgba(255, 255, 255, .4)` | `.sf` | --sf-rule | custom property --sf-rule defined on sf | |
| 28 | `transparent` | `.sf__field` | background-image gradient stop | background-image gradient stop in sf field | |
| 28 | `#E2CAC6` | `.sf__field` | background-image gradient stop | background-image gradient stop in sf field | |
| 28 | `#D7C2C9` | `.sf__field` | background-image gradient stop | background-image gradient stop in sf field | |
| 28 | `#E3D7D3` | `.sf__field` | background-image gradient stop | background-image gradient stop in sf field | |
| 33 | `#000` | `.sf__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in sf field | |
| 33 | `rgba(0,0,0,.55)` | `.sf__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in sf field | |
| 33 | `rgba(0,0,0,.22)` | `.sf__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in sf field | |
| 34 | `#000` | `.sf__field` | mask-image gradient stop | mask-image gradient stop in sf field | |
| 34 | `rgba(0,0,0,.55)` | `.sf__field` | mask-image gradient stop | mask-image gradient stop in sf field | |
| 34 | `rgba(0,0,0,.22)` | `.sf__field` | mask-image gradient stop | mask-image gradient stop in sf field | |
| 39 | `transparent` | `.sf__field::after` | background-image gradient stop | background-image gradient stop in sf field after | |
| 39 | `#D7C2C9` | `.sf__field::after` | background-image gradient stop | background-image gradient stop in sf field after | |
| 39 | `#F3EFEC` | `.sf__field::after` | background-image gradient stop | background-image gradient stop in sf field after | |
| 39 | `#E2CAC6` | `.sf__field::after` | background-image gradient stop | background-image gradient stop in sf field after | |
| 44 | `#F3EFEC` | `.sf__aurora::after` | background | background on sf aurora after | |

## css/house-flight.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 29 | `transparent` | `.flight.is-reveal` | background | background on flight is reveal | |
| 310 | `rgba(243, 239, 236, .62)` | `.deskcard` | background | background on deskcard | |
| 344 | `rgba(90, 82, 79, .9)` | `.deskcard .cards__name` | color | text colour on deskcard cards name | |
| 351 | `rgba(90, 82, 79, .38)` | `.deskcard .cards__line` | background | background on deskcard cards line | |
| 357 | `rgba(90, 82, 79, .78)` | `.deskcard .cards__desc` | color | text colour on deskcard cards desc | |
| 409 | `rgba(90, 82, 79, .9)` | `.cards__card .cards__name` | color | text colour on cards card cards name | |
| 411 | `rgba(90, 82, 79, .38)` | `.cards__card .cards__line` | background | background on cards card cards line | |
| 414 | `rgba(90, 82, 79, .78)` | `.cards__card .cards__desc` | color | text colour on cards card cards desc | |
| 512 | `transparent` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 512 | `rgba(0, 0, 0, .22)` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 512 | `rgba(0, 0, 0, .55)` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 512 | `rgba(0, 0, 0, .84)` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 512 | `#000` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 513 | `#000` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 513 | `rgba(0, 0, 0, .98)` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 513 | `rgba(0, 0, 0, .93)` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 514 | `rgba(0, 0, 0, .84)` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 514 | `rgba(0, 0, 0, .71)` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 514 | `rgba(0, 0, 0, .54)` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 515 | `rgba(0, 0, 0, .34)` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 515 | `rgba(0, 0, 0, .14)` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 515 | `transparent` | `.flight__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight film | |
| 517 | `transparent` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 517 | `rgba(0, 0, 0, .22)` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 517 | `rgba(0, 0, 0, .55)` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 517 | `rgba(0, 0, 0, .84)` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 517 | `#000` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 518 | `#000` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 518 | `rgba(0, 0, 0, .98)` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 518 | `rgba(0, 0, 0, .93)` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 519 | `rgba(0, 0, 0, .84)` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 519 | `rgba(0, 0, 0, .71)` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 519 | `rgba(0, 0, 0, .54)` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 520 | `rgba(0, 0, 0, .34)` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 520 | `rgba(0, 0, 0, .14)` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 520 | `transparent` | `.flight__film` | mask-image gradient stop | mask-image gradient stop in flight film | |
| 545 | `transparent` | `.flight__aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight aurora | |
| 545 | `rgba(0, 0, 0, .12)` | `.flight__aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight aurora | |
| 545 | `rgba(0, 0, 0, .32)` | `.flight__aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight aurora | |
| 546 | `rgba(0, 0, 0, .58)` | `.flight__aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight aurora | |
| 546 | `rgba(0, 0, 0, .82)` | `.flight__aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight aurora | |
| 546 | `#000` | `.flight__aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight aurora | |
| 548 | `transparent` | `.flight__aurora` | mask-image gradient stop | mask-image gradient stop in flight aurora | |
| 548 | `rgba(0, 0, 0, .12)` | `.flight__aurora` | mask-image gradient stop | mask-image gradient stop in flight aurora | |
| 548 | `rgba(0, 0, 0, .32)` | `.flight__aurora` | mask-image gradient stop | mask-image gradient stop in flight aurora | |
| 549 | `rgba(0, 0, 0, .58)` | `.flight__aurora` | mask-image gradient stop | mask-image gradient stop in flight aurora | |
| 549 | `rgba(0, 0, 0, .82)` | `.flight__aurora` | mask-image gradient stop | mask-image gradient stop in flight aurora | |
| 549 | `#000` | `.flight__aurora` | mask-image gradient stop | mask-image gradient stop in flight aurora | |
| 568 | `transparent` | `.flight__ghost` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight ghost | |
| 568 | `#000` | `.flight__ghost` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight ghost | |
| 568 | `rgba(0, 0, 0, .7)` | `.flight__ghost` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight ghost | |
| 569 | `rgba(0, 0, 0, .45)` | `.flight__ghost` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight ghost | |
| 569 | `rgba(0, 0, 0, .35)` | `.flight__ghost` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight ghost | |
| 569 | `transparent` | `.flight__ghost` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in flight ghost | |
| 571 | `transparent` | `.flight__ghost` | mask-image gradient stop | mask-image gradient stop in flight ghost | |
| 571 | `#000` | `.flight__ghost` | mask-image gradient stop | mask-image gradient stop in flight ghost | |
| 571 | `rgba(0, 0, 0, .7)` | `.flight__ghost` | mask-image gradient stop | mask-image gradient stop in flight ghost | |
| 572 | `rgba(0, 0, 0, .45)` | `.flight__ghost` | mask-image gradient stop | mask-image gradient stop in flight ghost | |
| 572 | `rgba(0, 0, 0, .35)` | `.flight__ghost` | mask-image gradient stop | mask-image gradient stop in flight ghost | |
| 572 | `transparent` | `.flight__ghost` | mask-image gradient stop | mask-image gradient stop in flight ghost | |
| 606 | `rgba(10, 10, 10, .32)` | `.cards__card .cards__line` | background | background on cards card cards line | |
| 702 | `transparent` | `.zones__poster, .zones__video` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in zones poster, zones video | |
| 702 | `#000` | `.zones__poster, .zones__video` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in zones poster, zones video | |
| 704 | `transparent` | `.zones__poster, .zones__video` | mask-image gradient stop | mask-image gradient stop in zones poster, zones video | |
| 704 | `#000` | `.zones__poster, .zones__video` | mask-image gradient stop | mask-image gradient stop in zones poster, zones video | |
| 794 | `transparent` | `.zones__rooms button` | background | background on zones rooms button | |
| 866 | `transparent` | `.zones__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in zones film | |
| 866 | `#000` | `.zones__film` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in zones film | |
| 868 | `transparent` | `.zones__film` | mask-image gradient stop | mask-image gradient stop in zones film | |
| 868 | `#000` | `.zones__film` | mask-image gradient stop | mask-image gradient stop in zones film | |
| 899 | `transparent` | `.zones__tab` | background | background on zones tab | |
| 900 | `transparent` | `.zones__tab` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on zones tab | |
| 916 | `transparent` | `.zones__home` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on zones home | |
| 967 | `#000` | `.route` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in route | |
| 967 | `transparent` | `.route` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in route | |
| 968 | `#000` | `.route` | mask-image gradient stop | mask-image gradient stop in route | |
| 968 | `transparent` | `.route` | mask-image gradient stop | mask-image gradient stop in route | |
| 989 | `rgba(243, 239, 236, .9)` | `.route__wash` | background gradient stop | background gradient stop in route wash | |
| 990 | `rgba(243, 239, 236, .82)` | `.route__wash` | background gradient stop | background gradient stop in route wash | |
| 991 | `rgba(243, 239, 236, .4)` | `.route__wash` | background gradient stop | background gradient stop in route wash | |
| 992 | `rgba(243, 239, 236, .12)` | `.route__wash` | background gradient stop | background gradient stop in route wash | |
| 993 | `rgba(243, 239, 236, 0)` | `.route__wash` | background gradient stop | background gradient stop in route wash | |
| 1057 | `transparent` | `.route__stops button.route__name` | background | background on route stops button route name | |
| 1100 | `transparent` | `.route__stops button.route__head` | background | background on route stops button route head | |
| 1227 | `rgba(10, 10, 10, .22)` | `.route__stop:not(.is-born) .route__dot` | background | background on route stop not( is born) route dot | |

## css/inner-pages.css

No raw colour values.

## css/programmes.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 32 | `rgba(243, 239, 236, .55)` | `.pg-hero__wash` | background gradient stop | background gradient stop in pg hero wash | |
| 32 | `rgba(243, 239, 236, 0)` | `.pg-hero__wash` | background gradient stop | background gradient stop in pg hero wash | |
| 33 | `rgba(243, 239, 236, 0)` | `.pg-hero__wash` | background gradient stop | background gradient stop in pg hero wash | |
| 33 | `rgba(243, 239, 236, .9)` | `.pg-hero__wash` | background gradient stop | background gradient stop in pg hero wash | |
| 34 | `rgba(243, 239, 236, .68)` | `.pg-hero__wash` | background gradient stop | background gradient stop in pg hero wash | |
| 84 | `#000` | `.pg-lengths .aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in pg lengths aurora | |
| 84 | `transparent` | `.pg-lengths .aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in pg lengths aurora | |
| 85 | `#000` | `.pg-lengths .aurora` | mask-image gradient stop | mask-image gradient stop in pg lengths aurora | |
| 85 | `transparent` | `.pg-lengths .aurora` | mask-image gradient stop | mask-image gradient stop in pg lengths aurora | |
| 88 | `rgba(166, 76, 69, .18)` | `.pg-lengths .pg-card` | border-color | border-color on pg lengths pg card | |
| 88 | `rgba(140, 54, 47, .28)` | `.pg-lengths .pg-card` | box-shadow | box-shadow on pg lengths pg card | |
| 109 | `transparent` | `.pg-car` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in pg car | |
| 109 | `#000` | `.pg-car` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in pg car | |
| 110 | `transparent` | `.pg-car` | mask-image gradient stop | mask-image gradient stop in pg car | |
| 110 | `#000` | `.pg-car` | mask-image gradient stop | mask-image gradient stop in pg car | |
| 137 | `rgba(255, 255, 255, .62)` | `.pg-card` | background | background on pg card | |
| 137 | `rgba(255, 255, 255, .7)` | `.pg-card` | border | border on pg card | |
| 194 | `rgba(10, 10, 10, .14)` | `.pg-kind` | border-top | border-top on pg kind | |
| 214 | `rgba(255, 255, 255, .62)` | `.pg-tablecard, .pg-pricing` | background | background on pg tablecard, pg pricing | |
| 214 | `rgba(166, 76, 69, .18)` | `.pg-tablecard, .pg-pricing` | border | border on pg tablecard, pg pricing | |
| 220 | `rgba(10, 10, 10, .14)` | `.pg-table thead th` | border-bottom | border-bottom on pg table thead th | |
| 229 | `rgba(10, 10, 10, .14)` | `.pg-table tbody th[scope="row"]` | border-bottom | border-bottom on pg table tbody th[scope="row"] | |
| 234 | `rgba(10, 10, 10, .14)` | `.pg-table td` | border-bottom | border-bottom on pg table td | |
| 248 | `rgba(10, 10, 10, .14)` | `.pg-pricing__list li + li` | border-left | border-left on pg pricing list li + li | |
| 265 | `rgba(10, 10, 10, .14)` | `.pg-table tbody tr:not(.pg-table__group)` | border-bottom | border-bottom on pg table tbody tr not( pg table group) | |
| 278 | `rgba(10, 10, 10, .14)` | `.pg-pricing__list li + li` | border-top | border-top on pg pricing list li + li | |
| 296 | `transparent` | `.pg-cta .aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in pg cta aurora | |
| 296 | `#000` | `.pg-cta .aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in pg cta aurora | |
| 297 | `transparent` | `.pg-cta .aurora` | mask-image gradient stop | mask-image gradient stop in pg cta aurora | |
| 297 | `#000` | `.pg-cta .aurora` | mask-image gradient stop | mask-image gradient stop in pg cta aurora | |
| 395 | `rgba(10, 10, 10, .14)` | `.pg-care` | border-left | border-left on pg care | |
| 397 | `rgba(10, 10, 10, .08)` | `.pg-care__row` | border-top | border-top on pg care row | |
| 404 | `rgba(10, 10, 10, .14)` | `.pg-care` | border-top | border-top on pg care | |

## css/request.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 14 | `rgba(10, 10, 10, .14)` | `.rq-input` | border | border on rq input | |
| 14 | `rgba(255, 255, 255, .85)` | `.rq-input` | background | background on rq input | |
| 37 | `rgba(10, 10, 10, .14)` | `.rq-phone__cc` | border | border on rq phone cc | |
| 37 | `rgba(255, 255, 255, .6)` | `.rq-phone__cc` | background | background on rq phone cc | |
| 57 | `rgba(10, 10, 10, .1)` | `.rq-cal` | border | border on rq cal | |
| 58 | `rgba(10, 10, 10, .28)` | `.rq-cal` | box-shadow | box-shadow on rq cal | |
| 87 | `transparent` | `.page--request .pg-lengths .aurora--voices .aurora__field` | --a | custom property --a defined on page request pg lengths aurora voices aurora field | |
| 88 | `transparent` | `.page--request .pg-lengths .aurora--voices .aurora__field` | --b | custom property --b defined on page request pg lengths aurora voices aurora field | |
| 90 | `rgba(0,0,0,.25)` | `.page--request .pg-lengths .aurora--voices .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in page request pg lengths aurora voices aurora field | |
| 90 | `#000` | `.page--request .pg-lengths .aurora--voices .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in page request pg lengths aurora voices aurora field | |
| 91 | `rgba(0,0,0,.25)` | `.page--request .pg-lengths .aurora--voices .aurora__field` | mask-image gradient stop | mask-image gradient stop in page request pg lengths aurora voices aurora field | |
| 91 | `#000` | `.page--request .pg-lengths .aurora--voices .aurora__field` | mask-image gradient stop | mask-image gradient stop in page request pg lengths aurora voices aurora field | |

## css/site.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 19 | `#F3EFEC` | `:root` | --canvas | custom property --canvas defined on root | |
| 20 | `#FFFFFF` | `:root` | --paper | custom property --paper defined on root | |
| 21 | `#E2CAC6` | `:root` | --blush | custom property --blush defined on root | |
| 22 | `#D7C2C9` | `:root` | --rose-mist | custom property --rose-mist defined on root | |
| 25 | `#0A0A0A` | `:root` | --ink | custom property --ink defined on root | |
| 26 | `#2C2C2C` | `:root` | --ink-soft | custom property --ink-soft defined on root | |
| 27 | `#5A524F` | `:root` | --ink-mute | custom property --ink-mute defined on root | |
| 30 | `#C86D58` | `:root` | --coral-mid | custom property --coral-mid defined on root | |
| 31 | `#B95A4B` | `:root` | --coral-deep | custom property --coral-deep defined on root | |
| 32 | `#A64C45` | `:root` | --ember | custom property --ember defined on root | |
| 33 | `#8C362F` | `:root` | --ember-deep | custom property --ember-deep defined on root | |
| 36 | `#C9B9B5` | `:root` | --sand | custom property --sand defined on root | |
| 37 | `#E3D7D3` | `:root` | --haze | custom property --haze defined on root | |
| 44 | `rgba(10, 10, 10, .08)` | `:root` | --hairline | custom property --hairline defined on root | |
| 45 | `rgba(10, 10, 10, .14)` | `:root` | --hairline-firm | custom property --hairline-firm defined on root | |
| 91 | `rgba(10, 10, 10, .12)` | `:root` | --tline-track | custom property --tline-track defined on root | |
| 316 | `transparent` | `.btn--outline` | background | background on btn outline | |
| 354 | `transparent` | `.nav` | background | background on nav | |
| 545 | `rgba(243, 239, 236, .62)` | `.tab` | background | background on tab | |
| 573 | `rgba(140, 127, 121, .46)` | `.nav.is-dark .tab` | background | background on nav is dark tab | |
| 576 | `rgba(255, 255, 255, .22)` | `.nav.is-dark .tab` | border-color | border-color on nav is dark tab | |
| 581 | `rgba(243, 239, 236, .86)` | `.tab:hover` | background | background on tab (hover) | |
| 581 | `rgba(10, 10, 10, .18)` | `.tab:hover` | border-color | border-color on tab (hover) | |
| 582 | `rgba(140, 127, 121, .62)` | `.nav.is-dark .tab:hover` | background | background on nav is dark tab (hover) | |
| 607 | `rgba(140, 127, 121, .78)` | `.tab--menu[aria-expanded="true"], .nav.is-dark .tab--menu[aria-expanded="true"]` | background | background on tab menu[aria expanded="true"], nav is dark tab menu[aria expanded="true"] | |
| 645 | `rgba(243, 239, 236, .62)` | `.nav--glass::before` | background | background on nav glass before | |
| 651 | `rgba(140, 127, 121, .46)` | `.nav--glass.is-dark::before` | background | background on nav glass is dark before | |
| 656 | `transparent` | `.nav--glass .tab:not(.tab--cta), .nav--glass.is-dark .tab:not(.tab--cta)` | background | background on nav glass tab not( tab cta), nav glass is dark tab not( tab cta) | |
| 657 | `transparent` | `.nav--glass .tab:not(.tab--cta), .nav--glass.is-dark .tab:not(.tab--cta)` | border-color | border-color on nav glass tab not( tab cta), nav glass is dark tab not( tab cta) | |
| 663 | `transparent` | `.nav--glass .tab:not(.tab--cta):hover, .nav--glass.is-dark .tab:not(.tab--cta):hover` | background | background on nav glass tab not( tab cta) (hover), nav glass is dark tab not( tab cta) (hover) | |
| 827 | `transparent` | `.nav.nav--glass.is-open .nav__side--l .nav__tabs` | background | background on nav nav glass is open nav side l nav tabs | |
| 838 | `transparent` | `.nav.nav--glass.is-open .nav__side--l .nav__tabs .tab` | background | background on nav nav glass is open nav side l nav tabs tab | |
| 839 | `transparent` | `.nav.nav--glass.is-open .nav__side--l .nav__tabs .tab` | border-color | border-color on nav nav glass is open nav side l nav tabs tab | |
| 844 | `transparent` | `.nav.nav--glass.is-open .nav__side--l .nav__tabs .tab[aria-expanded="true"]` | background | background on nav nav glass is open nav side l nav tabs tab[aria expanded="true"] | |
| 872 | `transparent` | `.nav--glass .tab[aria-expanded="true"]:not(.tab--cta), .nav--glass.is-dark .tab[aria-expanded="true"]:not(.tab--cta), .nav--glass .tab--menu[aria-expanded="true"], .nav--glass.is-dark .tab--menu[aria-expanded="true"]` | background | background on nav glass tab[aria expanded="true"] not( tab cta), nav glass is dark tab[aria expanded="true"] not( tab cta), nav glass tab menu[aria expanded="true"], nav glass is dark tab menu[aria expanded="true"] | |
| 997 | `rgba(243, 239, 236, .55)` | `.veil` | background | background on veil | |
| 1029 | `transparent` | `.nav.is-open .nav__side--l .nav__tabs .tab` | border-color | border-color on nav is open nav side l nav tabs tab | |
| 1079 | `rgba(243,239,236,.90)` | `.scrim--lead` | background gradient stop | background gradient stop in scrim lead | |
| 1080 | `rgba(243,239,236,.80)` | `.scrim--lead` | background gradient stop | background gradient stop in scrim lead | |
| 1081 | `rgba(243,239,236,.48)` | `.scrim--lead` | background gradient stop | background gradient stop in scrim lead | |
| 1082 | `rgba(243,239,236,.10)` | `.scrim--lead` | background gradient stop | background gradient stop in scrim lead | |
| 1083 | `rgba(243,239,236,0)` | `.scrim--lead` | background gradient stop | background gradient stop in scrim lead | |
| 1089 | `rgba(10,10,10,.30)` | `.scrim--band` | background gradient stop | background gradient stop in scrim band | |
| 1090 | `rgba(10,10,10,.12)` | `.scrim--band` | background gradient stop | background gradient stop in scrim band | |
| 1091 | `rgba(10,10,10,0)` | `.scrim--band` | background gradient stop | background gradient stop in scrim band | |
| 1310 | `transparent` | `.act--pan .stage` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in act pan stage | |
| 1310 | `#000` | `.act--pan .stage` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in act pan stage | |
| 1311 | `transparent` | `.act--pan .stage` | mask-image gradient stop | mask-image gradient stop in act pan stage | |
| 1311 | `#000` | `.act--pan .stage` | mask-image gradient stop | mask-image gradient stop in act pan stage | |
| 1475 | `rgba(10,10,10,.34)` | `.act--peak .peak__band` | background gradient stop | background gradient stop in act peak peak band | |
| 1475 | `rgba(10,10,10,0)` | `.act--peak .peak__band` | background gradient stop | background gradient stop in act peak peak band | |
| 1480 | `rgba(10,10,10,.32)` | `.act--peak .peak__band--top` | background gradient stop | background gradient stop in act peak peak band top | |
| 1480 | `rgba(10,10,10,0)` | `.act--peak .peak__band--top` | background gradient stop | background gradient stop in act peak peak band top | |
| 1624 | `transparent` | `.act--peak .peak__answer .btn` | background | background on act peak peak answer btn | |
| 1625 | `rgba(255, 255, 255, .45)` | `.act--peak .peak__answer .btn` | border | border on act peak peak answer btn | |
| 1636 | `rgba(255, 255, 255, .12)` | `.act--peak .peak__answer .btn:hover` | background | background on act peak peak answer btn (hover) | |
| 1637 | `rgba(255, 255, 255, .7)` | `.act--peak .peak__answer .btn:hover` | border-color | border-color on act peak peak answer btn (hover) | |
| 1798 | `rgba(10, 10, 10, .62)` | `.nightframe__scrim` | background gradient stop | background gradient stop in nightframe scrim | |
| 1799 | `rgba(10, 10, 10, .34)` | `.nightframe__scrim` | background gradient stop | background gradient stop in nightframe scrim | |
| 1800 | `rgba(10, 10, 10, .04)` | `.nightframe__scrim` | background gradient stop | background gradient stop in nightframe scrim | |
| 1801 | `rgba(10, 10, 10, 0)` | `.nightframe__scrim` | background gradient stop | background gradient stop in nightframe scrim | |
| 1884 | `#FFFFFF` | `.aurora__field, .aurora__field::after` | --aurora-light gradient stop | custom property --aurora-light gradient stop defined on aurora field, aurora field after | |
| 1884 | `transparent` | `.aurora__field, .aurora__field::after` | --aurora-light gradient stop | custom property --aurora-light gradient stop defined on aurora field, aurora field after | |
| 1924 | `transparent` | `.aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora field | |
| 1924 | `#000` | `.aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora field | |
| 1925 | `#000` | `.aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora field | |
| 1925 | `rgba(0,0,0,.35)` | `.aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora field | |
| 1925 | `transparent` | `.aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora field | |
| 1927 | `transparent` | `.aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora field | |
| 1927 | `#000` | `.aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora field | |
| 1928 | `#000` | `.aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora field | |
| 1928 | `rgba(0,0,0,.35)` | `.aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora field | |
| 1928 | `transparent` | `.aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora field | |
| 1947 | `#FFFFFF` | `.aurora__field::after` | background-image gradient stop | background-image gradient stop in aurora field after | |
| 1947 | `transparent` | `.aurora__field::after` | background-image gradient stop | background-image gradient stop in aurora field after | |
| 1983 | `transparent` | `.aurora--turn .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora turn aurora field | |
| 1983 | `#000` | `.aurora--turn .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora turn aurora field | |
| 1984 | `#000` | `.aurora--turn .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora turn aurora field | |
| 1984 | `rgba(0,0,0,.32)` | `.aurora--turn .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora turn aurora field | |
| 1984 | `transparent` | `.aurora--turn .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora turn aurora field | |
| 1986 | `transparent` | `.aurora--turn .aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora turn aurora field | |
| 1986 | `#000` | `.aurora--turn .aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora turn aurora field | |
| 1987 | `#000` | `.aurora--turn .aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora turn aurora field | |
| 1987 | `rgba(0,0,0,.32)` | `.aurora--turn .aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora turn aurora field | |
| 1987 | `transparent` | `.aurora--turn .aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora turn aurora field | |
| 2112 | `transparent` | `.dur__track` | background gradient stop | background gradient stop in dur track | |
| 2395 | `rgb(238, 236, 233)` | `.fog__veil` | background | background on fog veil | |
| 2436 | `transparent` | `.act--bath` | background | background on act bath | |
| 2496 | `rgba(243, 239, 236, .92)` | `.scrim--bath` | background gradient stop | background gradient stop in scrim bath | |
| 2497 | `rgba(243, 239, 236, .74)` | `.scrim--bath` | background gradient stop | background gradient stop in scrim bath | |
| 2498 | `rgba(243, 239, 236, .30)` | `.scrim--bath` | background gradient stop | background gradient stop in scrim bath | |
| 2499 | `rgba(243, 239, 236, 0)` | `.scrim--bath` | background gradient stop | background gradient stop in scrim bath | |
| 2710 | `#000` | `.bath` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in bath | |
| 2710 | `transparent` | `.bath` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in bath | |
| 2711 | `#000` | `.bath` | mask-image gradient stop | mask-image gradient stop in bath | |
| 2711 | `transparent` | `.bath` | mask-image gradient stop | mask-image gradient stop in bath | |
| 2734 | `#000` | `.film__stage` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in film stage | |
| 2734 | `transparent` | `.film__stage` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in film stage | |
| 2735 | `#000` | `.film__stage` | mask-image gradient stop | mask-image gradient stop in film stage | |
| 2735 | `transparent` | `.film__stage` | mask-image gradient stop | mask-image gradient stop in film stage | |
| 2764 | `rgba(255, 255, 255, .5)` | `.film__sound` | border | border on film sound | |
| 2766 | `rgba(243, 239, 236, .62)` | `.film__sound` | background | background on film sound | |
| 2783 | `rgba(243, 239, 236, .78)` | `.film__sound:hover` | background | background on film sound (hover) | |
| 2833 | `#000` | `.film__track` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in film track | |
| 2833 | `transparent` | `.film__track` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in film track | |
| 2834 | `#000` | `.film__track` | mask-image gradient stop | mask-image gradient stop in film track | |
| 2834 | `transparent` | `.film__track` | mask-image gradient stop | mask-image gradient stop in film track | |
| 2845 | `rgba(10, 10, 10, .26)` | `.film__line` | background | background on film line | |
| 2879 | `transparent` | `.film__video` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in film video | |
| 2879 | `#000` | `.film__video` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in film video | |
| 2880 | `transparent` | `.film__video` | mask-image gradient stop | mask-image gradient stop in film video | |
| 2880 | `#000` | `.film__video` | mask-image gradient stop | mask-image gradient stop in film video | |
| 3079 | `#000` | `.text-link` | color | text colour on text link | |
| 3210 | `transparent` | `.gal__copy::before` | background gradient stop | background gradient stop in gal copy before | |
| 3276 | `#0A0A0A` | `.voices` | --tv-fg | custom property --tv-fg defined on voices | |
| 3277 | `#737373` | `.voices` | --tv-mute | custom property --tv-mute defined on voices | |
| 3278 | `#0A0A0A` | `.voices` | --tv-accent | custom property --tv-accent defined on voices | |
| 3324 | `transparent` | `.aurora--voices .aurora__field` | --a | custom property --a defined on aurora voices aurora field | |
| 3325 | `transparent` | `.aurora--voices .aurora__field` | --b | custom property --b defined on aurora voices aurora field | |
| 3330 | `#000` | `.aurora--voices .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora voices aurora field | |
| 3330 | `rgba(0,0,0,.55)` | `.aurora--voices .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora voices aurora field | |
| 3330 | `rgba(0,0,0,.22)` | `.aurora--voices .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in aurora voices aurora field | |
| 3331 | `#000` | `.aurora--voices .aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora voices aurora field | |
| 3331 | `rgba(0,0,0,.55)` | `.aurora--voices .aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora voices aurora field | |
| 3331 | `rgba(0,0,0,.22)` | `.aurora--voices .aurora__field` | mask-image gradient stop | mask-image gradient stop in aurora voices aurora field | |
| 3354 | `transparent` | `.aurora--silk .aurora__field` | --a | custom property --a defined on aurora silk aurora field | |
| 3355 | `transparent` | `.aurora--silk .aurora__field` | --b | custom property --b defined on aurora silk aurora field | |
| 3370 | `#FFFFFF` | `.act--silk .display, .act--silk .say, .act--silk .card__title, .act--silk .card .body` | color | text colour on act silk display, act silk say, act silk card title, act silk card body | |
| 3378 | `rgba(255, 255, 255, .4)` | `.act--silk .rail__close` | border-color | border-color on act silk rail close | |
| 3397 | `rgba(255, 255, 255, .32)` | `.care-line__track` | background | background on care line track | |
| 3398 | `#FFFFFF` | `.care-line__fill` | background | background on care line fill | |
| 3403 | `#FFFFFF` | `.care-line__tip` | background | background on care line tip | |
| 3415 | `rgba(255, 255, 255, .55)` | `.care-line__stop::before` | background | background on care line stop before | |
| 3418 | `#FFFFFF` | `.care-line__stop.is-past::before` | background | background on care line stop is past before | |
| 3425 | `rgba(255, 255, 255, .62)` | `.care-line__stop button` | color | text colour on care line stop button | |
| 3426 | `transparent` | `.care-line__stop button` | background | background on care line stop button | |
| 3430 | `#FFFFFF` | `.care-line__stop.is-current button, .care-line__stop button:hover` | color | text colour on care line stop is current button, care line stop button (hover) | |
| 3431 | `#FFFFFF` | `.care-line__stop button:focus-visible` | outline | outline on care line stop button (focus) visible | |
| 3459 | `rgba(255, 255, 255, .32)` | `.care-vline__track` | background | background on care vline track | |
| 3460 | `#FFFFFF` | `.care-vline__fill` | background | background on care vline fill | |
| 3466 | `rgba(255, 255, 255, .55)` | `.care-vline__dot` | background | background on care vline dot | |
| 3469 | `#FFFFFF` | `.care-vline__dot.is-past` | background | background on care vline dot is past | |
| 3474 | `#FFFFFF` | `.care-vline__tip` | background | background on care vline tip | |
| 3664 | `transparent` | `.tv2__car` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in tv2 car | |
| 3664 | `#000` | `.tv2__car` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in tv2 car | |
| 3665 | `transparent` | `.tv2__car` | mask-image gradient stop | mask-image gradient stop in tv2 car | |
| 3665 | `#000` | `.tv2__car` | mask-image gradient stop | mask-image gradient stop in tv2 car | |
| 3806 | `transparent` | `.act--treatments-b .treatments-addon__link` | border-bottom | border-bottom on act treatments b treatments addon link | |
| 3903 | `transparent` | `.tb-acc__panel:not(.is-open)::before` | background gradient stop | background gradient stop in tb acc panel not( is open) before | |
| 3904 | `transparent` | `.tb-acc__panel:not(.is-open)::before` | background gradient stop | background gradient stop in tb acc panel not( is open) before | |
| 3905 | `transparent` | `.tb-acc__panel:not(.is-open)::before` | background gradient stop | background gradient stop in tb acc panel not( is open) before | |
| 4073 | `rgba(255, 255, 255, .32)` | `.act--care .tv2__track-line` | background | background on act care tv2 track line | |
| 4074 | `#FFFFFF` | `.act--care .tv2__fill, .act--care .tv2__tip, .act--care .tv2__dot` | background | background on act care tv2 fill, act care tv2 tip, act care tv2 dot | |
| 4075 | `rgba(255, 255, 255, .62)` | `.act--care .tv2__stop` | color | text colour on act care tv2 stop | |
| 4076 | `#FFFFFF` | `.act--care .tv2__stop[aria-current="true"], .act--care .tv2__stop:hover` | color | text colour on act care tv2 stop[aria current="true"], act care tv2 stop (hover) | |
| 4077 | `#FFFFFF` | `.act--care .tv2__stop:focus-visible` | outline-color | outline-color on act care tv2 stop (focus) visible | |
| 4100 | `rgba(255, 255, 255, .72)` | `.care__nav` | color | text colour on care nav | |
| 4102 | `#FFFFFF` | `.care__nav:hover` | color | text colour on care nav (hover) | |
| 4103 | `#FFFFFF` | `.care__nav:focus-visible` | outline | outline on care nav (focus) visible | |
| 4111 | `rgba(10, 10, 10, .32)` | `.care__nav` | background | background on care nav | |
| 4111 | `#FFFFFF` | `.care__nav` | color | text colour on care nav | |
| 4132 | `rgba(255, 255, 255, .62)` | `.cta.cta--card` | background | background on cta cta card | |
| 4132 | `rgba(255, 255, 255, .7)` | `.cta.cta--card` | border | border on cta cta card | |
| 4138 | `#FFFFFF` | `.act--care .script` | color | text colour on act care script | |
| 4210 | `#FFFFFF` | `.act.act--turn` | background gradient stop | background gradient stop in act act turn | |
| 4214 | `transparent` | `.film > .aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in film > aurora | |
| 4214 | `#000` | `.film > .aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in film > aurora | |
| 4215 | `transparent` | `.film > .aurora` | mask-image gradient stop | mask-image gradient stop in film > aurora | |
| 4215 | `#000` | `.film > .aurora` | mask-image gradient stop | mask-image gradient stop in film > aurora | |
| 4243 | `rgba(255, 255, 255, .86)` | `.act--care .care__sub` | color | text colour on act care care sub | |
| 4247 | `rgba(255, 255, 255, .86)` | `.care__list li` | color | text colour on care list li | |
| 4249 | `rgba(255, 255, 255, .62)` | `.care__list li::before` | background | background on care list li before | |
| 4255 | `#C39A9D` | `(top level)` | comment (not rendered) | comment only, not rendered | |
| 4255 | `#D8C1C8` | `(top level)` | comment (not rendered) | comment only, not rendered | |
| 4259 | `transparent` | `.act--cta .aurora__field` | --a | custom property --a defined on act cta aurora field | |
| 4259 | `#C39A9D` | `.act--cta .aurora__field` | --a | custom property --a defined on act cta aurora field | |
| 4259 | `#CFAAAE` | `.act--cta .aurora__field` | --a | custom property --a defined on act cta aurora field | |
| 4260 | `transparent` | `.act--cta .aurora__field` | --b | custom property --b defined on act cta aurora field | |
| 4260 | `#CFAAAE` | `.act--cta .aurora__field` | --b | custom property --b defined on act cta aurora field | |
| 4260 | `#C39A9D` | `.act--cta .aurora__field` | --b | custom property --b defined on act cta aurora field | |
| 4260 | `#D8C1C8` | `.act--cta .aurora__field` | --b | custom property --b defined on act cta aurora field | |
| 4265 | `#000` | `.act--cta .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in act cta aurora field | |
| 4265 | `rgba(0,0,0,.55)` | `.act--cta .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in act cta aurora field | |
| 4265 | `rgba(0,0,0,.22)` | `.act--cta .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in act cta aurora field | |
| 4266 | `#000` | `.act--cta .aurora__field` | mask-image gradient stop | mask-image gradient stop in act cta aurora field | |
| 4266 | `rgba(0,0,0,.55)` | `.act--cta .aurora__field` | mask-image gradient stop | mask-image gradient stop in act cta aurora field | |
| 4266 | `rgba(0,0,0,.22)` | `.act--cta .aurora__field` | mask-image gradient stop | mask-image gradient stop in act cta aurora field | |

## css/specialist.css

No raw colour values.

## css/what-we-do-day-night.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 34 | `rgba(0, 0, 0, .55)` | `.dn-wrap .act--peak .dissolve__night` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dn wrap act peak dissolve night | |
| 34 | `#000` | `.dn-wrap .act--peak .dissolve__night` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dn wrap act peak dissolve night | |
| 35 | `rgba(0, 0, 0, .55)` | `.dn-wrap .act--peak .dissolve__night` | mask-image gradient stop | mask-image gradient stop in dn wrap act peak dissolve night | |
| 35 | `#000` | `.dn-wrap .act--peak .dissolve__night` | mask-image gradient stop | mask-image gradient stop in dn wrap act peak dissolve night | |
| 42 | `rgba(10, 10, 10, var(--dn-bb, .12))` | `.dn-wrap .act--peak .peak__band:not(.peak__band--top)` | background gradient stop | background gradient stop in dn wrap act peak peak band not( peak band top) | |
| 42 | `rgba(10, 10, 10, calc(var(--dn-bb, .12) * .55))` | `.dn-wrap .act--peak .peak__band:not(.peak__band--top)` | background gradient stop | background gradient stop in dn wrap act peak peak band not( peak band top) | |
| 42 | `rgba(10, 10, 10, 0)` | `.dn-wrap .act--peak .peak__band:not(.peak__band--top)` | background gradient stop | background gradient stop in dn wrap act peak peak band not( peak band top) | |
| 61 | `rgba(243, 239, 236, calc(.66 * var(--dn-g)))` | `.dng__half--day` | background | background on dng half day | |
| 62 | `#000` | `.dng__half--day` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half day | |
| 62 | `transparent` | `.dng__half--day` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half day | |
| 63 | `#000` | `.dng__half--day` | mask-image gradient stop | mask-image gradient stop in dng half day | |
| 63 | `transparent` | `.dng__half--day` | mask-image gradient stop | mask-image gradient stop in dng half day | |
| 71 | `#000` | `.dng__half--day` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half day | |
| 71 | `transparent` | `.dng__half--day` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half day | |
| 72 | `rgba(0, 0, 0, .42)` | `.dng__half--day` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half day | |
| 72 | `#000` | `.dng__half--day` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half day | |
| 75 | `#000` | `.dng__half--day` | mask-image gradient stop | mask-image gradient stop in dng half day | |
| 75 | `transparent` | `.dng__half--day` | mask-image gradient stop | mask-image gradient stop in dng half day | |
| 76 | `rgba(0, 0, 0, .42)` | `.dng__half--day` | mask-image gradient stop | mask-image gradient stop in dng half day | |
| 76 | `#000` | `.dng__half--day` | mask-image gradient stop | mask-image gradient stop in dng half day | |
| 86 | `#000` | `.dng .dng__half--night` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng dng half night | |
| 86 | `transparent` | `.dng .dng__half--night` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng dng half night | |
| 87 | `rgba(0, 0, 0, var(--dn-band-n))` | `.dng .dng__half--night` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng dng half night | |
| 87 | `#000` | `.dng .dng__half--night` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng dng half night | |
| 90 | `#000` | `.dng .dng__half--night` | mask-image gradient stop | mask-image gradient stop in dng dng half night | |
| 90 | `transparent` | `.dng .dng__half--night` | mask-image gradient stop | mask-image gradient stop in dng dng half night | |
| 91 | `rgba(0, 0, 0, var(--dn-band-n))` | `.dng .dng__half--night` | mask-image gradient stop | mask-image gradient stop in dng dng half night | |
| 91 | `#000` | `.dng .dng__half--night` | mask-image gradient stop | mask-image gradient stop in dng dng half night | |
| 99 | `rgba(38, 30, 28, calc(.50 * var(--dn-g)))` | `.dng__half--night` | background | background on dng half night | |
| 100 | `#000` | `.dng__half--night` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half night | |
| 100 | `transparent` | `.dng__half--night` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half night | |
| 101 | `#000` | `.dng__half--night` | mask-image gradient stop | mask-image gradient stop in dng half night | |
| 101 | `transparent` | `.dng__half--night` | mask-image gradient stop | mask-image gradient stop in dng half night | |
| 112 | `rgb(var(--dn-ink))` | `.dnf__opt--day` | color | text colour on dnf opt day | |
| 120 | `#7C4A35` | `.dn-wrap .act--peak` | background | background on dn wrap act peak | |
| 139 | `#fff` | `.dn-title` | color | text colour on dn title | |
| 144 | `rgb(var(--dnt-c))` | `.dn-title--ink` | color | text colour on dn title ink | |
| 153 | `rgb(var(--dnt-c))` | `.dn-wrap .act--peak .sundial__sun` | background | background on dn wrap act peak sundial sun | |
| 154 | `rgb(var(--dnt-c))` | `.dn-wrap .act--peak .sundial__line` | background | background on dn wrap act peak sundial line | |
| 155 | `rgb(var(--dnt-c))` | `.dn-wrap .act--peak .peak__states` | color | text colour on dn wrap act peak peak states | |
| 174 | `rgb(var(--dnt-c))` | `.dnf__lede` | color | text colour on dnf lede | |
| 176 | `rgb(var(--dnt-c))` | `.dnf__intro` | color | text colour on dnf intro | |
| 197 | `#000` | `.dnf__body` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dnf body | |
| 197 | `transparent` | `.dnf__body` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dnf body | |
| 198 | `#000` | `.dnf__body` | mask-image gradient stop | mask-image gradient stop in dnf body | |
| 198 | `transparent` | `.dnf__body` | mask-image gradient stop | mask-image gradient stop in dnf body | |
| 222 | `#000` | `.dng__half--day` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half day | |
| 222 | `transparent` | `.dng__half--day` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half day | |
| 223 | `#000` | `.dng__half--day` | mask-image gradient stop | mask-image gradient stop in dng half day | |
| 223 | `transparent` | `.dng__half--day` | mask-image gradient stop | mask-image gradient stop in dng half day | |
| 225 | `#000` | `.dng__half--night` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half night | |
| 225 | `transparent` | `.dng__half--night` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in dng half night | |
| 226 | `#000` | `.dng__half--night` | mask-image gradient stop | mask-image gradient stop in dng half night | |
| 226 | `transparent` | `.dng__half--night` | mask-image gradient stop | mask-image gradient stop in dng half night | |
| 258 | `rgb(var(--dnt-c))` | `.dnl` | color | text colour on dnl | |
| 264 | `transparent` | `.dnl__end` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on dnl end | |

## css/what-we-do-hands.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 28 | `rgba(10, 10, 10, .14)` | `.hd__items` | border-top | border-top on hd items | |
| 29 | `rgba(10, 10, 10, .14)` | `.hd__item` | border-bottom | border-bottom on hd item | |
| 59 | `rgba(243, 239, 236, .82)` | `.hd.is-live .hd__veil` | background gradient stop | background gradient stop in hd is live hd veil | |
| 59 | `rgba(243, 239, 236, .66)` | `.hd.is-live .hd__veil` | background gradient stop | background gradient stop in hd is live hd veil | |
| 59 | `rgba(243, 239, 236, .28)` | `.hd.is-live .hd__veil` | background gradient stop | background gradient stop in hd is live hd veil | |
| 59 | `rgba(243, 239, 236, 0)` | `.hd.is-live .hd__veil` | background gradient stop | background gradient stop in hd is live hd veil | |
| 64 | `rgba(10, 10, 10, .2)` | `.hd.is-live .hd__rail span` | background | background on hd is live hd rail span | |
| 67 | `#000` | `.hd.is-tight .hd__para` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in hd is tight hd para | |
| 67 | `transparent` | `.hd.is-tight .hd__para` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in hd is tight hd para | |
| 67 | `#000` | `.hd.is-tight .hd__para` | mask-image gradient stop | mask-image gradient stop in hd is tight hd para | |
| 67 | `transparent` | `.hd.is-tight .hd__para` | mask-image gradient stop | mask-image gradient stop in hd is tight hd para | |
| 101 | `rgba(10, 10, 10, .12)` | `.hd.is-live .hd__cut` | filter | filter on hd is live hd cut | |
| 135 | `rgba(10, 10, 10, .4)` | `.hd__read` | text-decoration-color | text-decoration-color on hd read | |
| 171 | `rgba(243, 239, 236, .86)` | `.hd.is-live .hd__veil::after` | background | background on hd is live hd veil after | |
| 231 | `rgba(243, 239, 236, .9)` | `.hd:not(.is-live) .hd__kind.is-reading` | background gradient stop | background gradient stop in hd not( is live) hd kind is reading | |

## css/what-we-do-kinds.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 31 | `rgba(243, 239, 236, .74)` | `.kc__card` | background | background on kc card | |
| 39 | `rgba(10, 10, 10, .12)` | `.kc__chips li` | border | border on kc chips li | |
| 39 | `rgba(255, 255, 255, .42)` | `.kc__chips li` | background | background on kc chips li | |
| 62 | `rgba(10, 10, 10, .16)` | `.kc.is-live .kc__rail span` | background | background on kc is live kc rail span | |

## css/what-we-do-opening.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 36 | `#000` | `.op__aurora .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in op aurora aurora field | |
| 36 | `transparent` | `.op__aurora .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in op aurora aurora field | |
| 37 | `#000` | `.op__aurora .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in op aurora aurora field | |
| 37 | `rgba(0,0,0,.45)` | `.op__aurora .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in op aurora aurora field | |
| 37 | `rgba(0,0,0,.18)` | `.op__aurora .aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in op aurora aurora field | |
| 39 | `#000` | `.op__aurora .aurora__field` | mask-image gradient stop | mask-image gradient stop in op aurora aurora field | |
| 39 | `transparent` | `.op__aurora .aurora__field` | mask-image gradient stop | mask-image gradient stop in op aurora aurora field | |
| 40 | `#000` | `.op__aurora .aurora__field` | mask-image gradient stop | mask-image gradient stop in op aurora aurora field | |
| 40 | `rgba(0,0,0,.45)` | `.op__aurora .aurora__field` | mask-image gradient stop | mask-image gradient stop in op aurora aurora field | |
| 40 | `rgba(0,0,0,.18)` | `.op__aurora .aurora__field` | mask-image gradient stop | mask-image gradient stop in op aurora aurora field | |
| 55 | `rgba(10, 10, 10, .26)` | `.op__dim` | background | background on op dim | |
| 57 | `transparent` | `.op__tint` | background | background on op tint | |
| 58 | `rgba(10, 10, 10, .62)` | `.op__scrim` | background gradient stop | background gradient stop in op scrim | |
| 58 | `rgba(10, 10, 10, .32)` | `.op__scrim` | background gradient stop | background gradient stop in op scrim | |
| 58 | `rgba(10, 10, 10, 0)` | `.op__scrim` | background gradient stop | background gradient stop in op scrim | |
| 70 | `#F3EFEC` | `.op__copy--light .op__kicker, .op__copy--light .op__head, .op__copy--light .op__line, .op__copy--light .op__kicker, .op__copy--light .op__head, .op__copy--light .op__line, .op__copy--light .op__rows` | color | text colour on op copy light op kicker, op copy light op head, op copy light op line, op copy light op kicker, op copy light op head, op copy light op line, op copy light op rows | |
| 101 | `#F3EFEC` | `.op__copy--light .op__kinds span::before` | background | background on op copy light op kinds span before | |
| 133 | `#F3EFEC` | `.op__intro-in--light .op__who, .op__intro-in--light .wp` | color | text colour on op intro in light op who, op intro in light wp | |
| 159 | `#F3EFEC` | `html:not(.js) .op__copy, .op--static .op__copy` | color | text colour on html not( js) op copy, op static op copy | |
| 160 | `#F3EFEC` | `html:not(.js) .op__line, .op--static .op__line, html:not(.js) .op__rows, .op--static .op__rows` | color | text colour on html not( js) op line, op static op line, html not( js) op rows, op static op rows | |
| 196 | `#F3EFEC` | `.op__ask` | color | text colour on op ask | |
| 197 | `#F3EFEC` | `.op__on-p` | color | text colour on op on p | |
| 203 | `#F3EFEC` | `.op--phone .op__copy .op__kicker, .op--phone .op__copy .op__head, .op--phone .op__copy .op__rows, .op--phone .op__copy .op__rows b` | color | text colour on op phone op copy op kicker, op phone op copy op head, op phone op copy op rows, op phone op copy op rows b | |
| 204 | `#F3EFEC` | `.op--phone .op__copy .op__kinds span + span:nth-child(2n)::before` | background | background on op phone op copy op kinds span + span nth child(2n) before | |

## css/what-we-do-tailored.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 21 | `#5A524F` | `.ty` | --ty-ground | custom property --ty-ground defined on ty | |
| 22 | `#fff` | `.ty` | --ty-ink | custom property --ty-ink defined on ty | |
| 34 | `#000` | `.ty__aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty aurora | |
| 34 | `transparent` | `.ty__aurora` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty aurora | |
| 35 | `#000` | `.ty__aurora` | mask-image gradient stop | mask-image gradient stop in ty aurora | |
| 35 | `transparent` | `.ty__aurora` | mask-image gradient stop | mask-image gradient stop in ty aurora | |
| 39 | `transparent` | `.ty__field` | background-image gradient stop | background-image gradient stop in ty field | |
| 42 | `#000` | `.ty__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty field | |
| 42 | `rgba(0,0,0,.55)` | `.ty__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty field | |
| 42 | `rgba(0,0,0,.22)` | `.ty__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty field | |
| 43 | `#000` | `.ty__field` | mask-image gradient stop | mask-image gradient stop in ty field | |
| 43 | `rgba(0,0,0,.55)` | `.ty__field` | mask-image gradient stop | mask-image gradient stop in ty field | |
| 43 | `rgba(0,0,0,.22)` | `.ty__field` | mask-image gradient stop | mask-image gradient stop in ty field | |
| 48 | `transparent` | `.ty__field::after` | background-image gradient stop | background-image gradient stop in ty field after | |
| 84 | `rgba(243, 239, 236, .70)` | `.ty__card::before` | background | background on ty card before | |
| 84 | `rgba(255, 255, 255, .6)` | `.ty__card::before` | border | border on ty card before | |
| 88 | `rgba(0,0,0,1.000)` | `.ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty card before | |
| 88 | `rgba(0,0,0,0.957)` | `.ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty card before | |
| 88 | `rgba(0,0,0,0.844)` | `.ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty card before | |
| 88 | `rgba(0,0,0,0.684)` | `.ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty card before | |
| 88 | `rgba(0,0,0,0.500)` | `.ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty card before | |
| 88 | `rgba(0,0,0,0.316)` | `.ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty card before | |
| 88 | `rgba(0,0,0,0.156)` | `.ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty card before | |
| 88 | `rgba(0,0,0,0.043)` | `.ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty card before | |
| 88 | `rgba(0,0,0,0.000)` | `.ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty card before | |
| 89 | `rgba(0,0,0,1.000)` | `.ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty card before | |
| 89 | `rgba(0,0,0,0.957)` | `.ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty card before | |
| 89 | `rgba(0,0,0,0.844)` | `.ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty card before | |
| 89 | `rgba(0,0,0,0.684)` | `.ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty card before | |
| 89 | `rgba(0,0,0,0.500)` | `.ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty card before | |
| 89 | `rgba(0,0,0,0.316)` | `.ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty card before | |
| 89 | `rgba(0,0,0,0.156)` | `.ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty card before | |
| 89 | `rgba(0,0,0,0.043)` | `.ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty card before | |
| 89 | `rgba(0,0,0,0.000)` | `.ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty card before | |
| 142 | `rgba(255, 255, 255, .28)` | `.ty__rail::before` | background | background on ty rail before | |
| 183 | `#fff` | `.ty__title` | color | text colour on ty title | |
| 206 | `rgba(0,0,0,0.000)` | `.ty.is-live .ty__photo` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is live ty photo | |
| 206 | `rgba(0,0,0,0.043)` | `.ty.is-live .ty__photo` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is live ty photo | |
| 206 | `rgba(0,0,0,0.156)` | `.ty.is-live .ty__photo` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is live ty photo | |
| 206 | `rgba(0,0,0,0.316)` | `.ty.is-live .ty__photo` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is live ty photo | |
| 206 | `rgba(0,0,0,0.500)` | `.ty.is-live .ty__photo` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is live ty photo | |
| 206 | `rgba(0,0,0,0.684)` | `.ty.is-live .ty__photo` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is live ty photo | |
| 206 | `rgba(0,0,0,0.844)` | `.ty.is-live .ty__photo` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is live ty photo | |
| 206 | `rgba(0,0,0,0.957)` | `.ty.is-live .ty__photo` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is live ty photo | |
| 206 | `rgba(0,0,0,1.000)` | `.ty.is-live .ty__photo` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is live ty photo | |
| 207 | `rgba(0,0,0,0.000)` | `.ty.is-live .ty__photo` | mask-image gradient stop | mask-image gradient stop in ty is live ty photo | |
| 207 | `rgba(0,0,0,0.043)` | `.ty.is-live .ty__photo` | mask-image gradient stop | mask-image gradient stop in ty is live ty photo | |
| 207 | `rgba(0,0,0,0.156)` | `.ty.is-live .ty__photo` | mask-image gradient stop | mask-image gradient stop in ty is live ty photo | |
| 207 | `rgba(0,0,0,0.316)` | `.ty.is-live .ty__photo` | mask-image gradient stop | mask-image gradient stop in ty is live ty photo | |
| 207 | `rgba(0,0,0,0.500)` | `.ty.is-live .ty__photo` | mask-image gradient stop | mask-image gradient stop in ty is live ty photo | |
| 207 | `rgba(0,0,0,0.684)` | `.ty.is-live .ty__photo` | mask-image gradient stop | mask-image gradient stop in ty is live ty photo | |
| 207 | `rgba(0,0,0,0.844)` | `.ty.is-live .ty__photo` | mask-image gradient stop | mask-image gradient stop in ty is live ty photo | |
| 207 | `rgba(0,0,0,0.957)` | `.ty.is-live .ty__photo` | mask-image gradient stop | mask-image gradient stop in ty is live ty photo | |
| 207 | `rgba(0,0,0,1.000)` | `.ty.is-live .ty__photo` | mask-image gradient stop | mask-image gradient stop in ty is live ty photo | |
| 286 | `rgba(0,0,0,0.000)` | `.ty.is-flow .ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is flow ty card before | |
| 286 | `rgba(0,0,0,0.043)` | `.ty.is-flow .ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is flow ty card before | |
| 286 | `rgba(0,0,0,0.156)` | `.ty.is-flow .ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is flow ty card before | |
| 286 | `rgba(0,0,0,0.316)` | `.ty.is-flow .ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is flow ty card before | |
| 286 | `rgba(0,0,0,0.500)` | `.ty.is-flow .ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is flow ty card before | |
| 286 | `rgba(0,0,0,0.684)` | `.ty.is-flow .ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is flow ty card before | |
| 286 | `rgba(0,0,0,0.844)` | `.ty.is-flow .ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is flow ty card before | |
| 286 | `rgba(0,0,0,0.957)` | `.ty.is-flow .ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is flow ty card before | |
| 286 | `rgba(0,0,0,1.000)` | `.ty.is-flow .ty__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in ty is flow ty card before | |
| 287 | `rgba(0,0,0,0.000)` | `.ty.is-flow .ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty is flow ty card before | |
| 287 | `rgba(0,0,0,0.043)` | `.ty.is-flow .ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty is flow ty card before | |
| 287 | `rgba(0,0,0,0.156)` | `.ty.is-flow .ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty is flow ty card before | |
| 287 | `rgba(0,0,0,0.316)` | `.ty.is-flow .ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty is flow ty card before | |
| 287 | `rgba(0,0,0,0.500)` | `.ty.is-flow .ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty is flow ty card before | |
| 287 | `rgba(0,0,0,0.684)` | `.ty.is-flow .ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty is flow ty card before | |
| 287 | `rgba(0,0,0,0.844)` | `.ty.is-flow .ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty is flow ty card before | |
| 287 | `rgba(0,0,0,0.957)` | `.ty.is-flow .ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty is flow ty card before | |
| 287 | `rgba(0,0,0,1.000)` | `.ty.is-flow .ty__card::before` | mask-image gradient stop | mask-image gradient stop in ty is flow ty card before | |

## css/what-we-do-timeline.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 13 | `#C86D58` | `.vt` | --vt-a1 | custom property --vt-a1 defined on vt | |
| 13 | `#D7C2C9` | `.vt` | --vt-a2 | custom property --vt-a2 defined on vt | |
| 13 | `#E2CAC6` | `.vt` | --vt-a3 | custom property --vt-a3 defined on vt | |
| 14 | `#D7C2C9` | `.vt` | --vt-b1 | custom property --vt-b1 defined on vt | |
| 14 | `#B95A4B` | `.vt` | --vt-b2 | custom property --vt-b2 defined on vt | |
| 14 | `#E2CAC6` | `.vt` | --vt-b3 | custom property --vt-b3 defined on vt | |
| 30 | `transparent` | `.vt__field` | background-image gradient stop | background-image gradient stop in vt field | |
| 33 | `#000` | `.vt__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt field | |
| 33 | `rgba(0,0,0,.55)` | `.vt__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt field | |
| 33 | `rgba(0,0,0,.22)` | `.vt__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt field | |
| 34 | `#000` | `.vt__field` | mask-image gradient stop | mask-image gradient stop in vt field | |
| 34 | `rgba(0,0,0,.55)` | `.vt__field` | mask-image gradient stop | mask-image gradient stop in vt field | |
| 34 | `rgba(0,0,0,.22)` | `.vt__field` | mask-image gradient stop | mask-image gradient stop in vt field | |
| 39 | `transparent` | `.vt__field::after` | background-image gradient stop | background-image gradient stop in vt field after | |
| 60 | `transparent` | `.vt__sub` | color | text colour on vt sub | |
| 77 | `rgba(243, 239, 236, .6)` | `.vt__photo-veil` | background gradient stop | background gradient stop in vt photo veil | |
| 77 | `rgba(243, 239, 236, .34)` | `.vt__photo-veil` | background gradient stop | background gradient stop in vt photo veil | |
| 77 | `rgba(243, 239, 236, 0)` | `.vt__photo-veil` | background gradient stop | background gradient stop in vt photo veil | |
| 206 | `rgba(243, 239, 236, .70)` | `.vt.is-flow .vt__card::before` | background | background on vt is flow vt card before | |
| 206 | `rgba(255, 255, 255, .6)` | `.vt.is-flow .vt__card::before` | border | border on vt is flow vt card before | |
| 208 | `rgba(0,0,0,0.000)` | `.vt.is-flow .vt__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt is flow vt card before | |
| 208 | `rgba(0,0,0,0.043)` | `.vt.is-flow .vt__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt is flow vt card before | |
| 208 | `rgba(0,0,0,0.156)` | `.vt.is-flow .vt__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt is flow vt card before | |
| 208 | `rgba(0,0,0,0.316)` | `.vt.is-flow .vt__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt is flow vt card before | |
| 208 | `rgba(0,0,0,0.500)` | `.vt.is-flow .vt__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt is flow vt card before | |
| 208 | `rgba(0,0,0,0.684)` | `.vt.is-flow .vt__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt is flow vt card before | |
| 208 | `rgba(0,0,0,0.844)` | `.vt.is-flow .vt__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt is flow vt card before | |
| 208 | `rgba(0,0,0,0.957)` | `.vt.is-flow .vt__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt is flow vt card before | |
| 208 | `rgba(0,0,0,1.000)` | `.vt.is-flow .vt__card::before` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in vt is flow vt card before | |
| 209 | `rgba(0,0,0,0.000)` | `.vt.is-flow .vt__card::before` | mask-image gradient stop | mask-image gradient stop in vt is flow vt card before | |
| 209 | `rgba(0,0,0,0.043)` | `.vt.is-flow .vt__card::before` | mask-image gradient stop | mask-image gradient stop in vt is flow vt card before | |
| 209 | `rgba(0,0,0,0.156)` | `.vt.is-flow .vt__card::before` | mask-image gradient stop | mask-image gradient stop in vt is flow vt card before | |
| 209 | `rgba(0,0,0,0.316)` | `.vt.is-flow .vt__card::before` | mask-image gradient stop | mask-image gradient stop in vt is flow vt card before | |
| 209 | `rgba(0,0,0,0.500)` | `.vt.is-flow .vt__card::before` | mask-image gradient stop | mask-image gradient stop in vt is flow vt card before | |
| 209 | `rgba(0,0,0,0.684)` | `.vt.is-flow .vt__card::before` | mask-image gradient stop | mask-image gradient stop in vt is flow vt card before | |
| 209 | `rgba(0,0,0,0.844)` | `.vt.is-flow .vt__card::before` | mask-image gradient stop | mask-image gradient stop in vt is flow vt card before | |
| 209 | `rgba(0,0,0,0.957)` | `.vt.is-flow .vt__card::before` | mask-image gradient stop | mask-image gradient stop in vt is flow vt card before | |
| 209 | `rgba(0,0,0,1.000)` | `.vt.is-flow .vt__card::before` | mask-image gradient stop | mask-image gradient stop in vt is flow vt card before | |
| 217 | `transparent` | `.vt.is-flow .vt__go` | -webkit-tap-highlight-color | -webkit-tap-highlight-color on vt is flow vt go | |

## css/what-we-do.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 18 | `rgba(243, 239, 236, .70)` | `.glass` | background | background on glass | |
| 19 | `rgba(255, 255, 255, .6)` | `.glass` | border | border on glass | |
| 63 | `rgba(243,239,236,.82)` | `.wh__photo::after` | background gradient stop | background gradient stop in wh photo after | |
| 63 | `rgba(243,239,236,0)` | `.wh__photo::after` | background gradient stop | background gradient stop in wh photo after | |
| 130 | `rgba(243,239,236,.88)` | `.wx__scrim` | background gradient stop | background gradient stop in wx scrim | |
| 130 | `rgba(243,239,236,.6)` | `.wx__scrim` | background gradient stop | background gradient stop in wx scrim | |
| 130 | `rgba(243,239,236,.12)` | `.wx__scrim` | background gradient stop | background gradient stop in wx scrim | |
| 130 | `rgba(243,239,236,0)` | `.wx__scrim` | background gradient stop | background gradient stop in wx scrim | |
| 209 | `rgba(0,0,0,.08)` | `.hx__img::before, .hx__img::after` | background | background on hx img before, hx img after | |
| 234 | `rgba( calc(243 + (140 - 243) * var(--nd)), calc(239 + (127 - 239) * var(--nd)), calc(236 + (121 - 236) * var(--nd)), calc(.62 + (.46 - .62) * var(--nd)))` | `.nav--glass[data-nd]::before` | background | background on nav glass[data nd] before | |
| 241 | `rgb( calc(10 + (255 - 10) * var(--nd)), calc(10 + (255 - 10) * var(--nd)), calc(10 + (255 - 10) * var(--nd)))` | `.nav[data-nd] .tab:not(.tab--cta)` | color | text colour on nav[data nd] tab not( tab cta) | |
| 254 | `rgba(0, 0, 0, .08)` | `.ph::before, .ph::after` | background | background on ph before, ph after | |
| 265 | `#F3EFEC` | `.page--faqs` | --faq-ground | custom property --faq-ground defined on page faqs | |
| 272 | `transparent` | `.page--faqs .faq--morph` | background | background on page faqs faq morph | |
| 288 | `#C86D58` | `.page--faqs` | --fw-a1 | custom property --fw-a1 defined on page faqs | |
| 288 | `#D7C2C9` | `.page--faqs` | --fw-a2 | custom property --fw-a2 defined on page faqs | |
| 288 | `#E2CAC6` | `.page--faqs` | --fw-a3 | custom property --fw-a3 defined on page faqs | |
| 289 | `#D7C2C9` | `.page--faqs` | --fw-b1 | custom property --fw-b1 defined on page faqs | |
| 289 | `#B95A4B` | `.page--faqs` | --fw-b2 | custom property --fw-b2 defined on page faqs | |
| 289 | `#E2CAC6` | `.page--faqs` | --fw-b3 | custom property --fw-b3 defined on page faqs | |
| 302 | `transparent` | `.page--faqs .faq__weather-field` | background-image gradient stop | background-image gradient stop in page faqs faq weather field | |
| 308 | `#000` | `.page--faqs .faq__weather-field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in page faqs faq weather field | |
| 308 | `rgba(0,0,0,.55)` | `.page--faqs .faq__weather-field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in page faqs faq weather field | |
| 308 | `rgba(0,0,0,.22)` | `.page--faqs .faq__weather-field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in page faqs faq weather field | |
| 309 | `#000` | `.page--faqs .faq__weather-field` | mask-image gradient stop | mask-image gradient stop in page faqs faq weather field | |
| 309 | `rgba(0,0,0,.55)` | `.page--faqs .faq__weather-field` | mask-image gradient stop | mask-image gradient stop in page faqs faq weather field | |
| 309 | `rgba(0,0,0,.22)` | `.page--faqs .faq__weather-field` | mask-image gradient stop | mask-image gradient stop in page faqs faq weather field | |
| 314 | `transparent` | `.page--faqs .faq__weather-field::after` | background-image gradient stop | background-image gradient stop in page faqs faq weather field after | |

## css/who-comes.css

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 90 | `rgba(243, 239, 236, .62)` | `.wc-card figcaption` | background | background on wc card figcaption | |
| 123 | `rgba(10, 10, 10, .22)` | `.wc-ck__wrap.is-armed li` | color | text colour on wc ck wrap is armed li | |
| 126 | `transparent` | `.wc-ck__wrap.is-armed li.is-lit::before` | outline-color | outline-color on wc ck wrap is armed li is lit before | |
| 127 | `rgba(10, 10, 10, .22)` | `@keyframes wcLight stop 0%` | color | text colour on @keyframes wcLight stop 0% | |
| 139 | `rgba(243, 239, 236, .62)` | `.wc-bf__glass` | background | background on wc bf glass | |
| 189 | `transparent` | `.page--who .wc-top .spec, .page--who .wc-top .wc-st` | background | background on page who wc top spec, page who wc top wc st | |
| 226 | `transparent` | `.wc-life__bg` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in wc life bg | |
| 226 | `#000` | `.wc-life__bg` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in wc life bg | |
| 227 | `transparent` | `.wc-life__bg` | mask-image gradient stop | mask-image gradient stop in wc life bg | |
| 227 | `#000` | `.wc-life__bg` | mask-image gradient stop | mask-image gradient stop in wc life bg | |

## about.html

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 14 | `#F3EFEC` | `<meta name="theme-color">` | content (theme-color) | browser theme colour (meta tag) | |

## build-your-programme.html

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 16 | `#F3EFEC` | `<meta name="theme-color">` | content (theme-color) | browser theme colour (meta tag) | |

## faqs.html

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 10 | `#F3EFEC` | `<meta name="theme-color">` | content (theme-color) | browser theme colour (meta tag) | |

## gifts.html

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 14 | `#F3EFEC` | `<meta name="theme-color">` | content (theme-color) | browser theme colour (meta tag) | |
| 28 | `#8C362F` | `.gifts-soon` | background | background on gifts soon | |
| 28 | `#fff` | `.gifts-soon` | color | text colour on gifts soon | |
| 41 | `transparent` | `.gifts-aurora__field` | --a | custom property --a defined on gifts aurora field | |
| 41 | `#E2CAC6` | `.gifts-aurora__field` | --a | custom property --a defined on gifts aurora field | |
| 41 | `#FFFFFF` | `.gifts-aurora__field` | --a | custom property --a defined on gifts aurora field | |
| 41 | `#D7C2C9` | `.gifts-aurora__field` | --a | custom property --a defined on gifts aurora field | |
| 42 | `#000` | `.gifts-aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in gifts aurora field | |
| 42 | `rgba(0,0,0,.55)` | `.gifts-aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in gifts aurora field | |
| 42 | `rgba(0,0,0,.22)` | `.gifts-aurora__field` | -webkit-mask-image gradient stop | -webkit-mask-image gradient stop in gifts aurora field | |
| 43 | `#000` | `.gifts-aurora__field` | mask-image gradient stop | mask-image gradient stop in gifts aurora field | |
| 43 | `rgba(0,0,0,.55)` | `.gifts-aurora__field` | mask-image gradient stop | mask-image gradient stop in gifts aurora field | |
| 43 | `rgba(0,0,0,.22)` | `.gifts-aurora__field` | mask-image gradient stop | mask-image gradient stop in gifts aurora field | |
| 46 | `transparent` | `.gifts-aurora__field::after` | --b | custom property --b defined on gifts aurora field after | |
| 46 | `#FFFFFF` | `.gifts-aurora__field::after` | --b | custom property --b defined on gifts aurora field after | |
| 46 | `#E2CAC6` | `.gifts-aurora__field::after` | --b | custom property --b defined on gifts aurora field after | |
| 46 | `#E3D7D3` | `.gifts-aurora__field::after` | --b | custom property --b defined on gifts aurora field after | |

## index.html

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 21 | `#F3EFEC` | `<meta name="theme-color">` | content (theme-color) | browser theme colour (meta tag) | |

## programmes.html

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 14 | `#F3EFEC` | `<meta name="theme-color">` | content (theme-color) | browser theme colour (meta tag) | |

## request-a-place.html

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 14 | `#F3EFEC` | `<meta name="theme-color">` | content (theme-color) | browser theme colour (meta tag) | |

## single-treatments.html

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 14 | `#F3EFEC` | `<meta name="theme-color">` | content (theme-color) | browser theme colour (meta tag) | |

## what-we-do.html

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 10 | `#F3EFEC` | `<meta name="theme-color">` | content (theme-color) | browser theme colour (meta tag) | |

## who-comes-into-your-home.html

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 14 | `#F3EFEC` | `<meta name="theme-color">` | content (theme-color) | browser theme colour (meta tag) | |

## partials/site-footer.html

Source partial. Its markup is stamped into each page, so colours are counted in the pages, not here. Raw colours in this file: 0.

No raw colour values.

## partials/site-header.html

Source partial. Its markup is stamped into each page, so colours are counted in the pages, not here. Raw colours in this file: 0.

No raw colour values.

## js/about.js

No raw colour values.

## js/booking-m25.js

No raw colour values.

## js/booking.js

No raw colour values.

## js/build-your-programme-pricing.js

No raw colour values.

## js/build-your-programme.js

No raw colour values.

## js/faqs.js

No raw colour values.

## js/fee-ticker.js

No raw colour values.

## js/home-flight.js

No raw colour values.

## js/home.js

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 538 | `#FFFFFF` | `JS answer` | color | color set in answer | |
| 551 | `#0A0A0A` | `JS INK` | comment (not rendered) | comment only, not rendered | |
| 551 | `rgb(10, 10, 10)` | `JS INK` | rgb array triplet | unclear | |
| 552 | `#FFFFFF` | `JS PAPER` | comment (not rendered) | comment only, not rendered | |
| 552 | `rgb(255, 255, 255)` | `JS PAPER` | rgb array triplet | unclear | |

## js/inner-nav.js

No raw colour values.

## js/nav-fold.js

No raw colour values.

## js/postcode-check.js

No raw colour values.

## js/programmes.js

No raw colour values.

## js/request.js

No raw colour values.

## js/specialist.js

No raw colour values.

## js/what-we-do-dn-title.js

No raw colour values.

## js/what-we-do-hands.js

No raw colour values.

## js/what-we-do-kinds.js

No raw colour values.

## js/what-we-do-opening.js

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 130 | `#F3EFEC` | `JS CREAM` | unclear | unclear | |

## js/what-we-do-promise.js

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 76 | `rgb(243, 239, 236)` | `JS DN_CREAM` | rgb array triplet | unclear | |
| 76 | `rgb(10, 10, 10)` | `JS DN_INK` | rgb array triplet | unclear | |
| 114 | `rgb(140, 54, 47)` | `JS sink` | rgb array triplet | unclear | |
| 152 | `#0A0A0A` | `JS INK` | comment (not rendered) | comment only, not rendered | |
| 152 | `rgb(10, 10, 10)` | `JS INK` | rgb array triplet | unclear | |
| 153 | `#FFFFFF` | `JS PAPER` | comment (not rendered) | comment only, not rendered | |
| 153 | `rgb(255, 255, 255)` | `JS PAPER` | rgb array triplet | unclear | |

## js/what-we-do-tailored.js

| line | value | selector or context | property | note | role |
|---|---|---|---|---|---|
| 290 | `rgb(10, 10, 10)` | `JS ink.style.background` | background (fallback when --dnt-c is unset) | background (fallback when --dnt-c is unset) set in ink.style.background | |
| 299 | `#fff` | `JS cut` | cssText | cssText set in cut | |

## js/what-we-do-timeline.js

No raw colour values.

## js/what-we-do-zones.js

No raw colour values.

## js/what-we-do.js

No raw colour values.

## js/who-comes.js

No raw colour values.

## Summary

### Raw colours per file

| file | raw colours |
|---|---|
| css/about.css | 4 |
| css/booking.css | 30 |
| css/build-your-programme.css | 73 |
| css/footer.css | 20 |
| css/house-flight.css | 85 |
| css/inner-pages.css | 0 |
| css/programmes.css | 33 |
| css/request.css | 12 |
| css/site.css | 187 |
| css/specialist.css | 0 |
| css/what-we-do-day-night.css | 56 |
| css/what-we-do-hands.css | 15 |
| css/what-we-do-kinds.css | 4 |
| css/what-we-do-opening.css | 24 |
| css/what-we-do-tailored.css | 72 |
| css/what-we-do-timeline.css | 39 |
| css/what-we-do.css | 28 |
| css/who-comes.css | 10 |
| about.html | 1 |
| build-your-programme.html | 1 |
| faqs.html | 1 |
| gifts.html | 17 |
| index.html | 1 |
| programmes.html | 1 |
| request-a-place.html | 1 |
| single-treatments.html | 1 |
| what-we-do.html | 1 |
| who-comes-into-your-home.html | 1 |
| partials/site-footer.html | 0 |
| partials/site-header.html | 0 |
| js/about.js | 0 |
| js/booking-m25.js | 0 |
| js/booking.js | 0 |
| js/build-your-programme-pricing.js | 0 |
| js/build-your-programme.js | 0 |
| js/faqs.js | 0 |
| js/fee-ticker.js | 0 |
| js/home-flight.js | 0 |
| js/home.js | 5 |
| js/inner-nav.js | 0 |
| js/nav-fold.js | 0 |
| js/postcode-check.js | 0 |
| js/programmes.js | 0 |
| js/request.js | 0 |
| js/specialist.js | 0 |
| js/what-we-do-dn-title.js | 0 |
| js/what-we-do-hands.js | 0 |
| js/what-we-do-kinds.js | 0 |
| js/what-we-do-opening.js | 1 |
| js/what-we-do-promise.js | 7 |
| js/what-we-do-tailored.js | 2 |
| js/what-we-do-timeline.js | 0 |
| js/what-we-do-zones.js | 0 |
| js/what-we-do.js | 0 |
| js/who-comes.js | 0 |
| **total** | **733** |

### Distinct raw values (case and whitespace folded) and occurrences

| value | occurrences |
|---|---|
| `transparent` | 154 |
| `#000` | 92 |
| `#FFFFFF` | 29 |
| `#F3EFEC` | 25 |
| `rgba(0,0,0,.55)` | 18 |
| `rgba(0,0,0,.22)` | 16 |
| `rgba(10, 10, 10, .14)` | 15 |
| `rgba(0,0,0,0.000)` | 12 |
| `rgba(0,0,0,0.043)` | 12 |
| `rgba(0,0,0,0.156)` | 12 |
| `rgba(0,0,0,0.316)` | 12 |
| `rgba(0,0,0,0.500)` | 12 |
| `rgba(0,0,0,0.684)` | 12 |
| `rgba(0,0,0,0.844)` | 12 |
| `rgba(0,0,0,0.957)` | 12 |
| `rgba(0,0,0,1.000)` | 12 |
| `rgba(243, 239, 236, 0)` | 11 |
| `#E2CAC6` | 9 |
| `rgba(243, 239, 236, .62)` | 9 |
| `#D7C2C9` | 8 |
| `rgb(var(--dnt-c))` | 7 |
| `rgba(10,10,10,0)` | 6 |
| `rgba(255, 255, 255, .62)` | 6 |
| `#0A0A0A` | 5 |
| `#fff` | 5 |
| `rgba(255, 255, 255, .6)` | 5 |
| `rgb(10, 10, 10)` | 4 |
| `rgba(0, 0, 0, .32)` | 4 |
| `rgba(0, 0, 0, .35)` | 4 |
| `rgba(0, 0, 0, .45)` | 4 |
| `rgba(0, 0, 0, .84)` | 4 |
| `rgba(10, 10, 10, .12)` | 4 |
| `rgba(10, 10, 10, .32)` | 4 |
| `rgba(226, 202, 198, .35)` | 4 |
| `rgba(243, 239, 236, .70)` | 4 |
| `#5A524F` | 3 |
| `#B95A4B` | 3 |
| `#C39A9D` | 3 |
| `#C86D58` | 3 |
| `#E3D7D3` | 3 |
| `rgba(10, 10, 10, .22)` | 3 |
| `rgba(243, 239, 236, .6)` | 3 |
| `rgba(243, 239, 236, .82)` | 3 |
| `rgba(243, 239, 236, .9)` | 3 |
| `rgba(255, 255, 255, .32)` | 3 |
| `rgba(255, 255, 255, .7)` | 3 |
| `#8C362F` | 2 |
| `#8F8480` | 2 |
| `#CFAAAE` | 2 |
| `#D8C1C8` | 2 |
| `black` | 2 |
| `rgb(255, 255, 255)` | 2 |
| `rgba(0,0,0,.08)` | 2 |
| `rgba(0, 0, 0, .12)` | 2 |
| `rgba(0, 0, 0, .14)` | 2 |
| `rgba(0,0,0,.18)` | 2 |
| `rgba(0,0,0,.25)` | 2 |
| `rgba(0, 0, 0, .34)` | 2 |
| `rgba(0, 0, 0, .42)` | 2 |
| `rgba(0, 0, 0, .54)` | 2 |
| `rgba(0, 0, 0, .58)` | 2 |
| `rgba(0, 0, 0, .7)` | 2 |
| `rgba(0, 0, 0, .71)` | 2 |
| `rgba(0, 0, 0, .82)` | 2 |
| `rgba(0, 0, 0, .93)` | 2 |
| `rgba(0, 0, 0, .98)` | 2 |
| `rgba(0, 0, 0, var(--dn-band-n))` | 2 |
| `rgba(10, 10, 10, .08)` | 2 |
| `rgba(10, 10, 10, .26)` | 2 |
| `rgba(10,10,10,.34)` | 2 |
| `rgba(10, 10, 10, .62)` | 2 |
| `rgba(140, 127, 121, .46)` | 2 |
| `rgba(166, 76, 69, .18)` | 2 |
| `rgba(226, 202, 198, .4)` | 2 |
| `rgba(243, 239, 236, .12)` | 2 |
| `rgba(243, 239, 236, .55)` | 2 |
| `rgba(243, 239, 236, .74)` | 2 |
| `rgba(243, 239, 236, .78)` | 2 |
| `rgba(243, 239, 236, .86)` | 2 |
| `rgba(255, 255, 255, .4)` | 2 |
| `rgba(255, 255, 255, .55)` | 2 |
| `rgba(255, 255, 255, .86)` | 2 |
| `rgba(255, 255, 255, 0)` | 2 |
| `rgba(90, 82, 79, .38)` | 2 |
| `rgba(90, 82, 79, .78)` | 2 |
| `rgba(90, 82, 79, .9)` | 2 |
| `#2C2C2C` | 1 |
| `#737373` | 1 |
| `#7C4A35` | 1 |
| `#A64C45` | 1 |
| `#C9B9B5` | 1 |
| `#CA8882` | 1 |
| `#D66F4E` | 1 |
| `#f5f5f5` | 1 |
| `#fefefe` | 1 |
| `rgb(140, 54, 47)` | 1 |
| `rgb(238, 236, 233)` | 1 |
| `rgb(243, 239, 236)` | 1 |
| `rgb( calc(10 + (255 - 10) * var(--nd)), calc(10 + (255 - 10) * var(--nd)), calc(10 + (255 - 10) * var(--nd)))` | 1 |
| `rgb(var(--dn-ink))` | 1 |
| `rgba(10, 10, 10, .04)` | 1 |
| `rgba(10, 10, 10, .1)` | 1 |
| `rgba(10, 10, 10, .16)` | 1 |
| `rgba(10, 10, 10, .18)` | 1 |
| `rgba(10, 10, 10, .2)` | 1 |
| `rgba(10, 10, 10, .28)` | 1 |
| `rgba(10,10,10,.30)` | 1 |
| `rgba(10, 10, 10, .4)` | 1 |
| `rgba(10, 10, 10, .45)` | 1 |
| `rgba(10, 10, 10, calc(var(--dn-bb, .12) * .55))` | 1 |
| `rgba(10, 10, 10, var(--dn-bb, .12))` | 1 |
| `rgba(140, 127, 121, .62)` | 1 |
| `rgba(140, 127, 121, .78)` | 1 |
| `rgba(140, 54, 47, .28)` | 1 |
| `rgba(166, 76, 69, .25)` | 1 |
| `rgba(226, 202, 198, .5)` | 1 |
| `rgba(226, 202, 198, 0)` | 1 |
| `rgba(243,239,236,.10)` | 1 |
| `rgba(243, 239, 236, .28)` | 1 |
| `rgba(243, 239, 236, .30)` | 1 |
| `rgba(243, 239, 236, .34)` | 1 |
| `rgba(243, 239, 236, .4)` | 1 |
| `rgba(243,239,236,.48)` | 1 |
| `rgba(243, 239, 236, .66)` | 1 |
| `rgba(243, 239, 236, .68)` | 1 |
| `rgba(243,239,236,.80)` | 1 |
| `rgba(243,239,236,.88)` | 1 |
| `rgba(243,239,236,.90)` | 1 |
| `rgba(243, 239, 236, .92)` | 1 |
| `rgba(243, 239, 236, calc(.66 * var(--dn-g)))` | 1 |
| `rgba(255, 255, 255, .12)` | 1 |
| `rgba(255, 255, 255, .22)` | 1 |
| `rgba(255, 255, 255, .28)` | 1 |
| `rgba(255, 255, 255, .42)` | 1 |
| `rgba(255, 255, 255, .45)` | 1 |
| `rgba(255, 255, 255, .5)` | 1 |
| `rgba(255, 255, 255, .72)` | 1 |
| `rgba(255, 255, 255, .85)` | 1 |
| `rgba(38, 30, 28, calc(.50 * var(--dn-g)))` | 1 |
| `rgba(90, 82, 79, .35)` | 1 |
| `rgba(90, 82, 79, .7)` | 1 |
| `rgba( calc(243 + (140 - 243) * var(--nd)), calc(239 + (127 - 239) * var(--nd)), calc(236 + (121 - 236) * var(--nd)), calc(.62 + (.46 - .62) * var(--nd)))` | 1 |

Distinct values: 142. Occurrences: 733.

## Role assignment rules (Opus, 26 Oct 2026)

The role column above is filled by value, using these rules. Where a line's context says otherwise, the context wins and the line is flagged for Opus. Role tokens are defined in the PALETTE LAYER at the top of index/css/site.css.

### Leave as is (the allowed neutrals; the leak check whitelists these)
- `transparent`, `black`, `#000` and every `rgba(0,0,0,x)` including the mask ramps: masks and shadows, not palette colours.
- `rgba(10,10,10,x)` and `rgb(10,10,10)` at any alpha: ink alphas. Where the value is .08 or .14 use `var(--line)` / `var(--line-firm)`; every other alpha stays raw.
- `#FFFFFF`, `#fff`, `rgb(255,255,255)` and `rgba(255,255,255,x)`: white. When it is text or a line on a dark ground or a photograph, use `var(--t-on-dark)` for the solid value; when it is a paper surface, `var(--g-paper)`; alphas of white stay raw.
- Comment only values (`#f5f5f5`, `#fefefe` in comments): ignore.
- Day and Night scene values (`rgb(var(--dnt-c))`, `rgb(var(--dn-ink))`, the `--nd` calc ramps, `#7C4A35`, `rgba(38,30,28,x)`): they are the film's own light, not the palette. Leave.
- `rgb(238,236,233)` fog veil and `#737373` voices mute: near neutral, leave.

### Replace
| raw value | role |
|---|---|
| `#F3EFEC`, `rgb(243,239,236)` | `var(--g-canvas)` |
| `rgba(243,239,236,a)` | `color-mix(in srgb, var(--g-canvas) A%, transparent)` with A = a x 100 |
| `#E2CAC6` | `var(--g-tint)` |
| `rgba(226,202,198,a)` | `color-mix(in srgb, var(--g-tint) A%, transparent)` |
| `#D7C2C9` | `var(--g-soft)` |
| `#C9B9B5` | `var(--g-stone)` |
| `#E3D7D3` | `var(--g-haze)` |
| `#5A524F` | `var(--t-mute)` when text, `var(--g-dark)` when a ground |
| `rgba(90,82,79,a)` | `color-mix(in srgb, var(--g-dark) A%, transparent)` |
| `#0A0A0A` | `var(--t-ink)` |
| `#2C2C2C` | `var(--t-soft)` |
| `#A64C45` | `var(--acc)` |
| `rgba(166,76,69,.18)` | `var(--acc-line)` |
| `rgba(166,76,69,a)` other alphas | `color-mix(in srgb, var(--acc) A%, transparent)` |
| `#8C362F`, `rgb(140,54,47)` | `var(--acc-deep)` |
| `rgba(140,54,47,.28)` | `var(--acc-shadow)` is ember based; use `color-mix(in srgb, var(--acc-deep) 28%, transparent)` |
| `#C86D58` | `var(--rib-1)` |
| `#B95A4B` | `var(--rib-2)` |
| `rgba(140,127,121,a)` | `color-mix(in srgb, var(--g-taupe) A%, transparent)` |
| `#8F8480` | `var(--g-taupe-lite)` |
| `#C39A9D` | `var(--rib-cta-1)` |
| `#CFAAAE` | `var(--rib-cta-2)` |
| `#D8C1C8` | `var(--rib-cta-3)` |
| `#CA8882` (booking aurora soft) | `var(--rib-bk-soft)` |
| `#D66F4E` (booking aurora warm) | `var(--rib-bk-warm)` |

### Old token names inside rules
Every `var(--ember)`, `var(--coral-deep)` and the other old names keep working through aliases in Phase 2. In Phase 3 each use is retargeted by its job:
- buttons, selected days, toggles, slider fills and dots, header Check your dates button: `--acc` (hover `--acc-hover`)
- Quentin script lines: `--reach-script`
- links, `.cta-link`, `.text-link` underlines, Recommended tags: `--reach-link`
- prices on Programmes and in the builder: `--reach-price`
- focus rings: `--focus`
- form errors and the service area refusal: `--err`
- aurora ribbon stops: `--rib-1` to `--rib-4` (`--ember` is `--rib-3`, `--ember-deep` is `--rib-4`), the blush and rose stops `--g-tint` / `--g-soft`
- timeline ink `--tline-ink`: `--reach-script`
- grounds and text: the `--g-*` and `--t-*` names
