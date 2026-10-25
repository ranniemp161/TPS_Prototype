/* Request a place (TJ and Ami, 24 Oct 2026): checks the form, then the
   postcode with the single treatments check (postcode-check.js, inside the
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
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var bad = [].slice.call(form.querySelectorAll('[required]')).filter(function (i) { return !i.checkValidity(); });
    if (bad.length) { bad[0].focus(); say(bad[0].type === 'email' && bad[0].value ? 'Please check your email address.' : 'Please fill in every field.', 'error'); return; }
    busy = true; say('Checking your postcode', 'busy');
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
