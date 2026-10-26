/* Check your dates (TJ and Ami, 25 Oct 2026): checks the form, then the
   area (first part of the postcode) with the single treatments check (postcode-check.js, inside the
   M25). Outside, the client's Service Area Notice shows and nothing is sent.
   Inside, the form is replaced by the confirmation, which offers a time to
   talk. Sending is UI only for now: TJ's colleague adds the request here. */
(function () {
  'use strict';
  var form = document.querySelector('[data-request]');
  var done = document.querySelector('[data-request-done]');
  var msg = document.querySelector('[data-request-msg]');
  if (!form || !done) return;
  var busy = false;
  function say(text, kind) { msg.textContent = text || ''; msg.className = 'rq-msg' + (kind ? ' is-' + kind : ''); }
  form.addEventListener('input', function () { if (msg.textContent && !busy) say(''); });

  /* The due date pop-up (TJ, 25 Oct 2026): the bespoke builder's calendar
     (build-your-programme.js), six rows always so nothing moves between
     months, every day selectable, past days allowed (she may have had her
     baby). Opens from the field, closes on a pick, a click outside or Escape. */
  var dateWrap = document.querySelector('[data-rq-date]');
  if (dateWrap) {
    var field = dateWrap.querySelector('[data-rq-date-field]');
    var due = dateWrap.querySelector('[data-rq-due]');
    var pop = dateWrap.querySelector('[data-rq-cal]');
    var grid = dateWrap.querySelector('[data-rq-grid]');
    var monthEl = dateWrap.querySelector('[data-rq-month]');
    var WD = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var iso = function (y, m, d) { return y + '-' + pad(m) + '-' + pad(d); };
    var now = new Date();
    var todayIso = iso(now.getFullYear(), now.getMonth() + 1, now.getDate());
    var cur = { year: now.getFullYear(), month: now.getMonth() + 1 };
    var fmtMonth = function (c) { return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(c.year, c.month - 1, 1))); };
    var fmtLong = function (v) { var p = v.split('-'); return new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]))).replace(',', ''); };
    var render = function () {
      monthEl.textContent = fmtMonth(cur);
      grid.setAttribute('aria-label', 'Choose a date in ' + fmtMonth(cur));
      var html = WD.map(function (l) { return '<div class="due-cal__wd" aria-hidden="true">' + l + '</div>'; }).join('');
      var blanks = (new Date(Date.UTC(cur.year, cur.month - 1, 1)).getUTCDay() + 6) % 7;
      var days = new Date(Date.UTC(cur.year, cur.month, 0)).getUTCDate();
      for (var i = 0; i < blanks; i++) html += '<div></div>';
      for (var d = 1; d <= days; d++) {
        var di = iso(cur.year, cur.month, d);
        html += '<button type="button" class="due-day" data-date="' + di + '"' + (di === todayIso ? ' aria-current="date"' : '') + ' aria-pressed="' + (di === due.value) + '">' + d + '</button>';
      }
      for (var k = blanks + days; k < 42; k++) html += '<span class="due-day due-day--pad" aria-hidden="true"></span>';
      grid.innerHTML = html;
    };
    var openCal = function () {
      if (due.value) { var p = due.value.split('-'); cur = { year: +p[0], month: +p[1] }; }
      render(); pop.hidden = false; field.setAttribute('aria-expanded', 'true');
      var first = grid.querySelector('[aria-pressed="true"]') || grid.querySelector('[aria-current="date"]') || grid.querySelector('.due-day');
      if (first) first.focus({ preventScroll: true });
    };
    var closeCal = function (refocus) { pop.hidden = true; field.setAttribute('aria-expanded', 'false'); if (refocus) field.focus({ preventScroll: true }); };
    field.addEventListener('click', function () { if (pop.hidden) openCal(); else closeCal(false); });
    field.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); openCal(); } });
    pop.addEventListener('click', function (e) {
      var step = e.target.closest('[data-rq-step]');
      if (step) { var s = new Date(Date.UTC(cur.year, cur.month - 1 + (+step.getAttribute('data-rq-step')), 1)); cur = { year: s.getUTCFullYear(), month: s.getUTCMonth() + 1 }; render(); return; }
      var day = e.target.closest('.due-day[data-date]');
      if (day) { due.value = day.getAttribute('data-date'); field.value = fmtLong(due.value); say(''); closeCal(true); }
    });
    document.addEventListener('click', function (e) { if (!pop.hidden && !dateWrap.contains(e.target)) closeCal(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) closeCal(true); });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var bad = [].slice.call(form.querySelectorAll('[required]')).filter(function (i) { return !i.checkValidity(); });
    var dueField = form.querySelector('[data-rq-date-field]'), dueVal = form.querySelector('[data-rq-due]');
    if (dueField && dueVal && !dueVal.value) {
      // The due date takes its place in the order of the form.
      var all = [].slice.call(form.querySelectorAll('[required], [data-rq-date-field]'));
      bad.push(dueField); bad.sort(function (a, b) { return all.indexOf(a) - all.indexOf(b); });
    }
    if (bad.length) {
      var first = bad[0];
      first.focus();
      say(first.type === 'email' && first.value ? 'Please check your email address.'
        : first.name === 'privacy' ? 'Please accept the privacy policy.'
        : first.name === 'child' ? 'Please tell us which baby this is.'
        : first.hasAttribute('data-rq-date-field') ? 'Please choose your due date.'
        : 'Please fill in every field.', 'error');
      return;
    }
    busy = true; say('Checking your area', 'busy');
    TPS_POSTCODE.lookup(form.elements.postcode.value).then(function (r) {
      busy = false;
      if (r.error) { say(r.error, 'error'); form.elements.postcode.focus(); return; }
      if (!r.inServiceArea) { say(TPS_POSTCODE.OUTSIDE, 'out'); return; }
      form.elements.postcode.value = r.postcode;
      say('');
      form.hidden = true;
      done.hidden = false;
      var h = done.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      // Bring the confirmation into view, clear of the header (it was hidden under it).
      var nav = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 80;
      var y = done.getBoundingClientRect().top + window.scrollY - nav - 24;
      window.scrollTo({ top: Math.max(0, y), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  });
})();

/* Back (TJ, 26 Oct 2026): to the page she came from on this site, or home. */
(function () {
  var back = document.querySelector('[data-rq-back]');
  if (!back) return;
  back.addEventListener('click', function (e) {
    var ref = document.referrer;
    var same = false;
    try { same = ref && new URL(ref).origin === location.origin && ref !== location.href; } catch (err) {}
    if (same && history.length > 1) { e.preventDefault(); history.back(); }
  });
})();
