# Bespoke Programmes: funnel and close plan (13 Oct 2026)

Instructions for turning `index/build-your-programme.html` into a quiet funnel that ends in a booked call or a captured email. Written by Claude (Opus 5.5) from TJ's brief of 13 Oct 2026, for one chat per numbered section.

**The pricing engine, the rules, the fee ticker, the summary, the Change links, the budget recommender and the toggle rows are finished and approved (TJ). Do not change what they do.** This plan adds screens, removes chrome, and rebuilds the close.

Open every chat with "TPS dev skill", wait for the status report, then say "Read FUNNEL-PLAN.md and do chat N." One chat per session.

**Model per chat (TJ, 13 Oct 2026): the lowest model that can do the job, never above Opus 5.5.** Set it with `/model` before the chat starts.

| Chat | Model | Why |
|---|---|---|
| 1 | Opus 5.5 | Touches the shared header without editing the partial, and the deck's state; a mistake shows on every page |
| 2 | Sonnet 5.5 | One field, one blocking rule, a helper and a summary line, all spelled out |
| 3 | Sonnet 5.5 | Copies a layout already built on the same page and measures it |
| 4 | Sonnet 5.5 | The toggle row already exists; the Calendly link is specified |
| 5 | Opus 5.5 | Two copy versions, date arithmetic, the form contract the colleague builds on |
| 6 | Haiku 5.5 | Compiles the new lines from the page into one message |

If a chat on Sonnet or Haiku stalls or guesses, stop, note it in DESIGN.md, and rerun that chat one model up.

---

## 0. The decisions (TJ, 13 Oct 2026)

- **Option A, the quiet funnel.** Once she presses Begin, the header slims to the logo and one "Return to the site" link. The nav links and Enquire go. The footer goes from this page. Forward or exit, nothing else.
- **Due date first.** Right after Begin, before Live-in or daytime, she enters her due date. Required, one field, no "unknown" option. A past date is allowed (she has already given birth).
- **Never gate the price.** The fee stays on screen throughout. The email earns her something on top of it.
- **The close asks one question:** "Would you like to book a call now?" Yes / No, the same toggle row as every other step.
- **Yes:** Calendly, the existing 30 minute link, with her programme and due date passed through.
- **No:** an email capture, split by her due date.
  - More than three months out: the price hold. Indicative pricing is held for three months; email your programme and we hold this price for twelve months.
  - Within three months, or already born: the availability check. Email your programme and we check your dates and come back within one working day.
- **The window is three months (TJ), the hold is twelve months (TJ).**
- **The email form is UI only.** Plain HTML form with named fields. TJ's colleague wires it to the CRM and Resend. Nothing on the page needs to change when he does.
- **The fee screen's layout** (glass panel fading into a taller photo) is replaced by the start screen's layout: words left, photo right, same height, no glass.
- **Avoid:** exit pop ups, countdowns, scarcity lines. The only urgency is the client's own: pricing held for a window.

Everything not quoted or marked (TJ) is Claude's recommendation. If TJ changes it in a chat, follow TJ and record it in DESIGN.md with his name on it.

---

## 1. Sources of truth, in order

1. `TPS Brand Pack.html` and `TPS Brand Fonts.pdf`.
2. `DESIGN.md` sections 1 to 9, then the dated sections from 12 Oct 2026 on, especially "one way to choose, toggles" and "the start screen laid out simply" (13 Oct).
3. The start screen of this page as built: `index/build-your-programme.html` section `builder-start`, and the ONE WAY TO CHOOSE block at the end of `css/build-your-programme.css`.
4. This plan.

---

## 2. The screens, in order, after this plan

| # | Screen | Status |
|---|---|---|
| 0 | Start | built |
| 1 | **When is your baby due?** | new, chat 2 |
| 2 to 8 | Live-in or daytime, How long, Day or night, Meals, Recovery treatments (two), Massage rhythm, What matters most (two) | built |
| 9 | Your programme (the fee) | relaid, chat 3 |
| 10 to 12 | Your programme (built, two), Your days, Always included | built |
| 13 | Care budget | built, now alone on its screen (its pair, Book, goes) |
| 14 | **Book a call now?** | new, chat 4 |
| 15 | **The close** (one of two versions by due date) | new, chat 5 |
| 16 | **Done** | new, chat 5 |

The bar's line gains the new stops automatically; the deck reads the pages from the DOM.

---

## 3. Chat 1: the quiet frame (Opus 5.5)

**Goal.** Header slims after Begin; footer gone from this page; the exits are the logo and one link.

- Add `data-funnel` to the `.dk` main element. The deck's `paint(i)` already sets `.is-start` on the start screen; add a body class `is-funnelled` when `i > 0`, removed on Back to 0.
- CSS, scoped to `.page--builder.is-funnelled`: hide `.nav__tabs` and the Enquire `.tab--cta`; keep the logo and the wordmark; show a new `.nav__return` link at the right, "Return to the site", Montserrat label style, ink-mute, underlined on hover, href `index.html`. On phones the Menu button hides too and the return link takes its place.
- The header still folds and takes the glass on scroll as it does now; nothing else about it changes. **The header is a locked section on other pages. Do not edit `partials/header.html`.** The return link is injected by this page's script into `[data-nav]` after load, so the shared partial stays identical and `sync-header.py --check` stays ok.
- Footer: add `hidden` to the footer's wrapper on this page only via a `.page--builder .sf { display: none; }` rule, and remove the bar's footer clearance (`.page--deck` padding-bottom) in the released state. The partial file is untouched.
- Check: screenshot start and step 01 at 1440 and 390; `sync-header.py --check` and `sync-footer.py --check` ok; deck-check passes.

## 4. Chat 2: the due date screen (Sonnet 5.5)

**Goal.** A required due date between Start and Live-in or daytime.

- New `.dk-page` after the start page, `data-title="Due date"`, title "When is your baby due?" (capitals, the same `.dk-step__t`), lead line (Claude's words, for Amidat to approve): "So we can hold the right dates for you, and the right price."
- One field: `<input type="date" name="due" required>` styled like the budget field (`.budget__input`: hairline underline, mono figure). Min: none (past dates allowed). A one line note under it: "Already had your baby? Enter the birth date."
- **Next is blocked on this screen only** until the field has a valid date: the deck's `go()` refuses to move forward from this page while `due` is empty, and Next takes `aria-disabled="true"` and the muted colour. Everything else keeps the defaults on and never blocks.
- The engine reads `due` through a new `dueDate()` helper in `build-your-programme.js`; it is not a pricing input. `briefFor()` adds a line `DUE DATE  <d Mon yyyy>` at the top of the summary text.
- Check: the deck walks 0 to 1, Next blocked, enter a date, Next moves; the summary text carries the date; fit check at the four sizes.

## 5. Chat 3: the fee screen relaid (Sonnet 5.5)

**Goal.** The fee screen (`builder-summary`, the `.dk-sumhero` block) uses the start screen's layout.

- Copy the desktop rules from the start screen block (grid of words 1fr and photo 34%, `align-items: stretch`, no `::before` panel, the photo `position: absolute; inset: 0` inside its frame). Apply to `.dk-sum--fee > .dk-sumhero`. Remove the `.dk-sumhero .dk-start__copy` padding and fade variables.
- The words: INDICATIVE FEE label, the rolling fee (unchanged hooks: `[data-count-fee]`, `[data-fee]`), the introductory pricing line, the two paragraphs.
- Phones unchanged (photo band above).
- Check: photo top level with the label, foot level with the last paragraph, at 1440x900, 1835x605, 1024x768; fit check; bespoke-summary-check ALL OK.

## 6. Chat 4: Book a call now? (Sonnet 5.5)

**Goal.** One screen after Care budget with the question and a Yes / No pair.

- Care budget loses `data-pair-title="Book"` and its pair; it stands alone (or pairs with Always included if the fit check prefers; Claude's call in the chat).
- New `.dk-page`, `data-title="Book a call"`, title "Would you like to book a call now?", lead (client's words, from the existing Book page): "Thirty minutes by phone or video. We'll look at your choices, recommend the programme that fits, then confirm availability and fee. Nothing is booked on the call."
- A `.tgl` with hint "Choose one" and two `.tg` radios, `name="call"`: **Yes, book a call** ("Pick a time with Amidat") and **Not yet** ("Send my programme to my email instead"). Nothing on by default. **Next is blocked** until one is on, the same device as chat 2.
- The bar's Next on this screen reads **Continue**. On Yes, Continue goes to Calendly in the same tab: `consultationUrl` plus query parameters `name` empty, `a1` set to the brief text (Calendly custom question 1) and `a2` to the due date. If the Calendly event has no custom questions, pass them anyway; it ignores them. TJ or Amidat to add the questions in Calendly.
- On Not yet, Continue goes to the close (chat 5).
- The old Book page (`builder-summary-book`) is removed. Its legal line moves to the close.

## 7. Chat 5: the close and Done (Opus 5.5)

**Goal.** One screen with two versions chosen by due date, then a Done screen.

- New `.dk-page`, `data-title="Your programme"`, `data-close`. Script sets `data-close="hold"` when the due date is more than three calendar months from today, else `data-close="dates"`. The two versions are two blocks in the same section; CSS shows the one that matches.
- **Hold version** (copy Claude's, for Amidat): title "Hold this price"; lead "Your baby is due in [N] months. Indicative pricing is held for three months, but send your programme to your email and we'll hold this price for twelve months."; button **Hold my price**.
- **Dates version:** title "Check my dates"; lead "Your baby is due in [N] weeks. Send your programme to your email and we'll check availability for your dates and come back to you within one working day."; button **Check my dates**. If the date is past: "Your baby arrived [N] weeks ago."
- The form, shared by both: `<form data-capture method="post" action="#">` with `email` (required, type email, the budget field style), hidden `due`, `fee`, `days`, `format`, `shift`, `meals`, `treatments`, `rhythm`, `priorities`, `budget`, `summary` (the brief text), `close` (hold or dates), `generated` (ISO date). The script fills the hidden fields on every change. **No submit handler beyond preventing navigation and showing Done.** TJ's colleague replaces `action` and adds the request.
- Under the form, the legal line from the old Book page (client's). Beneath, small: "We'll send your programme summary too."
- **Done:** `data-title="Done"`, title "Done", line "Your programme is on its way." (hold: "and your price is held for twelve months"; dates: "and we'll come back to you within one working day"), then two links: **Return to the site** (index.html) and a quiet **Book a call** (Calendly). The bar on Done shows no Next.
- Check: both versions by setting the due date near and far; the hidden fields carry the right values; the Done screen; fit check at the four sizes; no overflow.

## 8. Chat 6: words for Amidat (Haiku 5.5)

List every new visible line from chats 2, 4 and 5 in one message for TJ to send. Nothing ships to GitHub before she has seen them.

---

## 9. For TJ's colleague (the email)

- The form is `form[data-capture]` on the close screen. Visible fields: `name` (required, added by TJ 14 Oct 2026) and `email` (required). Hidden fields are named above. `summary` is the same text as Copy my programme summary.
- `close` tells you which email to send: `hold` (twelve month price hold) or `dates` (availability check, follow up within one working day).
- Replace `action="#"` or attach a submit handler; on success show the Done screen by calling `deck.go(<index of Done>)`, which the page exposes.
