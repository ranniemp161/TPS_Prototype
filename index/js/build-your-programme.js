/* ============================================================
   THE POSTPARTUM SUITE, programme builder (the carousel, 10 Oct 2026)

   Three jobs, in this order of importance.

   1. Enforce the dependency rules in spec section 2, so the page can
      never reach a state the pricing has no answer for.
   2. Read the controls, price them through `build-your-programme-pricing.js`, and
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
     THE BUILDER (Build 10, 10 Oct 2026)
     Same machinery as before: rules, read, price, paint the steps, the
     panel, the day strip, the budget and the brief, flag the area a
     change landed in. The fields and the copy follow the Build 10 spec.
     ------------------------------------------------------------ */

  var TREAT_LABEL = {
    scrub: 'body scrub',
    reflex: 'foot reflexology',
    facial: 'facial massage',
    herbfoot: 'herbal foot treatment',
    thermal: 'thermal blanket treatment'
  };

  var AREA_FOR = {
    format:   ['duration'],
    days:     ['duration', 'reservation', 'treatments'],
    shift:    ['duration', 'baby', 'meals'],
    meals:    ['meals'],
    massage:  ['treatments'],
    rhythm:   ['treatments'],
    scrub:    ['treatments'],
    reflex:   ['treatments'],
    facial:   ['treatments'],
    herbfoot: ['treatments'],
    thermal:  ['treatments']
  };

  function builder() {
    var form = document.querySelector('[data-builder-scope]') || document;
    var summary = document.querySelector('[data-summary]');
    if (!summary) return;

    var el = {
      feeOuts:    [].slice.call(document.querySelectorAll('[data-fee]')),
      floorNote:  document.querySelector('[data-floor-notice]'),
      doneNote:   document.querySelector('[data-complete-notice]'),
      reserveNote:document.querySelector('[data-reserve-note]'),
      builtTitle: document.querySelector('[data-built-title]'),
      mealsNote:  document.querySelector('[data-meals-note]'),
      mealsSub:   document.querySelector('[data-meals-sub]'),
      nightBand:  document.querySelector('[data-night-band]'),
      rhythms:    document.querySelector('[data-rhythms]'),
      rhythmNote: document.querySelector('[data-rhythm-note]'),
      rhythmStep: document.querySelector('[data-step-rhythm]'),
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
      massage:    form.querySelector('input[name="massage"]'),
      tickerChip: document.querySelector('[data-fee-chip]')
    };

    // Two counting figures, one value: the bar's fee and the summary.
    var rollers = [].slice.call(document.querySelectorAll('[data-count-fee]')).map(counter);

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
      var days = parseInt(radio('days'), 10);
      var sel = {
        days: days,
        format: radio('format'),
        shift: radio('shift'),
        meals: radio('meals') === 'yes',
        massage: checked('massage'),
        rhythm: radio('rhythm') || P.standardRhythm(days)
      };
      P.COUNTED.forEach(function (k) { sel[k] = checked(k); });
      return sel;
    }

    function priorities() {
      return [].slice.call(form.querySelectorAll('input[name^="p-"]:checked'))
        .map(function (i) { return i.value; });
    }

    /* ---------- Step 06: the rhythm options for the length (spec 4.3) ---------- */

    function drawRhythms(days, keep) {
      var std = P.standardRhythm(days);
      var want = keep && P.RHYTHMS[days].indexOf(keep) >= 0 ? keep : std;
      var frag = document.createDocumentFragment();
      P.RHYTHMS[days].forEach(function (r) {
        var n = P.massageSessions(r, days);
        var lab = document.createElement('label');
        lab.className = 'tg' + (r === std ? ' is-standard' : '');
        lab.innerHTML =
          '<input class="sr-only" type="radio" name="rhythm" value="' + r + '"' + (r === want ? ' checked' : '') + ' />' +
          '<span class="tg__body">' +
            '<span class="tg__t">' + P.rhythmTitle(r) + '</span>' +
            '<span class="tg__s">' + (days <= 7
              ? 'Across your ' + days + ' days'
              : n + ' sessions across ' + days + ' days') + '</span>' +
          '</span>' +
          (r === std ? '<span class="tg__aside">Standard</span>' : '') +
          '<span class="tg__sw" aria-hidden="true"></span>';
        frag.appendChild(lab);
      });
      el.rhythms.textContent = '';
      el.rhythms.appendChild(frag);
    }

    /* ---------- Rules (spec 3 and 4.5) ---------- */

    function applyRules(cause) {
      var format = radio('format');
      var shift = radio('shift');
      var forced = [];

      // Night care is live-in only.
      var nightAllowed = format === 'in';
      el.nightInput.disabled = !nightAllowed;
      el.nightBand.hidden = nightAllowed;
      if (!nightAllowed && shift === 'night') {
        form.querySelector('input[name="shift"][value="day"]').checked = true;
        forced.push('baby', 'meals');
      }

      // Changing the length resets the rhythm to that length's standard.
      var days = parseInt(radio('days'), 10);
      if (lastDays === null || days !== lastDays) {
        var had = radio('rhythm');
        drawRhythms(days, null);
        if (lastDays !== null && had !== P.standardRhythm(days)) forced.push('treatments');
      }
      lastDays = days;

      // No rhythm to set without massage.
      var off = !el.massage.checked;
      el.rhythmStep.classList.toggle('is-off', off);
      [].slice.call(form.querySelectorAll('input[name="rhythm"]'))
        .forEach(function (i) { i.disabled = off; });

      return forced;
    }

    /* ---------- Step copy that moves with the selection ---------- */

    function times(n) { return n + (n === 1 ? ' time' : ' times'); }

    function paintSteps(sel) {
      var night = sel.shift === 'night' && sel.format === 'in';

      el.mealsNote.textContent = night
        ? 'Cooked fresh in your kitchen for you and your family. With night care your specialist’s day begins at 1pm, so breakfast sits outside it. Herbal teas and lactation drinks are in every programme.'
        : 'Cooked fresh in your kitchen for you and your family, guided by confinement principles. Herbal teas and lactation drinks are in every programme.';
      el.mealsSub.textContent = night ? 'Lunch and dinner, every day' : 'Breakfast, lunch and dinner, every day';

      P.COUNTED.forEach(function (k) {
        var out = document.querySelector('[data-count="' + k + '"]');
        if (out) out.textContent = times(P.STD[sel.days][k]);
      });
      var mOut = document.querySelector('[data-count="massage"]');
      if (mOut) {
        var mc = P.massageSessions(sel.rhythm, sel.days);
        mOut.textContent = sel.massage ? mc + (mc === 1 ? ' session' : ' sessions') : 'Not selected';
      }

      var stdN = P.massageSessions(P.standardRhythm(sel.days), sel.days);
      el.rhythmNote.textContent = !sel.massage
        ? 'Postpartum massage isn’t selected, so there’s no rhythm to set. Go back one step to add it.'
        : sel.days <= 7
          ? 'Your ' + sel.days + '-day programme includes ' + stdN + ' massages. Choose fewer and the fee comes down with it. Massage is never on back-to-back days, so your body has a day to rest between.'
          : 'Your ' + sel.days + '-day programme is built around massage four times a week. Choose fewer and the fee comes down with it. Massage is never on back-to-back days, so your body has a day to rest between.';
    }

    /* ---------- The summary (spec page 8, card 2) ---------- */

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

    function formatLine(sel) {
      var night = sel.shift === 'night' && sel.format === 'in';
      return (sel.format === 'in' ? 'Live-in care' : 'Daytime in-home care') + ', ' +
        (night ? 'day and night' : '7am to 7pm');
    }

    function treatmentsLine(sel) {
      var bits = ['Herbal baths and belly binding daily'];
      if (sel.massage) {
        var mc = P.massageSessions(sel.rhythm, sel.days);
        bits.push('postpartum massage with hot stone therapy ' +
          (sel.days <= 7 ? '(' + mc + ' sessions)' : P.rhythmTitle(sel.rhythm).toLowerCase() + ' (' + mc + ' sessions)'));
      }
      var extras = P.COUNTED.filter(function (k) { return sel[k]; })
        .map(function (k) { return TREAT_LABEL[k] + ' (' + P.STD[sel.days][k] + ')'; });
      if (extras.length) bits.push(extras.join(', '));
      return bits.join(' · ');
    }

    function mealsLine(sel) {
      var night = sel.shift === 'night' && sel.format === 'in';
      return sel.meals
        ? (night ? 'Lunch and dinner' : 'Breakfast, lunch and dinner') + ' cooked daily · herbal teas and lactation drinks'
        : 'No cooked meals · herbal teas and lactation drinks still included';
    }

    function paintSummary(sel, result) {
      var night = sel.shift === 'night' && sel.format === 'in';
      var title = sel.days + ' days · ' + formatLine(sel).charAt(0).toLowerCase() + formatLine(sel).slice(1);
      if (el.builtTitle) el.builtTitle.textContent = title;

      setArea('duration', sel.days + ' days · ' + formatLine(sel) +
        (sel.format === 'out' ? ' · includes £30 a day for travel and accommodation' : ''));
      setArea('reservation', 'One postpartum specialist, reserved for your family for the full ' + sel.days + ' days');
      setArea('baby', 'Hands-on baby care through the day' + (night ? ', and overnight from 11.30pm to 6am' : ''));
      setArea('meals', mealsLine(sel), !sel.meals);
      setArea('treatments', treatmentsLine(sel));
      setArea('household', 'Light housekeeping · laundry and ironing · grocery collection');
      var pri = priorities();
      setArea('priorities', pri.length ? pri.join(' · ') : 'Not chosen yet', !pri.length);

      // The fee: counted, not swapped.
      var text = P.money(result.fee);
      var value = Math.round(result.fee);
      el.feeOuts.forEach(function (out) { out.textContent = text; });
      var prev = null;
      if (rollers.length) prev = rollers[0].value();
      rollers.forEach(function (r) { r.set(value, lastFee !== null); });
      if (prev !== null) prev = Math.round(prev);
      if (prev !== null && prev !== value) chip(value - prev);
      lastFee = text;

      el.floorNote.hidden = !result.floored;
      if (result.floored) {
        el.floorNote.textContent = 'Because your specialist is reserved for your family alone, a ' + sel.days +
          '-day programme has a minimum fee of ' + P.money(result.floor) + '.';
      }

      var done = P.isComplete(sel);
      el.doneNote.hidden = !done;
      if (done) el.doneNote.textContent = 'This is our complete ' + sel.days + '-day programme.';

      if (el.restore) {
        el.restore.hidden = done;
        if (!done) el.restore.textContent = 'Restore the complete ' + sel.days + '-day programme';
      }

      el.reserveNote.textContent = sel.format === 'in'
        ? 'On live-in programmes, your specialist is reserved for your family alone for the whole stay. Taking out meals or treatments changes what she does each day, but the reservation is what most of the fee pays for.'
        : 'Your specialist is held for your family for each day of the programme. Daytime in-home care adds £30 a day towards her travel and accommodation.';
    }

    // The change, said in the band as the figure rolls.
    function chip(delta) {
      if (!el.tickerChip || !delta) return;
      var up = delta > 0;
      el.tickerChip.textContent = (up ? '+ ' : '− ') + P.money(Math.abs(delta));
      el.tickerChip.classList.toggle('is-down', !up);
      el.tickerChip.classList.remove('is-on');
      void el.tickerChip.offsetWidth;
      el.tickerChip.classList.add('is-on');
      clearTimeout(el.tickerChip._t);
      el.tickerChip._t = setTimeout(function () { el.tickerChip.classList.remove('is-on'); }, 1500);
    }

    /* ---------- The shape of the stay ---------- */

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

      // Herbal baths run daily in every programme.
      var bathDays = {};
      spread(d, d).forEach(function (i) { bathDays[i] = true; });

      var massageDays = {};
      if (sel.massage) spread(P.massageSessions(sel.rhythm, d), d).forEach(function (i) { massageDays[i] = true; });

      var pool = [], most = 0;
      P.COUNTED.forEach(function (k) { if (sel[k]) most = Math.max(most, P.STD[d][k]); });
      for (var round = 0; round < most; round++) {
        P.COUNTED.forEach(function (k) { if (sel[k] && P.STD[d][k] > round) pool.push(k); });
      }
      var treatDays = {};
      spread(pool.length, d).forEach(function (i) { treatDays[i] = (treatDays[i] || 0) + 1; });

      el.shapeTitle.textContent = d + ' days, laid out';
      el.shapeEmpty.hidden = true;

      var week = NARROW.matches;
      var scale = week ? 'week' : d <= 7 ? 'short' : d <= 14 ? 'mid' : 'long';
      el.shapeGrid.setAttribute('data-scale', scale);

      var frag = document.createDocumentFragment();
      for (var i = 0; i < d; i++) {
        var col = document.createElement('div');
        col.className = 'day';
        if (treatDays[i]) for (var t = 0; t < treatDays[i]; t++) col.appendChild(mark('treat'));
        if (massageDays[i]) col.appendChild(mark('massage'));
        if (bathDays[i]) col.appendChild(mark('bath'));
        if (night) col.appendChild(mark('night'));
        var n = document.createElement('span');
        n.className = 'day__n';
        var isWeekMark = (i + 1) % 7 === 0 && (d - 1 - i) > 2;
        n.textContent = scale === 'short' ? 'Day ' + (i + 1)
          : scale === 'week' ? String(i + 1)
          : (i === 0 || i === d - 1 || isWeekMark) ? String(i + 1) : '';
        col.appendChild(n);
        col.setAttribute('role', 'listitem');
        col.setAttribute('aria-label', dayLabel(i + 1, bathDays[i], massageDays[i], treatDays[i], night));
        frag.appendChild(col);
      }
      el.shapeGrid.setAttribute('role', 'list');
      el.shapeGrid.setAttribute('aria-label', 'Day by day shape of your ' + d + ' day programme');
      el.shapeGrid.textContent = '';
      el.shapeGrid.appendChild(frag);

      el.keys.forEach(function (k) {
        var off =
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

    /* ---------- The enquiry brief (spec page 8, card 5) ---------- */

    function briefFor(sel, result) {
      var night = sel.shift === 'night' && sel.format === 'in';
      var pri = priorities();
      var budget = el.budget.value ? Number(el.budget.value) : null;
      var lines = [];
      function block(head, body) { lines.push(head); lines.push('  ' + body); }
      lines.push('THE POSTPARTUM SUITE, PROGRAMME ENQUIRY');
      lines.push('');
      var due = dueDate();
      if (due) { lines.push('DUE DATE  ' + dueLabel(due)); lines.push(''); }
      block('LENGTH AND FORMAT', sel.days + ' days · ' + formatLine(sel) +
        (sel.format === 'out' ? ' · includes £30 a day for travel and accommodation' : ''));
      block('YOUR SPECIALIST', 'One postpartum specialist, reserved for your family for the full ' + sel.days + ' days');
      block('MOTHER AND BABY CARE', 'Hands-on baby care through the day' + (night ? ', and overnight from 11.30pm to 6am' : ''));
      block('MEALS', mealsLine(sel));
      block('TREATMENTS', treatmentsLine(sel));
      block('HOME SUPPORT', 'Light housekeeping · laundry and ironing · grocery collection');
      block('WHAT MATTERS MOST', pri.length ? pri.join(' · ') : 'Not chosen yet');
      if (budget) block('CARE BUDGET', P.money(budget));
      lines.push('');
      lines.push('Indicative fee  ' + P.money(result.fee) +
        (P.CONFIG.introPricing ? '  (indicative, held for three months)' : ''));
      if (result.floored) lines.push('                at the minimum fee for this length');
      lines.push('');
      lines.push('Final programme, availability and fee are confirmed after consultation.');
      return lines.join('\n');
    }

    /* ---------- Budget ---------- */

    function strippedSelection(days) {
      var s = { days: days, format: 'in', shift: 'day', meals: false, massage: false, rhythm: P.standardRhythm(days) };
      P.COUNTED.forEach(function (k) { s[k] = false; });
      return s;
    }

    function bracket(days, format) {
      var full = P.completeSelection(days);
      var bare = strippedSelection(days);
      full.format = bare.format = format;
      return { full: P.calculate(full).fee, floor: P.calculate(bare).fee };
    }

    var WORDS = { 7: 'seven', 14: 'fourteen', 30: 'thirty' };
    function word(d) { return WORDS[d] || String(d); }
    var COUNTS = ['none', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

    function paintPriorities() {
      var picked = priorities();
      if (!el.prioCount) return;
      if (!picked.length) el.prioCount.hidden = true;
      else {
        el.prioCount.hidden = false;
        el.prioCount.textContent = (COUNTS[picked.length] || picked.length) +
          (picked.length === 1 ? ' thing noted for your call.' : ' things noted for your call.');
      }
      if (el.briefToggle && el.briefBox) {
        var now = picked.join('|');
        var first = lastPriorities === null;
        var changed = !first && now !== lastPriorities;
        lastPriorities = now;
        if (changed && picked.length && el.briefBox.hidden) el.briefToggle.classList.add('has-news');
      }
    }

    function paintBudget(result, sel) {
      var raw = el.budget.value;
      if (raw === '' || isNaN(Number(raw)) || Number(raw) <= 0) {
        el.budgetAns.hidden = true;
        el.budgetFit.hidden = true;
        return;
      }
      var v = Number(raw);
      var text;
      if (v >= result.fee) text = 'Thank you. That sits comfortably around the programme you’ve shaped, and we’ll bring options to your call.';
      else if (v >= result.floor * 0.85) text = 'Thank you. On your call we’ll look at where the care can be shaped to work closer to that.';
      else text = 'Thank you. That’s below where this length usually sits, so we’ll talk through a shorter programme or a different format with you.';
      el.budgetAns.textContent = text;
      el.budgetAns.hidden = false;
      recommend(v, sel);
    }

    function recommend(v, sel) {
      var lengths = [30, 14, 7];
      var format = sel.format;
      var completeFit = null, shapedFit = null;
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
        action = { days: completeFit.days, complete: true, label: 'Show me the ' + word(completeFit.days) + ' day programme' };
      } else if (shapedFit) {
        head = 'A ' + word(shapedFit.days) + ' day programme can be shaped to sit near that.';
        body = 'It starts at ' + P.money(shapedFit.fee) + ' indicative for the period, and we build up from there with you.';
        action = { days: shapedFit.days, complete: false, label: 'Start from ' + word(shapedFit.days) + ' days' };
      } else {
        var seven = bracket(7, format);
        head = 'That sits below where our shortest programme starts.';
        body = 'Seven days begins at ' + P.money(seven.floor) + ' indicative, because your specialist is reserved for your family for the whole of it. Bring the figure to your call and we will talk through what is possible.';
      }
      if (completeFit && shapedFit && shapedFit.days > completeFit.days) {
        alt = 'Or ' + word(shapedFit.days) + ' days, shaped to fit. It starts at ' + P.money(shapedFit.fee) + ' indicative and we build up from there with you.';
        altAction = { days: shapedFit.days, complete: false, label: 'Start from ' + word(shapedFit.days) + ' days' };
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

    }

    function setAction(btn, action) {
      if (!action) { btn.hidden = true; return; }
      btn.textContent = action.label;
      btn.hidden = false;
      btn.setAttribute('data-days', String(action.days));
      btn.setAttribute('data-complete', String(action.complete));
    }

    // Puts the published programme's elements on the controls. Format and
    // shift are the client's and are left alone.
    function applyComplete(days) {
      var full = P.completeSelection(days);
      form.querySelector('input[name="meals"][value="yes"]').checked = true;
      el.massage.checked = true;
      P.COUNTED.forEach(function (k) {
        var i = form.querySelector('input[name="' + k + '"]');
        if (i) i.checked = full[k];
      });
      drawRhythms(days, full.rhythm);
    }

    if (el.restore) {
      el.restore.addEventListener('click', function () {
        applyComplete(parseInt(radio('days'), 10));
        update('restore');
      });
    }

    el.budgetFit.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-fit-apply]');
      if (!btn) return;
      var days = Number(btn.getAttribute('data-days'));
      form.querySelector('input[name="days"][value="' + days + '"]').checked = true;
      if (btn.getAttribute('data-complete') === 'true') { lastDays = days; applyComplete(days); }
      update('days');
      deck.go(3);
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
      el.briefText.textContent = briefFor(sel, result);
      fillCapture(sel, result);
      return forced;
    }

    // The close's form (FUNNEL-PLAN.md chat 5): the hidden fields carry the programme for TJ's
    // colleague to send on; the close's version and its first sentence follow the due date.
    function fillCapture(sel, result) {
      var d = dueDate(), kind = closeKind(d);
      var app = document.querySelector('.dk');
      if (app) app.setAttribute('data-close', kind);
      [].slice.call(document.querySelectorAll('[data-due-phrase]')).forEach(function (n) { n.textContent = duePhrase(d); });
      var f = document.querySelector('[data-capture]');
      if (!f) return;
      var v = {
        due: d ? dueIso(d) : '',
        fee: String(Math.round(result.fee)),
        days: String(sel.days),
        format: sel.format === 'in' ? 'live-in' : 'daytime',
        shift: sel.shift,
        meals: mealsLine(sel),
        treatments: treatmentsLine(sel),
        rhythm: sel.massage ? sel.rhythm : '',
        priorities: priorities().join(' · '),
        budget: el.budget.value || '',
        summary: el.briefText.textContent,
        close: kind,
        generated: new Date().toISOString()
      };
      Object.keys(v).forEach(function (k) { if (f.elements[k]) f.elements[k].value = v[k]; });
    }

    /* ---------- The panel's two views ---------- */

    var tabs = [], views = [];

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

    function flag(name, forced) {
      var areas = (AREA_FOR[name] || (name && name.indexOf('p-') === 0 ? ['priorities'] : [])).concat(forced || []);
      if (!areas.length) return;
      [].slice.call(summary.querySelectorAll('.area.is-changed'))
        .forEach(function (a) { a.classList.remove('is-changed'); });
      var body = summary.querySelector('.summary__body');
      var scrolls = body && body.scrollHeight > body.clientHeight;
      var seen = {};
      areas.forEach(function (a, i) {
        if (seen[a]) return;
        seen[a] = true;
        var node = summary.querySelector('[data-area="' + a + '"]');
        if (!node) return;
        void node.offsetWidth;
        node.classList.add('is-changed');

      });
    }

    summary.addEventListener('animationend', function (e) {
      if (e.animationName === 'flag') e.target.classList.remove('is-changed');
    });

    summary.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-goto]');
      if (!btn) return;
      deck.go(Number(btn.dataset.goto));
    });

    document.addEventListener('animationend', function (e) {
      if (e.animationName === 'target') e.target.classList.remove('is-targeted');
    });

    var dueEl = document.getElementById('due');
    if (dueEl) dueEl.addEventListener('input', function () { update('due'); deck.dueChanged(); });

    // The due date calendar (TJ, 13 Oct 2026). Looks like the single treatments booking
    // calendar (booking.js renderCalendar) with no limits: both arrows always live, every
    // day selectable, no time step. The hidden #due stays the single source of truth.
    (function () {
      var root = document.querySelector('[data-due-cal]');
      if (!root || !dueEl) return;
      var grid = root.querySelector('[data-due-grid]');
      var monthEl = root.querySelector('[data-due-month]');
      var chosenEl = document.querySelector('[data-due-chosen]');
      var WD = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      var pad = function (n, w) { var s = String(n); while (s.length < w) s = '0' + s; return s; };
      var iso = function (y, m, d) { return pad(y, 4) + '-' + pad(m, 2) + '-' + pad(d, 2); };
      var now = new Date();
      var todayIso = iso(now.getFullYear(), now.getMonth() + 1, now.getDate());
      var cur = { year: now.getFullYear(), month: now.getMonth() + 1 };
      var selected = '';
      function readValue() {
        var m = /^(\d{4,6})-(\d{2})-(\d{2})$/.exec(dueEl.value || '');
        return m ? { year: +m[1], month: +m[2], day: +m[3] } : null;
      }
      function addMonths(c, delta) {
        var s = new Date(Date.UTC(c.year, c.month - 1 + delta, 1));
        return { year: s.getUTCFullYear(), month: s.getUTCMonth() + 1 };
      }
      function daysIn(c) { return new Date(Date.UTC(c.year, c.month, 0)).getUTCDate(); }
      function fmtMonth(c) {
        return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(c.year, c.month - 1, 1)));
      }
      function fmtLong(v) {
        // en-GB puts a comma after the weekday; the line reads 'Saturday 15 May 2027'.
        return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(v.year, v.month - 1, v.day))).replace(',', '');
      }
      function paintSelection() {
        [].slice.call(grid.querySelectorAll('.due-day')).forEach(function (b) {
          b.setAttribute('aria-pressed', String(b.getAttribute('data-date') === selected));
        });
        var v = readValue();
        chosenEl.textContent = v ? fmtLong(v) : '';
      }
      function render() {
        monthEl.textContent = fmtMonth(cur);
        grid.setAttribute('aria-label', 'Choose a date in ' + fmtMonth(cur));
        var html = WD.map(function (l) { return '<div class="due-cal__wd" aria-hidden="true">' + l + '</div>'; }).join('');
        var blanks = (new Date(Date.UTC(cur.year, cur.month - 1, 1)).getUTCDay() + 6) % 7;
        for (var i = 0; i < blanks; i++) html += '<div></div>';
        for (var d = 1, n = daysIn(cur); d <= n; d++) {
          var di = iso(cur.year, cur.month, d);
          html += '<button type="button" class="due-day" data-date="' + di + '"' + (di === todayIso ? ' aria-current="date"' : '') + ' aria-pressed="' + (di === selected) + '">' + d + '</button>';
        }
        // Always six rows (TJ, 14 Oct 2026): the arrows and the days never move between months, so
        // she can click through months without the buttons shifting. Trailing cells are blank.
        for (var k = blanks + daysIn(cur); k < 42; k++) html += '<span class="due-day due-day--pad" aria-hidden="true"></span>';
        grid.setAttribute('data-rows', '6');
        grid.innerHTML = html;
      }
      root.addEventListener('click', function (e) {
        var step = e.target.closest && e.target.closest('[data-due-step]');
        if (step && root.contains(step)) { cur = addMonths(cur, +step.getAttribute('data-due-step')); render(); return; }
        var day = e.target.closest && e.target.closest('.due-day');
        if (day && grid.contains(day)) {
          dueEl.value = day.getAttribute('data-date');
          dueEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      // Anything that sets #due (a tap, a script) lands here: mirror it in the grid.
      dueEl.addEventListener('input', function () {
        var v = readValue();
        selected = v ? iso(v.year, v.month, v.day) : '';
        if (v && (v.year !== cur.year || v.month !== cur.month)) { cur = { year: v.year, month: v.month }; render(); }
        paintSelection();
      });
      var v0 = readValue();
      if (v0) { selected = iso(v0.year, v0.month, v0.day); cur = { year: v0.year, month: v0.month }; }
      render(); paintSelection();
    })();
    form.addEventListener('change', function (e) {
      var name = e.target && e.target.name;
      if (!name || name === 'budget') return;
      if (e.target.closest && e.target.closest('[data-capture]')) return;
      // Book a call now? (FUNNEL-PLAN.md chat 4): not a pricing input; only Next needs to know.
      if (name === 'call') { deck.dueChanged(); return; }
      var forced = update(name);
      flag(name, forced);
    });
    el.budget.addEventListener('input', function () { update('budget'); });

    var onWidth = function () { update('width'); };
    if (NARROW.addEventListener) NARROW.addEventListener('change', onWidth);
    else if (NARROW.addListener) NARROW.addListener(onWidth);

    /* ---------- The brief reveal ---------- */


    el.briefCopy.addEventListener('click', function () {
      var text = el.briefText.textContent;
      var label = 'Copy my programme summary';
      var done = function () {
        el.briefCopy.textContent = 'Copied';
        setTimeout(function () { el.briefCopy.textContent = label; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
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
     THE FEE COUNTER (TJ, 10 Oct 2026)
     The same motion as Tailored For You's figures (what-we-do.js,
     countTo): the number runs from where it is to the new figure and
     eases to a stop, ease out cubic. Set in Instrument Serif, not mono
     (Brand Fonts: mono is never a price). Reduced motion sets it.
     ------------------------------------------------------------ */
  function counter(node) {
    var shown = null, raf = 0;
    function paint(v) { node.textContent = P.money(v); }
    return {
      set: function (target, animate) {
        cancelAnimationFrame(raf);
        if (shown === null || !animate || REDUCED) { shown = target; paint(target); return; }
        var from = shown, t0 = performance.now(), dur = 650;
        node.classList.remove('is-counting'); void node.offsetWidth; node.classList.add('is-counting');
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          shown = from + (target - from) * e;
          paint(shown);
          if (p < 1) raf = requestAnimationFrame(tick);
          else { shown = target; paint(target); node.classList.remove('is-counting'); }
        })(t0);
      },
      value: function () { return shown; }
    };
  }

  /* ------------------------------------------------------------
     THE DECK (spec section 2, in the site's clothes)
     One page per step, swiped sideways or moved with Back and Next.
     The bar at the foot carries the fee and the Tailored line (TJ, 12 Oct
     2026): a window onto a track with a stop per page; the track slides
     650ms on --tease so the current stop sits under the circle at the
     centre, with only the previous and next stops in view.
     ------------------------------------------------------------ */
  // deck.go takes a PAGE index (the Change links' data-goto, the budget's
  // Apply); the deck turns it into the screen that page is on.
  var deck = { go: function () {}, dueChanged: function () {} };

  // The due date (FUNNEL-PLAN.md chat 2). Not a pricing input. Returns a Date at
  // local midnight, or null while the field is empty or not a real date. Past
  // dates are valid (she has already given birth), and there is no year cap (TJ, 13 Oct 2026).
  function dueDate() {
    var f = document.getElementById('due');
    var m = f && /^(\d{4,6})-(\d{2})-(\d{2})$/.exec(f.value);
    if (!m) return null;
    var y = +m[1], mo = +m[2] - 1, d = +m[3];
    var dt = new Date(y, mo, d);
    return dt.getMonth() === mo && dt.getDate() === d ? dt : null;
  }
  // The due date as YYYY-MM-DD for Calendly's second answer (FUNNEL-PLAN.md chat 4).
  function dueIso(dt) {
    function z(n) { return (n < 10 ? '0' : '') + n; }
    return dt.getFullYear() + '-' + z(dt.getMonth() + 1) + '-' + z(dt.getDate());
  }
  function callChoice() {
    var r = document.querySelector('input[name="call"]:checked');
    return r ? r.value : '';
  }
  // Calendly: the booking link with the programme text (a1) and the due date (a2) passed through.
  function calendlyUrl() {
    var u = P.CONFIG.consultationUrl, d = dueDate();
    var t = document.querySelector('[data-brief-text]');
    var q = 'a1=' + encodeURIComponent(t ? t.textContent : '') + '&a2=' + encodeURIComponent(d ? dueIso(d) : '');
    return u + (u.indexOf('?') < 0 ? '?' : '&') + q;
  }
  // The close (FUNNEL-PLAN.md chat 5). 'hold' when the due date is more than three calendar
  // months from today, else 'dates' (nearer, or already born). No date yet reads as 'hold'.
  function today0() { var t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); }
  function closeKind(d) {
    if (!d) return 'hold';
    var t = today0(), edge = new Date(t.getFullYear(), t.getMonth() + 3, t.getDate());
    return d > edge ? 'hold' : 'dates';
  }
  function plural(n, one) { return n + ' ' + one + (n === 1 ? '' : 's'); }
  // The first sentence of the close: how far away the baby is, in months when far, weeks when near.
  function duePhrase(d) {
    if (!d) return '';
    var t = today0(), days = Math.round((d - t) / 864e5);
    if (closeKind(d) === 'hold') {
      var m = (d.getFullYear() - t.getFullYear()) * 12 + d.getMonth() - t.getMonth() - (d.getDate() < t.getDate() ? 1 : 0);
      return 'Your baby is due in ' + plural(m, 'month') + '.';
    }
    if (days < 0) { var a = Math.floor(-days / 7); return a ? 'Your baby arrived ' + plural(a, 'week') + ' ago.' : 'Your baby arrived this week.'; }
    var w = Math.round(days / 7);
    return w ? 'Your baby is due in ' + plural(w, 'week') + '.' : 'Your baby is due this week.';
  }

  function dueLabel(dt) {
    return dt.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dt.getMonth()] + ' ' + dt.getFullYear();
  }

  function deckController() {
    var root = document.querySelector('[data-deck]');
    if (!root) return;
    var pages = [].slice.call(root.querySelectorAll('.dk-page'));
    var line = document.querySelector('[data-line]');
    var back = document.querySelector('[data-back]');
    var next = document.querySelector('[data-next]');
    var nameEl = document.querySelector('[data-step-name]');
    // The summary is several screens (TJ, 12 Oct 2026); Next reads "See my
    // programme" on the screen before the first of them.
    var firstSumPage = pages.findIndex(function (p) { return p.classList.contains('dk-page--summary'); });
    var cur = 0, settleT = 0, target = null, lockT = 0;
    var free = false;

    // SCREENS (Claude, 12 Oct 2026). A screen is what the deck shows at once.
    // On a phone every page is a screen. From 1024px wide a page marked
    // data-join shares the screen of the page before it (two halves side by
    // side), so a step split for a phone is one screen on a laptop. The bar's
    // stops are screens. The grouping is read from the held layout.
    var screens = [], screenOf = [], last = 0, sig = '';

    // The frame sits directly under the site header, whatever height the
    // header is at this width (the three line wordmark makes it taller). The
    // bar's height is kept on the root for the released page (.is-free).
    var app = document.querySelector('.dk'), hdr = document.querySelector('[data-nav]'), bar = document.querySelector('.dk-bar');
    // Return to the site (top left, where the corner mark sits; TJ, 13 Oct 2026): added here, not in partials/header.html, so the shared header stays
    // identical on every page (FUNNEL-PLAN.md chat 1).
    if (app && app.hasAttribute('data-funnel') && hdr && !hdr.querySelector('.nav__return')) {
      var side = hdr.querySelector('.nav__side--l');
      if (side) {
        var ret = document.createElement('a');
        ret.className = 'nav__return'; ret.href = 'index.html'; ret.textContent = 'Return to the site';
        side.insertBefore(ret, side.firstChild);
      }
    }
    function fitTop() {
      if (app && hdr) app.style.setProperty('--dk-top', Math.round(hdr.getBoundingClientRect().height) + 'px');
      if (bar) document.documentElement.style.setProperty('--dk-bar-h', Math.round(bar.getBoundingClientRect().height) + 'px');
    }
    fitTop();
    if (window.ResizeObserver) [hdr, bar].forEach(function (n) { if (n) new ResizeObserver(fitTop).observe(n); });

    var track = line.querySelector('[data-line-track]');
    var stops = [];

    function title(s) {
      var g = screens[s], p = pages[g[0]];
      return g.length > 1 ? (p.getAttribute('data-pair-title') || p.getAttribute('data-title')) : p.getAttribute('data-title');
    }

    // Which screen each page is on, from the layout (released: one page each).
    function group() {
      var w = root.clientWidth || 1, s = [], of = [];
      pages.forEach(function (p, k) {
        var n = free ? k : Math.floor((p.offsetLeft + 1) / w);
        if (n < 0) n = 0;
        of[k] = n;
        (s[n] = s[n] || []).push(k);
      });
      // No holes (each screen index has pages).
      s = s.filter(Boolean);
      of = []; s.forEach(function (g, n) { g.forEach(function (k) { of[k] = n; }); });
      screens = s; screenOf = of; last = screens.length - 1;
      var now = screens.map(function (g) { return g.join('+'); }).join(',');
      if (now !== sig) { sig = now; buildStops(); }
    }

    // A stop for every screen on the track, each a button that goes there
    // (TJ, 12 Oct 2026: no step numbers; only the previous, current and next
    // stops show). The track slides so the current stop sits under the circle
    // at the window's centre; the previous and next dots are the live buttons.
    function buildStops() {
      stops.forEach(function (b) { b.remove(); });
      line.style.setProperty('--last', String(Math.max(1, last)));
      stops = screens.map(function (g, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'dk-line__stop';
        b.style.setProperty('--k', String(i));
        b.setAttribute('aria-label', 'Go to ' + title(i));
        var d = document.createElement('span');
        d.className = 'dk-line__dot';
        d.setAttribute('aria-hidden', 'true');
        b.appendChild(d);
        b.addEventListener('click', function () {
          if (Math.abs(i - cur) !== 1) return;
          var dir = i - cur, had = document.activeElement === b;
          go(i);
          // Keyboard focus moves on to the stop now in the same place, if any.
          if (had && stops[i + dir]) stops[i + dir].focus({ preventScroll: true });
        });
        track.appendChild(b);
        return b;
      });
    }

    function label(i) {
      if (i === 0) return 'Begin';
      if (i === callScreen()) return 'Continue';
      // No 'See my programme' (TJ, 14 Oct 2026): the programme is a surprise; Next reads Next.
      return 'Next';
    }

    function paint(i) {
      cur = i;
      app.classList.toggle('is-start', i === 0);
      // The quiet funnel (TJ, 13 Oct 2026): past the start, the header keeps only the logo
      // and Return to the site (FUNNEL-PLAN.md chat 1).
      if (app.hasAttribute('data-funnel')) document.body.classList.toggle('is-funnelled', i > 0);
      line.style.setProperty('--pos', String(last ? i / last : 0));
      line.style.setProperty('--i', String(i));
      stops.forEach(function (s, k) {
        var open = k === i - 1 || k === i + 1;
        s.classList.toggle('is-past', k < i);
        s.classList.toggle('is-on', k === i);
        s.classList.toggle('is-prev', k === i - 1);
        s.classList.toggle('is-next', k === i + 1);
        s.classList.toggle('is-near', Math.abs(k - i) <= 1);
        s.classList.toggle('is-open', open);
        s.tabIndex = open ? 0 : -1;
        s.setAttribute('aria-disabled', String(!open));
        s.setAttribute('aria-current', k === i ? 'step' : 'false');
      });
      nameEl.textContent = title(i);
      paintNext();
      back.disabled = i === 0;
      back.classList.toggle('is-hidden', i === 0);
      // The ember button only as Begin and Book a call; otherwise the link.
      var primary = i === 0;
      next.classList.toggle('btn', primary);
      next.classList.toggle('btn--primary', primary);
      next.classList.toggle('dk-link', !primary);
      next.textContent = label(i);
      // The last screen is the close; it has no Next (FUNNEL-PLAN.md chat 5 builds it).
      next.classList.toggle('is-hidden', (i === last && last > 0) || (i === closeScreen() && closeScreen() > 0) || (i === decideScreen() && decideScreen() > 0));
      // Held, only the screen in view is live; released, every section is on the page.
      pages.forEach(function (p, k) { var off = !free && screenOf[k] !== i; p.setAttribute('aria-hidden', String(off)); p.inert = off; });
    }

    // The due date screen blocks Next until a valid date is in (FUNNEL-PLAN.md chat 2).
    // The screen is found from the page flagged data-block="due".
    var duePage = pages.findIndex(function (p) { return p.getAttribute('data-block') === 'due'; });
    function blocked() { return duePage >= 0 && !dueDate(); }
    function dueScreen() { return screenOf[duePage]; }
    // Book a call now? blocks Next until Yes or Not yet is on (chat 4). Only Not yet may pass
    // to the screen after it; Yes goes to Calendly instead.
    var callPage = pages.findIndex(function (p) { return p.getAttribute('data-block') === 'call'; });
    function callScreen() { return callPage >= 0 ? screenOf[callPage] : -1; }
    function callBlocked() { return callPage >= 0 && callChoice() !== 'no'; }
    // The close and Done (FUNNEL-PLAN.md chat 5): Done is reached only by sending the form, and
    // the close carries its own button, so Next is hidden on both.
    var closePage = pages.findIndex(function (p) { return p.getAttribute('data-block') === 'close'; });
    var donePage = pages.findIndex(function (p) { return p.getAttribute('data-block') === 'done'; });
    var sent = false;
    function closeScreen() { return closePage >= 0 ? screenOf[closePage] : -1; }
    // The conclusive screen (TJ, 13 Oct 2026): Book a call or Not yet are its only ways on. Next is
    // hidden there, and the close is reached only through Not yet.
    var decidePage = pages.findIndex(function (p) { return p.getAttribute('data-block') === 'decide'; });
    var notYet = false;
    function decideScreen() { return decidePage >= 0 ? screenOf[decidePage] : -1; }
    function decideBlocked() { return decidePage >= 0 && !notYet; }
    function closeBlocked() { return donePage >= 0 && !sent; }
    function paintNext() {
      var b = (blocked() && cur === dueScreen()) || (cur === callScreen() && !callChoice());
      if (b) next.setAttribute('aria-disabled', 'true'); else next.removeAttribute('aria-disabled');
    }
    deck.dueChanged = paintNext;

    function go(i, instant) {
      i = Math.max(0, Math.min(last, i));
      // No way forward past the due date screen without a date: Next, the arrow keys,
      // the stops, a Change link and a swipe all land here.
      if (blocked() && i > dueScreen()) i = dueScreen();
      if (callBlocked() && i > callScreen() && cur <= callScreen()) i = callScreen();
      if (decideBlocked() && i > decideScreen()) i = decideScreen();
      if (closeBlocked() && i > closeScreen()) i = closeScreen();
      // A move we started: ignore the deck's (or, released, the window's)
      // scroll until it lands, so the line never steps back on the way.
      target = i;
      clearTimeout(lockT);
      lockT = setTimeout(function () { target = null; realign(); }, free ? 1600 : 1400);
      if (free) glide(i, instant || REDUCED);
      else root.scrollTo({ left: i * root.clientWidth, behavior: instant || REDUCED ? 'auto' : 'smooth' });
      paint(i);
    }
    // Sending the form. UI only: TJ's colleague replaces action="#" or adds the request here, then
    // calls deck.done() on success (FUNNEL-PLAN.md section 9).
    var capture = document.querySelector('[data-capture]');
    deck.done = function () { sent = true; go(screenOf[donePage]); };
    if (capture && donePage >= 0) capture.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!capture.checkValidity()) { capture.reportValidity(); return; }
      deck.done();
    });
    var notYetBtn = document.querySelector('[data-not-yet]');
    if (notYetBtn) notYetBtn.addEventListener('click', function () { notYet = true; go(decideScreen() + 1); });
    // The days and Always included: open on desktop; behind an expand on phones, so the call to
    // action shows before any scroll (TJ, 13 Oct 2026).
    var more = document.querySelector('[data-decide-more]');
    if (more && window.matchMedia) {
      var WIDE = window.matchMedia('(min-width: 861px)');
      var syncMore = function () { more.open = WIDE.matches; };
      syncMore();
      if (WIDE.addEventListener) WIDE.addEventListener('change', syncMore); else if (WIDE.addListener) WIDE.addListener(syncMore);
    }
    [].slice.call(document.querySelectorAll('[data-calendly]')).forEach(function (a) {
      a.addEventListener('click', function () { a.href = calendlyUrl(); });
    });
    deck.go = function (page, instant) { go(screenOf[Math.max(0, Math.min(pages.length - 1, page))], instant); };

    back.addEventListener('click', function () { go(cur - 1); });
    next.addEventListener('click', function () {
      if (next.getAttribute('aria-disabled') === 'true') return;
      if (cur === last) return;
      if (cur === callScreen() && callChoice() === 'yes') { window.location.href = calendlyUrl(); return; }
      go(cur + 1);
    });

    // The deck always rests exactly on a screen (TJ, 14 Oct 2026: the due date screen showed
    // about 180px left of centre in his Chrome). If a slide is interrupted part way, or the
    // window or a side panel changes size, or the tab returns, snap to the current screen.
    function realign() {
      if (free || fitting || target !== null) return;
      var w = root.clientWidth, x = cur * w;
      if (w && Math.abs(root.scrollLeft - x) > 1) root.scrollTo({ left: x, behavior: 'auto' });
    }
    var realignT = 0;
    function realignSoon() { clearTimeout(realignT); realignT = setTimeout(realign, 120); }
    window.addEventListener('resize', realignSoon, { passive: true });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) realignSoon(); });
    if (window.ResizeObserver) new ResizeObserver(realignSoon).observe(root);

    // Swiping: read the screen once scrolling settles, so the line and the
    // buttons follow a swipe exactly as they follow a tap.
    root.addEventListener('scroll', function () {
      if (free || fitting) return;
      clearTimeout(settleT);
      settleT = setTimeout(function () {
        var i = Math.max(0, Math.min(last, Math.round(root.scrollLeft / root.clientWidth)));
        if (target !== null) { if (i === target) { target = null; clearTimeout(lockT); } return; }
        if (blocked() && i > dueScreen()) { go(dueScreen()); return; }
        if (callBlocked() && i > callScreen() && cur <= callScreen()) { go(callScreen()); return; }
        if (decideBlocked() && i > decideScreen()) { go(decideScreen()); return; }
        if (closeBlocked() && i > closeScreen()) { go(closeScreen()); return; }
        if (i !== cur) paint(i);
        realignSoon();
      }, 80);
    }, { passive: true });

    document.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (document.querySelector('[data-nav].is-open')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    });

    /* ---------- Every screen fits (TJ, 12 Oct 2026) ----------
       No scroll inside a scroll and no continuous scroll: each page fits the
       deck. Claude's execution of the Tailored rule: when the deck is built,
       on a resize (any width change, or a height change of 40px or more) and
       when a page's content changes size, each page's content is measured
       against the deck in the held frame. A page that overflows takes
       .is-tight (closer spacing, smaller type, body never under 13px); if a
       page still overflows, or the window is under 500px tall, the frame is
       released (.dk.is-free): the window scrolls, the steps are sections down
       the page and the bar stays at the foot following the section being
       read (the flowing page's rules, lab/flow-attempt). Pages never scroll
       on their own (overflow hidden). */
    function need(p) {
      var inner = p.querySelector('.dk-in');
      return inner ? Math.ceil(Math.max(inner.scrollHeight, inner.getBoundingClientRect().height)) : p.scrollHeight;
    }
    function overflows(p) { return need(p) > p.clientHeight + 1; }

    // A joined half without a title of its own (data-join="align") starts its
    // rows level with the first row of the half beside it.
    function align() {
      pages.forEach(function (p, k) {
        if (p.getAttribute('data-join') !== 'align') return;
        var inner = p.querySelector('.dk-in');
        inner.style.removeProperty('--join-top');
        if (free || k === 0 || screenOf[k] !== screenOf[k - 1]) return;
        var a = pages[k - 1], sel = '.tg, .area';
        var ar = a.querySelector(sel), br = p.querySelector(sel);
        if (!ar || !br) return;
        var aOff = ar.getBoundingClientRect().top - a.querySelector('.dk-in').getBoundingClientRect().top;
        var bOff = br.getBoundingClientRect().top - inner.getBoundingClientRect().top;
        var pad = parseFloat(getComputedStyle(inner).paddingTop) || 0;
        inner.style.setProperty('--join-top', Math.max(0, Math.round(pad + aOff - bOff)) + 'px');
      });
    }

    // Centring on desktop (TJ, 13 Oct 2026): a single page centres itself in CSS (margin-block auto
    // on .dk-in). The halves of a joined screen cannot centre apart, or they would part company, so
    // the pair shares one offset, half the room left over by the taller half (CSS reads --join-shift).
    function centre() {
      pages.forEach(function (p) { var i = p.querySelector('.dk-in'); if (i) i.style.removeProperty('--join-shift'); });
      if (free || window.innerWidth < 1024) return;
      screens.forEach(function (g) {
        if (g.length < 2) return;
        var room = Infinity, most = 0;
        g.forEach(function (k) { room = Math.min(room, pages[k].clientHeight); most = Math.max(most, need(pages[k])); });
        var shift = Math.max(0, Math.floor((room - most) / 2));
        g.forEach(function (k) { var i = pages[k].querySelector('.dk-in'); if (i) i.style.setProperty('--join-shift', shift + 'px'); });
      });
    }

    var fitting = false;
    function fit() {
      // data-fit-hold on the root holds the frame for the lab's probe (lab/bespoke-fit-probe.mjs).
      if (fitting || !app || document.documentElement.hasAttribute('data-fit-hold')) return;
      fitting = true;
      var was = free, y = window.scrollY;
      var curPage = screens.length ? screens[Math.min(cur, last)][0] : 0;
      app.classList.remove('is-free');
      document.body.classList.remove('dk-is-free');
      free = false;
      pages.forEach(function (p) { p.classList.remove('is-tight'); });
      group(); align();
      pages.forEach(function (p) { if (overflows(p)) p.classList.add('is-tight'); });
      align(); centre();
      var over = pages.filter(overflows);
      free = over.length > 0 || window.innerHeight < 500;
      app.classList.toggle('is-free', free);
      document.body.classList.toggle('dk-is-free', free);
      app.setAttribute('data-over', over.map(function (p) { return pages.indexOf(p); }).join(' '));
      app.setAttribute('data-fit', free ? 'free' : pages.some(function (p) { return p.classList.contains('is-tight'); }) ? 'tight' : 'fits');
      if (free) { group(); align(); centre(); }
      fitTop();
      var to = screenOf[curPage] || 0;
      paint(to);
      if (free !== was) {
        // Into the flowing page: the section being read comes to the top.
        // Back to the frame: the window to the top, the deck on the screen.
        if (free) window.scrollTo({ top: landY(to), behavior: 'instant' });
        else { window.scrollTo({ top: 0, behavior: 'instant' }); root.scrollTo({ left: to * root.clientWidth, behavior: 'auto' }); }
      } else if (free) window.scrollTo({ top: y, behavior: 'instant' });
      else root.scrollTo({ left: to * root.clientWidth, behavior: 'auto' });
      fitting = false;
    }

    // Released: where a section lands when scrolled to (just under the header).
    function landY(i) {
      var off = hdr ? hdr.getBoundingClientRect().height : 0;
      var p = pages[screens[i][0]];
      return i === 0 ? 0 : Math.max(0, p.getBoundingClientRect().top + window.scrollY - off);
    }
    // Released: the page's own eased scroll (as the flowing page had it):
    // instant steps toward a target read again every frame; a touch, wheel or
    // key from the reader stops it.
    var gRaf = 0;
    function stopGlide() { if (gRaf) { cancelAnimationFrame(gRaf); gRaf = 0; } }
    ['touchstart', 'wheel', 'keydown'].forEach(function (ev) { window.addEventListener(ev, stopGlide, { passive: true }); });
    function glide(i, now) {
      stopGlide();
      var y0 = window.scrollY;
      if (now) { window.scrollTo({ top: landY(i), behavior: 'instant' }); return; }
      var dist = Math.abs(landY(i) - y0), ms = Math.min(1100, Math.max(500, 380 + dist * 0.35)), t0 = performance.now();
      var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      (function step(t) {
        var k = Math.min(1, (t - t0) / ms);
        window.scrollTo({ top: y0 + (landY(i) - y0) * ease(k), behavior: 'instant' });
        gRaf = k < 1 ? requestAnimationFrame(step) : 0;
      })(t0);
    }
    // Released: the section being read is the last whose top has passed 45
    // percent of the window (the last, once the page reaches its end).
    function reading() {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) return last;
      var mark = window.innerHeight * 0.45, i = 0;
      pages.forEach(function (p, k) { if (p.getBoundingClientRect().top <= mark) i = screenOf[k]; });
      return i;
    }
    var sRaf = 0;
    window.addEventListener('scroll', function () {
      if (!free || sRaf || fitting) return;
      sRaf = requestAnimationFrame(function () {
        sRaf = 0;
        if (!free) return;
        var i = reading();
        if (target !== null) { if (i === target) { target = null; clearTimeout(lockT); } return; }
        if (blocked() && i > dueScreen()) { go(dueScreen()); return; }
        if (callBlocked() && i > callScreen() && cur <= callScreen()) { go(callScreen()); return; }
        if (decideBlocked() && i > decideScreen()) { go(decideScreen()); return; }
        if (closeBlocked() && i > closeScreen()) { go(closeScreen()); return; }
        if (i !== cur) paint(i);
      });
    }, { passive: true });

    var rw = 0, lastW = window.innerWidth, lastH = window.innerHeight;
    window.addEventListener('resize', function () {
      clearTimeout(rw);
      rw = setTimeout(function () {
        var w = window.innerWidth, h = window.innerHeight;
        if (w !== lastW || Math.abs(h - lastH) >= 40) { lastW = w; lastH = h; fit(); }
        else if (!free) root.scrollTo({ left: cur * root.clientWidth, behavior: 'auto' });
      }, 120);
    });

    // A page's content changing size (a longer summary line, the budget's
    // recommendation, thirty days on the strip) measures again.
    // A short timer, not a frame: a frame request was seen to stall in headless Chrome.
    var fT = 0;
    function refit() { if (fitting) return; clearTimeout(fT); fT = setTimeout(fit, 30); }
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(refit);
      pages.forEach(function (p) {
        var inner = p.querySelector('.dk-in');
        if (!inner) return;
        ro.observe(inner);
        [].slice.call(inner.children).forEach(function (c) { ro.observe(c); });
      });
    }
    // Every choice and the budget measure again too, after the builder has
    // painted (the observer alone missed some changes in testing).
    var scope = document.querySelector('[data-builder-scope]');
    if (scope) ['change', 'input'].forEach(function (ev) { scope.addEventListener(ev, refit); });
    deck.fit = fit;

    group();
    paint(0);
    fit();
    // Fonts change every measure; once they are in, measure again.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    window.addEventListener('load', fit);
  }

  function boot() {
    nav();
    deckController();
    builder();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
