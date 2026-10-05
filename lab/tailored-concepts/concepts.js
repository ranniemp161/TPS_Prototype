/* Concept previews: accordion, drawers, and the stay. Not production.
   The stay count up is the same as what-we-do.js ledger(): 650 ms, ease out cubic. */
(function () {
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Accordion rows and strips: one open at a time, optionally driving a photo stack.
  document.querySelectorAll('[data-acc]').forEach(function (acc) {
    var items = [].slice.call(acc.querySelectorAll('[data-item]'));
    var pics = acc.closest('[data-scope]') && acc.closest('[data-scope]').querySelectorAll('[data-pic]');
    function open(i) {
      items.forEach(function (it, k) {
        it.classList.toggle('is-open', k === i);
        var b = it.matches('button') ? it : it.querySelector('button');
        if (b) b.setAttribute('aria-expanded', String(k === i));
      });
      if (pics) [].forEach.call(pics, function (p, k) { p.classList.toggle('is-on', k === i); });
    }
    items.forEach(function (it, i) {
      var b = it.matches('button') ? it : it.querySelector('button');
      b.addEventListener('click', function () { open(i); });
    });
    open(0);
  });

  // The stay.
  document.querySelectorAll('[data-stay]').forEach(function (root) {
    var buttons = [].slice.call(root.querySelectorAll('[data-days]'));
    var out = {};
    [].forEach.call(root.querySelectorAll('[data-out]'), function (el) { out[el.getAttribute('data-out')] = el; });
    var shown = { days: 14, meals: 42, baths: 14, binds: 14 }, raf = 0;
    function set(k, v) { if (out[k]) out[k].textContent = String(Math.round(v)); }
    function go(days) {
      var to = { days: days, meals: days * 3, baths: days, binds: days };
      root.style.setProperty('--sel', String(days));
      cancelAnimationFrame(raf);
      if (reduced) { Object.keys(to).forEach(function (k) { shown[k] = to[k]; set(k, to[k]); }); return; }
      var from = { days: shown.days, meals: shown.meals, baths: shown.baths, binds: shown.binds };
      var t0 = performance.now(), dur = 650;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        Object.keys(to).forEach(function (k) { shown[k] = from[k] + (to[k] - from[k]) * e; set(k, shown[k]); });
        if (p < 1) raf = requestAnimationFrame(tick);
      })(t0);
    }
    function pick(btn) {
      buttons.forEach(function (b) { b.setAttribute('aria-checked', String(b === btn)); });
      go(parseInt(btn.getAttribute('data-days'), 10));
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { pick(b); }); });
  });
})();
