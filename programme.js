/* ============================================================
   THE POSTPARTUM SUITE, programme builder

   Three jobs, in this order of importance.

   1. Enforce the dependency rules in spec section 2, so the page can
      never reach a state the pricing has no answer for.
   2. Read the controls, price them through `programme-pricing.js`, and
      write the result into the summary, the fee, the notices, the day
      strip and the enquiry brief.
   3. The nav, carried over from v1 so the two pages behave alike.

   What it deliberately does not do: register a ScrollTrigger or pin
   anything. v1 measures the whole document when it builds its hero pin
   and a stray pin here would inherit that trap for no gain. The two
   entrances on this page are an IntersectionObserver, which is the same
   choice the testimonial block on v1 makes and for the same reason.
   ============================================================ */

(function () {
  'use strict';

  var P = window.TPS_PRICING;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'power3.out';

  /* ------------------------------------------------------------
     NAVIGATION
     v1's nav, minus the logo morph. That morph is earned by scrolling
     through a photographic hero; this page opens on paper, so the bar
     starts in its resolved state and stays there.
     ------------------------------------------------------------ */
  function nav() {
    var root = document.querySelector('[data-nav]');
    if (!root) return;

    var tabs = [].slice.call(root.querySelectorAll('.tab[data-tab]'));
    var menu = root.querySelector('[data-menu]');
    var panels = [].slice.call(root.querySelectorAll('.menu__panel'));
    var veil = document.querySelector('[data-veil]');
    var burger = root.querySelector('[data-burger]');
    var open = null;

    function close(focusTab) {
      if (!open) return;
      var was = tabs.filter(function (t) { return t.dataset.tab === open; })[0];
      tabs.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
      open = null;
      function done() {
        menu.hidden = true;
        veil.hidden = true;
        if (burger) burger.setAttribute('aria-expanded', 'false');
        root.classList.remove('is-open');
      }
      if (REDUCED) { gsap.set(menu, { height: 0 }); gsap.set(veil, { opacity: 0 }); done(); }
      else {
        gsap.to(veil, { opacity: 0, duration: 0.2, ease: EASE });
        gsap.to(menu, { height: 0, duration: 0.28, ease: EASE, onComplete: done });
      }
      if (focusTab && was) was.focus();
    }

    function openPanel(name) {
      var tab = tabs.filter(function (t) { return t.dataset.tab === name; })[0];
      if (!tab) return;
      panels.forEach(function (p) { p.hidden = p.dataset.panel !== name; });
      tabs.forEach(function (t) { t.setAttribute('aria-expanded', String(t.dataset.tab === name)); });
      var first = open === null;
      open = name;

      menu.hidden = false;
      veil.hidden = false;
      var h = menu.scrollHeight;
      if (REDUCED) { gsap.set(menu, { height: 'auto' }); gsap.set(veil, { opacity: 1 }); return; }
      if (first) {
        gsap.fromTo(menu, { height: 0 }, { height: h, duration: 0.34, ease: EASE });
        gsap.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.26, ease: EASE });
      } else {
        gsap.to(menu, { height: h, duration: 0.26, ease: EASE });
      }
      gsap.fromTo(menu.querySelectorAll('.menu__group'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: EASE, delay: first ? 0.08 : 0 });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        if (open === tab.dataset.tab) close(true);
        else openPanel(tab.dataset.tab);
      });
    });

    veil.addEventListener('click', function () { close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) close(true); });
    root.addEventListener('focusout', function (e) { if (open && !root.contains(e.relatedTarget)) close(); });

    if (burger) {
      burger.addEventListener('click', function () {
        var isOpen = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', String(!isOpen));
        root.classList.toggle('is-open', !isOpen);
        if (isOpen) close();
        else { openPanel(tabs[0].dataset.tab); tabs[0].focus(); }
      });
    }
  }


  /* ------------------------------------------------------------
     THE BUILDER
     ------------------------------------------------------------ */

  var TREAT_LABEL = {
    scrub: 'body scrub',
    reflex: 'foot reflexology',
    facial: 'facial massage',
    herbfoot: 'herbal foot treatment',
    serum: 'hair serum therapy'
  };

  var RHYTHM_WORDS = {
    w4: 'four times a week',
    w3: 'three times a week',
    w2: 'twice a week',
    w1: 'once a week'
  };

  var BATH_WORDS = {
    daily: 'daily',
    eod: 'every other day',
    weekly: 'weekly',
    none: 'none'
  };

  function builder() {
    var form = document.querySelector('[data-builder-scope]') || document;
    var summary = document.querySelector('[data-summary]');
    if (!summary) return;

    var el = {
      feeOuts:    [].slice.call(document.querySelectorAll('[data-fee]')),
      floorNote:  document.querySelector('[data-floor-notice]'),
      doneNote:   document.querySelector('[data-complete-notice]'),
      doneFee:    document.querySelector('[data-complete-fee]'),
      reserveNote:document.querySelector('[data-reserve-note]'),
      mealsNote:  document.querySelector('[data-meals-note]'),
      rhythmNote: document.querySelector('[data-rhythm-note]'),
      rhythmStep: document.querySelector('[data-step-rhythm]'),
      bathCount:  document.querySelector('[data-bath-count]'),
      shapeTitle: document.querySelector('[data-shape-title]'),
      shapeGrid:  document.querySelector('[data-shape-grid]'),
      shapeEmpty: document.querySelector('[data-shape-empty]'),
      keys:       [].slice.call(document.querySelectorAll('.shape__key .key')),
      briefBox:   document.getElementById('brief'),
      briefText:  document.querySelector('[data-brief-text]'),
      briefToggle:document.querySelector('[data-brief-toggle]'),
      briefCopy:  document.querySelector('[data-brief-copy]'),
      budget:     document.getElementById('budget'),
      budgetAns:  document.querySelector('[data-budget-answer]'),
      nightInput: form.querySelector('input[name="shift"][value="night"]'),
      breakfast:  form.querySelector('input[name="breakfast"]'),
      massage:    form.querySelector('input[name="massage"]'),
      hotstone:   form.querySelector('input[name="hotstone"]')
    };

    // The last length seen, so rule 5 can tell a length change from any
    // other change without diffing the whole selection.
    var lastDays = null;
    var lastFee = null;

    function radio(name) {
      var hit = form.querySelector('input[name="' + name + '"]:checked');
      return hit ? hit.value : null;
    }
    function checked(name) {
      var hit = form.querySelector('input[name="' + name + '"]');
      return !!(hit && hit.checked);
    }

    function read() {
      var sel = {
        days: parseInt(radio('days'), 10),
        format: radio('format'),
        shift: radio('shift'),
        breakfast: checked('breakfast'),
        lunch: checked('lunch'),
        dinner: checked('dinner'),
        bath: radio('bath'),
        massage: checked('massage'),
        hotstone: checked('hotstone'),
        binding: checked('binding'),
        rhythm: radio('rhythm')
      };
      P.COUNTED.forEach(function (k) { sel[k] = checked(k); });
      return sel;
    }

    function priorities() {
      return [].slice.call(form.querySelectorAll('.prio input:checked'))
        .map(function (i) { return i.value; });
    }

    /* ---------- Dependency rules, spec section 2 ---------- */

    function applyRules(cause) {
      var format = radio('format');
      var shift = radio('shift');

      // Rule 1. Night care requires live-in.
      var nightAllowed = format === 'in';
      el.nightInput.disabled = !nightAllowed;
      if (!nightAllowed && shift === 'night') {
        form.querySelector('input[name="shift"][value="day"]').checked = true;
        shift = 'day';
      }

      // Rule 2. Night care removes breakfast. Service starts at 1pm, so
      // breakfast sits outside it. Switching back to daytime re-checks it,
      // which is the spec's wording: the client did not deselect it.
      var night = shift === 'night' && format === 'in';
      if (night) {
        el.breakfast.checked = false;
        el.breakfast.disabled = true;
      } else if (el.breakfast.disabled) {
        el.breakfast.disabled = false;
        el.breakfast.checked = true;
      }

      // Rule 3. Hot stone requires massage, and follows it.
      if (cause === 'massage') el.hotstone.checked = el.massage.checked;
      el.hotstone.disabled = !el.massage.checked;
      if (!el.massage.checked) el.hotstone.checked = false;

      // Rule 5. Changing length resets the rhythm to the standard for
      // that length. Without this a client silently leaves the published
      // programme and the fee moves for no visible reason.
      var days = parseInt(radio('days'), 10);
      if (lastDays !== null && days !== lastDays) {
        var std = form.querySelector('input[name="rhythm"][value="' + P.STD_MFREQ[days] + '"]');
        if (std) std.checked = true;
      }
      lastDays = days;

      // Rule 4. Rhythm requires massage. The whole step goes down, not
      // just its inputs, because a live-looking step whose numbers mean
      // nothing is worse than a dimmed one.
      var rhythmOff = !el.massage.checked;
      el.rhythmStep.classList.toggle('is-off', rhythmOff);
      [].slice.call(form.querySelectorAll('input[name="rhythm"]'))
        .forEach(function (i) { i.disabled = rhythmOff; });
    }

    /* ---------- Step copy that moves with the selection ---------- */

    function paintSteps(sel) {
      var night = sel.shift === 'night' && sel.format === 'in';

      el.mealsNote.textContent = night
        ? 'Cooked fresh in your kitchen. Night care begins at 1pm, so breakfast sits outside it. Herbal teas and lactation drinks are part of every programme.'
        : 'Cooked fresh in your kitchen, for you and your family. Herbal teas and lactation drinks are part of every programme.';

      var b = P.baths(sel.bath, sel.days);
      el.bathCount.textContent = b === 0 ? 'No baths'
        : b === 1 ? 'One bath' : b + ' baths';

      // Step 06 counts. The five with fixed counts read them off STD; the
      // three that follow the stay describe themselves in words, because
      // "30" against belly binding reads as thirty separate treatments.
      P.COUNTED.forEach(function (k) {
        var out = document.querySelector('[data-count="' + k + '"]');
        if (out) out.textContent = String(P.STD[sel.days][k]);
      });
      var mc = P.massageSessions(sel.rhythm, sel.days);
      var mOut = document.querySelector('[data-count="massage"]');
      if (mOut) mOut.textContent = mc + (mc === 1 ? ' session' : ' sessions');
      var hOut = document.querySelector('[data-count="hotstone"]');
      if (hOut) hOut.textContent = sel.massage ? 'with each massage' : 'needs massage';
      var bnOut = document.querySelector('[data-count="binding"]');
      if (bnOut) bnOut.textContent = 'daily';

      // Step 07 counts, one per rhythm, so the client can see what she is
      // choosing between rather than inferring it from the fee.
      ['w4', 'w3', 'w2', 'w1'].forEach(function (r) {
        var out = document.querySelector('[data-rhythm-count="' + r + '"]');
        if (!out) return;
        var n = P.massageSessions(r, sel.days);
        out.textContent = String(n);
        out.classList.toggle('is-one', n === 1);
        var row = out.closest('.rhythm');
        if (row) row.classList.toggle('is-standard', r === P.STD_MFREQ[sel.days]);
      });

      // The spec's line for this step promises that massage is never taken
      // on consecutive days. At most rhythms that holds. It cannot hold at
      // four a week on thirty days, which is eighteen sessions where
      // alternate days allow fifteen, and the day strip below makes that
      // visible. So the promise is made only where it is true, and where it
      // is not the client is told plainly and pointed at a gentler rhythm.
      // Flagged to the client as an open item alongside the three in the
      // spec's own section 13.
      var sessions = P.massageSessions(sel.rhythm, sel.days);
      var fitsAlternate = sessions <= Math.ceil(sel.days / 2);
      el.rhythmNote.textContent = sel.massage
        ? 'Our ' + sel.days + '-day programme is built around ' + RHYTHM_WORDS[P.STD_MFREQ[sel.days]] +
          '. Choose more or less and the fee moves with it. ' +
          (fitsAlternate
            ? 'Massage is never taken on consecutive days, so your body has a day between treatments.'
            : 'At ' + sessions + ' sessions across ' + sel.days + ' days, some fall on consecutive days. A gentler rhythm leaves your body a day between treatments.')
        : 'Postpartum massage is not currently selected, so there is no rhythm to set. Every other treatment follows a set rhythm for the length of programme you have chosen, and the count beside each one shows how often.';
    }

    /* ---------- The summary ---------- */

    // "Breakfast, Lunch and Dinner" is three proper nouns in a row. The
    // meal names are capitalised on their controls, where each one is a
    // label, and lowercased inside a sentence, where they are not.
    function sentenceCase(parts) {
      return parts.map(function (w, i) {
        return i === 0 ? w : w.charAt(0).toLowerCase() + w.slice(1);
      });
    }

    function sentence(parts) {
      if (parts.length === 0) return '';
      if (parts.length === 1) return parts[0];
      return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
    }

    function setArea(name, text, empty) {
      var area = document.querySelector('[data-area="' + name + '"]');
      if (!area) return;
      area.querySelector('[data-area-body]').textContent = text;
      area.classList.toggle('is-empty', !!empty);
    }

    function paintSummary(sel, result) {
      var night = sel.shift === 'night' && sel.format === 'in';
      var formatWord = sel.format === 'in' ? 'live-in care' : 'daytime in-home care';

      setArea('duration',
        sel.days + ' days, ' + formatWord + (night ? ', day and night' : '') +
        (sel.format === 'out' ? ', includes £30 a day for accommodation and travel' : ''));

      setArea('reservation',
        'One postpartum specialist, reserved for your family for the full ' + sel.days + ' days');

      var mother = [];
      if (sel.bath !== 'none') mother.push('Herbal baths ' + BATH_WORDS[sel.bath]);
      if (sel.massage) {
        mother.push('Postpartum massage ' + RHYTHM_WORDS[sel.rhythm] +
          (sel.hotstone ? ', with hot stone therapy' : ''));
      }
      if (sel.binding) mother.push('Daily belly binding');
      setArea('mother', mother.length ? mother.join(' · ') : 'None selected', !mother.length);

      setArea('baby', 'Hands-on care through the day' +
        (night ? ', and overnight from 11.30pm to 6am' : ''));

      var meals = [];
      if (sel.breakfast) meals.push('Breakfast');
      if (sel.lunch) meals.push('Lunch');
      if (sel.dinner) meals.push('Dinner');
      // The wording of the empty case matters. Printing only the teas and
      // drinks reads as though the meals were still in the programme.
      setArea('meals',
        meals.length
          ? sentence(sentenceCase(meals)) + ' cooked daily · herbal teas and lactation drinks'
          : 'No cooked meals selected · herbal teas and lactation drinks still included',
        !meals.length);

      var treats = P.COUNTED.filter(function (k) { return sel[k]; })
        .map(function (k) { return TREAT_LABEL[k] + ' (' + P.STD[sel.days][k] + ')'; });
      setArea('treatments', treats.length ? sentence(treats) : 'None selected', !treats.length);

      setArea('household', 'Light housekeeping · laundry and ironing · grocery shopping and cooking');

      // The fee. It settles rather than flickers, and only when it moved.
      var text = P.money(result.fee);
      var moved = lastFee !== null && text !== lastFee;
      el.feeOuts.forEach(function (out) {
        out.textContent = text;
        if (moved && !REDUCED) {
          out.classList.remove('is-moved');
          void out.offsetWidth;          // restart the animation
          out.classList.add('is-moved');
        }
      });
      lastFee = text;

      el.floorNote.hidden = !result.floored;

      var done = P.isComplete(sel);
      el.doneNote.hidden = !done;
      if (done) {
        el.doneNote.firstChild.textContent = 'This is our complete ' + sel.days + '-day programme, ';
        el.doneFee.textContent = P.money(result.fee);
      }

      el.reserveNote.textContent = sel.format === 'in'
        ? 'For live-in care, your specialist is reserved exclusively for your family for the full period. Removing elements adjusts the shape of care, not the reservation beneath it.'
        : 'Your specialist is held for your family for each day of the programme, whichever elements you keep. Daytime in-home care carries a supplement of £30 a day towards her accommodation and travel.';
    }

    /* ---------- The shape of the stay ---------- */

    // Evenly spaced positions for n events across d days. Placing each one
    // at the middle of its own share rather than at the edges is what makes
    // the result fall on alternate days by itself whenever the count allows
    // it, which is the rhythm the massage copy describes.
    function spread(n, d) {
      var out = [];
      if (n <= 0 || d <= 0) return out;
      if (n >= d) { for (var j = 0; j < d; j++) out.push(j); return out; }
      for (var i = 0; i < n; i++) out.push(Math.floor((i + 0.5) * d / n));
      return out;
    }

    function paintShape(sel) {
      var d = sel.days;
      var night = sel.shift === 'night' && sel.format === 'in';

      var bathDays = {};
      spread(P.baths(sel.bath, d), d).forEach(function (i) { bathDays[i] = true; });

      var massageDays = {};
      if (sel.massage) {
        spread(P.massageSessions(sel.rhythm, d), d).forEach(function (i) { massageDays[i] = true; });
      }

      // The treatments are spread as one pooled set, not one at a time.
      // Spreading each independently put every treatment with a count of
      // one on the same day, so a complete five day programme drew four
      // bare days and a single stack of five, which is both ugly and a
      // lie about how the stay runs. Pooling them round robin and
      // spreading the pool gives one treatment a day at five days and an
      // even scatter at thirty.
      var pool = [];
      var most = 0;
      P.COUNTED.forEach(function (k) { if (sel[k]) most = Math.max(most, P.STD[d][k]); });
      for (var round = 0; round < most; round++) {
        P.COUNTED.forEach(function (k) {
          if (sel[k] && P.STD[d][k] > round) pool.push(k);
        });
      }
      var treatDays = {};
      spread(pool.length, d).forEach(function (i) { treatDays[i] = (treatDays[i] || 0) + 1; });

      var anything = Object.keys(bathDays).length || Object.keys(massageDays).length ||
                     Object.keys(treatDays).length || night;

      el.shapeTitle.textContent = d + ' days, laid out';
      el.shapeEmpty.hidden = !!anything;

      // Five days drawn at thirty day weight is five small ticks in a lot
      // of paper, and this strip is the one thing on the page that has to
      // land. The marks, the rules between days and the day labels all
      // grow as the stay shortens, so a short programme reads as a full
      // drawing rather than a sparse version of a longer one.
      var scale = d <= 7 ? 'short' : d <= 14 ? 'mid' : 'long';
      el.shapeGrid.setAttribute('data-scale', scale);

      var frag = document.createDocumentFragment();
      for (var i = 0; i < d; i++) {
        var col = document.createElement('div');
        col.className = 'day';

        if (treatDays[i]) {
          for (var t = 0; t < treatDays[i]; t++) col.appendChild(mark('treat'));
        }
        if (massageDays[i]) col.appendChild(mark('massage'));
        if (bathDays[i]) col.appendChild(mark('bath'));
        if (night) col.appendChild(mark('night'));

        var n = document.createElement('span');
        n.className = 'day__n';
        // Named in full where there is room for the word, numbered where
        // there is not: the first, every seventh, and the last.
        // The last day always gets its number, and a week marker within
        // two days of it is dropped rather than printed alongside: at
        // thirty days, 28 and 30 otherwise collide.
        var isWeek = (i + 1) % 7 === 0 && (d - 1 - i) > 2;
        var label = scale === 'short'
          ? 'Day ' + (i + 1)
          : (i === 0 || i === d - 1 || isWeek) ? String(i + 1) : '';
        n.textContent = label;
        col.appendChild(n);

        col.setAttribute('role', 'listitem');
        col.setAttribute('aria-label', dayLabel(i + 1, bathDays[i], massageDays[i], treatDays[i], night));
        frag.appendChild(col);
      }

      el.shapeGrid.setAttribute('role', 'list');
      el.shapeGrid.setAttribute('aria-label', 'Day by day shape of your ' + d + ' day programme');
      el.shapeGrid.textContent = '';
      el.shapeGrid.appendChild(frag);

      // The key dims the entries that have nothing on the strip, so it
      // describes this programme rather than the set of all programmes.
      el.keys.forEach(function (k) {
        var off =
          (k.classList.contains('key--bath')    && !Object.keys(bathDays).length) ||
          (k.classList.contains('key--massage') && !Object.keys(massageDays).length) ||
          (k.classList.contains('key--treat')   && !Object.keys(treatDays).length) ||
          (k.classList.contains('key--night')   && !night);
        k.classList.toggle('is-off', off);
      });
    }

    function mark(kind) {
      var m = document.createElement('span');
      m.className = 'mark mark--' + kind;
      return m;
    }

    function dayLabel(n, bath, massage, treats, night) {
      var bits = [];
      if (bath) bits.push('herbal bath');
      if (massage) bits.push('massage');
      if (treats) bits.push(treats === 1 ? 'a recovery treatment' : treats + ' recovery treatments');
      if (night) bits.push('night care');
      return 'Day ' + n + (bits.length ? ': ' + sentence(bits) : ': no treatments placed');
    }

    /* ---------- The enquiry brief ---------- */

    function briefFor(sel, result) {
      var night = sel.shift === 'night' && sel.format === 'in';
      var pri = priorities();
      var budget = el.budget.value ? Number(el.budget.value) : null;

      var mother = [];
      if (sel.bath !== 'none') mother.push('Herbal baths ' + BATH_WORDS[sel.bath]);
      if (sel.massage) mother.push('Postpartum massage ' + RHYTHM_WORDS[sel.rhythm] +
        (sel.hotstone ? ', with hot stone therapy' : ''));
      if (sel.binding) mother.push('Daily belly binding');

      var meals = [];
      if (sel.breakfast) meals.push('Breakfast');
      if (sel.lunch) meals.push('Lunch');
      if (sel.dinner) meals.push('Dinner');

      var treats = P.COUNTED.filter(function (k) { return sel[k]; })
        .map(function (k) { return TREAT_LABEL[k] + ' (' + P.STD[sel.days][k] + ')'; });

      var lines = [];
      lines.push('THE POSTPARTUM SUITE, PROGRAMME ENQUIRY');
      lines.push('');
      lines.push(pad('Duration') + sel.days + ' days');
      lines.push(pad('Care format') + (sel.format === 'in' ? 'Live-in care' : 'Daytime in-home care') +
        (night ? ', day and night' : ', daytime'));
      lines.push(pad('Reservation') + 'One postpartum specialist, exclusive, ' + sel.days + ' days');
      lines.push('');
      lines.push("Mother's recovery support");
      lines.push('  ' + (mother.length ? mother.join(' · ') : 'None selected'));
      lines.push('Baby support');
      lines.push('  Hands-on care through the day' + (night ? ', and overnight from 11.30pm to 6am' : ''));
      lines.push('Meals and nourishment');
      lines.push('  ' + (meals.length
        ? sentence(sentenceCase(meals)) + ' cooked daily · herbal teas and lactation drinks'
        : 'No cooked meals selected · herbal teas and lactation drinks still included'));
      lines.push('Recovery treatments');
      lines.push('  ' + (treats.length ? sentence(treats) : 'None selected'));
      lines.push('Household support');
      lines.push('  Light housekeeping · laundry and ironing · grocery shopping and cooking');
      lines.push('');
      lines.push('Priorities');
      lines.push('  ' + (pri.length ? sentence(pri) : 'None indicated'));
      if (budget) lines.push('  Care budget indicated: ' + P.money(budget));
      lines.push('');
      lines.push(pad('Indicative fee') + P.money(result.fee) +
        (P.CONFIG.introPricing ? '  (introductory pricing, held for ' + P.CONFIG.introHeldFor + ')' : ''));
      if (result.floored) {
        lines.push(pad('') + 'At the minimum fee for this length.');
      }
      lines.push('');
      lines.push('Final programme, availability and fee are confirmed after consultation.');
      return lines.join('\n');
    }

    function pad(label) {
      var s = label;
      while (s.length < 19) s += ' ';
      return s;
    }

    /* ---------- Budget ---------- */

    // Consultative, never arithmetic. It never shows an over or under
    // amount, because the answer to a budget on this page is a
    // conversation rather than a shortfall.
    function paintBudget(result) {
      var raw = el.budget.value;
      if (raw === '' || isNaN(Number(raw))) { el.budgetAns.hidden = true; return; }
      var v = Number(raw);
      var floor = result.floor;
      var text;
      if (v >= result.fee) {
        text = 'Thank you. That sits comfortably around the programme you have shaped, and we will bring options to your call.';
      } else if (v >= floor * 0.85) {
        text = 'Thank you. We will look at where the care can be shaped differently to work closer to that on your call.';
      } else {
        text = 'Thank you. That is below where this length of programme usually sits, so we will talk through a shorter programme or a different format with you.';
      }
      el.budgetAns.textContent = text;
      el.budgetAns.hidden = false;
    }

    /* ---------- The update ---------- */

    function update(cause) {
      applyRules(cause);
      var sel = read();
      var result = P.calculate(sel);

      paintSteps(sel);
      paintSummary(sel, result);
      paintShape(sel);
      paintBudget(result);

      var text = briefFor(sel, result);
      el.briefText.textContent = text;
    }

    form.addEventListener('change', function (e) {
      var name = e.target && e.target.name;
      update(name === 'massage' ? 'massage' : name);
    });
    el.budget.addEventListener('input', function () { update('budget'); });

    /* ---------- The brief reveal ---------- */

    el.briefToggle.addEventListener('click', function () {
      var open = el.briefBox.hidden;
      el.briefBox.hidden = !open;
      el.briefToggle.setAttribute('aria-expanded', String(open));
      el.briefToggle.textContent = open ? 'Hide my programme summary' : 'See my programme summary';
      if (open) {
        el.briefBox.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
      }
    });

    el.briefCopy.addEventListener('click', function () {
      var text = el.briefText.textContent;
      var done = function () {
        el.briefCopy.textContent = 'Copied';
        setTimeout(function () { el.briefCopy.textContent = 'Copy'; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else fallback();

      // Clipboard access is refused over file:// in some browsers, and this
      // prototype opens that way as often as it is served.
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); }
        catch (err) { el.briefCopy.textContent = 'Select and copy'; }
        document.body.removeChild(ta);
      }
    });

    update('init');
  }


  /* ------------------------------------------------------------
     ENTRANCES
     One observer, no scroll listener, no ScrollTrigger.
     ------------------------------------------------------------ */
  function entrances() {
    if (REDUCED) return;
    // The hero is deliberately not in this list. It is the first thing on
    // screen, so fading it in means the visitor lands on a blank page and
    // waits out a transition to read the sentence she came for. Reveals
    // start below the fold, where there is something to reveal.
    var targets = [].slice.call(document.querySelectorAll(
      '.movement, .step, .pair, .brief-band__budget, .shape__head, .shape, .included__copy, .included__frame, .close'));
    targets.forEach(function (t) { t.classList.add('rise'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (t) { io.observe(t); });
  }


  function boot() {
    nav();
    builder();
    entrances();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
