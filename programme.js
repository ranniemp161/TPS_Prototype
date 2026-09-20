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
  // A phone cannot hold thirty days on one line. The strip is drawn as
  // weeks below this width, which is a different arrangement rather
  // than a smaller one, so the script has to know which it is drawing.
  var NARROW = window.matchMedia('(max-width: 700px)');
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

  // Which care area a given control writes into. The panel is the only
  // place a change becomes visible, and a change nobody can find is a
  // change nobody trusts, so every control says where to look.
  var AREA_FOR = {
    format:    ['duration'],
    days:      ['duration', 'reservation'],
    shift:     ['duration', 'baby'],
    breakfast: ['meals'],
    lunch:     ['meals'],
    dinner:    ['meals'],
    bath:      ['mother'],
    massage:   ['mother'],
    hotstone:  ['mother'],
    binding:   ['mother'],
    rhythm:    ['mother'],
    scrub:     ['treatments'],
    reflex:    ['treatments'],
    facial:    ['treatments'],
    herbfoot:  ['treatments'],
    serum:     ['treatments']
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
      budgetFit:  document.querySelector('[data-budget-fit]'),
      prioCount:  document.querySelector('[data-prio-count]'),
      restore:    document.querySelector('[data-restore]'),
      nightInput: form.querySelector('input[name="shift"][value="night"]'),
      breakfast:  form.querySelector('input[name="breakfast"]'),
      massage:    form.querySelector('input[name="massage"]'),
      hotstone:   form.querySelector('input[name="hotstone"]')
    };

    // The last length seen, so rule 5 can tell a length change from any
    // other change without diffing the whole selection.
    var lastDays = null;
    var lastFee = null;
    var lastPriorities = null;

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
      // Areas the rules moved without the client touching them. Night
      // care taking breakfast out, or a length change resetting the
      // rhythm, changes the panel just as much as a click does, and an
      // unexplained change is the one that loses trust.
      var forced = [];

      // Rule 1. Night care requires live-in.
      var nightAllowed = format === 'in';
      el.nightInput.disabled = !nightAllowed;
      if (!nightAllowed && shift === 'night') {
        form.querySelector('input[name="shift"][value="day"]').checked = true;
        shift = 'day';
        forced.push('baby');
      }

      // Rule 2. Night care removes breakfast. Service starts at 1pm, so
      // breakfast sits outside it. Switching back to daytime re-checks it,
      // which is the spec's wording: the client did not deselect it.
      var night = shift === 'night' && format === 'in';
      if (night) {
        if (el.breakfast.checked || !el.breakfast.disabled) forced.push('meals');
        el.breakfast.checked = false;
        el.breakfast.disabled = true;
      } else if (el.breakfast.disabled) {
        el.breakfast.disabled = false;
        el.breakfast.checked = true;
        forced.push('meals');
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
        if (std && !std.checked) { std.checked = true; forced.push('mother'); }
      }
      lastDays = days;

      // Rule 4. Rhythm requires massage. The whole step goes down, not
      // just its inputs, because a live-looking step whose numbers mean
      // nothing is worse than a dimmed one.
      var rhythmOff = !el.massage.checked;
      el.rhythmStep.classList.toggle('is-off', rhythmOff);
      [].slice.call(form.querySelectorAll('input[name="rhythm"]'))
        .forEach(function (i) { i.disabled = rhythmOff; });

      return forced;
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

      // The way back, offered only when there is one to offer.
      if (el.restore) {
        el.restore.hidden = done;
        if (!done) el.restore.textContent = 'Restore the complete ' + sel.days + ' day programme';
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
      //
      // On a phone none of that applies, because thirty days on one line
      // is fourteen pixels a day behind a sideways scroll nobody finds.
      // There the stay is drawn as weeks, seven days to a row, which is
      // the shape a month already has in the reader's head.
      var week = NARROW.matches;
      var scale = week ? 'week' : d <= 7 ? 'short' : d <= 14 ? 'mid' : 'long';
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
        // there is not: the first, every seventh, and the last. The last
        // day always keeps its number, and a week marker within two days
        // of it is dropped rather than printed alongside, because at
        // thirty days 28 and 30 otherwise collide.
        //
        // In weeks every day is numbered. A cell is wide enough for two
        // figures there, and a calendar with most of its dates missing
        // is not a calendar.
        // The short tier lost its wording when the week tier arrived and
        // the two were folded into one branch. A 190px cell has room
        // for the word and reads as a calendar with it; a 44px cell in
        // a week row does not and takes the numeral.
        var isWeekMark = (i + 1) % 7 === 0 && (d - 1 - i) > 2;
        var label = scale === 'short' ? 'Day ' + (i + 1)
          : scale === 'week' ? String(i + 1)
          : (i === 0 || i === d - 1 || isWeekMark) ? String(i + 1) : '';
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

    // Everything a client can switch off, switched off. Grocery has no
    // control and is always charged, which is what the floor is for.
    function strippedSelection(days) {
      return {
        days: days, format: 'in', shift: 'day',
        breakfast: false, lunch: false, dinner: false,
        bath: 'none',
        massage: false, hotstone: false, binding: false,
        scrub: false, reflex: false, facial: false, herbfoot: false, serum: false,
        rhythm: P.STD_MFREQ[days]
      };
    }

    // What a length costs at its fullest and at its floor, in the format
    // the client has already chosen. Priced through the same function as
    // everything else, so a recommendation can never quote a figure the
    // builder itself would not reach.
    function bracket(days, format) {
      var full = P.completeSelection(days);
      var bare = strippedSelection(days);
      full.format = bare.format = format;
      return { full: P.calculate(full).fee, floor: P.calculate(bare).fee };
    }

    var WORDS = { 5: 'five', 7: 'seven', 14: 'fourteen', 30: 'thirty' };
    function word(d) { return WORDS[d] || String(d); }

    var COUNTS = ['none', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

    // What the client just did, said back to her where she did it, and
    // pointed at where it went. Neither of these moves the fee, and
    // that is the point: the only evidence they are working at all is
    // the brief, and the brief is behind a button.
    function paintPriorities() {
      var picked = priorities();
      if (!el.prioCount) return;

      if (!picked.length) {
        el.prioCount.hidden = true;
      } else {
        el.prioCount.hidden = false;
        el.prioCount.textContent = (COUNTS[picked.length] || picked.length) +
          (picked.length === 1 ? ' thing noted for your call.' : ' things noted for your call.');
      }

      // And the control that holds them says so, until she opens it.
      // Not on the first paint, which is the page loading rather than
      // the client choosing, and not when she has just cleared the last
      // one: a summary marked as holding something new, when what is
      // new is that it holds nothing, is noise.
      if (el.briefToggle && el.briefBox) {
        var now = picked.join('|');
        var first = lastPriorities === null;
        var changed = !first && now !== lastPriorities;
        lastPriorities = now;
        if (changed && picked.length && el.briefBox.hidden) {
          el.briefToggle.classList.add('has-news');
        }
      }
    }

    // Consultative, never arithmetic. It never shows an over or under
    // amount, because the answer to a budget here is a conversation
    // rather than a shortfall.
    //
    // What it does now is answer the question the client actually asked.
    // The field took a number, replied with a courtesy and left her
    // exactly where she was: its own helper line promises we will
    // recommend the strongest programme for her, and nothing recommended
    // anything. Every figure below is priced through calculate(), and
    // the control beside it puts that programme on the page.
    function paintBudget(result, sel) {
      var raw = el.budget.value;
      if (raw === '' || isNaN(Number(raw)) || Number(raw) <= 0) {
        el.budgetAns.hidden = true;
        el.budgetFit.hidden = true;
        return;
      }
      var v = Number(raw);

      // The three responses the spec sets, word for word. They carry the
      // tone; the recommendation under them carries the use.
      var text;
      if (v >= result.fee) {
        text = 'Thank you. That sits comfortably around the programme you have shaped, and we will bring options to your call.';
      } else if (v >= result.floor * 0.85) {
        text = 'Thank you. We will look at where the care can be shaped differently to work closer to that on your call.';
      } else {
        text = 'Thank you. That is below where this length of programme usually sits, so we will talk through a shorter programme or a different format with you.';
      }
      el.budgetAns.textContent = text;
      el.budgetAns.hidden = false;

      recommend(v, sel);
    }

    function recommend(v, sel) {
      var lengths = [30, 14, 7, 5];
      var format = sel.format;
      var completeFit = null, shapedFit = null;

      // Longest first, because the length is the programme. A client who
      // can afford a fortnight should be shown the fortnight.
      for (var i = 0; i < lengths.length; i++) {
        var d = lengths[i];
        var br = bracket(d, format);
        if (completeFit === null && v >= br.full)  completeFit = { days: d, fee: br.full };
        if (shapedFit === null   && v >= br.floor) shapedFit  = { days: d, fee: br.floor };
      }

      var head, body, action = null, alt = null, altAction = null;

      if (completeFit && completeFit.days === 30) {
        head = 'Every one of our programmes sits within that.';
        body = 'The full thirty days, complete, is ' + P.money(completeFit.fee) + ' indicative.';
        if (sel.days !== 30) action = { days: 30, complete: true, label: 'Show me the thirty day programme' };
      } else if (completeFit) {
        head = 'Our complete ' + word(completeFit.days) + ' day programme fits that.';
        body = P.money(completeFit.fee) + ' indicative, with every element of the published programme in it.';
        action = { days: completeFit.days, complete: true,
                   label: 'Show me the ' + word(completeFit.days) + ' day programme' };
      } else if (shapedFit) {
        head = 'A ' + word(shapedFit.days) + ' day programme can be shaped to sit near that.';
        body = 'It starts at ' + P.money(shapedFit.fee) + ' indicative for the period, and we build up from there with you.';
        action = { days: shapedFit.days, complete: false,
                   label: 'Start from ' + word(shapedFit.days) + ' days' };
      } else {
        var five = bracket(5, format);
        head = 'That sits below where our shortest programme starts.';
        body = 'Five days begins at ' + P.money(five.floor) + ' indicative, because your specialist is reserved for your family for the whole of it. Bring the figure to your call and we will talk through what is possible.';
      }

      // Two real answers, not one. At four thousand two hundred a client
      // can have seven days complete or fourteen days shaped, and which
      // of those is the better recovery is her call and her specialist's,
      // not this page's. Offering only the complete one quietly decides
      // it, and decides it towards the shorter stay, which is neither
      // what the brand believes nor what she asked.
      if (completeFit && shapedFit && shapedFit.days > completeFit.days) {
        alt = 'Or ' + word(shapedFit.days) + ' days, shaped to fit. It starts at '
            + P.money(shapedFit.fee) + ' indicative and we build up from there with you.';
        altAction = { days: shapedFit.days, complete: false,
                      label: 'Start from ' + word(shapedFit.days) + ' days' };
      }

      el.budgetFit.querySelector('[data-fit-head]').textContent = head;
      el.budgetFit.querySelector('[data-fit-body]').textContent = body;
      setAction(el.budgetFit.querySelector('[data-fit-apply]'), action);

      var altBox = el.budgetFit.querySelector('[data-fit-alt]');
      altBox.hidden = !alt;
      if (alt) {
        altBox.querySelector('[data-fit-alt-body]').textContent = alt;
        setAction(altBox.querySelector('[data-fit-apply]'), altAction);
      }

      el.budgetFit.hidden = false;
      markBudgetTab();

      // The recommendation carries a control, and a control below the
      // fold of the panel is a control nobody presses. If the view it
      // lives in is the one on screen, bring it up.
      var view = document.getElementById('view-budget');
      var body = summary.querySelector('.summary__body');
      if (view && !view.hidden && body && body.scrollHeight > body.clientHeight) {
        el.budgetFit.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'nearest' });
      }
    }

    function setAction(btn, action) {
      if (!action) { btn.hidden = true; return; }
      btn.textContent = action.label;
      btn.hidden = false;
      btn.setAttribute('data-days', String(action.days));
      btn.setAttribute('data-complete', String(action.complete));
    }

    // Restoring means the published programme at the length she has
    // chosen. Her format and her shift are hers and are left alone, the
    // same rule the budget's apply button follows.
    if (el.restore) {
      el.restore.addEventListener('click', function () {
        var days = parseInt(radio('days'), 10);
        var full = P.completeSelection(days);
        // Set everything, then let applyRules be the authority on what
        // the dependencies forbid. Skipping disabled inputs here looked
        // safer and was wrong: with massage off, hot stone is disabled,
        // so restore left it out and rebuilt a programme that was not
        // the published one. The rules live in one place.
        ['breakfast', 'lunch', 'dinner', 'massage', 'hotstone', 'binding']
          .concat(P.COUNTED).forEach(function (k) {
            var i = form.querySelector('input[name="' + k + '"]');
            if (i) i.checked = full[k];
          });
        form.querySelector('input[name="bath"][value="' + full.bath + '"]').checked = true;
        form.querySelector('input[name="rhythm"][value="' + full.rhythm + '"]').checked = true;
        update('restore');
      });
    }

    // Putting the recommendation on the page rather than describing it.
    // The client's format and shift are hers and are left alone; only
    // the length, and the elements of the published programme, are set.
    el.budgetFit.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-fit-apply]');
      if (!btn) return;
      var days = btn.getAttribute('data-days');
      var complete = btn.getAttribute('data-complete') === 'true';

      form.querySelector('input[name="days"][value="' + days + '"]').checked = true;
      if (complete) {
        var full = P.completeSelection(Number(days));
        ['breakfast', 'lunch', 'dinner', 'massage', 'hotstone', 'binding']
          .concat(P.COUNTED).forEach(function (k) {
            var i = form.querySelector('input[name="' + k + '"]');
            if (i) i.checked = full[k];
          });
        form.querySelector('input[name="bath"][value="' + full.bath + '"]').checked = true;
        form.querySelector('input[name="rhythm"][value="' + full.rhythm + '"]').checked = true;
      }
      update('days');
      document.getElementById('step-02').scrollIntoView({
        behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });
    });

    /* ---------- The update ---------- */

    function update(cause) {
      var forced = applyRules(cause);
      var sel = read();
      var result = P.calculate(sel);

      paintSteps(sel);
      paintSummary(sel, result);
      paintShape(sel);
      paintPriorities();
      paintBudget(result, sel);

      var text = briefFor(sel, result);
      el.briefText.textContent = text;

      return forced;
    }

    /* ---------- The panel's two views ---------- */

    // One panel, two readings, and a fee below both that never moves.
    // The budget used to sit in a band of its own halfway down the page:
    // by the time a client reached it the programme it was meant to be
    // measured against had scrolled away, which is the opposite of what
    // the field is for.
    //
    // A recommendation that arrives while the other view is open marks
    // its tab, so nothing useful happens off screen unannounced.
    var tabs = [].slice.call(summary.querySelectorAll('.summary__tab'));
    var views = [].slice.call(summary.querySelectorAll('.view'));

    function showView(name, focusTab) {
      tabs.forEach(function (t) {
        var on = t.dataset.view === name;
        t.setAttribute('aria-selected', String(on));
        if (on && focusTab) t.focus();
        if (on) t.classList.remove('has-news');
      });
      views.forEach(function (v) { v.hidden = v.id !== 'view-' + name; });
      var body = summary.querySelector('.summary__body');
      if (body) body.scrollTop = 0;
    }

    tabs.forEach(function (t) {
      t.addEventListener('click', function () { showView(t.dataset.view); });
      // Left and right move between tabs, which is what a tablist owes
      // a keyboard user.
      t.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.preventDefault();
        var i = tabs.indexOf(t);
        var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        showView(next.dataset.view, true);
      });
    });

    function markBudgetTab() {
      var budgetView = document.getElementById('view-budget');
      if (!budgetView || !budgetView.hidden) return;
      var tab = summary.querySelector('[data-view="budget"]');
      if (tab) tab.classList.add('has-news');
    }

    /* ---------- Cause and effect, both ways ---------- */

    // The panel shows the area the last change landed in, and only
    // scrolls when it has to: block "nearest" leaves an area already in
    // view exactly where it is, and the panel only scrolls at all when
    // it is the sticky column rather than a block in the phone's flow.
    function flag(name, forced) {
      var areas = (AREA_FOR[name] || []).concat(forced || []);
      if (!areas.length) return;

      // Last change only. Marks that accumulate are marks that mean
      // nothing, which is the same mistake the Blush fill was making.
      [].slice.call(summary.querySelectorAll('.area.is-changed'))
        .forEach(function (el) { el.classList.remove('is-changed'); });

      var body = summary.querySelector('.summary__body');
      var scrolls = body && body.scrollHeight > body.clientHeight;
      var seen = {};
      areas.forEach(function (a, i) {
        if (seen[a]) return;
        seen[a] = true;
        var el = summary.querySelector('[data-area="' + a + '"]');
        if (!el) return;
        void el.offsetWidth;                 // restart the animation
        el.classList.add('is-changed');
        if (i === 0 && scrolls) {
          el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'nearest' });
        }
      });
    }

    summary.addEventListener('animationend', function (e) {
      if (e.animationName === 'flag') e.target.classList.remove('is-changed');
    });

    // And the way back. A client notices the wrong thing in the panel,
    // not in the column, so the heading she is looking at takes her to
    // the control that sets it.
    summary.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-goto]');
      if (!btn) return;
      var step = document.getElementById(btn.dataset.goto);
      if (!step) return;

      step.classList.remove('is-targeted');
      void step.offsetWidth;
      step.classList.add('is-targeted');
      step.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'center' });

      // Focus follows, so a keyboard user arrives where the eye does.
      // preventScroll because the browser would otherwise fight the
      // smooth scroll above with a jump of its own.
      var first = step.querySelector('input:not([disabled])');
      if (first) first.focus({ preventScroll: true });
    });

    document.addEventListener('animationend', function (e) {
      if (e.animationName === 'target') e.target.classList.remove('is-targeted');
    });

    form.addEventListener('change', function (e) {
      var name = e.target && e.target.name;
      var forced = update(name === 'massage' ? 'massage' : name);
      flag(name, forced);
    });
    el.budget.addEventListener('input', function () { update('budget'); });

    // Crossing the breakpoint changes what the strip is, not just how
    // big it is, so it is redrawn rather than restyled. addListener is
    // the older spelling and is still what some in-app browsers offer.
    var onWidth = function () { update('width'); };
    if (NARROW.addEventListener) NARROW.addEventListener('change', onWidth);
    else if (NARROW.addListener) NARROW.addListener(onWidth);

    /* ---------- The brief reveal ---------- */

    el.briefToggle.addEventListener('click', function () {
      var open = el.briefBox.hidden;
      el.briefBox.hidden = !open;
      el.briefToggle.setAttribute('aria-expanded', String(open));
      el.briefToggle.textContent = open ? 'Hide my programme summary' : 'See my programme summary';
      if (open) el.briefToggle.classList.remove('has-news');
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
      '.movement, .step, .pair, .matters, .shape__head, .shape, .included__copy, .included__frame, .close'));
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


  /* ------------------------------------------------------------
     THE FEE BAR
     One rule: the fee is on screen, somewhere, for the whole of the
     choosing. The panel carries it while the panel is in view; this
     carries it when the panel is not, which is a phone at any
     position and a short laptop at the top of the builder, before
     the sticky column has anything to stick to.

     Two observers rather than a scroll listener, so nothing runs per
     frame: one watches the fee inside the panel, one watches the
     builder, and the bar shows only where both say it is wanted.
     ------------------------------------------------------------ */
  function feebar() {
    var panelFee = document.querySelector('.summary__top [data-fee]');
    var build = document.getElementById('builder');
    var body = document.body;
    if (!panelFee || !build) return;

    var feeSeen = false, choosing = false;
    function settle() {
      body.classList.toggle('is-fee-adrift', choosing && !feeSeen);
    }

    new IntersectionObserver(function (es) {
      feeSeen = es[0].isIntersecting;
      settle();
    }, { rootMargin: '-' + 64 + 'px 0px -72px 0px' }).observe(panelFee);

    // A little past the builder as well, so the bar does not vanish at
    // the exact moment a client reaches the day strip that her last
    // choice just redrew.
    new IntersectionObserver(function (es) {
      choosing = es[0].isIntersecting;
      settle();
    }, { rootMargin: '0px 0px 40% 0px' }).observe(build);
  }

  function boot() {
    nav();
    builder();
    entrances();
    feebar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
