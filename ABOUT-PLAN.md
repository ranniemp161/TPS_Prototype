# The founders' page: UI plan (10 Oct 2026)

For Opus 5.5 to build. Written by Claude (Fable 5.1) from `Founder_updated.docx` (project root; the client's copy for the About page, 1,117 words, 60 paragraphs), the current `index/about.html`, and the brand system in `DESIGN.md` sections 1 to 5.

TJ's brief (10 Oct 2026): implement the document's copy at high quality. It does not have to be the About page, and it does not have to be as motion heavy as What We Do.

## Where it lives: about.html, renamed in the menu

Recommendation: this copy replaces `index/about.html`. The menu entry "The Suite" under About Us becomes "Our Story" (the client's own frame for the page is the founding story). `who-comes-into-your-home.html` stays as it is; the two founders' profiles belong here, not there, because the document presents them as one piece with the story.

The current about.html has three "Note for Amidat" placeholders, an "Areas We Cover" section the client never confirmed, and a founding line that the new document contradicts (see Copy). All of that goes. The Contact section stays, moved to the foot.

Back up `index/about.html` and `css/inner-pages.css` to `lab/*.before-our-story.*.bak`. Screenshot the current page at 1440 and 390 for the record.

## The copy, exactly as she wrote it

Every visible word comes from `Founder_updated.docx`, in order, nothing added. Extract the text with the `python-docx` route or the zip and XML route; do not retype. The document's structure, which is the page's structure:

1. "Who is caring for the mother?" and the founding story (eight paragraphs, ending "That question shaped everything that followed.")
2. "The care we felt was missing" (four paragraphs and the bold line "That principle sits at the heart of TPS.")
3. "OUR FOUNDERS", "Two sisters. Two perspectives. One shared standard.", then Aminat Sowunmi, Co-Founder (five paragraphs) and Ami Olowu, Co-Founder (two paragraphs), then the shared closing sentence.
4. "Inspired by traditions that have long centred the mother" (seven paragraphs, including the bold line "Birth is not where care for the mother ends. It is where another kind of care begins.")
5. "Care should be felt in the details" (eight short paragraphs ending "We are present when you need us and discreet when you don't.")
6. "THE SAME INTENTION, IN EVERY HOME" (five paragraphs, ending "The baby has arrived." / "We are here for the mother.") and the sign off "Aminat & Ami Sowunmi, Co-Founders, The Postpartum Suite".

Four things in the copy need TJ or the client, not a guess:

- **The surname.** The sign off reads "Aminat & Ami Sowunmi", but Ami is "Ami Olowu" in her own profile and in every email. Build it as written and flag it in the DESIGN.md note for Ami to confirm.
- **Two em dashes** in the document, in the sentences beginning "Across cultures and generations" (after "a distinct time of recovery") and "Today, it informs every part of TPS". The site rule is no em dashes. Set each as a comma or a new sentence, keep her words, and list both in the note for her sign off.
- **One hyphen**: "Co-Founder" (three times) and "client-centred". Ask TJ whether these keep the hyphen (the bespoke plan has the same question).
- **"Who is caring for the mother?"** appears twice, as the first heading and inside the first sentence in bold. Set the heading once, large; keep the bold in the sentence as emphasis.

Everything in bold in the document is emphasis she chose. Carry it: bold runs in Karla 700, and the four standalone bold lines (the beginning, the principle, the tradition line, the closing two lines) become the page's set pieces below.

## The page, section by section

Type roles throughout: Instrument Serif in capitals for every section heading; Karla for all reading text; Montserrat for labels; Quentin once; IBM Plex Mono nowhere on this page (no badges, no numbers). Content max 1080px, reading measure 62ch, section rhythm 96px (64px on phones). No shadows. No dark sections.

### 1. Opening: the question

Full width, the aurora running behind (the FAQ page palette, as the What We Do opening uses). No photograph; the question is the picture.

- "WHO IS CARING FOR THE MOTHER?" in Instrument Serif capitals, the What We Do headline size (clamp 2.4rem to 5.2rem), centred, max 14ch so it breaks as two lines on every width.
- Under it the first paragraph as the lede, Karla, 1.15rem, centred, 48ch: "The Postpartum Suite began with a simple question: **who is caring for the mother?**"
- The header folds into the glass strip on scroll as on every page.
- Motion: the headline's two lines rise through masked lines on load (the What We Do `.hd-line` splitter is reusable), the lede 200ms after. Nothing scroll linked.

### 2. The story

A two column passage: the photograph on the left, sticky within the section on desktop; the seven remaining story paragraphs on the right in the reading measure, with "That was the beginning of The Postpartum Suite." set as a pull line between paragraph six and seven: Instrument Serif capitals, 1.6rem, ember, a hairline above and below (the "Day Care" glass card heading language).

Photograph: a real one from the shoot, two women together. First choice IMG_9552 (sofa, the specialist leaning in while the mother holds the newborn), cropped 4:5, with the gentle parallax already used on the specialist portrait (`data-par="4"`). If TJ prefers the converted version with the pink uniform (`TPS images/tailored/hero-option-C_sofa-newborn_from-IMG_9552.png`), use that; ask, do not pick. Phones: photograph first, 4:5, then the text.

Motion: each paragraph rises 12px and fades in as it enters (IntersectionObserver, the builder page's `.rise`, transform and opacity only).

### 3. The care we felt was missing

Canvas, single column, reading measure. The heading, then the four paragraphs. The second paragraph lists five needs in one sentence ("time to recover, nourishing food prepared for her, postpartum treatments..., someone she trusts with her baby, and a home that continues to function"). Keep the sentence as she wrote it; under it, set the same five phrases again as the specialist section's hairline list (Montserrat small spaced capitals beside a hairline that draws in ember and cools, `.spec__checks`), `aria-hidden` since the paragraph already says it. That is the one device from What We Do worth carrying here. "That principle sits at the heart of TPS." closes the section as a pull line, the same treatment as in section 2.

### 4. Our founders

Heading "OUR FOUNDERS", then "Two sisters. Two perspectives. One shared standard." in Instrument Serif capitals one size down, then the shared paragraph.

Two cards side by side on desktop (one above the other on phones), each: portrait 4:5 in the 16px media radius, the name in Instrument Serif capitals 1.5rem, "Co-Founder" in Montserrat 600 .6rem .14em uppercase ink mute (it is a label, which is Montserrat's job; it is not an invented eyebrow, it is her copy), then her paragraphs in Karla .95rem. Cards are paper on canvas with a hairline, 10px radius, no glass (glass belongs over photographs, and these cards carry long text).

Portraits: **real photographs of Aminat and Ami are needed and do not exist in the project.** Never generate them (TPS rule: real people are real). Until TJ supplies them, the card shows a haze block in the portrait's place with no text in it. Say so in the DESIGN.md note.

The closing sentence ("Both co-founders are building a service...") sits under both cards, centred, in the reading measure.

### 5. Inspired by traditions

A full width photograph band, the page's one photographic breath: the bath or the tungku from the shoot (`assets/img` already holds `t-treatment-10-facial-massage.webp` and `traditional-massage.webp`; pick a real shoot still with no face if one exists in `TPS images/Raw files/Treatments`, otherwise the existing `massage.webp`). 60vh on desktop, 50vh on phones, the picture covering, a soft canvas veil at the foot.

Over it, in a 62 percent canvas glass card (the What We Do "Day Care" card language), the heading and the first four paragraphs. Then, below the photograph on canvas, the page's single Quentin line: **"Birth is not where care for the mother ends. It is where another kind of care begins."** Quentin, ember, clamp 2rem to 3.6rem, centred, max 24ch, with 48px above and below. This is the one accent line the brand allows per page; nothing else on the page uses Quentin.

Then the last three paragraphs of the section in the reading measure.

### 6. Care should be felt in the details

The eight short paragraphs are a list of small acts. Set them as a vertical line that draws down the centre as the reader scrolls, each act appearing beside it as the line reaches it: the A Day With Us language (`--tline`, `--tdot`, the tip circle), without the pin, exactly as the phone version of A Day With Us now works on every width. Acts alternate left and right of the line on desktop; on phones they sit to the right of a left edge line. No times, no mono. "None of these things is remarkable in isolation." and the bold line "The difference is that the mother no longer must make all of them happen." close the list as the line's last stop, the bold line in Instrument Serif capitals 1.4rem.

The three paragraphs after ("The home still feels like her home...", "We make that rhythm feel lighter.", "We are present when you need us and discreet when you don't.") follow in the reading measure, the last one bold as she set it.

This is the only scroll linked motion on the page. It is scrubbed by scroll position, not pinned, and reduced motion shows the finished list.

### 7. The same intention, in every home

Canvas, centred, reading measure: the heading, the four paragraphs. Then the two closing lines as the page's full stop, Instrument Serif capitals, the opening's size: "THE BABY HAS ARRIVED." over "WE ARE HERE FOR THE MOTHER." Under them the sign off in Karla italic: "Aminat & Ami Sowunmi, Co-Founders, The Postpartum Suite". Then the existing consultation button ("Book a consultation", the primary button) and the contact rows from the current page (email, Instagram; drop the two "To be confirmed" rows until the client supplies them).

Motion: the two closing lines rise through masked lines when they enter, the only reveal that is not a plain rise.

### Header and footer

Unchanged partials. Both locked; sync check after.

## Mobile

Build phone first inside the same stylesheet; everything above describes the phone fallback. Rules from MOBILE-PLAN.md apply: 13px text floor, 44px targets, no horizontal overflow, `100svh` where a height is needed (only the photograph band), screenshot every section at 390 and 1440 before reporting.

## Files

- `index/about.html` rebuilt. Keep `data-section` and `data-section-name` on every section for the dev panel: `our-story-opening`, `the-story`, `the-care-missing`, `our-founders`, `traditions`, `the-details`, `the-same-intention`, `contact`.
- `css/our-story.css`, new, loaded after `site.css` and `inner-pages.css`. Reuse `.spec__checks` (specialist stylesheet) and the timeline tokens from `site.css`; copy only the rules needed rather than loading `what-we-do-*.css`.
- `js/our-story.js`, new: the rises, the hairline list, the details line. GSAP and ScrollTrigger are already on the site; no new libraries.
- Photographs: real shoot stills only, converted through the usual lab tools into `assets/img/` as webp, 2400 wide max. No paid generation without TJ's yes.

## Order of work

1. Back up, screenshot, extract the copy to `research/our-story/copy.txt` and compare it line by line against the document before building (the copy verification habit from What We Do).
2. Markup with all copy, no styling: read it top to bottom once as a page of text.
3. Styles section by section, phone then desktop.
4. Motion, in the order above, reduced motion checked.
5. Screenshots at 390 and 1440 of every section; the DESIGN.md note "Our Story page built from Founder_updated.docx (TJ, <date>)" with the four copy flags for the client. No commit unless TJ asks.

## Open questions for TJ

- The menu label ("Our Story" is my suggestion; TJ or the client may prefer "About Us" or "The Suite").
- Which photograph for the story section (real IMG_9552, or the converted pink uniform version).
- The founders' portraits: who supplies them and when.
- The surname and the em dashes, for Ami.
