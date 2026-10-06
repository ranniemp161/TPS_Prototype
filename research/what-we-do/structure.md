# What We Do: structure (version 3, 5 Oct 2026)

Versions 1 and 2 were rejected and deleted. This version follows DESIGN.md
section 9 and the MaisonFav design DNA (maison-design-dna.json). Built from
copy.json (verified word for word against the client PNG).

Files: care.html (this is now the live What We Do page, the menu already points at it), what-we-do.css, what-we-do.js. The previous Care page is saved as research/what-we-do/old-care.html.bak.
Header from site-header.html (compact bar). Preview images: preview/.
Scripts: GSAP, ScrollTrigger, inner-nav.js, zones.js. Does not use v1.js.

## Order
1. Hero (title page): label, capital headline from the Mother and Baby copy,
   booking button, three figures the copy states, one large photograph that
   melts into the page.
2. Four kinds of care: MaisonFav's stacked photograph cards. Sticky, rounded
   top corners, each about 64px lower than the last. Each shows its chapter
   name on the visible top strip, its promise and its intro. "Read the detail"
   links down.
3. The detail, one section per chapter: items as rows beside a held photograph
   that changes with the row in view (clip wipe plus slow scale, from the
   21st.dev Sticky Content Wrapper, without its snapping). Treatments and Home
   Support sit on the blush band. Housekeeping zones follow Home Support,
   unchanged.
4. The Postpartum Suite Experience: a quiet title page over the house photo.
5. A Day With Us: plain timetable, a line draws down as the day passes.
6. Your Postpartum Specialist.
7. Tailored To You: Aurora, glass copy block, signature moment (length of stay).
8. FAQ unchanged (TJ approved), shared close and footer.

## Not built
Arrow chip on buttons (client sign off). Statement sentence (needs a client
line). Cursor effect (TJ: never).

## Interface labels I added (not client copy, easy to remove)
What we do, At a glance, 7am to 7pm care each day, 3 fresh meals a day, 5 7 14
30 day programmes, Read the detail, The day, One person, Your stay, Your length
of stay and the ledger sentence and captions.

## Placeholder photographs (from assets/img) that need real ones
Herbal teas (tray of food), Lactation drinks (kitchen), Outings (arrival),
Grocery collection (kitchen). Everything else uses the closest existing image.

## Checked
No console errors, no overflow at 1440 and 390, all 185 copy strings present,
ledger arithmetic, photograph swap sequence, reduced motion readable, hero
guard passes, shared header in sync.
